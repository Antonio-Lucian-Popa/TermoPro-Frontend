import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, ClipboardList, Home, LayoutDashboard, LogOut, PackageOpen, Settings, User, Users, AppWindowIcon as WindowIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { Separator } from '@/components/ui/separator';

interface MobileSidebarProps {
  onNavigate?: () => void;
}

export default function MobileSidebar({ onNavigate }: MobileSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
      exact: true
    },
    {
      name: 'Echipe',
      href: '/teams',
      icon: <Users className="mr-2 h-5 w-5" />,
      roles: [Role.OWNER, Role.MANAGER]
    },
    {
      name: 'Sarcini',
      href: '/tasks',
      icon: <ClipboardList className="mr-2 h-5 w-5" />
    },
    {
      name: 'Comenzi',
      href: '/orders',
      icon: <PackageOpen className="mr-2 h-5 w-5" />
    },
    {
      name: 'Timp liber',
      href: '/timeoff',
      icon: <CalendarDays className="mr-2 h-5 w-5" />
    },
    {
      name: 'Invitații',
      href: `/invitations/${user?.companyId}`,
      icon: <Users className="mr-2 h-5 w-5" />,
      roles: [Role.OWNER, Role.MANAGER]
    }
  ];
  
  const adminItems = [
    {
      name: 'Setări firmă',
      href: `/company/${user?.companyId}`,
      icon: <Settings className="mr-2 h-5 w-5" />,
      roles: [Role.OWNER, Role.MANAGER]
    },
  ];

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate();
  };

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <WindowIcon className="h-6 w-6" />
          <span className="font-semibold text-lg">Termopan Manager</span>
        </div>
      </div>
      
      {/* User info */}
      {user && (
        <div className="p-4 border-b">
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            // Skip if user doesn't have required role
            if (item.roles && (!user || !item.roles.includes(user.role))) {
              return null;
            }
            
            const active = item.exact 
              ? location.pathname === item.href 
              : isActive(item.href);
              
            return (
              <Link key={item.href} to={item.href} onClick={handleClick}>
                <Button
                  variant={active ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start mb-1',
                    active ? 'font-medium' : 'font-normal'
                  )}
                >
                  {item.icon}
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Admin section */}
      {user && (user.role === Role.OWNER || user.role === Role.MANAGER) && (
        <div className="py-4 border-t">
          <div className="px-4 mb-2 text-xs uppercase font-semibold text-muted-foreground">
            Administrare
          </div>
          <nav className="px-3 space-y-1">
            {adminItems.map((item) => {
              // Skip if user doesn't have required role
              if (item.roles && (!user || !item.roles.includes(user.role))) {
                return null;
              }
              
              const active = isActive(item.href);
              
              return (
                <Link key={item.href} to={item.href} onClick={handleClick}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start mb-1',
                      active ? 'font-medium' : 'font-normal'
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
      
      {/* User actions */}
      <div className="py-4 border-t">
        <nav className="px-3 space-y-1">
          <Link to="/profile" onClick={handleClick}>
            <Button variant="ghost" className="w-full justify-start mb-1">
              <User className="mr-2 h-5 w-5" />
              Profil
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-1 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Deconectare
          </Button>
        </nav>
      </div>
    </div>
  );
}