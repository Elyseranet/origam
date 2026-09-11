import {useState, useEffect} from 'react'
import {postToCode, onMessageFromCode} from '@/lib/messaging'
import {EXPORT_FORMATS, type TExportFormat} from './constants'
import type {CodeToUIMessage} from '@/lib/messaging'

export function ExportTab(): JSX.Element {
  const [format, setFormat] = useState<TExportFormat>('tokens-studio')
  const [status, setStatus] = useState<string>('')
  const [isExporting, setIsExporting] = useState<boolean>(false)

  useEffect(() => {
    const cleanup = onMessageFromCode((msg: CodeToUIMessage) => {
      if (msg.type === 'export-ready') {
        // Decode base64 → Blob → trigger browser download
        try {
          const binary = atob(msg.base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          const blob = new Blob([bytes], {type: msg.mimeType})
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = msg.filename
          a.click()
          URL.revokeObjectURL(url)
          setStatus(`Downloaded: ${msg.filename}`)
        } catch {
          setStatus('Download failed — check console.')
        } finally {
          setIsExporting(false)
        }
      } else if (msg.type === 'error') {
        setStatus(`Error: ${msg.message}`)
        setIsExporting(false)
      }
    })

    return cleanup
  }, [])

  function handleExport(): void {
    setStatus('Exporting…')
    setIsExporting(true)
    postToCode({type: 'export', format})
  }

  return (
    <div className="panel" role="tabpanel" id="panel-export" aria-labelledby="tab-export">
      <section className="section">
        <h2 className="section__title">Format</h2>
        <ul className="radiolist" role="radiogroup" aria-label="Export format">
          {EXPORT_FORMATS.map((option) => {
            const id = `fmt-${option.id}`
            const checked = option.id === format
            return (
              <li key={option.id} className="radiolist__item">
                <input
                  id={id}
                  type="radio"
                  name="export-format"
                  value={option.id}
                  className="radiolist__radio"
                  checked={checked}
                  onChange={() => setFormat(option.id)}
                />
                <label htmlFor={id} className="radiolist__label">
                  <span className="radiolist__title">{option.label}</span>
                  <span className="radiolist__desc">{option.description}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="section section--footer">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleExport}
          disabled={isExporting}
          aria-busy={isExporting}
        >
          {isExporting ? 'Exporting…' : 'Export'}
        </button>
      </section>

      <section className="section status" aria-live="polite" aria-atomic="true">
        {status.length > 0 && (
          <p className="status__message">{status}</p>
        )}
      </section>
    </div>
  )
}
