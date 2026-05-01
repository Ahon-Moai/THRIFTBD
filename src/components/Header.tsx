import { ShoppingBag, User as UserIcon, Search, Menu, Moon, Sun, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from '../lib/firebase';

export default function Header({ onCartClick }: { onCartClick: () => void }) {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Direct email check for admin access in dev/preview
        const admins = ['studiosventa@gmail.com', 'thriftbd71@gmail.com'];
        setIsAdmin(admins.includes(u.email || ''));
        
        // Background sync with Firestore
        const userDocRef = doc(db, 'users', u.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const isUserAdmin = admins.includes(u.email || '');
          await setDoc(userDocRef, {
            email: u.email,
            role: isUserAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setIsAdmin(false);
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      unsub();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

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
                      // Navigate to admin on click (especially useful for mobile)
                      const path = window.location.pathname === '/admin' ? '/' : '/admin';
                      window.history.pushState({}, '', path);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="p-1 hover:opacity-60 transition-opacity"
                >
                  <img 
                    src={user.photoURL || ''} 
                    alt={user.displayName || ''} 
                    className="w-6 h-6 rounded-full border border-black/10"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white border border-brand-black/10 shadow-xl p-4 min-w-[160px]">
                    <p className="text-[10px] font-bold uppercase mb-2 opacity-40 text-black">{user.displayName}</p>
                    {isAdmin && (
                      <a href="/admin" onClick={(e) => navigate(e, '/admin')} className="block text-xs font-bold uppercase mb-3 text-black hover:opacity-60">Admin Panel</a>
                    )}
                    <button onClick={logout} className="text-xs font-bold uppercase text-red-500 hover:opacity-60">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={login} className="p-1 text-black hover:opacity-60 transition-opacity">
                <UserIcon className="w-5 h-5" />
              </button>
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
                <button onClick={login} className="btn-primary w-full text-center">Sign In</button>
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
