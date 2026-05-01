import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Share2, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

export default function ProductDetailPage({ 
  product, 
  onAddToCart, 
  onBuyNow 
}: { 
  product: Product, 
  onAddToCart: (p: Product, size?: string) => void,
  onBuyNow: (p: Product, size?: string) => void
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'impact'>('desc');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product.sizes]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Images */}
        <div className="flex gap-4">
          <div className="hidden md:flex flex-col gap-4">
            {(product.images || []).map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(i)}
                className={`w-20 aspect-[3/4] bg-zinc-100 overflow-hidden border-2 transition-all ${
                  selectedImage === i ? 'border-black' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[3/4] bg-zinc-100 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={product.images?.[selectedImage] || ''} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {(product.images || []).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${selectedImage === i ? 'bg-black' : 'bg-black/20'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2">
            <span className="label-tag">Vintage</span>
            <span className="label-tag opacity-40">Preloved</span>
            <span className="label-tag bg-brand-black">Authentic</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-display font-black">৳{product.price.toFixed(2)}</p>
              <span className="text-[10px] font-black text-[#ff5a00] uppercase tracking-widest bg-[#ff5a00]/10 px-2 py-0.5 rounded-full">
                ONLY 1 AVAILABLE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 border-y border-black/5">
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        selectedSize === s 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-black/10 hover:border-black/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))
                ) : (
                  <span className="text-sm font-bold opacity-40">One Size</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-3">Condition</p>
              <p className="text-sm font-bold">{product.condition}</p>
            </div>
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3 pb-8 border-b border-black/5">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Available Colors</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <span 
                    key={color} 
                    className="px-3 py-1 border border-black/10 text-[10px] font-bold uppercase tracking-wider bg-white"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 bg-zinc-50 p-6">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Flat Measurements</p>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="flex justify-between border-b border-black/5 pb-2 pr-4">
                <span className="opacity-60">Pit-to-Pit:</span>
                <span className="font-bold">24.5 in</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2 pl-4">
                <span className="opacity-60">Length:</span>
                <span className="font-bold">30.0 in</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2 pr-4">
                <span className="opacity-60">Sleeve:</span>
                <span className="font-bold">9.5 in</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2 pl-4">
                <span className="opacity-60">Shoulder:</span>
                <span className="font-bold">22.0 in</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => onAddToCart(product, selectedSize || undefined)}
              className="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
            >
              Add to Bag
            </button>
            <button 
              onClick={() => onBuyNow(product, selectedSize || undefined)}
              className="w-full border border-black py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all text-black"
            >
              Buy Now
            </button>
          </div>

          <div className="space-y-4 pt-4">
             <div className="border-t border-black/5">
                <button 
                  onClick={() => setActiveTab(activeTab === 'desc' ? 'desc' : 'desc')} 
                  className="w-full py-4 flex justify-between items-center group"
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest">Description</span>
                  <ChevronDown className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </button>
                <div className="pb-4 text-xs opacity-60 leading-relaxed space-y-2">
                  <p>{product.description || "A true collector's piece. This tee features a hand-designed graphic on heavy-weight cotton. Faded and worn to perfection for that chunky, high-end vintage feel."}</p>
                  <ul className="list-disc list-inside">
                    <li>100% Sustainable Cotton</li>
                    <li>Reinforced stitching</li>
                    <li>Eco-friendly screen print</li>
                  </ul>
                </div>
             </div>
             
             <div className="border-t border-black/5">
                <button className="w-full py-4 flex justify-between items-center group">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-green">Sustainability Impact</span>
                  <ChevronDown className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </button>
             </div>
          </div>
          
          <div className="pt-8 flex items-center justify-between border-t border-black/5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
              <ShieldCheck className="w-4 h-4" />
              Verified Authenticity
            </div>
            <div className="flex gap-4">
              <button className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* "You might also like" section */}
      <div className="mt-32">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-black tracking-tighter">You might also like</h2>
          <a href="/shop" className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1">View All Tees</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {/* Reusable ProductCards could go here */}
        </div>
      </div>
    </div>
  );
}
