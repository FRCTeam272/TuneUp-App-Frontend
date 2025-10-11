import { createContext } from 'react';

export const settingsContext = createContext(
  {
    timer: "",
    showForm: true,
    backendUrl: ""
  }
);