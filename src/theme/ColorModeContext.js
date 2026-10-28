import { createContext } from 'react';

/**
 * @typedef {object} ColorModeValue
 * @property {'light' | 'dark'} mode resolved mode in use
 * @property {'system' | 'light' | 'dark'} preference what the user chose
 * @property {() => void} toggle switch to the opposite of the current mode
 * @property {(preference: 'system' | 'light' | 'dark') => void} setPreference
 */

/** @type {import('react').Context<ColorModeValue | null>} */
export const ColorModeContext = createContext(null);

export const COLOR_MODE_STORAGE_KEY = 'solstice.colorMode';
