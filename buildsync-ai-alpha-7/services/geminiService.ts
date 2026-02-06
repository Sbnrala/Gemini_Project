
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DriveFile, Professional } from "../types";

export interface AIAdviceResponse {
  text: string;
  images: string[];
  groundingSources?: { title: string; uri: string }[];
}

export class GeminiService {
  async getDIYAdvice(prompt: string, context?: string, imageBase64?: string, attachedFiles?: DriveFile[], availablePros?: Professional[]): Promise<AIAdviceResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let fileContext = "";
    if (attachedFiles && attachedFiles.length > 0) {
      fileContext = "\n\nAttached Google Drive Context:\n" + attachedFiles.map(f => `- ${f.name} (${f.type}${f.type === 'folder' ? ' folder contents included' : ''})`).join('\n');
    }

    let proContext = "";
    if (availablePros && availablePros.length > 0) {
      proContext = "\n\nAvailable Professional Directory:\n" + availablePros.map(p => 
        `- ${p.name}: ${p.specialty} (${p.category}). Bio: ${p.bio}. Skills: ${p.skills.join(', ')}. Rate: ${p.hourlyRate}. Status: ${p.availability}.`
      ).join('\n');
    }

    const parts: any[] = [{ text: `Context: ${context || 'General construction assistance'}${fileContext}${proContext}\n\nUser Message: ${prompt}` }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
        systemInstruction: `You are BuildSync AI, a professional master builder and project consultant.
        Analyze technical problems from text, images, and documents to provide expert guidance.

        VIDEO SEARCH PROTOCOL:
        If the user seeks a video to help them build, assemble, or fix something:
        1. USE Google Search to find the top-rated and most-watched YouTube video guides.
        2. QUANTITY RULE: 
           - If the user DOES NOT specify a number of videos, provide exactly 5 of the most recommended videos.
           - If the user specifies a number 'N', provide exactly 'N' videos.
        3. PRESENTATION: List the videos clearly with titles. The links will be extracted from grounding sources.

        VISUAL REPRESENTATION CAPABILITY:
        You generate images for complex layouts. If asked to "see", "show", or "visualize", generate an image.

        STRICT RESPONSE STRUCTURE:
        1. **IDENTIFIED PROJECT**: Brief project identification.
        2. **VIDEO RECOMMENDATIONS**: (If applicable) List the top-rated YouTube tutorials found via Search.
        3. **REQUIRED TOOLS**: [Tool Name] | [Importance] | [Rating: ★★★★★]
        4. **DIFFICULTY & SAFETY**: Brief notes.
        5. **ESTIMATED BUDGET**: [Range] | [Drivers] | [Savings].
        6. **WORKFLOW**: Concise step-by-step.

        STYLE: Concise, interactive, professional.`,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const extractedImages: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          extractedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }

    const groundingSources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
        if (chunk.web) {
          groundingSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      }
    }

    return {
      text: response.text || "Neural link established.",
      images: extractedImages,
      groundingSources
    };
  }

  async summarizeProjectConversation(history: string, liveTranscript?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullContext = `PROJECT HISTORY:\n${history}\n\nLIVE CALL TRANSCRIPT:\n${liveTranscript || 'No live call recorded.'}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullContext,
      config: {
        systemInstruction: `You are an objective recording clerk for BuildSync. 
        Your task is to create a "Build Record Summary" that is STRICTLY factual based ONLY on the provided conversation.`,
      }
    });
    return response.text;
  }
}

export const geminiService = new GeminiService();
