import { Link, useLocation } from 'react-router-dom'
import { Home } from 'lucide-react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen">
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-700 bg-slate-900/95 pb-safe backdrop-blur">
        <div className="flex justify-center gap-8 py-3">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 px-4 py-1 ${
              isHome ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
