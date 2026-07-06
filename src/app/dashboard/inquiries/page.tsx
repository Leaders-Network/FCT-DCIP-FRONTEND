"use client";
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import UserInquiriesHub from '@/components/user/UserInquiriesHub';

const UserInquiriesPage = () => {
    return (
        <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
                            <Sparkles className="h-3.5 w-3.5" />
                            Inquiry desk
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Inquiries</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                            Track, raise, and review conflict inquiries in a cleaner, more focused workflow.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
                        <MessageSquare className="h-4 w-4" />
                        Resolution tracking
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <UserInquiriesHub />
            </div>
        </div>
    );
};

export default UserInquiriesPage;
