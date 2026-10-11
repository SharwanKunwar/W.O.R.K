import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from 'antd';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#315c4b',
                        colorText: '#1e2924',
                        colorBorder: '#dce3dd',
                        borderRadius: 8,
                        fontFamily: 'DM Sans, sans-serif',
                        controlHeight: 42,
                    },
                }}
            >
                <App />
            </ConfigProvider>
        </HelmetProvider>
    </React.StrictMode>,
);