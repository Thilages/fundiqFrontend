'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  // Don't show sidebar on login page
  const isLoginPage = pathname === '/login';

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Login page - show without sidebar
  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Protected routes - show with sidebar
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar />
          <main className="w-[80vw]">{children}</main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
