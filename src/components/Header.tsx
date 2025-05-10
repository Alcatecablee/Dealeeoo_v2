import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Users, DollarSign, Globe, Menu, Sparkles, Heart } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

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
    <header className="bg-background border-b border-border sticky top-0 z-50 text-foreground">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 gradient-text animate-pulse-soft">
            <div className="p-2 rounded-full bg-gradient-friendly text-white">
              <Shield className="h-6 w-6" />
            </div>
            Dealeeoo
          </Link>
        </div>
        {/* Centered Nav */}
        <nav className="hidden md:flex flex-1 justify-center space-x-6">
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
        </nav>
        {/* Create Deal Button - right aligned, pops out */}
        <div className="hidden md:flex items-center flex-shrink-0 ml-4">
          <Link to="/create-deal">
            <Button 
              className="bg-gradient-to-r from-friendly-blue via-friendly-purple to-friendly-green text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-2 px-6 py-2 border-0 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-friendly-blue"
              style={{ boxShadow: '0 4px 24px 0 rgba(80, 72, 229, 0.15)' }}
            >
              <DollarSign className="h-4 w-4" />
              Create Deal
            </Button>
          </Link>
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
                <div className="h-px bg-border my-2"></div>
                <Link 
                  to="/create-deal" 
                  className="text-lg font-medium text-primary flex items-center gap-2 hover:text-opacity-80 transition-colors"
                >
                  <DollarSign className="h-5 w-5" />
                  Create Deal
                </Link>
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
      {/* In the admin dashboard nav (visible only on /admin) */}
      {location.pathname.startsWith('/admin') && (
        <Link to="/admin-manual" className="ml-4 text-sm font-semibold text-gradient-friendly hover:underline">
          Admin Manual
        </Link>
      )}
    </header>
  );
};

export default Header;
