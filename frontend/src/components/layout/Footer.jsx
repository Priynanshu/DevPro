const Footer = () => {
    return (
        <footer className="border-t border-border bg-canvas py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink-faint md:flex-row">
                <p>© {new Date().getFullYear()} DevPro</p>
                <p className="font-mono text-xs">React · Node.js · MongoDB · Redis · AI</p>
            </div>
        </footer>
    )
}

export default Footer
