import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as apiLogin, checkUsername } from '../api/index.js';

// 初始状态
const initialState = {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    expiresIn: localStorage.getItem('expiresIn'),
    username: localStorage.getItem('username'),
    nickname: localStorage.getItem('nickname'),
    isLoggedIn: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                expiresIn: action.payload.expiresIn,
                username: action.payload.username,
                nickname: action.payload.nickname,
                isLoggedIn: true,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                accessToken: null,
                refreshToken: null,
                expiresIn: null,
                username: null,
                nickname: null,
                isLoggedIn: false
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                accessToken: null,
                refreshToken: null,
                expiresIn: null,
                username: null,
                nickname: null,
                isLoggedIn: false,
                error: null
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}

// Context
const AuthContext = createContext();

// Provider组件
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // 登录
    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        try {
            const response = await apiLogin(credentials);
            const authData = response.data;

            // 存储到localStorage
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            localStorage.setItem('expiresIn', authData.expiresIn);
            localStorage.setItem('username', authData.username);
            localStorage.setItem('nickname', authData.nickname);

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: authData
            });

            return authData;
        } catch (error) {
            const errorMessage = error.response?.data || '登录失败';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            });
            throw error;
        }
    };


    // 登出
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    // 清除错误
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // 检查用户名是否存在
    const checkUsernameExists = async (username) => {
        try {
            const response = await checkUsername(username);
            return response.data.exists;
        } catch (error) {
            console.error('检查用户名失败:', error);
            return false;
        }
    };

    const value = {
        ...state,
        login,
        logout,
        clearError,
        checkUsernameExists
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}