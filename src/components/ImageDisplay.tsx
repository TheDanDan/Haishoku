import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import convertImage from '@/utils/convert';
import type { ThemeName } from '@/constants/themes';
import { Label } from '@radix-ui/react-label';

export function ImageDisplay({image, theme}: {image: string | null, theme: ThemeName}) {
  const [conversionRate, setConversionRate] = useState<number>(.80);
  const [resetImage, setResetImage] = useState<number>(0);

  const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
  useEffect(() => {
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (image) {
      img.src = image;
      img.onload = () => {
        if (ctx) {
          const imageWidth = img.naturalWidth;
          const imageHeight = img.naturalHeight;

          // 1. Set the canvas element dimensions to the ORIGINAL image dimensions
          canvas.width = imageWidth;
          canvas.height = imageHeight;

          // 2. Draw the image onto the canvas at its full size (1:1 mapping)
          ctx.clearRect(0, 0, imageWidth, imageHeight);
          ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
        }
      };
    }
}, [image, resetImage]);

  const downloadImage = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'image.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const convertImageHandler = () => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    convertImage(canvas, ctx, theme, conversionRate);
  };

  const resetImageHandler = () => {
    setResetImage(prev => prev + 1);
  }
  
  return (
    <div className="items-center justify-center w-full h-full">
      <div style={{ maxWidth: '80vw', maxHeight: '80vh'}}>
        <canvas id="imageCanvas" style={{ maxWidth: '100%', maxHeight: '100%' }}></canvas>
      </div>
      <div className="flex gap-4 mt-4 justify-center">
        <Button variant="outline" onClick={downloadImage}>Download</Button>
        <Button variant="outline" onClick={convertImageHandler}>Convert</Button>
        <Button variant="outline" onClick={resetImageHandler}>Reset</Button>
        <Slider defaultValue={[33]} max={100} step={1} value={[conversionRate * 100]} onValueChange={([value]) => setConversionRate(value / 100)} />
        <Label>{conversionRate}%</Label>
      </div>
    </div>
  )
  
}
