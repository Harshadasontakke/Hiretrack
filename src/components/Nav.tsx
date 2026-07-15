"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/jobs" className="text-lg font-semibold text-slate-900">
          HireTrack
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
            Jobs
          </Link>
          <Link href="/applicants" className="text-slate-600 hover:text-slate-900">
            Applicants
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-600 hover:text-slate-900"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
