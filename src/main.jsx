import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fonts are bundled with the app (variable, with optical sizing), so nothing loads from the network.
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/inter/opsz.css';
import App from './App.jsx';
import { ColorModeProvider } from './theme/ColorModeProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </StrictMode>,
);
