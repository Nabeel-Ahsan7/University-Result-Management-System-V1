import React from 'react'
import Navbar from '@/components/Navbar'
import AdminLoginCard from '@/components/AdminLoginCard'
import { Link } from 'react-router-dom'

export default function AdminLoginPage() {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-12">
                <div className="w-full max-w-md mx-auto">
                    <AdminLoginCard />

                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center text-sm font-medium transition-colors"
                            style={{ color: "#025c53" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Back to main login
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-sm w-full" style={{ borderTopColor: "rgba(2, 92, 83, 0.2)", borderTopWidth: "1px", color: "#025c53" }}>
                <div className="container mx-auto max-w-7xl">
                    © {new Date().getFullYear()} University Result Management System. All rights reserved.
                </div>
            </footer>
        </div>
    )
}