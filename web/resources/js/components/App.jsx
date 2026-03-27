import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '../routes/AppRoutes';

export default function App() {
    return (
        <>
            <Toaster position="top-right" />
            <AppRoutes />
        </>
    );
}