// Function to display messages in chat
function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = text.replace(/\n/g, '<br>'); 
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle the send logic
async function sendMessage() {
    const input = document.getElementById('userInput');
    const sendBtn = document.querySelector('button');
    const message = input.value.trim();

    if (message === '') return;

    // 1. Disable input while AI is thinking
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    // 2. Show user's message
    addMessage(message, 'user');

    // 3. Show "thinking..." message
    addMessage('🤔 Thinking...', 'ai');

    try {
        // 4. Get response DIRECTLY from Ollama!
        const response = await getAIResponse(message);
        
        removeLastMessage();
        addMessage(response, 'ai');
    } catch (error) {
        removeLastMessage();
        addMessage('Oops! Could not connect directly to Ollama. 😢 Check CORS settings or make sure Ollama is running.', 'ai');
        console.error('Fetch Error:', error);
    } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function removeLastMessage() {
    const chatBox = document.getElementById('chatBox');
    if (chatBox.lastChild) {
        chatBox.removeChild(chatBox.lastChild);
    }
}

// THIS PART NOW TALKS DIRECTLY TO OLLAMA
async function getAIResponse(userMessage) {
    const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "phi3:latest", // Change this based on your preferred model
            messages: [{ role: 'user', content: userMessage }],
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error('Connection failed! Make sure your OLLAMA_ORIGINS is set properly.');
    }

    const data = await response.json();
    return data.message.content; // Ollama's response is in data.message.content
}

// Allow pressing Enter to send
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !document.getElementById('userInput').disabled) {
        sendMessage();
    }
});