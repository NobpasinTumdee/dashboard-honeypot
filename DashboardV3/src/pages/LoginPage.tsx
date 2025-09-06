import React, { useState } from 'react';
import { LignIn, SignUp } from '../service/api';
import type { Users } from '../types';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [confirmPassword, setconfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Users>({
    UserName: '',
    Email: '',
    Password: '',
  });

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!formData.Email || !formData.Password) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await LignIn(formData);
      if (response?.status === 200) {
        alert('Login successful!');
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("status", response.data.payload.Status);
        localStorage.setItem("token_type", response.data.token_type);
        localStorage.setItem("token", response.data.token);
        window.location.reload(); // มาแก้ด้วย
      } else {
        const errorMessage = response?.data?.message || 'Gmail or Password is incorrect';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network or unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.Password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.UserName || !formData.Email || !formData.Password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await SignUp(formData);
      if (res?.status === 201) {
        alert('SignUp successful!');
        window.location.reload();
      } else {
        const errorMessage = res?.data?.message || 'Gmail or Password is incorrect';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network or unexpected error');
    } finally {
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
    alert('Logout successful!');
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <p className="form-switch-text" onClick={Logout}>Log out</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;