import { Leaf, RefreshCcw, Star } from 'lucide-react';

export default function Manifest() {
  return (
    <section className="py-24 bg-white border-y border-black/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">The Rack Manifesto</p>
          <h2 className="text-3xl font-black tracking-tighter">Why Thrift With Us?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-offwhite rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="text-lg font-display font-bold uppercase">Eco-Friendly</h3>
            <p className="text-xs opacity-50 leading-relaxed max-w-[280px]">
              Every preloved purchase reduces textile waste and saves thousands of gallons of water. 
              Fashion that loves the planet back.
            </p>
          </div>

          <div className="text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-offwhite rounded-full flex items-center justify-center">
              <RefreshCcw className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="text-lg font-display font-bold uppercase">Affordable Drip</h3>
            <p className="text-xs opacity-50 leading-relaxed max-w-[280px]">
              High-end style doesn't need a high-end price tag. We curate the best brands at prices that 
              make sense for your wallet.
            </p>
          </div>

          <div className="text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-offwhite rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="text-lg font-display font-bold uppercase">One of One</h3>
            <p className="text-xs opacity-50 leading-relaxed max-w-[280px]">
              Say goodbye to cookie-cutter trends. Find unique, authentic pieces that tell a story and set 
              you apart from the crowd.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
