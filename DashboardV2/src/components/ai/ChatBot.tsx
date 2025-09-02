import { useEffect, useMemo, useState } from "react";
import '../../Styles/Chat.css'
import Aos from 'aos';
import 'aos/dist/aos.css';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,        // อนุญาตให้มี HTML tags ใน Markdown (ถ้า AI ส่งมา)
    linkify: true,     // แปลง URL ให้เป็นลิงก์อัตโนมัติ
    typographer: true  // ปรับปรุงการจัดวางเครื่องหมายวรรคตอนบางอย่าง
});

const Url = localStorage.getItem("apiUrlOllama");
const apiUrl = `${Url || 'http://localhost:11434'}`

const ChatBot = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setResponse('');

        const res = await fetch(`${apiUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2:3b',
                prompt: input,
                stream: false,
            }),
        });

        const data = await res.json();
        setResponse(data.response);
        setLoading(false);
    };

    const formattedAiResponse = useMemo(() => {
        if (!response) return '';

        // 1. **ค้นหาและห่อหุ้มแท็ก <think> ด้วย div ที่มีคลาส 'ai-thought'**
        //    ใช้ Regular Expression เพื่อค้นหาแท็ก <think> และเนื้อหาภายใน
        //    แล้วแทนที่ด้วย <div class="ai-thought">...เนื้อหา...</div>
        const processedTextWithThoughtStyle = response.replace(
            /<think>([\s\S]*?)<\/think>/gi,
            '<div class="ai-thought">$1</div>' // $1 คือเนื้อหาที่อยู่ภายในแท็ก <think>
        );

        // 2. **แปลง Markdown ที่เหลือเป็น HTML:**
        //    ตอนนี้ markdown-it จะเห็น <div class="ai-thought"> เป็น HTML ปกติ
        //    และจะประมวลผล Markdown ที่เหลือ (เช่น **, -, ```) ให้เป็น HTML
        return md.render(processedTextWithThoughtStyle);
    }, [response]);


    useEffect(() => {
        Aos.init({
            duration: 200,
            once: true,
        });
    }, []);
    return (
        <>
            <div className="chat-container">
                <div className="chat-box">
                    <h1 className="chat-title" data-aos="zoom-in-down">Hi I'm HoneyBot AI Chat</h1>
                    {response ? (
                        <div className="chat-response" data-aos="zoom-in" data-aos-duration="2000">
                            <strong>🤖HoneyBot:</strong>
                            <span dangerouslySetInnerHTML={{ __html: formattedAiResponse }} />
                        </div>
                    ) : (
                        <div className="chat-response" data-aos="zoom-in" data-aos-duration="2000" style={{ textAlign: 'center' }}>
                            <strong>🤖HoneyBot:</strong> สวัสดีค้าบบบ <br /> ตัวผมนั้นใช้ <b>model llama3.2:3b</b> เพราะงั้นผมอาจจะตอบได้เร็วก็จริง<br /> แต่อย่าลืมนะครับผมเป็น AI เพราะงั้นผมผิดพลาดได้เสมอ
                        </div>
                    )}
                </div>
            </div>
            <div className="chat-input-container">
                <textarea
                    className="chat-input"
                    placeholder="พิมพ์สิ่งที่อยากถาม AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="chat-button" onClick={handleSend} disabled={loading}>
                    {loading ?
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="var(--body_text_color)"><path d="M120-160v-640l572 240h-12q-35 0-66 8t-60 22L200-680v140l240 60-240 60v140l216-92q-8 23-12 45.5t-4 46.5v2L120-160Zm560 80q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80Zm66-106 28-28-74-74v-112h-40v128l86 86ZM200-372v-308 400-92Z"/></svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="var(--body_text_color)"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
                    }
                </button>
            </div>
        </>
    )
}

export default ChatBot
