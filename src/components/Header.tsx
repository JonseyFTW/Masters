'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, Users, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/golfers', label: 'Golfers', icon: Users },
  { href: '/rules', label: 'Rules', icon: BookOpen },
  { href: '/admin', label: 'Admin', icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-masters-card border-b border-masters-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-masters-green rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-masters-yellow" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-wider">MASTERS PICK &apos;EM</div>
            <div className="text-masters-yellow text-[10px] tracking-widest font-semibold">POOL 2026</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-masters-green text-white'
                    : 'text-masters-text hover:text-white hover:bg-masters-card-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
