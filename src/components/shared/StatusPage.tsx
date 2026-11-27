import Image from "next/image";
import React from "react";

interface StatusPageProps {
  code: string;
  title: string;
  body: string;
  children: React.ReactNode;
}

/** Full-page message used by the 404 and error routes. */
export default function StatusPage({ code, title, body, children }: StatusPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="" width={40} height={40} priority />
          <span className="text-left leading-tight">
            <span className="block text-lg font-bold text-slate-900">Builders Liability</span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#028835]">Portal</span>
          </span>
        </div>
        <p className="font-mono text-sm font-semibold text-[#028835]">{code}</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="text-slate-600">{body}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>
        <p className="text-sm text-slate-500">
          Need help? Call AMMC on <span className="font-medium text-slate-700">+234 806 006 0826</span>.
        </p>
      </div>
    </main>
  );
}

export const primaryActionClass =
  "inline-flex items-center rounded-lg bg-[#028835] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#026c2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028835] focus-visible:ring-offset-2";

export const secondaryActionClass =
  "inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028835] focus-visible:ring-offset-2";
