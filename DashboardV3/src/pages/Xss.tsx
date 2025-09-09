import { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import { message } from 'antd';

interface UrlParams {
    ngrok: string | null;
    ollama: string | null;
}
const Xss = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [ngrokValue, setNgrokValue] = useState<string | null>(null);
    const [ollamaValue, setollamaValue] = useState<string | null>(null);

    // =================================
    // XSS url
    // =================================
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const { ngrok, ollama }: UrlParams = {
            ngrok: params.get('ngrok') || null,
            ollama: params.get('ollama') || null,
        };

        if (ngrok) {
            localStorage.setItem("apiUrl", ngrok);
            setNgrok(ngrok)
            messageApi.success('ngrok 1', 1)
            setNgrokValue(ngrok);
        }

        if (ollama) {
            localStorage.setItem("apiUrlOllama", ollama);
            setOllama(ollama)
            messageApi.success('ollama', 1)
            setollamaValue(ollama);
        }

    }, []);



    // =================================
    // QR code 
    // =================================
    const [ngrok, setNgrok] = useState("");
    const [ollama, setOllama] = useState("");
    const computedUrl = useMemo(() => {
        return `https://smart-tiny-honeypot.netlify.app/xss/?ngrok=${ngrok}&ollama=${ollama}`;
    }, [ngrok, ollama]);



    return (
        <>
            {contextHolder}
            <div style={{ margin: '1% 0' }}>
                <h1 className="hero-title" style={{ textAlign: 'center' }}>คุณได้ตั้งค่า url สำหรับ server เรียบร้อยแล้วยอดเยื่ยมาก</h1>
                {(ngrokValue || ollamaValue) && (
                    <p className="form-subtitle" style={{ margin: '0px', textAlign: 'center' }}>
                        {`Ngrok URL: ${ngrokValue} Ollama URL: ${ollamaValue}`}
                    </p>
                )}
            </div>

            <div style={{ display: 'flex' , justifyContent: 'center' , alignItems: 'center' , flexDirection: 'column' }}>
                <h2 className="hero-title" style={{ textAlign: "center", fontSize: "2rem" }}>
                    สร้าง url ของคุณ
                </h2>
                <div className="form-card" style={{ width: "400px" }}>
                    <div className="form-header">
                        <h1 className="form-title">Your Ngrok url</h1>
                        <p className="form-subtitle">Set up your Ngrok Url and Ollama</p>
                    </div>


                    <label htmlFor="ngrok" className="form-label">
                        Ngrok Url
                    </label>
                    <input
                        id="ngrok"
                        type="text"
                        value={ngrok}
                        onChange={(e) => setNgrok(e.target.value)}
                        placeholder="https://[your id ngrok].ngrok-free.app"
                        required
                        aria-label="input-text-ngrok"
                        className="form-input"
                    />
                    <label htmlFor="ollama" className="form-label">
                        Ollama Url
                    </label>
                    <input
                        id="ollama"
                        type="text"
                        value={ollama}
                        onChange={(e) => setOllama(e.target.value)}
                        placeholder="https://[your id ngrok].ngrok-free.app"
                        required
                        aria-label="input-text-ollama"
                        className="form-input"
                    />
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <QRCodeCanvas value={computedUrl || " "} size={200} includeMargin />
                    </div>
                </div>
                <p className="form-subtitle" style={{margin: '10px 0 20px'}}>
                    {computedUrl}
                </p>
            </div>
        </>
    );
};

export default Xss;