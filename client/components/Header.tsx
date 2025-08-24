import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Gamepad Tester', href: '/gamepad-tester' },
  { name: 'GPU Tester', href: '/gpu-tester' },
  { name: 'Mic Tester', href: '/mic-tester' },
  { name: 'MIDI Tester', href: '/midi-tester' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Blog', href: '/blog' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
            <Gamepad2 className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-xl font-bold text-gradient transition-all duration-300 group-hover:tracking-wide">GamepadChecker</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5"
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-all duration-300 hover:text-primary relative px-3 py-2 rounded-md hover-scale group",
                location.pathname === item.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="relative z-10">{item.name}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* Removed theme toggle to keep light theme only */}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50"></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <Gamepad2 className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gradient">GamepadChecker</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 p-2.5"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-accent",
                        location.pathname === item.href
                          ? "text-primary bg-primary/10"
                          : "text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                {/* Removed theme toggle to keep light theme only */}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
