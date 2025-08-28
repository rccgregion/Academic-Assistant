import { GoogleGenAI, GenerateContentResponse, Chat, GenerateContentParameters, Part, Content, GenerateImagesResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, DEFAULT_ERROR_MESSAGE } from '../constants';
import { AISettings, GroundingChunk, FormattingStyle, ProjectScope, WritingTone, AcademicLevel } from "../types"; 

let ai: GoogleGenAI | null = null;

const getAIInstance = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is not defined in the environment.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};


interface GenerationResult {
  text: string;
  error?: string;
  sources?: GroundingChunk[];
}

interface GenerateTextOptions extends AISettings {
  useGrounding?: boolean;
  responseMimeType?: "text/plain" | "application/json";
  customPromptOverride?: string; 
  temperature?: number;
  topK?: number;
  topP?: number;
  thinkingBudget?: number; 
}

const makeApiCallWithRetry = async <T>(apiCall: () => Promise<T>, retries = 1, delay = 2000): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`API call failed. Retrying in ${delay / 1000}s... (${retries} retries left)`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiCallWithRetry(apiCall, retries - 1, delay);
    }
    console.error("API call failed after multiple retries:", error);
    const geminiError = error?.response?.error?.message || error.message;
    throw new Error(geminiError || DEFAULT_ERROR_MESSAGE);
  }
};


export const generateText = async (
  promptInput: string | Part | (string | Part)[], 
  options?: GenerateTextOptions
): Promise<GenerationResult> => {
  try {
    const currentAI = getAIInstance();
    const modelConfig: GenerateContentParameters['config'] = {
      temperature: options?.temperature ?? 0.75, 
      topP: options?.topP ?? 0.95,
      topK: options?.topK ?? 40,
    };

    let finalPromptContent: Content[];
    let systemInstructionText = `You are an AI academic assistant named SHARON. `;

    if (options) {
        systemInstructionText += `The user is at ${options.academicLevel || AcademicLevel.UNDERGRADUATE} level. `;
        systemInstructionText += `Respond in a ${options.writingTone || WritingTone.ACADEMIC} tone. `;
        if (options.currentSubject) {
            systemInstructionText += `The current academic subject is ${options.currentSubject}. `;
        }
        if (options.formattingStyle) { 
            systemInstructionText += `Format relevant parts of your answer according to ${options.formattingStyle} style if applicable (e.g., for citations), but prioritize clear and direct responses. `;
        }
        if (options.projectScope) {
            systemInstructionText += `The user is considering a project with the scope: ${options.projectScope}. `;
        }
        if (options.targetWordCount && options.targetWordCount > 0) {
            systemInstructionText += `Aim for a response length of approximately ${options.targetWordCount} words for the main content. `;
        }
        if (options.geographicRegion === 'Nigeria' && options.department) {
            systemInstructionText += `The user is in Nigeria, studying ${options.department}. Tailor examples and context accordingly. `;
        } else if (options.geographicRegion === 'Nigeria') {
            systemInstructionText += `The user is in Nigeria. Tailor examples and context accordingly. `;
        }
        if (options.dataSaverMode) {
            systemInstructionText += `Data saver mode is on: Provide concise, text-focused responses. `;
        }
        if (options.thinkingBudget !== undefined && GEMINI_TEXT_MODEL === "gemini-2.5-flash") {
          modelConfig.thinkingConfig = { thinkingBudget: options.thinkingBudget };
        }
    }
    modelConfig.systemInstruction = systemInstructionText;


    if (options?.customPromptOverride) {
      finalPromptContent = [{ role: 'user', parts: [{text: options.customPromptOverride}]}];
    } else {
      finalPromptContent = typeof promptInput === 'string' 
        ? [{ role: 'user', parts: [{text: promptInput}] }] 
        : Array.isArray(promptInput) 
          ? [{role: 'user', parts: promptInput.map(p => (typeof p === 'string' ? {text: p} : p))}] 
          : [{role: 'user', parts: [promptInput]}];
    }
    
    if (options?.useGrounding) {
        modelConfig.tools = [{googleSearch: {}}];
        if (options?.responseMimeType === "application/json") {
            console.warn("responseMimeType 'application/json' cannot be used with Google Search grounding. Ignoring JSON request for this call.");
            if (modelConfig.responseMimeType) delete modelConfig.responseMimeType;
        } else if (options?.responseMimeType) { 
             modelConfig.responseMimeType = options.responseMimeType;
        }
    } else if (options?.responseMimeType) {
        modelConfig.responseMimeType = options.responseMimeType;
    }

    const apiCall = () => currentAI.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: finalPromptContent,
      config: modelConfig,
    });

    const response: GenerateContentResponse = await makeApiCallWithRetry(apiCall);
  const text = response.text ?? "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    
  return { text, sources };

  } catch (error: any) {
    return { text: "", error: error.message || DEFAULT_ERROR_MESSAGE };
  }
};


let chatInstance: Chat | null = null;

interface ChatOptions extends AISettings {
  systemInstruction?: string; 
  useGrounding?: boolean; 
  thinkingBudget?: number; 
}

