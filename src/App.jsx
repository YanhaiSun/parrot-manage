import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/authStore.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import MainTab from './components/MainTab';
import Login from './pages/Login';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/parrot-web/*"
                        element={
                            <ProtectedRoute>
                                <MainTab />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/parrot-web" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
