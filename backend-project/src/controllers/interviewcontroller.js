const Interview = require('../models/Interview');


exports.getHistory = async (req, res) => {
    try {
        
        const history = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });
        
        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ message: "Server error fetching history", error: error.message });
    }
};


const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.submitAnswer = async (req, res) => {
    try {
        const { sessionId, answer } = req.body;

        
        const session = await Interview.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        
        const prompt = `
        You are an expert technical interviewer.
        Interview Topic: ${session.topic}
        Question Asked: ${session.nextQuestion}
        User's Answer: ${answer}

        Please evaluate the user's answer. Provide a JSON response with exactly these fields:
        {
          "score": (a number from 0 to 100 based on accuracy),
          "feedback": "A brief explanation of what they got right, what they missed, and the correct concept",
          "nextQuestion": "The next progressive technical interview question based on the topic"
        }
        `;

        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: prompt,
            config: { responseMimeType: "application/json" } 
        });

        
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const evaluation = JSON.parse(cleanText);
        
        session.score = evaluation.score;
        session.feedback = evaluation.feedback;
        session.nextQuestion = evaluation.nextQuestion;
        await session.save();

        
        return res.status(200).json({
            message: "Answer submitted and evaluated successfully!",
            score: session.score,
            feedback: session.feedback,
            nextQuestion: session.nextQuestion
        });

    } catch (error) {
        return res.status(500).json({ message: "Error submitting answer", error: error.message });
    }
};
exports.startInterview = async (req, res) => {
    try {
        const { topic, difficulty } = req.body;

        const prompt = `
        You are an expert technical interviewer.
        Topic: ${topic}
        Difficulty Level: ${difficulty}

        Please generate the first progressive technical interview question. 
        Provide a JSON response with exactly this field:
        {
          "nextQuestion": "The first technical question string here"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const initialQuestion = JSON.parse(cleanText);

        const newSession = new Interview({
            userId: req.user.id, 
            topic: topic,
            difficulty: difficulty,
            nextQuestion: initialQuestion.nextQuestion,
            score: 0,            
            feedback: "Interview started."
        });

        await newSession.save();

        return res.status(200).json({
            message: "Interview started successfully!",
            sessionId: newSession._id,
            nextQuestion: newSession.nextQuestion
        });

    } catch (error) {
        return res.status(500).json({ message: "Error starting interview", error: error.message });
    }
};