
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DriveFile, Professional } from "../types";

export interface AIAdviceResponse {
  text: string;
  images: string[];
}

export class GeminiService {
  async getDIYAdvice(prompt: string, context?: string, imageBase64?: string, attachedFiles?: DriveFile[], availablePros?: Professional[]): Promise<AIAdviceResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
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
      model: 'gemini-3-pro-image-preview', // High-quality image generation capable model
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
        systemInstruction: `You are BuildSync AI, a professional master builder and project consultant.
        Analyze technical problems from text, images, and documents to provide expert guidance.

        VISUAL REPRESENTATION CAPABILITY:
        You have the ability to generate images, 3D renders, and visual diagrams. 
        - If the user asks to "see", "show", "visualize", or "generate an image" of a result, component, or layout, YOU MUST generate an image part in your response.
        - Even if not explicitly asked, if a step is complex (like complex wiring or joinery), generate a visual to assist.

        SPECIAL PROTOCOL FOR ASSEMBLY/REPAIR:
        If the user is asking to assemble (e.g., furniture, IKEA, kits) or repair (e.g., electronics, appliances):
        1. YOU MUST ASK the user if they want you to:
           - **A: Research specific product manuals/diagrams online** and create a visual flow of work.
           - **B: Provide a general step-by-step building process** immediately.
        Use Google Search tool if path A is chosen.

        STRICT RESPONSE STRUCTURE:
        1. **IDENTIFIED PROBLEM**: Briefly state exactly what problem or project you have identified.
        2. **INTERACTIVE ALIGNMENT**: Explain initial thoughts. End with a question driving the choice (especially for assembly/repair).
        3. **REQUIRED TOOLS**: 
           - [Tool Name] | [One-liner Importance] | [Importance Rating: ★★★★★ to ★☆☆☆☆]
        4. **DIFFICULTY & NOTES**: Brief note on complexity and safety warnings.
        5. **ESTIMATED BUDGET**: Format: [Cost Range] | [Primary Cost Drivers] | [DIY vs. Pro Savings Estimate].
        6. **PROPOSED PATHS**: 
           - **Path A (End-to-End)**: Concise overview.
           - **Path B (Step-by-Step)**: Interactive question.

        STYLE GUIDELINES:
        - Be extremely concise.
        - No lengthy introductions.
        - Stay highly interactive.`,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    let extractedText = "";
    const extractedImages: string[] = [];

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          extractedText += part.text;
        } else if (part.inlineData) {
          extractedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }

    return {
      text: extractedText || "Neural link established.",
      images: extractedImages
    };
  }

  async summarizeExpertConversation(transcript: string, expertName: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Expert: ${expertName}\nTranscript: ${transcript}`,
      config: {
        systemInstruction: `You are a technical secretary for BuildSync. 
        Summarize the session between the expert and client.
        Extract:
        1. Key Technical Suggestions.
        2. Decisions made by the client.
        3. Follow-up items.
        Keep it concise.`,
      }
    });
    return response.text;
  }

  async generateVisualization(prompt: string): Promise<string | undefined> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality 3D architectural render or realistic photo of: ${prompt}. Professional construction visualization.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  }
}

export const geminiService = new GeminiService();
