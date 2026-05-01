import { Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-white border-t border-black/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <h2 className="text-xl font-display font-black tracking-tighter">THIRFTBD</h2>
            <p className="text-sm opacity-60 leading-relaxed max-w-[240px]">
              Curated vintage treasures for the modern rebel. Join the circular fashion movement.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-40">Quick Links</h3>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-wider">
              <li><button onClick={() => navigate('/shop')} className="hover:opacity-60 transition-opacity uppercase text-left">Shop All</button></li>
              <li><button onClick={() => navigate('/about')} className="hover:opacity-60 transition-opacity uppercase text-left">Our Ethos</button></li>
              <li><button onClick={() => navigate('/shipping')} className="hover:opacity-60 transition-opacity uppercase text-left">Shipping & Returns</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:opacity-60 transition-opacity uppercase text-left">Contact Us</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-40">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-40">Newsletter</h3>
            <p className="text-xs opacity-60">Get early access to drops & exclusive offers.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-brand-offwhite border-none py-3 px-4 text-xs font-bold w-full focus:ring-1 focus:ring-black"
              />
              <button className="bg-black text-white px-4 text-[10px] font-bold uppercase tracking-widest">Join</button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold opacity-30 uppercase tracking-widest">
          <p>© 2026 THIRFTBD. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
