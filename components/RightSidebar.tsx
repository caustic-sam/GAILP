import Link from 'next/link';

// Compact top navigation (48px) with blue gradient like the screenshot
export default function Navigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-12 border-b border-blue-900/20 bg-gradient-to-b from-[#1e3a5f] to-[#2d5a8f] text-blue-50 shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 md:px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[13px] font-semibold leading-none">World Papers</span>
          <span className="hidden md:inline-block text-[11px] leading-none opacity-80">
            Global Policy Analysis
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden md:flex items-center gap-5 text-[13px]">
          <Link href="/updates" className="hover:underline">Policy Updates</Link>
          <Link href="/blog" className="hover:underline">Expert Blog</Link>
          <Link href="/live-policy" className="hover:underline">Live Policy</Link>
          <Link href="/law-policy" className="hover:underline">Law &amp; Policy</Link>
          <Link href="/research" className="hover:underline">Research</Link>
          <Link href="/about" className="hover:underline">About</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded border border-white/25 bg-white/5 px-3 py-1 text-[12px] leading-none hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/subscribe"
            className="rounded bg-[#ff8a3d] px-3 py-1 text-[12px] leading-none text-white hover:brightness-110"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </header>
  );
}
