import React, { useState } from 'react';
import { Toast, Card, Space } from 'antd-mobile';
import { useAuth } from '../store/authStore.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // 清除该字段的错误
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = '请输入用户名';
        } else if (formData.username.length < 3) {
            newErrors.username = '用户名至少3个字符';
        } else if (formData.username.length > 20) {
            newErrors.username = '用户名最多20个字符';
        }

        if (!formData.password) {
            newErrors.password = '请输入密码';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少6个字符';
        } else if (formData.password.length > 20) {
            newErrors.password = '密码最多20个字符';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await login(formData);
            Toast.show({
                icon: 'success',
                content: '登录成功！'
            });
            const from = location.state?.from?.pathname || '/parrot-web';
            navigate(from, { replace: true });
        } catch (error) {
            Toast.show({
                icon: 'fail',
                content: error.response?.data || '登录失败'
            });
        }
    };

    return (
        <>
            <style>
                {`
                    .glass-input {
                        width: 100%;
                        padding: 12px 16px;
                        background-color: rgba(255, 255, 255, 0.2);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        outline: none;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                    }

                    .glass-input::placeholder {
                        color: rgba(255, 255, 255, 0.7);
                    }

                    .glass-input:focus {
                        border-color: rgba(255, 255, 255, 0.5);
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                    }

                    .glass-button {
                        width: 100%;
                        padding: 12px 16px;
                        background-color: rgba(255, 255, 255, 0.3);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        font-weight: bold;
                        height: 48px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                    }

                    .glass-button:hover {
                        background-color: rgba(255, 255, 255, 0.4);
                        transform: translateY(-2px);
                    }

                    .glass-button:active {
                        transform: translateY(0);
                    }

                    .glass-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .form-group {
                        margin-bottom: 20px;
                    }

                    .form-label {
                        display: block;
                        color: white;
                        font-weight: 500;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }

                    .form-error {
                        color: #ff6b6b;
                        font-size: 12px;
                        margin-top: 4px;
                    }
                `}
            </style>
            <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative'
        }}>
            {/* 背景图片 */}
            <img
                src="https://jaychou.sbs/parrot-web/bg.jpg"
                alt="背景"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0
                }}
            />

            {/* 背景遮罩 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                zIndex: 1
            }} />

            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    padding: '32px',
                    color: 'white'
                }}
            >


                {/* 表单 */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">用户名</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="请输入用户名"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                        {errors.username && <div className="form-error">{errors.username}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">密码</label>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="请输入密码"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                        {errors.password && <div className="form-error">{errors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        className="glass-button"
                        disabled={loading}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>
            </div>
        </div>
        </>
    );
}