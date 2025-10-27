/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ResultsHeaderProps {
  analyzedUrl?: string;
  onGoHome: () => void;
  showPlan?: boolean;
  onLogout?: () => void;
}

export default function ResultsHeader({
  onGoHome,
  showPlan = false,
  onLogout,
}: ResultsHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const links = [
    { label: 'Statistics', href: '#stats' },
    { label: 'Goal Planning', href: '#goals' },
    ...(showPlan ? [{ label: 'Plan', href: '#plan' }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, y: -10 },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: easeInOut, staggerChildren: 0.1 },
    },
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-4 z-50 w-full transition-all duration-500 ${isScrolled ? 'scale-[0.99]' : 'scale-100'
        }`}
    >
      <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 shadow-md backdrop-blur-xl transition-all duration-500">
        {/* Left: Home Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onGoHome}
          className="inline-flex items-center justify-center h-9 px-3 rounded-md font-semibold tracking-wide shadow-sm transition-all"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #d1d5db',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          SkillRack Tracker
        </motion.button>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-x-4">
          {links.map((link) => (
            <motion.button
              key={link.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleScroll(link.href)}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-gray-100"
              style={{ color: '#000000' }}
            >
              {link.label}
            </motion.button>
          ))}
        </nav>

        {/* Right: Menu / Logout */}
        <div className="flex items-center gap-2">
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="hidden md:inline-flex border-gray-300 hover:bg-gray-100"
              style={{ color: '#000000' }}
            >
              Logout
            </Button>
          )}


          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center rounded-lg p-2 transition-all"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #d1d5db',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute right-4 top-20 z-40 w-[90%] max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <motion.button
                  key={link.href}
                  onClick={() => handleScroll(link.href)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-base font-medium py-2 px-4 text-right rounded-md hover:bg-gray-100 transition-all"
                  style={{ color: '#000000' }}
                >
                  {link.label}
                </motion.button>
              ))}

              {onLogout && (
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-gray-300 hover:bg-gray-100 w-full"
                  style={{ color: '#000000' }}
                >
                  Logout
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
