import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  const navigate = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', `/product/${product.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <a 
        href={`/product/${product.id}`} 
        onClick={navigate}
        className="block relative aspect-[3/4] overflow-hidden bg-zinc-100"
      >
        <img 
          src={product.images?.[0] || ''} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {(product.tags || []).map(tag => (
            <span key={tag} className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 ${
              tag === 'ONLY 1 LEFT' ? 'bg-[#ff5a00] text-white' : 'bg-brand-green text-white'
            }`}>
              {tag}
            </span>
          ))}
        </div>
      </a>

      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
            {product.name}
          </h3>
          <p className="text-lg font-display font-black mt-1">৳{(product.price || 0).toFixed(2)}</p>
        </div>
        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-right">
          {product.sizes && product.sizes.length > 0 ? (
            product.sizes.length === 1 ? product.sizes[0] : `${product.sizes[0]}+`
          ) : 'N/A'}
        </div>
      </div>
    </motion.div>
  );
}
