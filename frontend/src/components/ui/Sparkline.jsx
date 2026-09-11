// A small inline trend line — the "up/down graph" used inside stat cards.
// Takes an array of numbers and draws a simple line + endpoint dot.
const Sparkline = ({ data, color = "#FF4D00" }) => {
    if (!data || data.length < 2) {
        return <div className="h-8 w-24" />
    }

    const width = 96
    const height = 32
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * (width - 4) + 2
        const y = height - 4 - ((value - min) / range) * (height - 8)
        return [x, y]
    })

    const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")
    const [lastX, lastY] = points[points.length - 1]

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
            <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
        </svg>
    )
}

export default Sparkline
