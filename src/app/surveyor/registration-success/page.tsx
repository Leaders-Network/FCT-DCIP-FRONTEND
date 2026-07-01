import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const RegistrationSuccess = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <Image
                src="/abuja-bg.png"
                alt="FCT background"
                fill
                className="object-cover opacity-30"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-emerald-950/85 to-slate-900/95" />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <Image src="/logo.svg" alt="Logo" width={148} height={148} className="h-16 w-16 rounded-2xl bg-white p-2 shadow-lg shadow-emerald-900/30 sm:h-20 sm:w-20" />
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">Builders Liability</p>
                        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">Surveyor Portal</h1>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center py-8">
                    <main className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <section className="space-y-6 text-center lg:text-left">
                            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 backdrop-blur">
                                Account ready
                            </p>
                            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                                Password reset successful.
                            </h2>
                            <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                Your surveyor account is ready to go. Sign in with your new password and continue
                                reviewing assignments, inspections, and reports.
                            </p>
                        </section>

                        <section className="mx-auto w-full max-w-md">
                            <div className="rounded-[2rem] border border-white/15 bg-white/92 p-6 text-slate-900 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl sm:p-8">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
                                    Password Reset Successful
                                </h2>
                                <p className="mt-3 text-center text-sm leading-6 text-slate-600">
                                    You can now continue to the surveyor login page and sign in with your updated
                                    credentials.
                                </p>

                                <Link
                                    href="/surveyor"
                                    className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#028835] to-emerald-700 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    Continue to Login
                                </Link>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
