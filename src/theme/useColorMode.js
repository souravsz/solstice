import { useContext } from 'react';
import { ColorModeContext } from './ColorModeContext.js';

export function useColorMode() {
  const value = useContext(ColorModeContext);
  if (!value) throw new Error('useColorMode must be used inside <ColorModeProvider>.');
  return value;
}
