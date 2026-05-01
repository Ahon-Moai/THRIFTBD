import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-24 bg-brand-offwhite border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.95] max-w-md">
            "THE BEST CURATED VINTAGE SHOP I'VE FOUND ONLINE. THE QUALITY IS UNMATCHED."
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">
            — JORDAN M., VERIFIED COLLECTOR
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-12 border border-black/5 shadow-sm space-y-6"
        >
          <div className="flex gap-1 text-[#ff5a00]">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
          </div>
          <p className="text-base opacity-60 leading-relaxed italic">
            "Absolutely obsessed with my oversized denim jacket. It arrived in perfect condition 
            and the grain of the denim is exactly what I wanted. Retrorack is my new go-to."
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">— CHLOE S.</p>
        </motion.div>
      </div>
    </section>
  );
}
