import { motion } from 'motion/react';

const feed = [
  'https://picsum.photos/seed/ig1/600/600',
  'https://picsum.photos/seed/ig2/600/600',
  'https://picsum.photos/seed/ig3/600/600',
  'https://picsum.photos/seed/ig4/600/600',
];

export default function InstagramFeed() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">@THIRFTBD_STYLE</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mt-2">Tag us to be featured</p>
          </div>
          <a href="#" className="btn-secondary !py-2 !px-4 text-[10px]">Follow Instagram</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {feed.map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 0.98 }}
              viewport={{ once: true }}
              className="aspect-square bg-zinc-100 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
            >
              <img src={img} alt="Instagram post" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
