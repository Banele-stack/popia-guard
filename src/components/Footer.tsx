import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--accent)]" aria-hidden="true" />
          <span className="text-sm text-[var(--foreground-muted)]">
            POPIAGuard &mdash; POPIA Compliance Tracking
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--foreground-muted)]">
          <Link href="/" className="hover:text-[var(--foreground)]">
            Dashboard
          </Link>
          <Link href="/operators" className="hover:text-[var(--foreground)]">
            Operators
          </Link>
          <Link href="/processing-activities" className="hover:text-[var(--foreground)]">
            Processing Activities
          </Link>
          <Link href="/breaches" className="hover:text-[var(--foreground)]">
            Breaches
          </Link>
          <span>Aligned to the Protection of Personal Information Act, 2013</span>
        </nav>
      </div>
    </footer>
  );
}
