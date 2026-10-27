import { GoogleGenerativeAI } from "@google/generative-ai";

// ১. টেক্সট বা PDF থেকে প্রশ্ন তৈরি (MCQ, Short, Creative)
export const generateMCQFromText = async (text, numQuestions = 10, difficulty = "medium", questionType = "mcq") => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in .env file");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    let prompt = "";
    const languageRule = "CRITICAL RULE: You MUST generate the output in the EXACT SAME LANGUAGE as the provided text.";

    if (questionType === "short") {
      prompt = `
        You are an expert teacher. Generate exactly ${numQuestions} short questions from the following text.
        Difficulty level: ${difficulty}.
        ${languageRule}
        Rules:
        - Each question should be answerable in 1 or 2 sentences.
        - Return ONLY a valid JSON array with this exact structure:
        [
          {
            "question": "Question text here?",
            "correctAnswer": "Short answer here",
            "difficulty": "${difficulty}"
          }
        ]
        Text:
        ${text.substring(0, 15000)} 
      `;
    } else if (questionType === "creative") {
      prompt = `
        You are an expert teacher. Generate exactly ${numQuestions} creative questions based on the following text.
        ${languageRule}
        Rules:
        - Each creative question must have a "stem" (stimulus/উদ্দীপক) which is a short paragraph.
        - Then there should be 4 sub-questions (ক, খ, গ, ঘ).
        - Return ONLY a valid JSON array with this exact structure and DO NOT change the keys:
        [
          {
            "stem": "Stem paragraph here",
            "questionA": "ক. Question here",
            "answerA": "Answer for ক",
            "questionB": "খ. Question here",
            "answerB": "Answer for খ",
            "questionC": "গ. Question here",
            "answerC": "Answer for গ",
            "questionD": "ঘ. Question here",
            "answerD": "Answer for ঘ"
          }
        ]
        Text:
        ${text.substring(0, 15000)} 
      `;
    } else {
      prompt = `
        You are an expert teacher. Generate exactly ${numQuestions} multiple-choice questions (MCQs) from the following text.
        Difficulty level: ${difficulty}.
        ${languageRule}
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
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("🔥 GEMINI TEXT ERROR:", error.message);
    throw new Error(error.message || "Failed to generate questions from text");
  }
};

// ২. ইমেজ থেকে প্রশ্ন তৈরি (একাধিক ইমেজ সাপোর্ট সহ)
export const generateMCQFromImage = async (base64ImagesArray, mimeType, numQuestions = 10, difficulty = "medium", questionType = "mcq") => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    let prompt = "";
    const languageRule = "CRITICAL RULE: Read the text from these images and you MUST generate the output in the EXACT SAME LANGUAGE as the text in the image.";

    if (questionType === "creative") {
      prompt = `
        You are an expert teacher. Read the text from these images and generate exactly ${numQuestions} creative questions.
        ${languageRule}
        Rules:
        - Each creative question must have a "stem" which is a short paragraph.
        - Then there should be 4 sub-questions (ক, খ, গ, ঘ).
        - Return ONLY a valid JSON array with this exact structure:
        [
          {
            "stem": "Stem paragraph here",
            "questionA": "ক. Question here",
            "answerA": "Answer for ক",
            "questionB": "খ. Question here",
            "answerB": "Answer for খ",
            "questionC": "গ. Question here",
            "answerC": "Answer for গ",
            "questionD": "ঘ. Question here",
            "answerD": "Answer for ঘ"
          }
        ]
      `;
    } else if (questionType === "short") {
      prompt = `
        You are an expert teacher. Read the text from these images and generate exactly ${numQuestions} short questions.
        ${languageRule}
        Rules:
        - Return ONLY a valid JSON array with this exact structure:
        [
          {
            "question": "Question text here?",
            "correctAnswer": "Short answer here"
          }
        ]
      `;
    } else {
      prompt = `
        You are an expert teacher. Read the text from these images and generate exactly ${numQuestions} multiple-choice questions (MCQs).
        ${languageRule}
        Rules:
        - Each question must have exactly 4 options.
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
    }

    // একাধিক ছবিকে Gemini API-র জন্য ফরম্যাট করা
    const imageParts = base64ImagesArray.map(base64 => ({
      inlineData: { data: base64, mimeType: mimeType }
    }));

    // প্রম্পট এবং সবগুলো ছবি একসাথে পাঠানো
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("🔥 GEMINI IMAGE ERROR:", error.message);
    throw new Error(error.message || "Failed to generate questions from images");
  }
};