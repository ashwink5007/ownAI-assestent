// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We'll use axios instead of openai package
require('dotenv').config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json());

// Store conversation history
let conversationHistory = [];

// Ollama configuration from .env
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const MODEL_NAME = process.env.MODEL_NAME || 'phi3:latest';

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Check for special commands
        let systemPrompt = `You are a helpful coding assistant for students. 
        Explain concepts simply, help debug code, and teach programming.
        Use emojis to make it fun! Keep answers concise but clear.`;

        if (userMessage.toLowerCase().includes('/explain')) {
            const code = userMessage.replace('/explain', '').trim();
            systemPrompt = `Explain this code step by step for a beginner:\n${code}`;
        }

        if (userMessage.toLowerCase().includes('/debug')) {
            const code = userMessage.replace('/debug', '').trim();
            systemPrompt = `Find bugs in this code and explain fixes:\n${code}`;
        }

        if (userMessage.toLowerCase().includes('/optimize')) {
            const code = userMessage.replace('/optimize', '').trim();
            systemPrompt = `Analyze this code and suggest optimizations:\n${code}`;
        }

        // Prepare messages for Ollama
        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: "user",
                content: userMessage
            }
        ];

        // Call Ollama API
        const response = await axios.post(OLLAMA_URL, {
            model: MODEL_NAME,
            messages: messages,
            stream: false // Set to true for streaming responses
        });

        const aiReply = response.data.message.content;

        // Update conversation history
        conversationHistory.push({
            role: "user",
            content: userMessage
        });
        conversationHistory.push({
            role: "assistant",
            content: aiReply
        });

        // Keep only last 10 messages to save memory
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Ollama Error:', error);
        res.status(500).json({
            reply: '😢 Oops! Make sure Ollama is running. Try: "ollama serve" in terminal'
        });
    }
});

// Clear conversation history
app.post('/clear', (req, res) => {
    conversationHistory = [];
    res.json({ status: 'cleared' });
});

// Get available models
app.get('/models', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        const models = response.data.models.map(m => m.name);
        res.json({ models });
    } catch (error) {
        res.status(500).json({ models: [] });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🤖 Using Ollama model: ${MODEL_NAME}`);
    console.log(`💡 Make sure Ollama is running!`);
});