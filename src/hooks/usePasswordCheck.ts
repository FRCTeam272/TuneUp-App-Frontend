import { useEffect, useState } from 'react';
import { displayApi } from '../api';

/** Asks the backend whether `password` is the admin password, re-checking whenever it changes. */
export default function usePasswordCheck(password: string) {
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [passwordChecked, setPasswordChecked] = useState(false);

    useEffect(() => {
        if (!password) {
            setIsPasswordValid(false);
            setPasswordChecked(true);
            return;
        }
        let current = true; // ignore answers for a password that has since changed
        displayApi.checkPassword(password)
            .then((result) => current && setIsPasswordValid(result.status))
            .catch((err) => {
                console.error('Error checking password:', err);
                if (current) setIsPasswordValid(false);
            })
            .finally(() => current && setPasswordChecked(true));
        return () => {
            current = false;
        };
    }, [password]);

    return { isPasswordValid, passwordChecked };
}
