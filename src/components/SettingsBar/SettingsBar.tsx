import './SettingsBar.css'

export interface Settings {
  noDupeRiders: boolean
  noDupeStars: boolean
  allowLegendary: boolean
}

const OPTIONS: { key: keyof Settings; label: string; hint: string }[] = [
  {
    key: 'noDupeStars',
    label: 'No dupe stars',
    hint: 'Each star may only be used on one course',
  },
  {
    key: 'noDupeRiders',
    label: 'No dupe riders',
    hint: 'Each rider may only be used on one course',
  },
  {
    key: 'allowLegendary',
    label: 'Legendary stars',
    hint: 'Allow Dragoon, Hydra, Leo and Gigantes',
  },
]

interface Props {
  settings: Settings
  onChange: (settings: Settings) => void
}

export default function SettingsBar({ settings, onChange }: Props) {
  return (
    <div className="settings-bar">
      <span className="label">Ruleset</span>
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`toggle${settings[option.key] ? ' on' : ''}`}
          title={option.hint}
          aria-pressed={settings[option.key]}
          onClick={() =>
            onChange({ ...settings, [option.key]: !settings[option.key] })
          }
        >
          <span className="dot" />
          {option.label}
        </button>
      ))}
    </div>
  )
}
