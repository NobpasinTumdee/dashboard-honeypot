import { useEffect, useState } from "react";
import '../Styles/Chat.css'
import Aos from 'aos';
import 'aos/dist/aos.css';


const ChatBot = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setResponse('');

        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1:1.5b',
                prompt: input,
                stream: false,
            }),
        });

        const data = await res.json();
        setResponse(data.response);
        setLoading(false);
    };


    useEffect(() => {
        Aos.init({
            duration: 1000,
            once: true,
        });
    }, []);
    return (
        <>
            <div className="chat-container">
                <div className="chat-box">
                    <h1 className="chat-title" data-aos="zoom-in-down">Hi I'm HoneyBot AI Chat</h1>
                    {response ? (
                        <div className="chat-response" data-aos="zoom-in" data-aos-duration="3000">
                            <strong>🤖HoneyBot:</strong> {response}
                        </div>
                    ) : (
                        <div className="chat-response" data-aos="zoom-in" data-aos-duration="3000">
                            <strong>🤖HoneyBot:</strong> สวัสดีค้าบบบ ตัวผมนั้นใช้ model deepseek-r1:1.5b เพราะงั้นผมอาจจะตอบได้เร็วก็จริง แต่อย่าลืมนะครับผมเป็น AI เพราะงั้นผมผิดพลาดได้เสมอ
                        </div>
                    )}
                    <textarea
                        className="chat-input"
                        placeholder="พิมพ์สิ่งที่อยากถาม AI..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        data-aos="zoom-in-up" data-aos-duration="2500"
                    />
                    <button data-aos="zoom-in-up" data-aos-duration="3000" className="chat-button" onClick={handleSend} disabled={loading}>
                        {loading ? 'กำลังประมวลผล...' : 'ส่งคำถาม'}
                    </button>
                </div>
            </div>
        </>
    )
}

export default ChatBot
