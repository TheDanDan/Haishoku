import { useEffect } from 'react';
import { Button } from "@/components/ui/button"
export function ImageDisplay({ image }: { image: string | null }) {
  const MAX_SCREEN_PERCENTAGE = 0.8;
  const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
  useEffect(() => {
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (image) {
      img.src = image;
      img.onload = () => {
        if (ctx) {
          const displayWidth = window.innerWidth;
          const displayHeight = window.innerHeight;

          const imageWidth = img.naturalWidth;
          const imageHeight = img.naturalHeight;

          const maxDrawWidth = displayWidth * MAX_SCREEN_PERCENTAGE;
          const maxDrawHeight = displayHeight * MAX_SCREEN_PERCENTAGE;

          let drawWidth, drawHeight;
          let scale;

          if (imageWidth <= maxDrawWidth && imageHeight <= maxDrawHeight) {
            drawWidth = imageWidth;
            drawHeight = imageHeight;
          } else {
            const widthRatio = maxDrawWidth / imageWidth;
            const heightRatio = maxDrawHeight / imageHeight;

            scale = Math.min(widthRatio, heightRatio);

            drawWidth = imageWidth * scale;
            drawHeight = imageHeight * scale;
          }
          canvas.width = drawWidth;
          canvas.height = drawHeight

          ctx.clearRect(0, 0, drawWidth, drawHeight);
          ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        }
      };
    }
  }, [image]);

  const downloadImage = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'image.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  // Button function
  <button onClick={downloadImage}>
  Activate Lasers
  </button>
  const convertImage = () => {
    if (!canvas) return;
  };
  <button onClick={convertImage}>
  Activate Lasers
  </button>
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas id="imageCanvas"></canvas>
      <Button variant="outline" onClick={downloadImage}>Download</Button>
      <Button variant="outline" onClick={convertImage}>Convert</Button>
    </div>
  )
  
}
