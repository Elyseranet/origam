import {useState} from 'react'
import {ExportTab} from './ExportTab'
import {GenerateTab} from './GenerateTab'
import {SyncTab} from './SyncTab'
import {TabBar} from './TabBar'
import type {TTabId} from './constants'

export function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TTabId>('generate')

  return (
    <main className="app">
      <TabBar activeTab={activeTab} onSelect={setActiveTab} />

      <div className="app__body">
        {activeTab === 'generate' && <GenerateTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'sync' && <SyncTab />}
      </div>

      <footer className="app__footer" aria-label="Plugin metadata">
        <span className="app__brand">Origam DS Sync</span>
        <span className="app__version">v{__PLUGIN_VERSION__}</span>
      </footer>
    </main>
  )
}
