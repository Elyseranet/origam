export function SyncTab(): JSX.Element {
  return (
    <div className="panel" role="tabpanel" id="panel-sync" aria-labelledby="tab-sync">
      <div className="empty">
        <h2 className="empty__title">Sync — coming soon</h2>
        <p className="empty__text">
          v2 will pull tokens from the repo back into Figma: open a branch,
          fetch <code>tokens/</code>, and rewrite the matching Figma Variables
          + Effect / Text styles in place.
        </p>
        <p className="empty__text empty__text--muted">
          Until then, edits flow Figma → repo via the <strong>Export</strong>{' '}
          tab.
        </p>
      </div>
    </div>
  )
}
