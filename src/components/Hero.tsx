import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
      <div className="w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full overflow-hidden aspect-[4/5] md:aspect-[16/7] lg:aspect-[21/8]"
        >
          <img 
            src="https://res.cloudinary.com/deyatjand/image/upload/v1778136677/WhatsApp_Image_2026-05-02_at_4.38.31_PM_vdzohj.jpg" 
            alt="Hero Visual" 
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -z-10 w-1/3 h-full bg-brand-green/5 blur-3xl rounded-full" />
    </section>
  );
}
