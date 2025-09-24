import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore.jsx';

export default function ProtectedRoute({ children }) {
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        // 保存当前路径，登录后可以重定向回来
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}