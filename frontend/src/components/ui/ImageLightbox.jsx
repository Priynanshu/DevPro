import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const ImageLightbox = ({ src, alt, open, onClose }) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 px-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(event) => event.stopPropagation()}
                        className="relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-10 right-0 rounded-full bg-surface/90 p-1.5 text-ink-muted hover:bg-surface"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={src}
                            alt={alt}
                            className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ImageLightbox
