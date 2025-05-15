'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-6">
        <Image
          src="https://img.icons8.com/ios-filled/50/000000/airplane-take-off.png"
          alt="Company Logo"
          width={28}
          height={28}
        />
        <span className="text-lg font-semibold text-gray-800">FrachtExpress</span>
      </Link>
      <nav className="flex pl-6 gap-6 text-sm text-gray-700">
        <Link href="/track" className="hover:underline hover:underline-offset-4">
          Track
        </Link>
        <Link href="/services" className="hover:underline hover:underline-offset-4">
          Services
        </Link>
        <Link href="/about" className="hover:underline hover:underline-offset-4">
          About
        </Link>
        <Link href="/support" className="hover:underline hover:underline-offset-4">
          Support
        </Link>
      </nav>
    </header>
  );
}
