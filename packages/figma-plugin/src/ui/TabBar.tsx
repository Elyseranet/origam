import {TABS, type TTabId} from './constants'

interface ITabBarProps {
  activeTab: TTabId
  onSelect: (id: TTabId) => void
}

export function TabBar({activeTab, onSelect}: ITabBarProps): JSX.Element {
  return (
    <nav className="tabbar" role="tablist" aria-label="Plugin sections">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`tabbar__tab${isActive ? ' tabbar__tab--active' : ''}`}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
