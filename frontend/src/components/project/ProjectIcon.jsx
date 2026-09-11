const isImageUrl = (icon) => Boolean(icon) && (icon.startsWith("http://") || icon.startsWith("https://"))

// No colored background box behind the icon anymore — just the
// icon/image itself, sized a bit larger so it stays legible on its own.
const ProjectIcon = ({ icon, name, size = 40 }) => {
    const style = { width: size, height: size }

    if (isImageUrl(icon)) {
        return (
            <img
                src={icon}
                alt={name}
                style={style}
                className="shrink-0 rounded-xl object-cover"
            />
        )
    }

    if (icon && icon !== "xyz.jpg") {
        return (
            <div
                style={{ ...style, fontSize: size * 0.75 }}
                className="flex shrink-0 items-center justify-center"
            >
                <span>{icon}</span>
            </div>
        )
    }

    // No icon set yet — plain initials, still no background fill.
    return (
        <div
            style={{ ...style, fontSize: size * 0.4 }}
            className="flex shrink-0 items-center justify-center rounded-xl border border-border font-bold text-ink-muted"
        >
            {name?.slice(0, 2).toUpperCase()}
        </div>
    )
}

export default ProjectIcon
