import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/ui/sidebar';
import { ToastContainer } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SentinelOps | Application Error Monitoring & Boundary Hardening Platform',
  description:
    'SentinelOps is an internal developer operations dashboard for monitoring application errors, hardening error boundaries, and integrating with Sentry for comprehensive observability.',
  keywords: ['error monitoring', 'sentry', 'error boundary', 'observability', 'nextjs'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans h-screen flex flex-col overflow-hidden`}>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 48px' }}>
              {children}
            </div>
          </main>
        </div>

        <ToastContainer />
      </body>
    </html>
  );
}
