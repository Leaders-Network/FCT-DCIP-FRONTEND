import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const RegistrationSuccess = () => {
    return (
        <div
            className="items-center justify-center bg-cover bg-center min-h-screen"
            style={{ backgroundImage: "url(/abuja-bg.png)" }}
        >
            <div className="w-full px-8 flex items-center justify-start">
                <Image src="/logo.png" alt="Logo" width={180} height={180} />
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <main className="grid md:grid-cols-2 grid-cols-1 items-center justify-center md:space-x-10 p-5 md:p-0">
                    <div className="text-center md:text-left">
                        <h2 className="text-white text-2xl md:text-5xl max-w-xl font-bold mb-4">
                            Defense Critical Infrastructure Program
                        </h2>
                        <h3 className="text-white text-base md:text-xl font-medium mb-8">
                            Protect your Property with Confidence
                        </h3>
                    </div>
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                    Password Reset Successful!
                                </h2>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Your password has been successfully reset. You can now login with your new password.
                                </p>
                            </div>

                            <Link
                                href="/surveyor"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
                            >
                                Continue to Login
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default RegistrationSuccess