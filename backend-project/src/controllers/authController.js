const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Interview = require('../models/Interview');
const { GoogleGenAI } = require('@google/genai');



const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY  });


exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (email)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password)' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

exports.startInterview = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Please provide an interview topic." });
    }

    // Save the interview session to MongoDB
    const newSession = new Interview({
      userId: req.user.id,
      topic: topic
    });
    await newSession.save();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert technical interviewer. Generate exactly ONE highly relevant, professional interview question for a ${topic} position. Do not include any introductory or concluding remarks—return only the question text.`,
    });

    const aiQuestion = response.text.trim();

    res.status(201).json({
      message: "Interview session created and AI question generated!",
      sessionId: newSession._id,
      topic: newSession.topic,
      nextQuestion: aiQuestion
    });

  } catch (error) {
    res.status(500).json({ message: "Server error in AI generation.", error: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer, action } = req.body; // action can be "continue" or "finish"

    if (!sessionId || !answer) {
      return res.status(400).json({ message: "Missing sessionId or answer." });
    }

    const currentSession = await Interview.findById(sessionId);
    if (!currentSession) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    if (action === "continue") {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert technical interviewer conducting a mock interview for a ${currentSession.topic} position. The user just answered a question with: "${answer}". Acknowledge their effort briefly and generate exactly ONE follow-up technical interview question. Do not include introductory conversational fillers—return only the next question text.`,
      });

      const nextQuestion = response.text.trim();

      return res.status(200).json({
        message: "Answer submitted successfully!",
        nextQuestion: nextQuestion
      });
    } 
    
    if (action === "finish") {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert technical interviewer evaluating a candidate for a ${currentSession.topic} position. Based on their final answer: "${answer}", provide a quick summary evaluation. Return your response strictly as a JSON object with two fields: "score" (a number out of 100) and "feedback" (a short sentence summarizing their performance). Do not include markdown code block styling like \`\`\`json.`,
      });

      const evaluation = JSON.parse(response.text.trim());
      
      currentSession.score = evaluation.score;
      currentSession.feedback = evaluation.feedback;
      await currentSession.save();

      return res.status(200).json({
        message: "Interview finished successfully!",
        score: currentSession.score,
        feedback: currentSession.feedback
      });
    }

    return res.status(400).json({ message: "Invalid action. Choose 'continue' or 'finish'." });

  } catch (error) {
    res.status(500).json({ message: "Server error during answer processing.", error: error.message });
  }
};