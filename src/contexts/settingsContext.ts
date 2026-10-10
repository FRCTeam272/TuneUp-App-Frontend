import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export interface Settings {
    /** Match timer length, "m:ss" or seconds. */
    timer: string;
    /** Show the score entry form next to the scoreboard. */
    showForm: boolean;
    /** Show the clock instead of the match timer. */
    showTime: boolean;
    backendUrl: string;
    /** Number of top scores averaged for the ranking. */
    divisor: number;
    /** Scoreboard rows per page. */
    tableSize: number;
    /** Admin password, also kept in localStorage. */
    password: string;
}

/** Defaults from the GATSBY_* env vars (inlined at build time). */
export function defaultSettings(): Settings {
    return {
        timer: process.env.GATSBY_TIMER || '2:30',
        showForm: process.env.GATSBY_SHOW_FORM === 'true',
        showTime: false,
        backendUrl: process.env.GATSBY_BACKEND_URL || 'http://127.0.0.1:5000',
        divisor: parseInt(process.env.GATSBY_DIVISOR ?? '') || 3,
        tableSize: 10,
        password: '',
    };
}

/** The password saved in localStorage ('' during the build-time render). */
export function storedPassword(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('password') || '' : '';
}

export type SettingsState = [Settings, Dispatch<SetStateAction<Settings>>];

// Pages that use settings provide their own state: <settingsContext.Provider value={[settings, setSettings]}>.
export const settingsContext = createContext<SettingsState>([defaultSettings(), () => {}]);

export const useSettings = () => useContext(settingsContext);
