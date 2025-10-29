import { useState, useCallback } from 'react';
import { ImageDropper } from './components/ImageDropper'
import './App.css'
import { ImageDisplay } from './components/ImageDisplay';
import { Button } from "@/components/ui/button"

function App() {
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = useCallback((imageData: string) => {
    setImage(imageData);
  }, []);

  return (
    <>
      <ImageDropper onFileChange={handleFileChange} />
      <ImageDisplay image={image} />
    </>
  )
}

export default App
