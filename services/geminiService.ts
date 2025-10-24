import { GoogleGenAI, Type } from "@google/genai";
import type { Modality, UseCase, Feedback } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    useCaseTitle: {
      type: Type.STRING,
      description: "A short, catchy title for the use case.",
    },
    useCaseDescription: {
      type: Type.STRING,
      description: "A detailed paragraph explaining the use case, its function, and target audience.",
    },
    examplePrompt: {
      type: Type.STRING,
      description: "An example prompt a user would provide to this AI application.",
    },
    benefits: {
      type: Type.ARRAY,
      description: "A list of 3-5 key benefits of this application.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["useCaseTitle", "useCaseDescription", "examplePrompt", "benefits"],
};


const buildPrompt = (modality: Modality, randomness: number, feedbackHistory: Feedback[]): string => {
  const randomnessMap: { [key: number]: string } = {
    1: "very practical, common, or conventional use case that is likely already being developed.",
    2: "practical and slightly innovative use case that builds upon existing ideas.",
    3: "creative use case that balances innovation with feasibility.",
    4: "highly creative and innovative idea that pushes current boundaries.",
    5: "highly speculative, 'far-out' idea that explores future possibilities, regardless of current technical feasibility."
  };

  let feedbackInstructions = '';
  if (feedbackHistory.length > 0) {
    const positiveFeedback = feedbackHistory.filter(f => f.feedback === 'positive');
    const negativeFeedback = feedbackHistory.filter(f => f.feedback === 'negative');

    feedbackInstructions += "\n\nYou are continuing a brainstorming session. The user has provided feedback on previous ideas. Please learn from their preferences.\n";

    if (positiveFeedback.length > 0) {
      feedbackInstructions += "\nHere are the ideas the user liked ('Love It!'). Try to generate something with a similar level of creativity or in a similar domain:\n";
      positiveFeedback.forEach(f => {
        feedbackInstructions += `- Title: "${f.useCase.useCaseTitle}". Description: ${f.useCase.useCaseDescription}\n`;
      });
    }

    if (negativeFeedback.length > 0) {
      feedbackInstructions += "\nHere are the ideas the user found 'Boring'. Please avoid generating anything similar to these:\n";
      negativeFeedback.forEach(f => {
        feedbackInstructions += `- Title: "${f.useCase.useCaseTitle}". Description: ${f.useCase.useCaseDescription}\n`;
      });
    }
  }

  return `
    You are an expert AI product manager and futurist, specializing in identifying innovative applications for cutting-edge generative AI technologies.
    ${feedbackInstructions}

    Your task is to brainstorm a use case for the following AI modality: "${modality.name}".
    The user has specified a "randomness" level of ${randomness}/5. A randomness of ${randomness} means you should generate a ${randomnessMap[randomness]}

    Based on the modality and randomness level, please generate a response in the specified JSON format. The use case should be described clearly. The example prompt should be realistic for a user of such an application. The benefits should be tangible and compelling.
  `;
};

export const generateUseCase = async (modality: Modality, randomness: number, feedbackHistory: Feedback[]): Promise<UseCase> => {
  try {
    const prompt = buildPrompt(modality, randomness, feedbackHistory);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: randomness * 0.2 + 0.1, // Scale temperature with randomness
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    
    // Basic validation to ensure the parsed object matches the UseCase structure
    if (
      !parsedJson.useCaseTitle ||
      !parsedJson.useCaseDescription ||
      !parsedJson.examplePrompt ||
      !Array.isArray(parsedJson.benefits)
    ) {
      throw new Error("API response does not match expected structure.");
    }

    return parsedJson as UseCase;

  } catch (error) {
    console.error("Error generating use case:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate use case: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the use case.");
  }
};
