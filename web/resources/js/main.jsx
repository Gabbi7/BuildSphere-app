import '../css/app.css';
import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-blue-600">
                BuildSphere Web Setup Ready
            </h1>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);