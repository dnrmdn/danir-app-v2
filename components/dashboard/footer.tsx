"use client"

import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-[#020817]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-semibold text-white">Danir App</p>
          <p className="mt-1 max-w-xl text-slate-400">
            Personal productivity super app for tasks, calendar, rewards, money, meal planning, photos, and saved links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/calendar" className="hover:text-white transition">Calendar</Link>
          <Link href="/task" className="hover:text-white transition">Task</Link>
          <Link href="/money" className="hover:text-white transition">Money</Link>
          <Link href="/saved-links" className="hover:text-white transition">Saved Links</Link>
        </div>

        <p className="text-slate-500">© {currentYear} Danir App</p>
      </div>
    </footer>
  )
}
