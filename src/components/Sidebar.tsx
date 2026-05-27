'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      setIsLightMode(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  const handleLogout = () => {
    // In a real app we would clear session/cookies here
    router.push('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', href: '/dashboard' },
    { icon: Building2, label: 'Empresas', href: '/dashboard/companies' },
    { icon: Users, label: 'Contactos', href: '/dashboard/contacts' },
  ];

  const investmentItems = [
    { icon: Building2, label: 'Empresas', href: '/dashboard/investment/companies' },
    { icon: Users, label: 'Contactos', href: '/dashboard/investment/contacts' },
  ];

  const adminItems = [
    { icon: ShieldAlert, label: 'Usuarios', href: '/admin/users' },
    { icon: Settings, label: 'Configuración', href: '/admin/settings' },
  ];

  return (
    <nav className="w-72 border-r border-card-border h-screen sticky top-0 flex flex-col p-6 bg-sidebar-bg">
      <div className="mb-10 px-4">
        <h2 className="text-2xl font-black text-gradient tracking-tighter">BI TOP AI Ventures</h2>
        <div className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">Premium Edition</div>
      </div>

      <div className="space-y-8 flex-grow">
        <div>
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-4 mb-4">BI Comercial</div>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                  pathname === item.href ? "bg-accent/10 text-accent shadow-lg shadow-accent/5" : "text-text-secondary hover:bg-glass hover:text-text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={clsx("w-5 h-5", pathname === item.href ? "text-accent" : "text-text-dim group-hover:text-text-primary")} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {pathname === item.href && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-4 mb-4">BI Inversión</div>
          <div className="space-y-1">
            {investmentItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                  pathname === item.href ? "bg-accent/10 text-accent shadow-lg shadow-accent/5" : "text-text-secondary hover:bg-glass hover:text-text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={clsx("w-5 h-5", pathname === item.href ? "text-accent" : "text-text-dim group-hover:text-text-primary")} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {pathname === item.href && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-4 mb-4">Administración</div>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                  pathname === item.href ? "bg-accent/10 text-accent shadow-lg shadow-accent/5" : "text-text-secondary hover:bg-glass hover:text-text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={clsx("w-5 h-5", pathname === item.href ? "text-accent" : "text-text-dim group-hover:text-text-primary")} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {pathname === item.href && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-card-border space-y-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-secondary hover:bg-glass hover:text-text-primary transition-colors group"
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="font-semibold text-sm">Modo {isLightMode ? 'Noche' : 'Día'}</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-error hover:bg-error/10 transition-colors group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
}
