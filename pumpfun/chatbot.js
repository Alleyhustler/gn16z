const OPENAI_API_KEY = ';

class ChatBot {
    constructor() {
        this.messageHistory = [
            {
                role: "system",
                content: "You are a helpful AI assistant in the dz16z terminal. Keep responses concise and technical."
            }
        ];
    }

    async sendMessage(message) {
        try {
            this.messageHistory.push({
                role: "user",
                content: message
            });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: this.messageHistory,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;

            this.messageHistory.push({
                role: "assistant",
                content: reply
            });

            return reply;

        } catch (error) {
            console.error('Error:', error);
            return 'Error: Unable to process request. Please try again.';
        }
    }

    clearHistory() {
        this.messageHistory = [
            {
                role: "system",
                content: "You are a helpful AI assistant in the dz16z terminal. Keep responses concise and technical."
            }
        ];
    }
}

// Initialize terminal functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatBot();
    const input = document.querySelector('.terminal-input');
    const terminalWindow = document.querySelector('.terminal-window');
    const terminalHistory = document.querySelector('.terminal-history');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    if (!input || !terminalWindow || !terminalHistory) return;

    const commands = {
        help: () => `Available commands:
- help: Show this help message
- about: Learn about dz16z
- status: Check system status
- clear: Clear terminal
- version: Show version information
Or simply ask any question!`,
        
        about: () => `dz16z is an AI Agentic Framework for Socials and onchain actions built on Solana's high-performance blockchain. It leverages Solana's speed and scalability to create breakthrough capabilities in self-improving networks and distributed intelligence.`,
        
        status: () => `System Status: Online
Network: Connected
AI Assistant: Active
Protocol Version: 0.1
Last Update: ${new Date().toLocaleString()}`,
        
        version: () => `dz16z Terminal v0.1
Build: ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}
Protocol: TEP-01
AI Model: GPT-3.5-turbo`,
        
        clear: () => {
            terminalHistory.innerHTML = '';
            return '';
        }
    };

    const addToHistory = (content, isCommand = false) => {
        const p = document.createElement('p');
        p.textContent = isCommand ? `> ${content}` : content;
        if (!isCommand) p.style.color = '#00ffaa';
        terminalHistory.appendChild(p);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    };

    const processInput = async (message) => {
        addToHistory(message, true);
        input.value = '';
        input.disabled = true;

        let response;
        if (commands[message.toLowerCase()]) {
            response = commands[message.toLowerCase()]();
        } else {
            addToHistory('Processing...');
            response = await chatbot.sendMessage(message);
            terminalHistory.removeChild(terminalHistory.lastChild); // Remove "Processing..."
        }

        if (response) {
            addToHistory(response);
        }

        input.disabled = false;
        input.focus();
    };

    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const message = input.value.trim();
            if (!message) return;
            await processInput(message);
        }
    });

    // Handle suggestion buttons
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const question = btn.textContent.replace(/['"]/g, ''); // Remove quotes
            await processInput(question);
        });
    });

    // Add command history navigation
    let commandHistory = [];
    let historyIndex = -1;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > -1) {
                historyIndex--;
                input.value = historyIndex === -1 ? '' : commandHistory[historyIndex];
            }
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            commandHistory.unshift(input.value);
            historyIndex = -1;
        }
    });
});
