import React, { useState } from 'react';
import './Login.css';
import { LignIn, SignUp } from '../../serviceApi/index';


const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [UserName, setUserName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setmode] = useState(true);

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
            const credentials = { Email: email, Password: password, UserName: UserName};
            const response = await SignUp(credentials);

            if (response?.status === 200) {
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
        localStorage.clear();
        setTimeout(() => {
            location.href = "/login";
        }, 100);
    };

    return (
        <>
            {isLogin === "true" ? (
                <>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <h1>login successful</h1>
                        <button onClick={Logout} className='logout'>Logout</button>
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

                                    <a href="#" onClick={() => setmode(!mode)} className="sign-up">Forget Password?</a>
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
                </>
            )}
        </>
    );
};

export default Login;