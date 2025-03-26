import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import LoginCard from '@/components/LoginCard'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen w-full" style={{ backgroundColor: "#edf2fa" }}>
            <Navbar />

            <main className="flex-1 flex items-center justify-center w-full px-4 py-8 sm:py-12 lg:py-16">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: "#025c53" }}>
                                University Result Management System
                            </h1>
                            <p className="text-lg sm:text-xl" style={{ color: "rgba(2, 92, 83, 0.7)" }}>
                                Access your academic results and manage exam information in one place.
                            </p>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <div className="rounded-full p-1" style={{ backgroundColor: "rgba(2, 92, 83, 0.1)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#025c53" }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span style={{ color: "#025c53" }}>Access exam results online</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="rounded-full p-1" style={{ backgroundColor: "rgba(2, 92, 83, 0.1)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#025c53" }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span style={{ color: "#025c53" }}>View and download grade sheets</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="rounded-full p-1" style={{ backgroundColor: "rgba(2, 92, 83, 0.1)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#025c53" }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span style={{ color: "#025c53" }}>Teachers can submit exam marks</span>
                            </li>
                        </ul>

                        <div className="hidden sm:block pt-4">
                            <p style={{ color: "rgba(2, 92, 83, 0.8)" }}>
                                Our secure platform ensures accurate results delivery while maintaining data integrity
                                and confidentiality for all users.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <LoginCard />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-sm w-full" style={{ borderTopColor: "rgba(2, 92, 83, 0.2)", borderTopWidth: "1px", color: "#025c53" }}>
                <div className="container mx-auto max-w-7xl">
                    © {new Date().getFullYear()} University Result Management System. All rights reserved.
                    <div className="mt-2">
                        <Link to="/developers" className="hover:underline">Developers</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}