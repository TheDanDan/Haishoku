import { useEffect } from 'react';
export function ImageDisplay({ image }: { image: string | null }) {

  useEffect(() => {
    const canvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (image) {
      img.src = image;
      img.onload = () => {
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        }
      };
    }
  }, [image]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas id="imageCanvas"></canvas>
    </div>
  )
}
