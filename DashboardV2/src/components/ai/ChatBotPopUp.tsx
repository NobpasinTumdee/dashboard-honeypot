import { useMemo, useState } from "react";
import MarkdownIt from 'markdown-it';
import '../../Styles/Navbar.css'

const md = new MarkdownIt({
    html: true,        // อนุญาตให้มี HTML tags ใน Markdown (ถ้า AI ส่งมา)
    linkify: true,     // แปลง URL ให้เป็นลิงก์อัตโนมัติ
    typographer: true  // ปรับปรุงการจัดวางเครื่องหมายวรรคตอนบางอย่าง
});

const Url = localStorage.getItem("apiUrlOllama");
const apiUrl = `${Url || 'http://localhost:11434'}`

const ChatBotPopUp = () => {
    const [input, setInput] = useState('');
    const [inputOld, setInputOld] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('llama3.2:3b');

    const handleSend = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setResponse('');

        const res = await fetch(`${apiUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: input,
                stream: true, // เปิดโหมด stream
            }),
        });

        if (!res.body) {
            console.error("No response body");
            setLoading(false);
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let fullText = "";

        // อ่าน chunk ทีละส่วน
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // Ollama จะส่งมาเป็น JSON หลายบรรทัด (NDJSON)
            const lines = chunk.split("\n").filter(line => line.trim() !== "");
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.response) {
                        fullText += parsed.response;
                        setResponse(prev => prev + parsed.response); // อัปเดตแบบทีละนิด
                    }
                } catch (e) {
                    console.error("Error parsing chunk", e, line);
                }
            }
        }

        setLoading(false);
        setInputOld(input);
        setInput('');
    };


    const formattedAiResponse = useMemo(() => {
        if (!response) return '';

        const processedTextWithThoughtStyle = response.replace(
            /<think>([\s\S]*?)<\/think>/gi,
            '<div class="ai-thought">$1</div>'
        );

        return md.render(processedTextWithThoughtStyle);
    }, [response]);
    return (
        <>
            <div className="chat-content">
                {response ? (
                    <>
                        <div className="chat-message user-message">
                            <p style={{ margin: '0' }}>{inputOld}</p>
                        </div>
                        <div className="chat-message">
                            <strong>🤖HoneyBot:</strong><br />
                            <span dangerouslySetInnerHTML={{ __html: formattedAiResponse }} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="chat-message">
                            <strong>🤖HoneyBot:</strong><br />
                            <p>สวัสดี! ฉันคือ HoneyBot AI <b>model "{model}"</b> พร้อมช่วยเหลือคุณ มีอะไรให้ช่วยไหม?</p>
                            <select name="model" id="model" onChange={(e) => setModel(e.target.value)} value={model}>
                                <option value="llama3.2:3b" selected>llama3.2:3b</option>
                                <option value="deepseek-r1:1.5b" selected>deepseek-r1:1.5b</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    placeholder="Type what you want to ask HoneyBot..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={handleSend} disabled={loading}>
                    {loading ?
                        "loading"
                        :
                        "Send"
                    }
                </button>
            </div>
        </>
    )
}

export default ChatBotPopUp
