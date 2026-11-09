import React, { useEffect, useState } from 'react';
import { storedPassword } from '../contexts/settingsContext';
import usePasswordCheck from '../hooks/usePasswordCheck';

/** Shows the site icon in the top right corner of every page while a valid admin password is saved. */
const AdminIndicator = () => {
    const [password, setPassword] = useState('');
    const { isPasswordValid } = usePasswordCheck(password);

    useEffect(() => {
        // Pages write the password to localStorage themselves, and same-tab writes fire no event.
        const readPassword = () => setPassword(storedPassword());
        readPassword();
        const timer = setInterval(readPassword, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isPasswordValid) return null;

    return (
        <img
            src="/favicon.ico"
            alt="Admin mode"
            style={{
                position: 'fixed',
                top: 'max(8px, env(safe-area-inset-top))',
                right: 'max(8px, env(safe-area-inset-right))',
                height: '32px',
                zIndex: 1040, // below Bootstrap modals
                pointerEvents: 'none', // never blocks a button underneath
            }}
        />
    );
};

export default AdminIndicator;
