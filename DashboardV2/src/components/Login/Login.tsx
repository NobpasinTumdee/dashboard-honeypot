import React, { useState } from 'react';
import './Login.css';
import { LignIn, SignUp } from '../../serviceApi/index';
import { Link } from 'react-router-dom';


const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [UserName, setUserName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setmode] = useState(true);
    const [isPopup, setPopup] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const credentials = { Email: email, Password: password };
            const response = await LignIn(credentials);

            if (response?.status === 200) {
                console.log('Login successful!', response.data);
                alert('Login successful!');
                localStorage.setItem("isLogin", "true");
                localStorage.setItem("token_type", response.data.token_type);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("UserName", response.data.payload.UserName);
                window.location.reload();
            } else {
                const errorMessage = response?.data?.message || 'Gmail or Password is incorrect';
                setError(errorMessage);
                console.error('Login failed:', response?.data);
            }
        } catch (err) {
            console.error('Network or unexpected error:', err);
            setError('Network or unexpected error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const credentials = { Email: email, Password: password, UserName: UserName };
            const response = await SignUp(credentials);

            if (response?.status === 201) {
                console.log('SignUp successful!', response.data);
                alert('SignUp successful!');
                window.location.reload();
            } else {
                const errorMessage = response?.data?.message || 'Gmail or Password is incorrect';
                setError(errorMessage);
                console.error('SignUp failed:', response?.data);
            }
        } catch (err) {
            console.error('Network or unexpected error:', err);
            setError('Network or unexpected error');
        } finally {
            setIsLoading(false);
        }
    };

    const isLogin = localStorage.getItem("isLogin");

    const Logout = () => {
        // localStorage.clear();
        localStorage.removeItem("isLogin");
        localStorage.removeItem("token_type");
        localStorage.removeItem("token");
        localStorage.removeItem("UserName");
        setTimeout(() => {
            location.href = "/login";
        }, 100);
    };

    const [Url, setUrl] = useState<string>("");
    const [UrlNgrok, setUrlNgrok] = useState<string>("");
    const [UrlNgrokOllama, setUrlNgrokOllama] = useState<string>("");
    const [Port, setPort] = useState<string>("");
    const UrlApi = localStorage.getItem("apiUrl");

    const handleUrlapi = (e: any) => {
        e.preventDefault();
        if (Url && Port) {
            localStorage.setItem("apiUrl", Url + ":" + Port);
            alert(`Url saved: ${Url + ":" + Port}`);
            window.location.reload();
        }
    };
    const handleUrlNgrok = (e: any) => {
        e.preventDefault();
        if (UrlNgrok) {
            localStorage.setItem("apiUrl", UrlNgrok);
            if (UrlNgrokOllama) {
                localStorage.setItem("apiUrlOllama", UrlNgrokOllama);
                console.log(UrlNgrokOllama);
            }
            alert(`Url Ngrok saved: ${UrlNgrok}`);
            window.location.reload();
        }
    };

    return (
        <>
            {isLogin === "true" ? (
                <>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <h1>login successful</h1>
                        <h3>{"listening on " + UrlApi || "Url not found"}</h3>
                        <h3 className='add-url' onClick={() => setPopup(!isPopup)}>{isPopup ? "Close" : "Add Url"}</h3>
                        <button onClick={Logout} className='logout'>Logout</button>
                    </div>
                    <div style={{ textAlign: 'center',margin: '30px 0' }}>
                        <Link to="/auth-user" style={{ textDecoration: 'none', color: 'inherit' }}>Authenticated User</Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="login-container">
                        {mode ? (
                            <>
                                <form className="login-form" onSubmit={handleSubmit}>
                                    <h2>Login</h2>
                                    <div className="input-group">
                                        <label htmlFor="email">Email:</label>
                                        <input
                                            type="text"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="password">Password:</label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                        {error && <p className="error-message">{error}</p>}
                                    </div>

                                    <button type="submit" className="login-button" disabled={isLoading}>
                                        {isLoading ? 'Login...' : 'Log In'}
                                    </button>

                                    <a href="#" onClick={() => setmode(!mode)} className="sign-up">Sign Up</a>
                                </form>
                            </>
                        ) : (
                            <>
                                <form className="login-form" onSubmit={handleSignUp}>
                                    <h2>SignUp</h2>


                                    <div className="input-group">
                                        <label htmlFor="email">Email:</label>
                                        <input
                                            type="text"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="User Name">User Name:</label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={UserName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="password">Password:</label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                        {error && <p className="error-message">{error}</p>}
                                    </div>

                                    <button type="submit" className="login-button" disabled={isLoading}>
                                        {isLoading ? 'Wait...' : 'Sign Up'}
                                    </button>

                                    <a href="#" onClick={() => setmode(!mode)} className="sign-up">Let's Login!</a>
                                </form>
                            </>
                        )}
                    </div>
                    <h3 style={{ textAlign: 'center', fontWeight: '200' }}>server listening on : {UrlApi ? (UrlApi + "✨") : ("not found")}</h3>
                    <h3 className='add-url' onClick={() => setPopup(!isPopup)}>{isPopup ? "Close" : "Add Url"}</h3>
                </>
            )}
            {isPopup &&
                <div className='popup-container-url'>
                    <div className='popup-url'>
                        <h2 style={{ margin: '0' }}>Server Url</h2>
                        <form onSubmit={handleUrlapi} className="form-server-url" style={{ marginTop: '20px' }}>
                            <input
                                type="text"
                                value={Url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Url : http://localhost"
                                required
                                aria-label="input-text"
                                className="input-url"
                            />
                            <input
                                type="text"
                                value={Port}
                                onChange={(e) => setPort(e.target.value)}
                                placeholder="port : 3000"
                                required
                                className="input-url"
                            />
                            <button type="submit" className='btn-submit-url' >
                                Submit
                            </button>
                        </form>
                        <p style={{ margin: "0" }}>or</p>
                        <form onSubmit={handleUrlNgrok} className="form-server-url">
                            <input
                                type="text"
                                value={UrlNgrok}
                                onChange={(e) => setUrlNgrok(e.target.value)}
                                placeholder="Ngrok Url"
                                required
                                aria-label="input-text"
                                className="input-url"
                            />
                            <input
                                type="text"
                                value={UrlNgrokOllama}
                                onChange={(e) => setUrlNgrokOllama(e.target.value)}
                                placeholder="Ngrok Url for Ollama"
                                aria-label="input-text"
                                className="input-url"
                            />
                            <button type="submit" className='btn-submit-url' >
                                Submit
                            </button>
                        </form>
                        <div style={{ cursor: 'pointer', }} onClick={() => localStorage.removeItem("apiUrl")}>clear ip</div>
                        <div style={{ cursor: 'pointer', }} onClick={() => setPopup(!isPopup)}>close</div>
                    </div>
                </div>
            }
        </>
    );
};

export default Login;