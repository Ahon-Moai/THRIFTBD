import { motion } from 'motion/react';

export default function Newsletter() {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">NEVER MISS A DROP.</h2>
          <p className="text-sm opacity-60 uppercase tracking-[0.2em] max-w-xl mx-auto">
            Join the rack insiders. Be the first to get exclusive access to rare 
            vintage finds and sustainable fashion tips.
          </p>
          
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 pt-8">
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              className="bg-brand-black border border-white/20 py-4 px-6 text-sm font-bold w-full focus:outline-none focus:border-white transition-colors"
            />
            <button className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all">
              Join the Insiders
            </button>
          </form>
        </motion.div>
      </div>
      
      {/* Abstract background graphics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
    </section>
  );
}
