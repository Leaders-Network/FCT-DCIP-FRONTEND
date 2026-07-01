'use client';

import React from 'react';
import Image from 'next/image';
import OTPAuthentication from '@/components/admin/OTPAuthentication';

const Page = () => {
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
                                Verify access
                            </p>
                            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                                Confirm your sign-in with a one-time code.
                            </h2>
                            <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                We use OTP verification to keep your surveyor account secure while giving you a
                                fast path back into the dashboard.
                            </p>
                        </section>

                        <section className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white/92 p-3 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
                            <OTPAuthentication />
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Page;
