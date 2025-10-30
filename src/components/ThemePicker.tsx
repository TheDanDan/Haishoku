import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { ThemeName } from "@/constants/Themes";

export function ThemePicker({ onThemeChange }: { onThemeChange: (themeName: ThemeName) => void }) {
  const applyTheme = (themeName: ThemeName) => {
    onThemeChange(themeName);
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Select onValueChange={(value) => applyTheme(value as ThemeName)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="catMocha">Catppuccin Mocha</SelectItem>
            <SelectItem value="catLatte">Catppuccin Latte</SelectItem>
            <SelectItem value="gruvBox">Gruvbox</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
