import { useState, useCallback } from 'react';
import { ImageDropper } from './components/ImageDropper'
import './App.css'
import { ImageDisplay } from './components/ImageDisplay';
import { ThemePicker } from './components/ThemePicker';
import { ColorPalette } from './components/ColorPalette';
import type { ThemeName } from '@/constants/themes';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>('catMocha');

  const handleFileChange = useCallback((imageData: string) => {
    setImage(imageData);
  }, []);

  const handleThemeChange = useCallback((themeName: ThemeName) => {
    setTheme(themeName);
  }, []);

  return (
    <>
      <ImageDropper onFileChange={handleFileChange} />
      <ImageDisplay image={image} theme={theme} />
      <ThemePicker onThemeChange={handleThemeChange} />
      <ColorPalette themeName={theme} />
    </>
  )
}

export default App
