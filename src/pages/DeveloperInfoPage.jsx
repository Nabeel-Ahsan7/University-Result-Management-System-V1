import React from 'react';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import developerImage1 from '../assets/developer1.jpg';
import developerImage2 from '../assets/developer2.jpg';

const DeveloperInfoPage = () => {
    return (
        <div className="flex flex-col min-h-screen w-full" style={{ backgroundColor: "#edf2fa" }}>
            <Navbar />

            <main className="flex-1 w-full px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back button */}
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm mb-8 hover:underline"
                        style={{ color: "#025c53" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header / Banner */}
                        <div className="h-48 bg-gradient-to-r from-teal-600 to-teal-800 flex items-center justify-center relative">
                            <h1 className="text-4xl font-bold text-white text-center z-10">The Developers</h1>
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0 bg-pattern"></div>
                            </div>
                        </div>

                        <div className="p-6 md:p-10">
                            <p className="text-lg text-center mb-12" style={{ color: "#025c53" }}>
                                Meet the team who brought the University Result Management System to life
                            </p>

                            {/* Lead Developer Section */}
                            <div className="mb-16 grid md:grid-cols-2 gap-10 items-center">
                                <div className="order-2 md:order-1">
                                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#025c53" }}>Nabeel Ahsan</h2>
                                    <p className="text-gray-600 mb-4">
                                        Full Stack Developer & Project Lead. With a passion for clean code and user-friendly design,
                                        led the development of the entire University Result Management System from concept to deployment.
                                    </p>

                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-2" style={{ color: "#025c53" }}>Technical Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JWT", "REST API", "JavaScript"].map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 text-sm rounded-full"
                                                    style={{ backgroundColor: "rgba(2, 92, 83, 0.1)", color: "#025c53" }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: "#025c53" }}>
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            <a href="mailto:nabeelahsanofficial@gmail.com" className="hover:underline">nabeelahsanofficial@gmail.com</a>
                                        </div>
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: "#025c53" }}>
                                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                            </svg>
                                            <a href="https://github.com/Nabeel-Ahsan7" target="_blank" rel="noopener noreferrer" className="hover:underline">https://github.com/Nabeel-Ahsan7</a>
                                        </div>
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: "#025c53" }}>
                                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                                <rect x="2" y="9" width="4" height="12"></rect>
                                                <circle cx="4" cy="4" r="2"></circle>
                                            </svg>
                                            <a href="https://www.linkedin.com/in/nabeel-ahsan-229475252" target="_blank" rel="noopener noreferrer" className="hover:underline">https://www.linkedin.com/in/nabeel-ahsan-229475252</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-1 md:order-2 flex justify-center">
                                    <div className="w-64 h-64 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: "#025c53" }}>
                                        {/* Replace with actual image URL */}
                                        <img
                                            src={developerImage1}
                                            alt="Nabeel Ahsan"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Developer Section */}
                            <div className="mb-16 grid md:grid-cols-2 gap-10 items-center">
                                <div>
                                    <div className="w-64 h-64 rounded-full overflow-hidden border-4 shadow-lg mx-auto" style={{ borderColor: "#025c53" }}>
                                        {/* Replace with actual image URL */}
                                        <img
                                            src={developerImage2}
                                            alt="Nusrat Jahan"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#025c53" }}>Nusrat Jahan</h2>
                                    <p className="text-gray-600 mb-4">
                                        Frontend Developer & UI/UX Designer. Nusrat's eye for design and user experience
                                        helped create an intuitive and accessible interface that makes complex academic data
                                        easy to navigate.
                                    </p>

                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-2" style={{ color: "#025c53" }}>Technical Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {["React", "Tailwind CSS", "UI/UX Design", "Figma", "JavaScript", "HTML/CSS", "Responsive Design"].map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 text-sm rounded-full"
                                                    style={{ backgroundColor: "rgba(2, 92, 83, 0.1)", color: "#025c53" }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: "#025c53" }}>
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            <a href="mailto:nusrat@example.com" className="hover:underline">nusrat@example.com</a>
                                        </div>
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: "#025c53" }}>
                                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                            </svg>
                                            <a href="https://twitter.com/nusratjahan" target="_blank" rel="noopener noreferrer" className="hover:underline">twitter.com/nusratjahan</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Information Section */}
                            <div className="bg-gray-50 p-8 rounded-lg">
                                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#025c53" }}>About the Project</h2>

                                <div className="space-y-6">
                                    <p className="text-gray-700">
                                        The University Result Management System was developed to streamline the process
                                        of recording, calculating, and distributing academic results for both students
                                        and faculty. The system provides separate interfaces for students, teachers,
                                        external examiners, and administrative staff.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-semibold mb-2" style={{ color: "#025c53" }}>Core Features</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                <li>Secure user authentication and role-based access</li>
                                                <li>Internal and external marking system</li>
                                                <li>Automated GPA calculation</li>
                                                <li>Downloadable PDF transcripts</li>
                                                <li>Course registration and improvement tracking</li>
                                                <li>Exam committee management</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-2" style={{ color: "#025c53" }}>Technology Stack</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                <li>Frontend: React, Tailwind CSS</li>
                                                <li>Backend: Node.js, Express</li>
                                                <li>Database: MongoDB</li>
                                                <li>Authentication: JWT</li>
                                                <li>PDF Generation: jsPDF</li>
                                                <li>Deployment: Docker, AWS</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <p className="text-gray-700">
                                        This project was developed as part of a graduation thesis at Jatiya Kabi Kazi Nazrul Islam University,
                                        with the aim of creating an open-source solution that can be adapted for use in universities across Bangladesh.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-sm w-full" style={{ borderTopColor: "rgba(2, 92, 83, 0.2)", borderTopWidth: "1px", color: "#025c53" }}>
                <div className="container mx-auto max-w-7xl">
                    © {new Date().getFullYear()} University Result Management System. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default DeveloperInfoPage;