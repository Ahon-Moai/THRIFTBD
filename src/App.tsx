/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Suspense, lazy } from 'react';

// --- META PIXEL & CAPI INTEGRATION START ---
const FALLBACK_PIXEL_ID = '1564061235060927';

// Reusable tracking function for deduplicated events
export const trackEvent = async (eventName: string, customData: any = {}) => {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID || FALLBACK_PIXEL_ID;
  
  // 1. Browser Pixel Track
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, customData, { eventID: eventId });
  }

  // 2. Server CAPI Track
  try {
    if (pixelId) {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventId,
          customData,
          sourceUrl: window.location.href,
          userData: {
            // Optional: add more user signals here if available
          }
        })
      });
    }
  } catch (err) {
    console.error('CAPI track error:', err);
  }
};
// --- META PIXEL & CAPI INTEGRATION END ---

import Header from './components/Header';
import Hero from './components/Hero';
import CollectionGrid from './components/CollectionGrid';
import NewDrops from './components/NewDrops';
import Manifest from './components/Manifest';
import Testimonials from './components/Testimonials';
import InstagramFeed from './components/InstagramFeed';
import Newsletter from './components/Newsletter';
import ProductDetailPage from './components/ProductDetailPage';
import ShopPage from './components/ShopPage';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartItem, Product } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import localProducts from './data/products.json';

// Lazy load heavy components for faster initial page load
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'product' | 'shop' | 'admin' | 'checkout'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // --- META PIXEL INITIALIZATION START ---
  useEffect(() => {
    // Meta Pixel Base Code
    // @ts-ignore
    !(function(f, b, e, v, n, t, s) {
      // @ts-ignore
      if (f.fbq) return;
      // @ts-ignore
      n = f.fbq = function() {
        // @ts-ignore
        n.callMethod
          ? // @ts-ignore
            n.callMethod.apply(n, arguments)
          : // @ts-ignore
            n.queue.push(arguments);
      };
      // @ts-ignore
      if (!f._fbq) f._fbq = n;
      // @ts-ignore
      n.push = n;
      // @ts-ignore
      n.loaded = !0;
      // @ts-ignore
      n.version = '2.0';
      // @ts-ignore
      n.queue = [];
      // @ts-ignore
      t = b.createElement(e);
      // @ts-ignore
      t.async = !0;
      // @ts-ignore
      t.src = v;
      // @ts-ignore
      s = b.getElementsByTagName(e)[0];
      // @ts-ignore
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    const pixelId = import.meta.env.VITE_META_PIXEL_ID || FALLBACK_PIXEL_ID;
    if (pixelId) {
      (window as any).fbq('init', pixelId);
    }
  }, []);

  // Track PageView on route change
  useEffect(() => {
    trackEvent('PageView');
  }, [currentPage]);
  // --- META PIXEL INITIALIZATION END ---

  const fetchProducts = async () => {
    if (!isSupabaseConfigured) {
      setProducts(localProducts as Product[]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40);
    
    if (error) {
       console.warn('Could not fetch products from Supabase, using local fallback:', error);
       setProducts(localProducts as Product[]);
    } else if (!data || data.length === 0) {
       setProducts(localProducts as Product[]);
    } else {
       setProducts(data.map(p => ({
         ...p,
         createdAt: p.created_at,
         updatedAt: p.updated_at
       })) as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    if (!isSupabaseConfigured) return;

    const subscription = supabase
      .channel('products-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle path based routing for a simple demo
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path === '/') setCurrentPage('home');
      else if (path.startsWith('/product/')) {
        const id = path.split('/').pop();
        if (id) setSelectedProductId(id);
        setCurrentPage('product');
      }
      else if (path.startsWith('/shop')) setCurrentPage('shop');
      else if (path.startsWith('/admin')) setCurrentPage('admin');
      else if (path.startsWith('/checkout')) setCurrentPage('checkout');
      
      // Reset scroll to top on page change
      window.scrollTo(0, 0);
    };

    handlePathChange();
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);

  const addToCart = (product: Product, selectedSize?: string, silent: boolean = false) => {
    // Meta Track: AddToCart
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'BDT'
    });

    setCartItems(prev => {
      const sizeToStore = selectedSize || (product.sizes && product.sizes[0]) || 'One Size';
      const existing = prev.find(item => item.productId === product.id && item.size === sizeToStore);
      if (existing) {
        return prev.map(item => (item.productId === product.id && item.size === sizeToStore) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0] || '',
        size: sizeToStore
      }];
    });
    if (!silent) setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const currentProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;

  const renderPage = () => {
    if (loading) {
      return (
        <div className="pt-40 pb-20 text-center h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-40">Loading THIRFTBD Catalog...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero />
            <CollectionGrid />
            <NewDrops products={products.slice(0, 4)} />
            <Manifest />
            <Testimonials />
            <InstagramFeed />
            <Newsletter />
          </>
        );
      case 'product':
        return currentProduct ? (
          <ProductDetailPage 
            product={currentProduct} 
            onAddToCart={(p, s) => addToCart(p, s)} 
            onBuyNow={(p, s) => {
              addToCart(p, s, true);
              window.history.pushState({}, '', '/checkout');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          />
        ) : (
          <div className="pt-40 pb-20 text-center">
            <p>Product not found.</p>
            <a href="/" className="btn-primary mt-4">Back Home</a>
          </div>
        );
      case 'shop':
        return <ShopPage products={products} />;
      case 'admin':
        return (
          <Suspense fallback={<div className="h-[60vh] flex items-center justify-center p-20"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminPanel />
          </Suspense>
        );
      case 'checkout':
        return (
          <Suspense fallback={<div className="h-[60vh] flex items-center justify-center p-20"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}>
            <CheckoutPage 
              items={cartItems} 
              onBack={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }} 
            />
          </Suspense>
        );
      default:
        return (
          <div className="pt-32 pb-20 text-center h-[60vh] flex flex-col items-center justify-center">
            <h1 className="text-2xl font-black mb-4 tracking-tighter uppercase text-black">404 - NOT FOUND</h1>
            <a href="/" className="btn-primary">Return Home</a>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main>
        {renderPage()}
      </main>

      <Footer />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onRemove={removeFromCart}
        onCheckout={() => {
          window.history.pushState({}, '', '/checkout');
          window.dispatchEvent(new PopStateEvent('popstate'));
          window.scrollTo(0, 0);
        }}
      />
      
      {/* Wishlist Drawer could follow a similar pattern */}
    </div>
  );
}
