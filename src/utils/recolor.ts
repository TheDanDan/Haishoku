type Vector = [number, number, number]

const hexToRgb = (hex: string): Vector => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

function toOklab([red, green, blue]: Vector): Vector {
  const linear = [red, green, blue].map(value => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const l = Math.cbrt(0.4122214708 * linear[0] + 0.5363325363 * linear[1] + 0.0514459929 * linear[2])
  const m = Math.cbrt(0.2119034982 * linear[0] + 0.6806995451 * linear[1] + 0.1073969566 * linear[2])
  const s = Math.cbrt(0.0883024619 * linear[0] + 0.2817188376 * linear[1] + 0.6299787005 * linear[2])
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

// A stable, screen-space noise pattern for dithering palette boundaries.
function interleavedGradientNoise(x: number, y: number) {
  const phase = (0.06711056 * x + 0.00583715 * y) % 1
  return (52.9829189 * phase) % 1
}

export async function recolorImage(
  image: ImageData,
  paletteHex: string[],
  strength: number,
  perceptual: boolean,
  useIgn: boolean,
  onProgress: (progress: number) => void,
  cancelled: () => boolean,
) {
  const palette = paletteHex.map(hexToRgb)
  const comparisonPalette = perceptual ? palette.map(toOklab) : palette
  const noiseAmounts: Vector = perceptual ? [0.08, 0.04, 0.04] : [32, 32, 32]
  const nearestCache = new Int16Array(32768).fill(-1)
  const output = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height)
  const data = output.data
  const rowsPerFrame = Math.max(1, Math.floor(30000 / image.width))
  for (let startY = 0; startY < image.height; startY += rowsPerFrame) {
    if (cancelled()) throw new Error('Cancelled')
    const endY = Math.min(image.height, startY + rowsPerFrame)
    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4
        if (data[index + 3] === 0) continue
        const original: Vector = [data[index], data[index + 1], data[index + 2]]
        const key = ((original[0] >> 3) << 10) | ((original[1] >> 3) << 5) | (original[2] >> 3)
        let nearest = useIgn ? -1 : nearestCache[key]
        if (nearest < 0) {
          const target = perceptual ? toOklab(original) : original
          if (useIgn) {
            // Offset each channel independently so both brightness and hue
            // boundaries can dither. Oklab channels use smaller units.
            for (let channel = 0; channel < 3; channel++) {
              target[channel] += (interleavedGradientNoise(x + channel * 37, y + channel * 17) - 0.5) * noiseAmounts[channel]
            }
          }
          let bestDistance = Infinity
          for (let i = 0; i < comparisonPalette.length; i++) {
            const color = comparisonPalette[i]
            const distance = (target[0] - color[0]) ** 2 + (target[1] - color[1]) ** 2 + (target[2] - color[2]) ** 2
            if (distance < bestDistance) { bestDistance = distance; nearest = i }
          }
          if (!useIgn) nearestCache[key] = nearest
        }
        for (let channel = 0; channel < 3; channel++) {
          data[index + channel] = original[channel] + (palette[nearest][channel] - original[channel]) * strength
        }
      }
    }
    onProgress(Math.round(endY / image.height * 100))
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
  return output
}
