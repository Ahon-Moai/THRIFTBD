import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

const CATEGORIES = ['All', 'Tees', 'Sweatshirts', 'Outerwear', 'Denim', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ShopPage({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      // Find matching category in the list
      const matched = CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
      if (matched) setSelectedCategory(matched);
      else if (cat.toLowerCase() === 'tees') setSelectedCategory('Tees'); // Fallback for slugs
      setShowFilters(true);
    }
  }, []);

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const sizeMatch = !selectedSize || (p.sizes && p.sizes.includes(selectedSize));
    return categoryMatch && sizeMatch;
  });

  return (
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">The Full Catalog</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase">Shop All</h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-black/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
          >
            <Filter className="w-3 h-3" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          
          <div className="relative group flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-black/10 text-[10px] font-bold uppercase tracking-widest">
              Sort: {sortBy}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-black/5 mb-12"
          >
            <div className="pb-12">
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-40">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        selectedCategory === cat ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredProducts.map(product => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-sm opacity-40 italic">No products found matching your filters.</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSelectedSize(null); }}
            className="mt-4 text-[10px] font-bold uppercase tracking-widest border-b border-black"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
