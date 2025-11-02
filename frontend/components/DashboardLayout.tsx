import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Settings,
  FileText
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sheets', href: '/dashboard/sheets', icon: FileText },
  { name: 'Rooms', href: '/dashboard/rooms', icon: Building },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center transition-transform hover:scale-105">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Building className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Rooming
              </span>
            </Link>
          </div>
          
          <nav className="flex-1 mt-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm scale-[1.02]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-[1.01]'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer info */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              v1.0.0 © 2025 Rooming
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}