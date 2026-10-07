import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

type HSV = { h: number; s: number; v: number }

function rgbToHsv(red: number, green: number, blue: number): HSV {
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const difference = max - min
  let hue = 0
  if (difference !== 0) {
    if (max === r) hue = ((g - b) / difference) % 6
    else if (max === g) hue = (b - r) / difference + 2
    else hue = (r - g) / difference + 4
    hue = (hue * 60 + 360) % 360
  }
  return { h: hue, s: max === 0 ? 0 : difference / max * 100, v: max * 100 }
}

function hexToHsv(hex: string): HSV {
  return rgbToHsv(
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  )
}

function hsvToRgb({ h, s, v }: HSV): [number, number, number] {
  const chroma = (v / 100) * (s / 100)
  const section = h / 60
  const secondary = chroma * (1 - Math.abs(section % 2 - 1))
  const base = v / 100 - chroma
  const segments: [number, number, number][] = [
    [chroma, secondary, 0], [secondary, chroma, 0], [0, chroma, secondary],
    [0, secondary, chroma], [secondary, 0, chroma], [chroma, 0, secondary],
  ]
  const [r, g, b] = segments[Math.min(5, Math.floor(section))]
  return [r, g, b].map(channel => Math.round((channel + base) * 255)) as [number, number, number]
}

function hsvToHex(hsv: HSV): string {
  return '#' + hsvToRgb(hsv).map(channel => channel.toString(16).padStart(2, '0')).join('')
}

export function CustomColorPicker({
  value,
  index,
  onChange,
  onValidityChange,
}: {
  value: string
  index: number
  onChange: (color: string) => void
  onValidityChange: (valid: boolean) => void
}) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value))
  const [hexDraft, setHexDraft] = useState(value.toUpperCase())
  const lastOutput = useRef(value)
  const field = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value !== lastOutput.current) {
      setHsv(hexToHsv(value))
      setHexDraft(value.toUpperCase())
      lastOutput.current = value
      onValidityChange(true)
    }
  }, [value, onValidityChange])

  const update = (next: HSV) => {
    const normalized = { h: (next.h + 360) % 360, s: Math.max(0, Math.min(100, next.s)), v: Math.max(0, Math.min(100, next.v)) }
    const hex = hsvToHex(normalized)
    setHsv(normalized)
    setHexDraft(hex.toUpperCase())
    lastOutput.current = hex
    onValidityChange(true)
    onChange(hex)
  }

  const updateField = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    update({
      ...hsv,
      s: (event.clientX - bounds.left) / bounds.width * 100,
      v: (1 - (event.clientY - bounds.top) / bounds.height) * 100,
    })
  }

  const handleFieldKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft') update({ ...hsv, s: hsv.s - step })
    else if (event.key === 'ArrowRight') update({ ...hsv, s: hsv.s + step })
    else if (event.key === 'ArrowUp') update({ ...hsv, v: hsv.v + step })
    else if (event.key === 'ArrowDown') update({ ...hsv, v: hsv.v - step })
    else return
    event.preventDefault()
  }

  const setHex = (input: string) => {
    const text = input.startsWith('#') ? input : '#' + input
    setHexDraft(text.toUpperCase())
    const valid = /^#[0-9a-f]{6}$/i.test(text)
    onValidityChange(valid)
    if (valid) {
      const normalized = text.toLowerCase()
      setHsv(hexToHsv(normalized))
      lastOutput.current = normalized
      onChange(normalized)
    }
  }

  const rgb = hsvToRgb(hsv)

  return (
    <div className="color-picker" aria-label={'Custom color picker for colour ' + (index + 1)}>
      <div className="picker-topline"><span>COLOUR LAB / {String(index + 1).padStart(2, '0')}</span><span>HSV + HEX</span></div>
      <div
        ref={field}
        className="picker-field"
        style={{ backgroundColor: 'hsl(' + hsv.h + ' 100% 50%)' }}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s)}
        aria-valuetext={Math.round(hsv.s) + '% saturation, ' + Math.round(hsv.v) + '% brightness'}
        onKeyDown={handleFieldKey}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); updateField(event) }}
        onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateField(event) }}
        onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
        onPointerCancel={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
      >
        <div className="picker-field-white" />
        <div className="picker-field-black" />
        <span className="picker-field-cursor" style={{ left: hsv.s + '%', top: (100 - hsv.v) + '%', backgroundColor: value }} />
      </div>
      <div className="picker-hue-row">
        <label htmlFor="custom-hue">HUE <span>{Math.round(hsv.h)}°</span></label>
        <input id="custom-hue" className="picker-hue" type="range" min="0" max="359" value={Math.round(hsv.h)} onChange={event => update({ ...hsv, h: Number(event.target.value) })} aria-label="Hue" />
      </div>
      <div className="picker-readout">
        <div className="picker-sample" style={{ backgroundColor: value }} aria-hidden="true" />
        <label htmlFor="custom-hex">HEX <input id="custom-hex" value={hexDraft} maxLength={7} spellCheck={false} onChange={event => setHex(event.target.value)} aria-invalid={!/^#[0-9a-f]{6}$/i.test(hexDraft)} /></label>
        <div className="picker-rgb"><span>RGB</span><strong>{rgb.join(' / ')}</strong></div>
      </div>
      <p className="picker-hint">Drag in the field, adjust the hue, or enter a six-digit hex value. Arrow keys work in the field.</p>
    </div>
  )
}
