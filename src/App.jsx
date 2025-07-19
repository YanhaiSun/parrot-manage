import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'

import MainTab from './components/MainTab'


export default function App() {
    return (
        <Router>
            <MainTab />
        </Router>
    );
}
