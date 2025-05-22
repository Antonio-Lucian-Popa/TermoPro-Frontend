import { Link, useLocation } from 'react-router-dom';
import { 
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  PackageOpen,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

export default function MobileNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: undefined
    },
    {
      name: 'Echipe',
      href: '/teams',
      icon: <Users className="h-5 w-5" />,
      roles: [Role.OWNER, Role.MANAGER]
    },
    {
      name: 'Sarcini',
      href: '/tasks',
      icon: <ClipboardList className="h-5 w-5" />,
      roles: undefined
    },
    {
      name: 'Comenzi',
      href: '/orders',
      icon: <PackageOpen className="h-5 w-5" />,
      roles: undefined
    },
    {
      name: 'Timp liber',
      href: '/timeoff',
      icon: <CalendarDays className="h-5 w-5" />,
      roles: undefined
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-card py-2 px-4">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          // Skip if user doesn't have required role
          if (item.roles && (!user || !item.roles.includes(user.role))) {
            return null;
          }
          
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}