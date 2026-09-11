export const PRESET_ICONS = [
    "📁", "🚀", "💡", "🎯", "📊", "🛠️", "🔥", "⭐",
    "🎨", "📱", "💻", "🧩", "📌", "🗂️", "⚙️", "📈"
]

const IconPicker = ({ value, onChange }) => {
    return (
        <div className="grid grid-cols-8 gap-1.5">
            {PRESET_ICONS.map((icon) => (
                <button
                    key={icon}
                    type="button"
                    onClick={() => onChange(icon)}
                    className={`flex h-9 w-9 items-center justify-center rounded text-lg transition ${
                        value === icon
                            ? "bg-accent-500/15 ring-1 ring-accent-500"
                            : "bg-surface-high hover:bg-white/10"
                    }`}
                >
                    {icon}
                </button>
            ))}
        </div>
    )
}

export default IconPicker
