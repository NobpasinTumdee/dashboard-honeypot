import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from "qrcode.react";
import { message } from 'antd';

interface UrlParams {
    ngrok: string | null;
    ollama: string | null;
}
const Xss = () => {
    // routing
    const navigate = useNavigate();

    // message
    const [messageApi, contextHolder] = message.useMessage();

    // value
    const [ngrokValue, setNgrokValue] = useState<string | null>(null);
    const [ollamaValue, setollamaValue] = useState<string | null>(null);

    // popup
    const [ispopup, setPopup] = useState(false);
    const [isQr, setQr] = useState(false);

    // =================================
    // XSS url
    // =================================
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const { ngrok, ollama }: UrlParams = {
            ngrok: params.get('ngrok') || null,
            ollama: params.get('ollama') || null,
        };

        if (ngrok && ngrok.startsWith('http')) {
            localStorage.setItem("apiUrl", ngrok);
            setNgrok(ngrok)
            messageApi.success('Yahoo! Your ngrok is saved', 1)
            setNgrokValue(ngrok);
        }

        if (ollama && ollama.startsWith('http')) {
            localStorage.setItem("apiUrlOllama", ollama);
            setOllama(ollama)
            messageApi.success('lets go to ollama', 1)
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
            <div style={{ margin: '1% 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <h1 className="hero-title" style={{ textAlign: 'center' }}>You have successfully set the url for the server 🎉</h1>
                    {(ngrokValue || ollamaValue) && (
                        <p className="form-subtitle" style={{ margin: '0px', textAlign: 'center' }}>
                            {`Ngrok URL: ${ngrokValue} Ollama URL: ${ollamaValue}`}
                        </p>
                    )}
                    <button
                        className="form-button"
                        style={{ width: 'auto', padding: '1rem 4.5rem', fontSize: '2.25rem', fontWeight: '900' }}
                        onClick={() => {
                            navigate('/login');
                            window.location.reload();
                        }}
                    >
                        Login
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <h2 className="hero-title" style={{ textAlign: "center", fontSize: "1rem", cursor: "pointer" }} onClick={() => setPopup(!ispopup)}>
                        Create your url
                    </h2>
                    {ispopup && (
                        <>
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
                                <button
                                    className="form-button"
                                    style={{ width: '100%', padding: '0.75rem 3.5rem', margin: '10px 0' }}
                                    onClick={() => setQr(!isQr)}
                                >
                                    {isQr ? 'Cancel' : 'Generate'}
                                </button>
                                {isQr &&
                                    <>
                                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                                            <QRCodeCanvas value={computedUrl || " "} size={200} includeMargin style={{borderRadius: '8px'}} />
                                        </div>

                                        <div style={{ textAlign: 'center', margin: '10px 0 20px' }}>
                                            <p className="form-subtitle">
                                                {computedUrl}
                                            </p>
                                            <button
                                                style={{ padding: '0.5rem 3.5rem', borderRadius: '8px', fontWeight: '500', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(computedUrl)
                                                    messageApi.success('Copied', 0.5)
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </>
                                }
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Xss;