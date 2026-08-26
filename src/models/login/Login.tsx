import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api  from '../../api/api';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import type { LoginProps } from '../../types/TotalTypes';

const Login: React.FC<LoginProps> = ({ setShowLoginForm }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/v1/auth/login', { phoneNumber, password });
            localStorage.setItem('data', JSON.stringify(response.data));
            const  data  = response.data;
            if (data && data.isAdmin) {
                navigate('/admin');
            }
            else {
                navigate('/');
            }
            setShowLoginForm(false);
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err?.response?.data?.message);
            } else {
                setError('Daxil olarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <button className="close-btn" onClick={() => setShowLoginForm(false)}>
                    <svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="login-header">
                    <div className="login-badge">⚡</div>
                    <h2>Sehrli Dünyaya Giriş</h2>
                    <p>Davam etmək üçün hesabınıza daxil olun</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Telefon Nömrəsi</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            className="form-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Telefon nömrənizi daxil edin"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Şifrə</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {showPassword ? (
                            <FaEye className="eye-icon" onClick={() => setShowPassword(false)} />
                        ) : (
                            <FaEyeSlash className="eye-icon" onClick={() => setShowPassword(true)} />
                        )}
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Yüklənir...' : 'Daxil ol'}
                    </button>
                </form>

                <div className="login-footer">
                    <span>Hesabınız yoxdur? </span>
                    <Link to="/register" className="register-link">Qeydiyyatdan keçin</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;