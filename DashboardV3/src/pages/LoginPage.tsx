import React, { useState } from 'react';
import { message } from 'antd';
import { LignIn, SignUp } from '../service/api';
import type { Users } from '../types';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  // routing
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupUrl, setPopupUrl] = useState(false);
  const [isLocalUrl, setLocalUrl] = useState(true);

  const [confirmPassword, setconfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Users>({
    UserName: '',
    Email: '',
    Password: '',
  });

  const isLogin = localStorage.getItem("isLogin");

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!formData.Email || !formData.Password) {
      setError('Please fill in all required fields.');
      messageApi.info('Please fill in all required fields.', 3)
      return;
    }
    try {
      setIsLoading(true);
      const response = await LignIn(formData);
      if (response?.status === 200) {
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("status", response.data.payload.Status);
        localStorage.setItem("UserName", response.data.payload.UserName);
        localStorage.setItem("token_type", response.data.token_type);
        localStorage.setItem("token", response.data.token);
        messageApi.success(response.data.message, 2)
        setIsLoading(false);
        setTimeout(() => {
          navigate('/')
          window.location.reload();
        }, 1400);
      } else {
        const errorMessage = response?.data?.error;
        messageApi.error(errorMessage, 3)
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Network or unexpected error');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.Password !== confirmPassword) {
      setError('Passwords do not match');
      messageApi.info('Passwords do not match', 3)
      return;
    }

    if (!formData.UserName || !formData.Email || !formData.Password) {
      setError('Please fill in all required fields.');
      messageApi.info('Please fill in all required fields.', 3)
      return;
    }

    try {
      setIsLoading(true);
      const res = await SignUp(formData);
      if (res?.status === 201) {
        messageApi.success(res?.data?.message, 3)
        setIsLoading(false);
        setIsSignUp(false);
      } else {
        const errorMessage = res?.data?.error;
        messageApi.error(errorMessage, 3)
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Network or unexpected error');
      setIsLoading(false);
    }
  };

  const Logout = () => {
    // localStorage.clear();
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token_type");
    localStorage.removeItem("token");
    localStorage.removeItem("UserName");
    localStorage.removeItem("status");
    messageApi.success('Logout successful!', 3)
  };

  const ClearUrl = () => {
    // localStorage.clear();
    localStorage.removeItem("apiUrl");
    localStorage.removeItem("apiUrlOllama");
    messageApi.info('Clear Url', 3)
  };



  // =================================
  // Ngrok set up
  // =================================
  const [Url, setUrl] = useState<string>("");
  const [UrlNgrok, setUrlNgrok] = useState<string>("");
  const [UrlNgrokOllama, setUrlNgrokOllama] = useState<string>("");
  const [Port, setPort] = useState<string>("");
  const UrlApi = localStorage.getItem("apiUrl");

  const handleUrlapi = (e: any) => {
    e.preventDefault();
    if (Url && Port) {
      localStorage.setItem("apiUrl", Url + ":" + Port);
      messageApi.success(`Url saved: ${Url + ":" + Port}`, 10)
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
      messageApi.success(`Url Ngrok saved: ${UrlNgrok}`, 10)
      window.location.reload();
    }
  };


  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {contextHolder}
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="form-subtitle">
              {isSignUp
                ? 'Sign up to access the honeypot monitoring system'
                : 'Sign in to your honeypot monitoring account'
              }
            </p>
          </div>


          {isSignUp ? (
            <>
              <form onSubmit={handleSignUp}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    onChange={(event) => setFormData({ ...formData, Email: event.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-input"
                    onChange={(event) => setFormData({ ...formData, UserName: event.target.value })}
                    required
                    placeholder="Choose a username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    onChange={(event) => setFormData({ ...formData, Password: event.target.value })}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    onChange={(event) => setconfirmPassword(event.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px', margin: '10px' }}>{error}</p>}

                {isLoading ? (
                  <button type="submit" className="form-button" disabled>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </button>
                ) : (
                  <button type="submit" className="form-button">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                )}
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleSignIn}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    onChange={(event) => setFormData({ ...formData, Email: event.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    onChange={(event) => setFormData({ ...formData, Password: event.target.value })}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px', margin: '10px' }}>{error}</p>}

                {isLoading ? (
                  <button type="submit" className="form-button" disabled>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </button>
                ) : (
                  <button type="submit" className="form-button">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                )}
              </form>
            </>
          )}

          <div className="form-switch">
            <p className="form-switch-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                className="form-switch-link"
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {isLogin === 'true' && (
                <p className="form-switch-text" onClick={Logout} style={{ cursor: 'pointer' }}>Log out</p>
              )}
              <p className="form-switch-text" onClick={() => setPopupUrl(true)} style={{ cursor: 'pointer' }}>set url</p>
            </div>
          </div>
        </div>
      </div>






      {isPopupUrl && (
        <div className="form-container">
          <div className="form-card" style={{ width: '400px' }}>
            <div className="form-header">
              <h1 className="form-title">
                Ngrok
              </h1>
              <p className="form-subtitle">
                Set up your Ngrok Url and Ollama <br /> Your Url : {UrlApi ? UrlApi : 'http://localhost:3000'}
              </p>
            </div>

            <div className='group-button-url'>
              <button onClick={() => setLocalUrl(false)} className={isLocalUrl ? '' : 'active'}>Local Url</button>
              <button onClick={() => setLocalUrl(true)} className={isLocalUrl ? 'active' : ''}>Ngrok Url</button>
            </div>

            {!isLocalUrl ? (
              <form onSubmit={handleUrlapi} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label htmlFor="Local ip" className="form-label">
                  Local ip
                </label>
                <input
                  type="text"
                  value={Url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Url : http://localhost"
                  required
                  aria-label="input-text"
                  className="form-input"
                />

                <label htmlFor="Local port" className="form-label">
                  Local port
                </label>
                <input
                  type="text"
                  value={Port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="port : 3000"
                  required
                  className="form-input"
                />
                <button type="submit" className="form-button" >
                  Submit
                </button>
              </form>
            ) : (
              <form onSubmit={handleUrlNgrok} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label htmlFor="Ngrok Url" className="form-label">
                  Ngrok Url
                </label>
                <input
                  type="text"
                  value={UrlNgrok}
                  onChange={(e) => setUrlNgrok(e.target.value)}
                  placeholder="Ngrok Url"
                  required
                  aria-label="input-text"
                  className="form-input"
                />
                <label htmlFor="Ngrok Ollama" className="form-label">
                  Ngrok Ollama
                </label>
                <input
                  type="text"
                  value={UrlNgrokOllama}
                  onChange={(e) => setUrlNgrokOllama(e.target.value)}
                  placeholder="Ngrok Url for Ollama"
                  aria-label="input-text"
                  className="form-input"
                />
                <button type="submit" className="form-button" >
                  Submit
                </button>
              </form>
            )}




            <div className="form-switch">
              <p className="form-switch-text">
                <button
                  type="button"
                  className="form-switch-link"
                  onClick={() => setPopupUrl(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem' }}
                >
                  close
                </button>
                <button
                  type="button"
                  className="form-switch-link"
                  onClick={ClearUrl}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem' }}
                >
                  clear
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;