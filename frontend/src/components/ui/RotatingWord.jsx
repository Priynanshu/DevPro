import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

// Cycles through a list of words with a soft fade — same effect as
// Notion's homepage headline ("Create, Ship, Build...").
const RotatingWord = ({ words, interval = 2000 }) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length)
        }, interval)
        return () => clearInterval(timer)
    }, [words.length, interval])

    return (
        <span className="relative inline-block min-w-[3ch] text-center align-baseline">
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="inline-block text-accent-300"
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    )
}

export default RotatingWord
