'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, Users, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Board', icon: Trophy },
  { href: '/golfers', label: 'Golfers', icon: Users },
  { href: '/rules', label: 'Rules', icon: BookOpen },
  { href: '/admin', label: 'Admin', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-masters-card border-t border-masters-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-masters-yellow' : 'text-masters-text'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
