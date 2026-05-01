import ProductCard from './ProductCard';
import { Product } from '../types';

export default function NewDrops({ products }: { products: Product[] }) {
  const displayProducts = products.length > 0 ? products : [];

  return (
    <section id="drops" className="py-24 bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Fresh from the rack</p>
            <h2 className="text-4xl font-black tracking-tighter text-black">New Drops</h2>
          </div>
          <a href="/shop" onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/shop');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }} className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity text-black">
            View All Drops
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map(product => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs opacity-40 italic text-black">Stay tuned for the next drop.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/shop');
              window.dispatchEvent(new PopStateEvent('popstate'));
              window.scrollTo(0, 0);
            }}
            className="btn-secondary"
          >
            See More Products
          </button>
        </div>
      </div>
    </section>
  );
}
