import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type ChangeEvent } from 'react';

export function ImageDropper({ onFileChange }: { onFileChange: (imageData: string) => void }) {

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          onFileChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="picture">Wallpaper</Label>
        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  )
}
