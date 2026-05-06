import React from 'react';
import { motion } from 'motion/react';

const collections = [
  { id: 1, name: 'Thrift Shirts', image: 'https://i.ibb.co.com/nSK7zxW/2.png', className: 'lg:col-span-2 lg:row-span-2', slug: 'Thrift Shirts' },
  { id: 2, name: 'Denims Shirts', image: 'https://i.ibb.co.com/WWQ8hcfg/1.png', className: 'lg:col-span-2 lg:row-span-2', slug: 'Denims Shirts' },
  { id: 3, name: 'Denims Jacket', image: 'https://i.ibb.co.com/n21vcBm/3.png', className: 'lg:col-span-1 lg:row-span-2', slug: 'Denims Jacket' },
];

export default function CollectionGrid() {
  const navigateToCategory = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    window.history.pushState({}, '', `/shop?category=${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Curated Categories</p>
          <h2 className="text-4xl font-black tracking-tighter">Collections</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-auto lg:h-[800px]">
          {collections.map((col) => (
            <motion.a 
              key={col.id}
              href={`/shop?category=${col.slug}`}
              onClick={(e) => navigateToCategory(e, col.slug)}
              whileHover={{ scale: 0.98 }}
              className={`relative overflow-hidden group ${col.className}`}
            >
              <img 
                src={col.image} 
                alt={col.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <h3 className="text-white text-xl md:text-2xl font-display font-bold tracking-tight">{col.name}</h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
