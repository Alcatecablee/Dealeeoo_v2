import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Users, DollarSign, Globe, Menu, Sparkles, Heart, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

const Header: React.FC = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use the auth context to get user information
  const { user, isAuthenticated, signOut } = useAuth();
  const userEmail = user?.email || localStorage.getItem('userEmail');

  // Header hide/show on scroll
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!userEmail) return;
    fetchNotifications();
    // Subscribe to notifications
    const channel = supabase
      .channel(`public:notifications:user_email=eq.${userEmail}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_email=eq.${userEmail}`
      }, (payload) => {
        fetchNotifications();
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [userEmail]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY < 10 || currentY < lastScrollY) {
            setShowHeader(true);
          } else if (currentY > lastScrollY) {
            setShowHeader(false);
          }
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const fetchNotifications = async () => {
    if (!userEmail) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  };

  const markAllAsRead = async () => {
    if (!userEmail) return;
    await supabase.from('notifications').update({ read: true }).eq('user_email', userEmail).eq('read', false);
    fetchNotifications();
  };

  // Helper to scroll or navigate then scroll
  const handleNav = (section: string) => {
    if (location.pathname === '/') {
      scrollToSection(section);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(section), 100);
    }
  };

  return (
    <header className={`bg-background border-b border-border sticky top-0 z-50 text-foreground transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`} style={{ willChange: 'transform' }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <img src="/logo.png" alt="Dealeeoo" className="h-16 w-auto" />
          </Link>
        </div>
        {/* Centered Nav */}
        <nav className="hidden md:flex flex-1 justify-center space-x-6">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
            <Globe className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link to="/how-to" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
            <Sparkles className="h-4 w-4" />
            <span>How It Works</span>
          </Link>
          <button onClick={() => setComingSoon('Use Cases')} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
            <Heart className="h-4 w-4" />
            <span>Use Cases</span>
          </button>
          <button onClick={() => handleNav('faq')} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
            <Shield className="h-4 w-4" />
            <span>FAQ</span>
          </button>
          <button onClick={() => handleNav('contact')} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
            <Users className="h-4 w-4" />
            <span>Contact</span>
          </button>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
              <User className="h-4 w-4" />
              <span>My Dashboard</span>
            </Link>
          )}
        </nav>
        {/* Create Deal Button - right aligned, pops out */}
        <div className="hidden md:flex items-center flex-shrink-0 ml-4">
          {/* Notification Bell - only show for authenticated users */}
          {isAuthenticated && (
            <div className="relative mr-4">
              <button
                className="relative focus:outline-none"
                onClick={() => {
                  setShowDropdown((v) => !v);
                  if (unreadCount > 0) markAllAsRead();
                }}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                )}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-border font-semibold">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-muted-foreground text-sm">No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      n.link ? (
                        <button
                          key={n.id}
                          className={`w-full text-left p-3 border-b border-border text-sm hover:bg-blue-100 transition ${!n.read ? 'bg-blue-50' : ''}`}
                          onClick={() => { setShowDropdown(false); navigate(n.link); }}
                        >
                          <div className="font-medium">{n.type.replace(/_/g, ' ')}</div>
                          <div>{n.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </button>
                      ) : (
                        <div key={n.id} className={`p-3 border-b border-border text-sm ${!n.read ? 'bg-blue-50' : ''}`}>
                          <div className="font-medium">{n.type.replace(/_/g, ' ')}</div>
                          <div>{n.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      )
                    ))
                  )}
                  <div className="p-2 text-center">
                    <button className="text-primary text-xs underline" onClick={() => setShowDropdown(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* User Menu for authenticated users */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 focus:ring-2 focus:ring-offset-2 focus:ring-friendly-blue">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-friendly-blue/20 flex items-center justify-center text-friendly-blue font-medium">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm hidden sm:inline-block">
                      {user.full_name || user.email.split('@')[0]}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthModal />
          )}
          
          {/* Create Deal Button */}
          <Button 
            className="ml-4 bg-gradient-to-r from-friendly-blue via-friendly-purple to-friendly-green text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-2 px-6 py-2 border-0 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-friendly-blue"
            style={{ boxShadow: '0 4px 24px 0 rgba(80, 72, 229, 0.15)' }}
          onClick={() => {
            if (location.pathname === '/create-deal') {
              window.location.reload();
            } else {
              navigate('/create-deal');
            }
          }}
          >
            <DollarSign className="h-4 w-4" />
            Create Deal
          </Button>
        </div>
        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background text-foreground border-border backdrop-blur-md">
              <div className="flex flex-col space-y-6 pt-10">
                <button onClick={() => { handleNav('how'); }} className="text-lg font-medium text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                  <Sparkles className="h-5 w-5" />
                  How It Works
                </button>
                <button onClick={() => setComingSoon('Use Cases')} className="text-lg font-medium text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                  <Heart className="h-5 w-5" />
                  Use Cases
                </button>
                <button onClick={() => handleNav('faq')} className="text-lg font-medium text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                  <Shield className="h-5 w-5" />
                  FAQ
                </button>
                <button onClick={() => handleNav('contact')} className="text-lg font-medium text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                  <Users className="h-5 w-5" />
                  Contact
                </button>
                
                {isAuthenticated && (
                  <button onClick={() => navigate('/dashboard')} className="text-lg font-medium text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                    <User className="h-5 w-5" />
                    My Dashboard
                  </button>
                )}
                
                {isAuthenticated && (
                  <button onClick={() => navigate('/profile')} className="text-lg font-medium text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors focus:outline-none">
                    <Settings className="h-5 w-5" />
                    Profile Settings
                  </button>
                )}
                
                <div className="h-px bg-border my-2"></div>
                
                <button
                  className="text-lg font-medium text-primary flex items-center gap-2 hover:text-opacity-80 transition-colors"
                  onClick={() => {
                    if (location.pathname === '/create-deal') {
                      window.location.reload();
                    } else {
                      navigate('/create-deal');
                    }
                  }}
                >
                  <DollarSign className="h-5 w-5" />
                  Create Deal
                </button>
                
                {isAuthenticated ? (
                  <button
                    onClick={() => signOut()}
                    className="text-lg font-medium text-red-500 flex items-center gap-2 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Close sheet first then open auth modal
                      document.body.click(); // This will close the sheet in most cases
                      setTimeout(() => {
                        const authTriggerEl = document.querySelector('[data-auth-trigger]');
                        if (authTriggerEl) {
                          (authTriggerEl as HTMLElement).click();
                        }
                      }, 300);
                    }}
                    className="text-lg font-medium text-friendly-blue flex items-center gap-2 hover:text-friendly-purple transition-colors"
                  >
                    <User className="h-5 w-5" />
                    Sign In / Sign Up
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Waitlist Modal */}
      {waitlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full relative border border-border">
            <button className="absolute top-2 right-2 text-muted-foreground text-2xl" onClick={() => setWaitlistOpen(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-gradient-friendly">Join Waitlist</h2>
            <p className="mb-4 text-muted-foreground">Enter your email to get early access and updates.</p>
            <form onSubmit={e => { e.preventDefault(); setWaitlistOpen(false); alert('Thank you! You are on the waitlist.'); }}>
              <input type="email" required placeholder="Your email" className="w-full mb-4 px-3 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <Button type="submit" className="w-full bg-gradient-friendly text-white">Join</Button>
            </form>
          </div>
        </div>
      )}
      {/* Coming Soon Modal */}
      {comingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full relative border border-border">
            <button className="absolute top-2 right-2 text-muted-foreground text-2xl" onClick={() => setComingSoon(null)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-gradient-friendly">{comingSoon} Coming Soon</h2>
            <p className="mb-4 text-muted-foreground">This page is under construction. Stay tuned!</p>
            <Button className="w-full bg-gradient-friendly text-white" onClick={() => setComingSoon(null)}>Close</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
