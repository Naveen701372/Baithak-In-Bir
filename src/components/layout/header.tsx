'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import BrandingDisplay from '@/components/ui/BrandingDisplay'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BrandingDisplay
              size="lg"
              logoClassName="h-12 w-auto object-contain"
              textClassName="text-2xl font-light tracking-wide"
              showTagline={true}
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/"
              className="text-gray-700 hover:text-black transition-colors font-light tracking-wide"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="text-gray-700 hover:text-black transition-colors font-light tracking-wide"
            >
              Menu
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-700 hover:text-black">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}