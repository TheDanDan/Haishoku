import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { THEMESHEX, type ThemeName } from "@/constants/themes";

export function ColorPalette({themeName}: {themeName: ThemeName}) {
  const colors = THEMESHEX[themeName];

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Card>
            <CardHeader>
                <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-12 gap-2">
                    {colors.map((color, index) => (
                        <div key={index} className="flex items-center">
                            <Input type="color" className="w-4 h-4" style={{ backgroundColor: color }} value={color} readOnly />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
