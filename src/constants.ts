


export const APP_NAME = "SHARON";
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002"; // If image generation is added

export const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred. Please try again.";

// In a real app, process.env.API_KEY would be used, but for frontend-only example, we might need a way to set it
// For this submission, we strictly follow the guideline: API key is from process.env.API_KEY
// `const ai = new GoogleGenAI({apiKey: process.env.API_KEY});`
// This constant is more for user awareness in this example context, not for direct use in API calls.