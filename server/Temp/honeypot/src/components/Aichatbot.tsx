import React, { useState } from 'react';
import '../styles/Aichatbot.css';

interface ChatProps {
    toggleChat: boolean;
}

const Aichatbot: React.FC<ChatProps> = ({ toggleChat }) => {
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'สวัสดี! ฉันคือแชทบอทของคุณ 😊' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() === '') return;

        const newMessages = [...messages, { from: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { from: 'bot', text: 'คุณพิมพ์ว่า: ' + input }
            ]);
        }, 500);
    };

    const handleKeyDown = (e : any) => {
        if (e.key === 'Enter') handleSend();
    };


    return (
        <div className={`chatbot-container ${toggleChat ? 'open' : 'close'}`}>
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`message ${msg.from === 'user' ? 'user' : 'bot'}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="พิมพ์ข้อความ..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={handleSend}>send</button>
                </div>
            </div>
        </div>
    );
};

export default Aichatbot;