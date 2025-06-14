"use client";

import Link from "next/link";
import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="bg-black/50 backdrop-filter backdrop-blur-lg border-b border-blue-800/20 text-white sticky top-0 z-50 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
            Cure-AI
          </Link>
          {/* Navigation Links - Minimalistic */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/home" className="text-gray-300 hover:text-white transition-colors text-sm">Application</Link>
          </nav>
        </div>

        {/* Right Icons (optional - keeping minimal) */}
        <div className="flex items-center space-x-4">
          <Link href="/home">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
              Launch App
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}; 