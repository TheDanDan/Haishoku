import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { THEMES, type ThemeName } from "@/constants/Themes";

export function ColorPalette({themeName}: {themeName: ThemeName}) {
  const colors = THEMES[themeName];

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Card>
            <CardHeader>
                <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2">
                    {colors.map((color, index) => (
                        <div key={index} className="flex items-center">
                            <div className="w-4 h-4" style={{ backgroundColor: color }} />
                            <span className="ml-2">{color}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
