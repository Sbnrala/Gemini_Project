
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapturePhoto: (base64: string) => void;
  onEditPhoto: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapturePhoto, onEditPhoto, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-700 aspect-video">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="font-bold">{error}</p>
            <button onClick={onClose} className="mt-6 bg-white text-slate-900 px-8 py-3 rounded-2xl font-black uppercase text-xs">Close</button>
          </div>
        ) : capturedImage ? (
          <div className="relative w-full h-full animate-in fade-in duration-300">
            <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-8 flex justify-center gap-4">
              <button 
                onClick={() => setCapturedImage(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold text-sm backdrop-blur-md transition-all border border-white/20"
              >
                Retake
              </button>
              <button 
                onClick={() => onEditPhoto(capturedImage)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-900/40 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit & Annotate
              </button>
              <button 
                onClick={() => onCapturePhoto(capturedImage)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/40 transition-all"
              >
                Use Directly
              </button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Viewfinder</span>
              </div>
              <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-8">
              <button 
                onClick={takeSnapshot}
                className="w-20 h-20 bg-white rounded-full border-8 border-white/30 shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
              >
                <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-full group-hover:bg-slate-50"></div>
              </button>
            </div>
          </>
        )}
      </div>
      <p className="text-white/40 mt-6 text-[10px] font-black uppercase tracking-[0.2em]">{capturedImage ? "Choose how to proceed with your snapshot" : "Capture your problem to annotate and solve with AI"}</p>
    </div>
  );
};
