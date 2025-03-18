
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Clock, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium hover:bg-accent group",
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
    )}
    onClick={onClick}
  >
    <Icon className={cn(
      "h-5 w-5 transition-all",
      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
    )} />
    {label}
  </Link>
);

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const navItems = [
    { to: "/dashboard", icon: CheckSquare, label: "Tasks" },
    { to: "/timer", icon: Clock, label: "Timer" },
    { to: "/calendar", icon: CalendarIcon, label: "Calendar" },
    { to: "/statistics", icon: BarChart, label: "Statistics" },
  ];
  
  const closeMenu = () => setMobileMenuOpen(false);
  
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col h-screen w-64 border-r border-border/50 bg-sidebar p-4">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">Time Cataloger</h1>
        </div>
        
        <div className="space-y-1 mt-8">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </div>
        
        <div className="mt-auto">
          <div className="border-t border-border/50 pt-4 pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-start gap-2 px-4 hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 glass-panel border-b border-border/30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Time Cataloger</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-background/95 backdrop-blur-sm md:hidden pt-16">
          <div className="container p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to}
                  onClick={closeMenu}
                />
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/30">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500 mt-2"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
