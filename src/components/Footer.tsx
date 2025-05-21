'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center py-4 border-t mt-8 text-sm text-gray-600">
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="/track"
    >
      <Image
        aria-hidden
        src="https://img.icons8.com/ios-filled/50/000000/delivery.png"
        alt="Truck icon"
        width={20}
        height={20}
      />
      Track Shipment
    </a>
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="/support"
    >
      <Image
        aria-hidden
        src="https://img.icons8.com/ios-filled/50/000000/help.png"
        alt="Support icon"
        width={20}
        height={20}
      />
      Contact Support
    </a>

    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="/services"
    >
      <Image
        aria-hidden
        src="https://img.icons8.com/ios-filled/50/000000/box.png"
        alt="Box icon"
        width={20}
        height={20}
      />
      Our Services
    </a>

    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="/about"
    >
      <Image
        aria-hidden
        src="https://img.icons8.com/ios-filled/50/000000/info.png"
        alt="Info icon"
        width={20}
        height={20}
      />
      About Us
    </a>
  </footer>
  );
}
