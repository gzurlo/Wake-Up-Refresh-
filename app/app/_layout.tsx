'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      href: '/',
      icon: 'house.fill',
      isActive: pathname === '/',
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: 'paperplane.fill',
      isActive: pathname === '/explore',
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Bottom Tab Navigation */}
      <nav className="flex border-t border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex-1 flex flex-col items-center py-2"
          >
            <HapticTab isActive={tab.isActive}>
              <IconSymbol 
                size={28} 
                name={tab.icon} 
                color={tab.isActive ? Colors[colorScheme ?? 'light'].tint : '#666'} 
              />
              <span className="text-xs mt-1">{tab.name}</span>
            </HapticTab>
          </Link>
        ))}
      </nav>
    </div>
  );
}