export const startChat = (options?: ChatOptions, history?: Content[]): Chat => {
  const currentAI = getAIInstance();
  let systemInstructionForConfig: string;
  const modelConfig: Chat['config'] = {
    temperature: 0.75,
    topP: 0.95,
    topK: 40,
  };

  if (options?.systemInstruction) { 
      systemInstructionForConfig = options.systemInstruction;
      if (options.currentSubject && !systemInstructionForConfig.toLowerCase().includes(options.currentSubject.toLowerCase())) {
          systemInstructionForConfig += ` (Current subject: ${options.currentSubject})`;
      }
  } else {
      let systemInstructionText = `You are an AI academic assistant named SHARON. `;
      systemInstructionText += `The user is at ${options?.academicLevel || AcademicLevel.UNDERGRADUATE} level. `;
      systemInstructionText += `Respond in a ${options?.writingTone || WritingTone.ACADEMIC} tone. `;
      if (options?.currentSubject) {
          systemInstructionText += `The current academic subject is ${options.currentSubject}. `;
      }
      if (options?.formattingStyle) {
          systemInstructionText += `Format relevant parts of your answer according to ${options.formattingStyle} style if applicable. `;
      }
      if (options?.projectScope) {
          systemInstructionText += `The user is considering a project with the scope: ${options.projectScope}. `;
      }
      if (options?.geographicRegion === 'Nigeria' && options?.department) {
        systemInstructionText += `The user is in Nigeria, studying ${options.department}. Tailor examples and context accordingly. `;
      } else if (options?.geographicRegion === 'Nigeria') {
          systemInstructionText += `The user is in Nigeria. Tailor examples and context accordingly. `;
      }
      if (options?.dataSaverMode) {
        systemInstructionText += `Data saver mode is on: Provide concise, text-focused responses. `;
      }
      systemInstructionText += ` Be interactive. Where appropriate, you can end your response by suggesting 1-2 brief follow-up questions or discussion points the user might consider. Clearly mark these suggestions, for example, by starting them with "Next, you could ask:".`;
      systemInstructionForConfig = systemInstructionText;
  }
  
  modelConfig.systemInstruction = systemInstructionForConfig;

  if (options?.useGrounding) {
    modelConfig.tools = [{googleSearch: {}}];
  }

  if (options?.thinkingBudget !== undefined && GEMINI_TEXT_MODEL === "gemini-2.5-flash") {
    modelConfig.thinkingConfig = { thinkingBudget: options.thinkingBudget };
  }

  chatInstance = currentAI.chats.create({
    model: GEMINI_TEXT_MODEL,
    history: history || [], 
    config: modelConfig,
  });
  return chatInstance;
};

export const sendMessageInChat = async (chat: Chat, message: string): Promise<GenerationResult> => {
  try {
    const apiCall = () => chat.sendMessage({ message });
    const response: GenerateContentResponse = await makeApiCallWithRetry(apiCall);
  const text = response.text ?? "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
  return { text, sources };
  } catch (error: any) {
    return { text: "", error: error.message || DEFAULT_ERROR_MESSAGE };
  }
};

export const streamMessageInChat = async (
  chat: Chat,
  message: string,
  onChunk: (chunkFullText: string, isFinal: boolean, error?: string, sources?: GroundingChunk[]) => void
): Promise<void> => {
  try {
    const stream: AsyncGenerator<GenerateContentResponse> = await makeApiCallWithRetry(() => chat.sendMessageStream({ message }));
    let fullText = ""; 
    for await (const chunk of stream) {
      const sources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      fullText += chunk.text; 
      onChunk(fullText, false, undefined, sources); 
    }
    onChunk(fullText, true); 
  } catch (error: any) {
    console.error("Error streaming message in chat:", error);
    onChunk("", true, error.message || DEFAULT_ERROR_MESSAGE);
  }
};

export const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s; 
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.warn("Failed to parse JSON response. Original text:", text, "Error:", e);
    const complexJsonRegex = /(\[[\s\S]*?\]|\{[\s\S]*?\})(?=\s*$|\s*```)/s;
    const complexMatch = jsonStr.match(complexJsonRegex);
    if (complexMatch && complexMatch[0]) {
      try {
        console.log("Attempting to parse extracted JSON-like structure: ", complexMatch[0]);
        return JSON.parse(complexMatch[0]) as T;
      } catch (e2) {
        console.error("Secondary JSON parsing attempt (complex structure) also failed:", e2);
      }
    }
    return null;
  }
};

interface ImageGenerationResult {
  base64Image?: string; 
  error?: string;
}

export const generateDiagramImage = async (
  prompt: string
): Promise<ImageGenerationResult> => {
  try {
    const currentAI = getAIInstance();
    const response: GenerateImagesResponse = await makeApiCallWithRetry(() => currentAI.models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }, 
    }));

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0]?.image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return { base64Image: base64ImageBytes };
    } else {
      return { error: "No image was generated by the AI." };
    }

  } catch (error: any) {
    console.error("Error generating diagram image:", error);
    return { error: error.message || DEFAULT_ERROR_MESSAGE };
  }
};