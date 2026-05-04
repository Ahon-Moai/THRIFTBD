import { ShoppingBag, User as UserIcon, Search, Menu, Moon, Sun, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Header({ onCartClick }: { onCartClick: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleUserChange = async (u: any) => {
      setUser(u);
      if (u) {
        const admins = [
          'studiosventa@gmail.com', 
          'thriftbd71@gmail.com', 
          'mimpy124ahon124@gmail.com'
        ];
        const userEmail = (u.email || '').toLowerCase();
        const isUserAdmin = admins.includes(userEmail);
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
    };

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    if (!isSupabaseConfigured) {
      return () => window.removeEventListener('scroll', handleScroll);
    }
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        handleUserChange(session?.user ?? null);
      })
      .catch(err => {
        console.error('Session retrieval fault:', err);
        handleUserChange(null);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserChange(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) throw error;
      setIsLoginFormOpen(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Invalid credentials');
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const navigate = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled || isMobileMenuOpen ? 'bg-brand-offwhite/80 backdrop-blur-md border-b border-black/5 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1 text-black"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
              <a href="/shop" onClick={(e) => navigate(e, '/shop')} className="text-black hover:opacity-60 transition-opacity">Shop</a>
              <a href="/archive" onClick={(e) => navigate(e, '/archive')} className="text-black hover:opacity-60 transition-opacity">Archive</a>
              <a href="/sustainability" onClick={(e) => navigate(e, '/sustainability')} className="text-black hover:opacity-60 transition-opacity">Sustainability</a>
            </nav>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <a href="/" onClick={(e) => navigate(e, '/')} className="text-2xl font-display font-black tracking-tighter text-black">THIRFTBD</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onCartClick} className="p-1 text-black hover:opacity-60 transition-opacity relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {user ? (
              <div className="group relative">
                <button 
                  onClick={(e) => {
                    if (isAdmin) {
                      // Navigate to admin on click
                      window.history.pushState({}, '', '/admin');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className={`p-0.5 rounded-full transition-all duration-300 ${
                    isAdmin ? 'ring-2 ring-brand-green ring-offset-2 ring-offset-brand-offwhite' : 'hover:opacity-60'
                  }`}
                  title={isAdmin ? "Enter Admin Panel" : "Profile"}
                >
                  <img 
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.email || 'User'}&background=black&color=white`} 
                    alt={user.user_metadata?.full_name || ''} 
                    className="w-6 h-6 rounded-full border border-black/10 transition-transform active:scale-95"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white border border-brand-black/10 shadow-2xl p-4 min-w-[180px] rounded-xl">
                    <div className="mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-black">Connected As</p>
                      <p className="text-[11px] font-bold text-black truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                    </div>
                    <div className="h-px bg-black/5 mb-3" />
                    {isAdmin && (
                      <a 
                        href="/admin" 
                        onClick={(e) => navigate(e, '/admin')} 
                        className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-3 text-brand-green hover:opacity-60 group/link"
                      >
                        Dashboard
                        <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
                      </a>
                    )}
                    <button onClick={logout} className="text-[11px] font-black uppercase tracking-widest text-red-500 hover:opacity-60 transition-opacity">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsLoginFormOpen(!isLoginFormOpen)} 
                  className={`p-1 transition-opacity ${isLoginFormOpen ? 'text-brand-green' : 'text-black hover:opacity-60'}`}
                >
                  <UserIcon className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {isLoginFormOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 bg-white border border-black/10 shadow-2xl p-6 min-w-[280px] rounded-2xl z-50"
                    >
                      <form onSubmit={login} className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Identifier</p>
                          <input 
                            type="email"
                            required
                            placeholder="EMAIL"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-50 border-none p-3 text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Secure Token</p>
                          <input 
                            type="password"
                            required
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-50 border-none p-3 text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-black"
                          />
                        </div>

                        {authError && (
                          <p className="text-[9px] font-bold text-red-500 uppercase tracking-tight text-center">{authError}</p>
                        )}

                        <button 
                          type="submit"
                          disabled={isAuthenticating}
                          className="w-full bg-black text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
                        >
                          {isAuthenticating ? 'VERIFYING...' : 'SIGN IN'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 pt-24 bg-brand-offwhite px-6 lg:hidden"
          >
            <nav className="flex flex-col gap-8 text-2xl font-display font-black uppercase tracking-tighter text-black">
              <a href="/shop" onClick={(e) => navigate(e, '/shop')} className="border-b border-black/5 pb-4">Shop All</a>
              <a href="/archive" onClick={(e) => navigate(e, '/archive')} className="border-b border-black/5 pb-4">Archive</a>
              <a href="/sustainability" onClick={(e) => navigate(e, '/sustainability')} className="border-b border-black/5 pb-4">Sustainability</a>
              <a href="/about" onClick={(e) => navigate(e, '/about')} className="border-b border-black/5 pb-4">Our Ethos</a>
            </nav>

            <div className="mt-12 space-y-6">
              {user && isAdmin && (
                <button 
                  onClick={(e) => {
                    window.history.pushState({}, '', '/admin');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    setIsMobileMenuOpen(false);
                  }} 
                  className="btn-primary w-full text-center flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" /> Admin Panel
                </button>
              )}
              {!user && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input 
                      type="email"
                      placeholder="EMAIL"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/5 border-none p-4 text-xs font-bold uppercase tracking-widest rounded-xl"
                    />
                    <input 
                      type="password"
                      placeholder="PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/5 border-none p-4 text-xs font-bold uppercase tracking-widest rounded-xl"
                    />
                  </div>
                  <button onClick={(e: any) => login(e)} className="btn-primary w-full text-center">Sign In</button>
                </div>
              )}
              {user && (
                <button onClick={logout} className="w-full text-center text-xs font-bold uppercase tracking-widest text-red-500 py-4">Sign Out</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
