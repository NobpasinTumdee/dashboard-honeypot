import React, { useState } from 'react';
import './Login.css';
import { LignIn } from '../../serviceApi/index';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            } else {
                const errorMessage = response?.data?.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
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

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {error && <p className="error-message">{error}</p>}

                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="text"
                        id="username"
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
                </div>

                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? 'Login...' : 'Sign Up'}
                </button>

                <a href="#" className="forgot-password">Forget Password?</a>
            </form>
        </div>
    );
};

export default Login;