import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const HERO_STORY_IMAGES = [
  "https://i.ibb.co.com/nSK7zxW/2.png",
  "https://i.ibb.co.com/n21vcBm/3.png",
  "https://i.ibb.co.com/WWQ8hcfg/1.png",
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_STORY_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 z-10"
        >
          {/* Mobile Hero Logo */}
          <div className="lg:hidden block mb-6">
            <img 
              src="https://i.imgur.com/RYEs541.jpeg" 
              alt="ThriftBD Logo" 
              className="h-16 w-auto grayscale brightness-0 invert opacity-80 rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl lg:text-[84px] leading-[0.95] font-black tracking-tighter">
              SUSTAINABLE STYLE.<br />
              <span className="text-brand-green">AFFORDABLE DRIP.</span>
            </h1>
          </div>
          
          <p className="text-sm md:text-base opacity-60 leading-relaxed max-w-lg">
            Curated vintage treasures for the modern rebel. We find the gems, you rock the fit. 
            Join the circular fashion movement without breaking the bank.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <a href="/shop" className="btn-primary flex items-center gap-2 px-8 py-4">
              Browse Latest Items
            </a>
          </div>
        </motion.div>

        <div className="relative h-[700px] flex items-center justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-[340px] h-[680px] bg-black rounded-[50px] p-4 shadow-2xl border-[8px] border-zinc-900 overflow-hidden group"
          >
            {/* Phone Notch/Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-zinc-900 rounded-b-3xl z-30" />
            
            {/* Story Progress Bars */}
            <div className="absolute top-10 left-0 right-0 px-6 flex gap-1.5 z-30">
              {HERO_STORY_IMAGES.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  {i === currentImageIndex && (
                    <motion.div 
                      key={currentImageIndex}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="h-full bg-white" 
                    />
                  )}
                  {i < currentImageIndex && <div className="h-full w-full bg-white" />}
                </div>
              ))}
            </div>

            {/* Content Profile Info */}
            <div className="absolute top-14 left-6 flex items-center gap-2 z-30">
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center bg-black overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url(https://i.imgur.com/RYEs541.jpeg)' }}>
              </div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">THRIFTBD <span className="opacity-40 ml-2">6h</span></p>
            </div>

            {/* Main Phone Content */}
            <div className="relative h-full rounded-[38px] overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  src={HERO_STORY_IMAGES[currentImageIndex]} 
                  alt={`Mobile Story ${currentImageIndex + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              
              <div className="absolute bottom-12 left-0 right-0 px-8 text-white space-y-4">
                <h3 className="text-3xl font-display font-bold leading-tight tracking-tighter uppercase">
                  THRIFT<br />SHIRTS.
                </h3>
                <a 
                  href="/shop"
                  className="block text-center bg-white/20 backdrop-blur-md border border-white/40 w-full py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Swipe Up to Shop
                </a>
              </div>
            </div>

            {/* Tap areas for navigation */}
            <div className="absolute inset-0 z-40 flex">
              <div 
                className="w-1/2 h-full cursor-w-resize" 
                onClick={() => setCurrentImageIndex(prev => (prev - 1 + HERO_STORY_IMAGES.length) % HERO_STORY_IMAGES.length)}
              />
              <div 
                className="w-1/2 h-full cursor-e-resize" 
                onClick={() => setCurrentImageIndex(prev => (prev + 1) % HERO_STORY_IMAGES.length)}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -z-10 w-1/3 h-full bg-brand-green/5 blur-3xl rounded-full" />
    </section>
  );
}
