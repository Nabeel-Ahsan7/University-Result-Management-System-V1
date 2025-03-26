import React from 'react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b shadow-md" style={{ backgroundColor: "#025c53" }}>
            <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    <span className="text-xl font-bold hidden sm:inline-block">Result Management System</span>
                    <span className="text-xl font-bold sm:hidden">RMS</span>
                </div>
                <nav className="flex items-center gap-3">
                    <Button
                        style={{ backgroundColor: "#03736a" }}
                        className="text-white hover:bg-white/20 transition-colors"
                    >
                        About
                    </Button>
                    <Button
                        style={{ backgroundColor: "#03736a" }}
                        className="text-white hover:bg-white/20 transition-colors hidden sm:inline-flex"
                    >
                        Contact
                    </Button>
                </nav>
            </div>
        </header>
    )
}