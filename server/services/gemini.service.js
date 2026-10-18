import { GoogleGenerativeAI } from "@google/generative-ai";

// ১. টেক্সট বা PDF থেকে MCQ তৈরি
export const generateMCQFromText = async (text, numQuestions = 10, difficulty = "medium") => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in .env file");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert teacher. Generate exactly ${numQuestions} multiple-choice questions (MCQs) from the following text.
      Difficulty level: ${difficulty}.
      
      Rules:
      - Each question must have exactly 4 options.
      - The correctAnswer must match one of the options exactly.
      - Return ONLY a valid JSON array with this exact structure:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "difficulty": "${difficulty}"
        }
      ]

      Text:
      ${text.substring(0, 15000)} 
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // AI মাঝে মাঝে মার্কডাউন দেয়, তাই ক্লিন করা
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedText);
    
  } catch (error) {
    // 👈 এই লগটি টার্মিনালে আসল সমস্যাটা দেখাবে
    console.error("🔥 GEMINI TEXT ERROR (DETAILS):", error.message); 
    throw new Error(error.message || "Failed to generate MCQs from text");
  }
};

// ২. Image থেকে MCQ তৈরি (Gemini Vision)
export const generateMCQFromImage = async (base64Image, mimeType, numQuestions = 10, difficulty = "medium") => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in .env file");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert teacher. Read the text from this image and generate exactly ${numQuestions} multiple-choice questions (MCQs).
      Difficulty level: ${difficulty}.
      
      Rules:
      - Each question must have exactly 4 options.
      - The correctAnswer must match one of the options exactly.
      - Return ONLY a valid JSON array with this exact structure:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "difficulty": "${difficulty}"
        }
      ]
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedText);
    
  } catch (error) {
    // 👈 এই লগটি টার্মিনালে আসল সমস্যাটা দেখাবে
    console.error("🔥 GEMINI IMAGE ERROR (DETAILS):", error.message);
    throw new Error(error.message || "Failed to generate MCQs from image");
  }
};