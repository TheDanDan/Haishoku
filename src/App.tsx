import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { ArrowDown, ArrowDownRight, ArrowRight, Check, Download, ImagePlus, Plus, RotateCcw, Settings2, Trash2, X } from 'lucide-react'
import { DEFAULT_CUSTOM, PALETTES, readCustomPalette, readSelectedPalette, type CustomPalette } from './constants/palettes'
import { CustomColorPicker } from './components/CustomColorPicker'
import { recolorImage } from './utils/recolor'
import './App.css'

const SAMPLE_URL = import.meta.env.BASE_URL + 'sample-still-life.svg'

function App() {
  const [source, setSource] = useState(SAMPLE_URL)
  const [fileName, setFileName] = useState('Still life / sample')
  const [theme, setTheme] = useState(readSelectedPalette)
  const [customPalette, setCustomPalette] = useState<CustomPalette>(readCustomPalette)
  const [draftPalette, setDraftPalette] = useState<CustomPalette>(readCustomPalette)
  const [activeColorIndex, setActiveColorIndex] = useState(0)
  const [pickerValid, setPickerValid] = useState(true)
  const [strength, setStrength] = useState(80)
  const [useOkLab, setUseOkLab] = useState(false)
  const [useIgn, setUseIgn] = useState(false)
  const [split, setSplit] = useState(50)
  const [status, setStatus] = useState<'ready' | 'loading' | 'processing' | 'done' | 'error'>('ready')
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const originalCanvas = useRef<HTMLCanvasElement>(null)
  const resultCanvas = useRef<HTMLCanvasElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const paletteDialog = useRef<HTMLDialogElement>(null)
  const job = useRef(0)

  useEffect(() => {
    try { localStorage.setItem('haishoku-selected-palette', theme) } catch { /* Storage may be disabled. */ }
  }, [theme])

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    const canvas = originalCanvas.current
    const result = resultCanvas.current
    if (!canvas || !result || !source) return
    const currentJob = ++job.current
    const image = new Image()
    setStatus('loading')
    setProgress(0)
    image.onload = () => {
      if (currentJob !== job.current) return
      canvas.width = result.width = image.naturalWidth
      canvas.height = result.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      const resultContext = result.getContext('2d')
      if (!context || !resultContext) return
      context.drawImage(image, 0, 0)
      resultContext.drawImage(image, 0, 0)
      setStatus('ready')
      setSplit(50)
    }
    image.onerror = () => { if (currentJob === job.current) setStatus('error') }
    image.src = source
    return () => { image.onload = null; image.onerror = null }
  }, [source])

  const handleFile = useCallback((file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setStatus('error'); return }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') { setSource(reader.result); setFileName(file.name) }
    }
    reader.onerror = () => setStatus('error')
    reader.readAsDataURL(file)
  }, [])

  const convert = async () => {
    const original = originalCanvas.current
    const result = resultCanvas.current
    if (!original || !result || !original.width || status === 'processing') return
    const context = original.getContext('2d', { willReadFrequently: true })
    const resultContext = result.getContext('2d')
    if (!context || !resultContext) return
    const currentJob = ++job.current
    setStatus('processing')
    setProgress(0)
    try {
      const imageData = context.getImageData(0, 0, original.width, original.height)
      const converted = await recolorImage(imageData, colors, strength / 100, useOkLab, useIgn,
        value => { if (currentJob === job.current) setProgress(value) },
        () => currentJob !== job.current)
      if (currentJob !== job.current) return
      resultContext.putImageData(converted, 0, 0)
      setStatus('done')
      setSplit(50)
    } catch { if (currentJob === job.current) setStatus('error') }
  }

  const reset = () => {
    ++job.current
    const original = originalCanvas.current
    const result = resultCanvas.current
    if (original && result && original.width) {
      result.getContext('2d')?.drawImage(original, 0, 0)
      setStatus('ready')
      setSplit(50)
      setProgress(0)
    }
  }

  const download = () => {
    const canvas = resultCanvas.current
    if (!canvas?.width) return
    const link = document.createElement('a')
    link.download = 'haishoku-' + theme + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopied(color)
      window.setTimeout(() => setCopied(null), 1400)
    } catch { /* Clipboard may be unavailable in insecure contexts. */ }
  }

  const moveSplit = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    setSplit(Math.max(0, Math.min(100, Math.round((event.clientX - bounds.left) / bounds.width * 100))))
  }

  const moveSplitWithKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft') setSplit(value => Math.max(0, value - step))
    else if (event.key === 'ArrowRight') setSplit(value => Math.min(100, value + step))
    else if (event.key === 'Home') setSplit(0)
    else if (event.key === 'End') setSplit(100)
    else return
    event.preventDefault()
  }

  const activePalette = theme === 'custom'
    ? { id: 'custom', name: customPalette.name, note: 'Made by you', colors: customPalette.colors }
    : PALETTES.find(palette => palette.id === theme) ?? PALETTES[0]
  const colors = activePalette.colors
  const paletteCode = theme === 'custom' ? '09' : String(PALETTES.findIndex(palette => palette.id === theme) + 1).padStart(2, '0')
  const paletteValid = draftPalette.name.trim().length > 0 &&
    draftPalette.colors.length >= 2 && draftPalette.colors.length <= 16 &&
    draftPalette.colors.every(color => /^#[0-9a-f]{6}$/i.test(color)) && pickerValid

  const openPaletteEditor = () => {
    setDraftPalette({ name: customPalette.name, colors: [...customPalette.colors] })
    setActiveColorIndex(0)
    setPickerValid(true)
    paletteDialog.current?.showModal()
  }

  const savePalette = () => {
    if (!paletteValid) return
    const saved = { name: draftPalette.name.trim(), colors: draftPalette.colors.map(color => color.toLowerCase()) }
    setCustomPalette(saved)
    try { localStorage.setItem('haishoku-custom-palette', JSON.stringify(saved)) } catch { /* The palette still works for this visit. */ }
    setTheme('custom')
    reset()
    paletteDialog.current?.close()
  }

  return (
    <div className="site-shell">
      <div className="scroll-meter" style={{ transform: 'scaleX(' + scrollProgress / 100 + ')' }} />
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Haishoku, back to top">HAI<span>SHO</span>KU<span className="wordmark-mark">✳</span></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#studio">Studio <span>01</span></a><a href="#palette">Palette <span>02</span></a><a href="#about">About <span>03</span></a>
        </nav>
        <a className="header-action" href="#studio">Open the studio <ArrowDownRight size={16} strokeWidth={1.6} /></a>
      </header>
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-topline"><span>Image colour converter / est. 2025</span><span>Independent colour study № 001</span></div>
          <div className="hero-stage">
            <div className="hero-copy">
              <span className="hero-kicker"><span className="hero-kicker-dot" /> A DIFFERENT WAY TO SEE</span>
              <div className="hero-heading">
                <h1 id="hero-title"><span>MAKE</span><span className="hero-line-two"><em>colour</em><span>YOURS<span className="title-period">.</span></span></span></h1>
              </div>
              <p className="hero-description">Give an image a whole new feeling. Choose a palette, find your balance, and watch the colours shift.</p>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="hero-art-orbit hero-art-orbit-one" />
              <div className="hero-art-orbit hero-art-orbit-two" />
              <div className="hero-image-card">
                <div className="hero-image-meta"><span>FIG. 01 / COLOUR STUDY</span><span>HAISHOKU®</span></div>
                <img src={SAMPLE_URL} alt="" />
                <div className="hero-image-footer"><span>EVERY IMAGE HAS ANOTHER SIDE</span><span>↗</span></div>
              </div>
              <div className="hero-colour-stack"><i /><i /><i /><i /><i /></div>
              <span className="hero-art-caption">A SMALL SHIFT IN COLOUR<br />CHANGES THE WHOLE STORY.</span>
            </div>
          </div>
          <div className="hero-bottomline">
            <p>UPLOAD <span>↗</span> TUNE <span>↗</span> COMPARE <span>↗</span> EXPORT</p>
            <a href="#studio" className="hero-discover">THE STUDIO <span className="hero-discover-icon"><ArrowDown size={21} strokeWidth={1.7} /></span></a>
          </div>
        </section>
        <section className="studio-section" id="studio" aria-labelledby="studio-title">
          <div className="section-heading"><span className="section-index">01 / THE STUDIO</span><h2 id="studio-title">An image, <em>reimagined.</em></h2><p>One workspace. Endless colour possibilities.</p></div>
          <div className="studio-grid">
            <div className="preview-column">
              <div className="preview-meta"><span>LIVE PREVIEW <span className="live-dot" /></span><span>{fileName}</span><span>{status === 'done' ? 'CONVERSION COMPLETE' : status === 'processing' ? 'PROCESSING ' + progress + '%' : 'ORIGINAL SOURCE'}</span></div>
              <div className="image-stage" role="slider" tabIndex={0} aria-label="Compare new colour with original image" aria-valuemin={0} aria-valuemax={100} aria-valuenow={split} aria-valuetext={split + '% new colour, ' + (100 - split) + '% original'} onKeyDown={moveSplitWithKey} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); moveSplit(event) }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveSplit(event) }} onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false) }} onDrop={event => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files[0]) }}>
                <canvas ref={originalCanvas} className="stage-canvas" aria-label="Original image" />
                <canvas ref={resultCanvas} className="stage-canvas result-canvas" style={{ clipPath: 'inset(0 ' + (100 - split) + '% 0 0)' }} aria-label="Recoloured image" />
                <div className="split-rule" style={{ left: split + '%' }}><span className="split-handle" aria-hidden="true">‹ <span>›</span></span></div>
                <span className="stage-label stage-label-left">AFTER</span><span className="stage-label stage-label-right">BEFORE</span>
                {dragging && <div className="drop-overlay"><ImagePlus size={38} strokeWidth={1.2} /><span>Drop your image here</span></div>}
                {status === 'loading' && <div className="stage-message">Preparing your image<span className="animated-dots">...</span></div>}
                {status === 'processing' && <div className="processing-bar" style={{ width: progress + '%' }} />}
                {status === 'error' && <div className="stage-message error-message">Could not open that image. Try a PNG or JPEG.</div>}
              </div>
              <div className="preview-foot"><span>01 / NEW COLOUR</span><span>02 / ORIGINAL</span></div>
            </div>
            <aside className="control-column" aria-label="Image controls">
              <div className="control-head"><span>THE CONTROL ROOM</span><span>№ 01—04</span></div>
              <div className="control-block upload-block">
                <div className="control-block-heading"><span className="control-number">01 / SOURCE</span><span>Use your image or the sample</span></div>
                <input ref={fileInput} type="file" accept="image/*" className="visually-hidden" onChange={event => { handleFile(event.target.files?.[0]); event.target.value = '' }} aria-label="Choose an image" />
                <button className="upload-button" onClick={() => fileInput.current?.click()}><span className="button-text"><span>Upload an image</span><span>Choose a file</span></span><ImagePlus size={18} strokeWidth={1.6} /></button>
              </div>
              <div className="control-block palette-block">
                <div className="control-block-heading"><span className="control-number">02 / PALETTE</span><span>Choose a colour language</span></div>
                <div className="palette-options" role="radiogroup" aria-label="Color palette">
                  {PALETTES.map((palette, index) => <button key={palette.id} type="button" role="radio" aria-checked={theme === palette.id} className={'palette-option ' + (theme === palette.id ? 'is-selected' : '')} onClick={() => { setTheme(palette.id); reset() }} title={palette.note}>
                    <span className="option-code">{String(index + 1).padStart(2, '0')}</span><span className="option-name">{palette.name}</span><span className="option-mini-swatches">{palette.colors.slice(0, 5).map(color => <i key={color} style={{ background: color }} />)}</span>
                  </button>)}
                  <button type="button" role="radio" aria-checked={theme === 'custom'} className={'palette-option custom-option ' + (theme === 'custom' ? 'is-selected' : '')} onClick={() => { setTheme('custom'); reset() }} title="Your saved palette">
                    <span className="option-code">09</span><span className="option-name">{customPalette.name}</span><span className="option-mini-swatches">{customPalette.colors.slice(0, 5).map((color, index) => <i key={index} style={{ background: color }} />)}</span>
                  </button>
                </div>
                <button className="edit-palette-button" onClick={openPaletteEditor}><Settings2 size={14} /> Edit custom palette <ArrowRight size={14} /></button>
              </div>
              <div className="control-block finish-block">
                <span className="control-number">03 / FINISH</span>
                <div className="range-label"><label htmlFor="strength">Colour intensity</label><strong>{strength}<small>%</small></strong></div>
                <input id="strength" className="strength-slider" type="range" min="0" max="100" value={strength} onChange={event => { setStrength(Number(event.target.value)); reset() }} style={{ '--fill': strength + '%' } as CSSProperties} />
                <div className="range-extents"><span>SUBTLE</span><span>FULL COLOUR</span></div>
                <div className="method-options">
                  <label className="method-switch"><input type="checkbox" checked={useOkLab} onChange={event => { setUseOkLab(event.target.checked); reset() }} /><span className="switch-visual" /><span>Perceptual matching<small>Compare by visual distance</small></span></label>
                  <label className="method-switch"><input type="checkbox" checked={useIgn} onChange={event => { setUseIgn(event.target.checked); reset() }} /><span className="switch-visual" /><span>Interleaved Gradient Noise (IGN)<small>Smooth colour transitions</small></span></label>
                </div>
              </div>
              <div className="control-actions"><button className="convert-button" onClick={convert} disabled={status === 'processing' || status === 'loading' || status === 'error'}><span className="button-text"><span>{status === 'processing' ? 'Converting ' + progress + '%' : 'Transform image'}</span><span>{status === 'processing' ? 'Working on it' : 'Make it yours'}</span></span><ArrowDownRight size={22} strokeWidth={1.5} /></button><div className="secondary-actions"><button onClick={reset} disabled={status === 'loading'}><RotateCcw size={15} /> Reset</button><button onClick={download} disabled={status !== 'done'}><Download size={15} /> Download PNG</button></div></div>
            </aside>
          </div>
        </section>
        <section className="palette-section" id="palette" aria-labelledby="palette-title"><div className="palette-intro"><span className="section-index">02 / THE PALETTE</span><div><h2 id="palette-title">Every shade<br />has a <em>story.</em></h2><p>{activePalette.name} / {activePalette.note}. Explore the colours behind your new image. Select any swatch to copy its hex value.</p></div><div className="palette-index">{paletteCode}<span>/ 09</span></div></div><div className="swatch-grid">{colors.map((color, index) => <button key={theme + index} className="swatch" onClick={() => copyColor(color)} style={{ backgroundColor: color, color: isLight(color) ? '#171713' : '#f4f1e9' }} aria-label={'Copy color ' + color}><span>{String(index + 1).padStart(2, '0')}</span><span>{copied === color ? <><Check size={13} /> COPIED</> : color.toUpperCase()}</span></button>)}</div><div className="palette-footer"><span>CLICK A SHADE TO COPY</span><span>{colors.length} COLOURS / {activePalette.name.toUpperCase()}</span></div></section>
        <section className="about-section" id="about" aria-labelledby="about-title"><div className="about-top"><span className="section-index">03 / ABOUT THE PROCESS</span><span>COLOUR IS A NEW WAY TO SEE.</span></div><div className="about-main"><h2 id="about-title">Same image.<br /><em>Different feeling.</em></h2><div className="about-copy"><p>Haishoku remaps the colours in your image to a curated palette. Keep a little of the original or push it all the way. The composition stays yours; the atmosphere changes.</p><div className="process-list"><div><span>01</span><strong>Bring an image</strong><ArrowDownRight size={18} /></div><div><span>02</span><strong>Find its new colour</strong><ArrowDownRight size={18} /></div><div><span>03</span><strong>Take it further</strong><ArrowDownRight size={18} /></div></div><a href="#studio" className="back-to-studio">Make another <ArrowRight size={20} /></a></div></div><footer className="site-footer"><a className="wordmark footer-wordmark" href="#top">HAI<span>SHO</span>KU<span className="wordmark-mark">✳</span></a><span>AN IMAGE COLOUR STUDIO</span><a href="#top">BACK TO TOP ↑</a></footer></section>
      </main>
      <dialog ref={paletteDialog} className="palette-dialog" aria-labelledby="palette-dialog-title" onClick={event => { if (event.target === paletteDialog.current) paletteDialog.current?.close() }}>
        <div className="palette-dialog-inner">
          <div className="dialog-topline"><span>YOUR COLOUR LANGUAGE / № 09</span><button onClick={() => paletteDialog.current?.close()} aria-label="Close custom palette editor"><X size={20} /></button></div>
          <h2 id="palette-dialog-title">Make it<br /><em>your own.</em></h2>
          <p className="dialog-intro">Name a palette and choose 2–16 colours. Your palette stays in this browser and can be used on any image.</p>
          <div className="palette-editor-layout">
            <div className="palette-editor-list">
              <label className="custom-name-label" htmlFor="custom-name">Palette name</label>
              <input id="custom-name" className="custom-name-input" maxLength={28} value={draftPalette.name} onChange={event => setDraftPalette(current => ({ ...current, name: event.target.value }))} />
              <div className="custom-colors-heading"><span>YOUR COLOURS</span><span>{String(draftPalette.colors.length).padStart(2, '0')} / 16</span></div>
              <div className="custom-colors">
                {draftPalette.colors.map((color, index) => <div className={'custom-color ' + (activeColorIndex === index ? 'is-active' : '')} key={index}>
                  <button className="custom-color-select" onClick={() => { setActiveColorIndex(index); setPickerValid(true) }} aria-label={'Edit colour ' + (index + 1)} aria-pressed={activeColorIndex === index}>
                    <span>{String(index + 1).padStart(2, '0')}</span><i style={{ backgroundColor: color }} /><strong>{color.toUpperCase()}</strong><ArrowRight size={13} />
                  </button>
                  <button className="custom-color-remove" onClick={() => { setDraftPalette(current => ({ ...current, colors: current.colors.filter((_, itemIndex) => itemIndex !== index) })); setActiveColorIndex(current => Math.max(0, Math.min(current > index ? current - 1 : current, draftPalette.colors.length - 2))) }} disabled={draftPalette.colors.length <= 2} aria-label={'Remove colour ' + (index + 1)}><Trash2 size={15} /></button>
                </div>)}
              </div>
              <div className="custom-helper-actions"><button onClick={() => { setDraftPalette(current => ({ ...current, colors: [...current.colors, '#d9f36a'] })); setActiveColorIndex(draftPalette.colors.length); setPickerValid(true) }} disabled={draftPalette.colors.length >= 16}><Plus size={15} /> Add colour</button><button onClick={() => { setDraftPalette({ name: draftPalette.name || DEFAULT_CUSTOM.name, colors: [...colors.slice(0, 16)] }); setActiveColorIndex(0); setPickerValid(true) }}>Use current palette</button></div>
            </div>
            <CustomColorPicker
              key={activeColorIndex}
              index={activeColorIndex}
              value={draftPalette.colors[activeColorIndex] ?? draftPalette.colors[0]}
              onChange={color => setDraftPalette(current => ({ ...current, colors: current.colors.map((item, index) => index === activeColorIndex ? color : item) }))}
              onValidityChange={setPickerValid}
            />
          </div>
          <div className="dialog-footer"><span>{paletteValid ? 'READY TO SAVE' : 'Enter a name and valid six-digit hex colours'}</span><button onClick={savePalette} disabled={!paletteValid}>Save & use palette <ArrowRight size={17} /></button></div>
        </div>
      </dialog>
    </div>
  )
}

function isLight(hex: string) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

export default App
