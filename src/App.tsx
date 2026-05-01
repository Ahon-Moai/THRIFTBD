/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Suspense, lazy } from 'react';
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
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

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

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(40));
    const unsub = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || ''
        } as Product;
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
       // If no products collection exists yet, it might error if rules are strict or collection doesn't exist
       // But usually onSnapshot handles it gracefully or we catch it.
       console.warn('Could not fetch products, might be empty or missing permission:', error);
       setLoading(false);
    });
    return unsub;
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
