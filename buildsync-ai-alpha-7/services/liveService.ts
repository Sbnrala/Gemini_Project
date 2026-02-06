
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class LiveCallSession {
  private nextStartTime = 0;
  private inputAudioContext?: AudioContext;
  private outputAudioContext?: AudioContext;
  private sources = new Set<AudioBufferSourceNode>();
  private audioStream?: MediaStream;
  private videoInterval?: number;
  private sessionPromise?: Promise<any>;

  constructor() {}

  async start(
    callbacks: { onMessage: (msg: string) => void; onClose: () => void },
    videoElement?: HTMLVideoElement,
    projectContext?: string,
    initialStream?: MediaStream,
    audioOnly: boolean = false,
    persona: 'ai' | 'expert' = 'ai'
  ) {
    // Guidelines: Create new instance right before the connection to ensure correct API key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = initialStream || await navigator.mediaDevices.getUserMedia({ 
      audio: true, 
      video: !audioOnly && !!videoElement ? { facingMode: 'environment' } : false 
    });
    
    this.audioStream = stream;

    if (videoElement && !audioOnly) {
      videoElement.srcObject = stream;
    }

    const systemInstruction = persona === 'ai' 
      ? `You are BuildSync AI, a master builder and project manager. 
         ${audioOnly ? 'This is an AUDIO-ONLY site call.' : 'This is a LIVE VIDEO vision link.'} 
         Listen to site sounds, look for material patterns, and provide precise construction guidance.
         Project Context: ${projectContext}`
      : `You are a professional human expert acting via proxy. 
         Be conversational, helpful, and technically accurate. 
         ${audioOnly ? 'You are on an AUDIO link.' : 'You are watching a LIVE FEED.'} 
         Context: ${projectContext}`;

    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = this.inputAudioContext!.createMediaStreamSource(this.audioStream!);
          const scriptProcessor = this.inputAudioContext!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob: Blob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            // Solely rely on sessionPromise resolution as per guidelines to avoid race conditions
            this.sessionPromise?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(this.inputAudioContext!.destination);

          if (videoElement && !audioOnly) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            this.videoInterval = window.setInterval(() => {
              if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                canvas.width = 480;
                canvas.height = (videoElement.videoHeight / videoElement.videoWidth) * 480;
                ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                // Solely rely on sessionPromise resolution for sending image frames
                this.sessionPromise?.then((session) => {
                  session.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'image/jpeg' }
                  });
                });
              }
            }, 1000);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext!.currentTime);
            const audioBuffer = await decodeAudioData(decode(audioData), this.outputAudioContext!, 24000, 1);
            const source = this.outputAudioContext!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext!.destination);
            source.addEventListener('ended', () => {
                this.sources.delete(source);
            });
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.sources.add(source);
          }

          if (message.serverContent?.outputTranscription) {
            callbacks.onMessage(message.serverContent.outputTranscription.text);
          }
          
          if (message.serverContent?.interrupted) {
            this.sources.forEach(s => {
                try { s.stop(); } catch(e) {}
            });
            this.sources.clear();
            this.nextStartTime = 0;
          }
        },
        onerror: (e) => console.error("Live session failed:", e),
        onclose: () => callbacks.onClose(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona === 'expert' ? 'Kore' : 'Zephyr' } } },
        systemInstruction,
        outputAudioTranscription: {},
      }
    });

    return this.sessionPromise;
  }

  stop() {
    if (this.videoInterval) clearInterval(this.videoInterval);
    this.audioStream?.getTracks().forEach(t => t.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    this.sources.forEach(s => {
        try { s.stop(); } catch(e) {}
    });
    this.sessionPromise?.then(session => session.close());
  }
}
