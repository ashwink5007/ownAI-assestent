const axios = require('axios');

async function testConnection() {
    const OLLAMA_URL = 'http://localhost:11434/api/chat';
    const MODEL_NAME = 'qwen2.5-coder:14b';

    try {
        console.log('Sending test request to:', OLLAMA_URL);
        const response = await axios.post(OLLAMA_URL, {
            model: MODEL_NAME,
            messages: [{ role: 'user', content: 'hi' }],
            stream: false
        });
        console.log('Success:', response.data.message.content);
    } catch (error) {
        console.error('Ollama connection test failed!');
        console.error('Error Code:', error.code);
        console.error('HTTP Status:', error.response?.status);
        if (error.response?.data) {
            console.error('Response Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

testConnection();
