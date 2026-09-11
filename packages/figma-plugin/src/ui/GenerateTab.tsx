import {useMemo, useState} from 'react'
import {postToCode} from '@/lib/messaging'
import {GENERATABLE_COMPONENTS} from './constants'

export function GenerateTab(): JSX.Element {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(GENERATABLE_COMPONENTS),
  )

  const allSelected = selected.size === GENERATABLE_COMPONENTS.length
  const noneSelected = selected.size === 0

  const sortedSelected = useMemo(
    () => GENERATABLE_COMPONENTS.filter((c) => selected.has(c)),
    [selected],
  )

  function toggle(component: string): void {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(component)) {
        next.delete(component)
      } else {
        next.add(component)
      }
      return next
    })
  }

  function selectAll(): void {
    setSelected(new Set(GENERATABLE_COMPONENTS))
  }

  function selectNone(): void {
    setSelected(new Set())
  }

  function handleDetect(): void {
    postToCode({type: 'detect-variables'})
  }

  function handleGenerate(): void {
    postToCode({type: 'generate-components', components: sortedSelected})
  }

  return (
    <div className="panel" role="tabpanel" id="panel-generate" aria-labelledby="tab-generate">
      {!bannerDismissed && (
        <div className="banner" role="note">
          <span className="banner__icon" aria-hidden="true">
            i
          </span>
          <span className="banner__text">
            Install <strong>Tokens Studio for Figma</strong> and import{' '}
            <code>tokens/</code> first.
          </span>
          <button
            type="button"
            className="banner__close"
            aria-label="Dismiss prerequisite banner"
            onClick={() => setBannerDismissed(true)}
          >
            ×
          </button>
        </div>
      )}

      <section className="section">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleDetect}
        >
          Detect Origam variables
        </button>
      </section>

      <section className="section">
        <header className="section__header">
          <h2 className="section__title">Components</h2>
          <div className="section__actions">
            <button
              type="button"
              className="link"
              onClick={selectAll}
              disabled={allSelected}
            >
              Select all
            </button>
            <span aria-hidden="true" className="link__sep">
              ·
            </span>
            <button
              type="button"
              className="link"
              onClick={selectNone}
              disabled={noneSelected}
            >
              Select none
            </button>
          </div>
        </header>

        <ul className="checklist" role="list">
          {GENERATABLE_COMPONENTS.map((component) => {
            const id = `cmp-${component}`
            const checked = selected.has(component)
            return (
              <li key={component} className="checklist__item">
                <input
                  id={id}
                  type="checkbox"
                  className="checklist__checkbox"
                  checked={checked}
                  onChange={() => toggle(component)}
                />
                <label htmlFor={id} className="checklist__label">
                  {component}
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
          disabled={noneSelected}
          onClick={handleGenerate}
        >
          Generate components
          {selected.size > 0 && (
            <span className="btn__count" aria-hidden="true">
              {selected.size}
            </span>
          )}
        </button>
      </section>
    </div>
  )
}
