import { X, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items,
  onRemove,
  onCheckout
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tighter">Your Bag</h2>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{items.length} Items</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <ShoppingBag className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-bold uppercase tracking-widest">Your bag is empty</p>
                  <button onClick={onClose} className="text-xs border-b border-black pb-0.5">Start Shopping</button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4 group">
                    <div className="w-24 aspect-[3/4] bg-zinc-100 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-[11px] font-bold uppercase tracking-wide">{item.name}</h3>
                          <button onClick={() => onRemove(item.productId)} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Size: {item.size}</p>
                      </div>
                      <p className="text-sm font-black">৳{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-black/5 space-y-4 bg-zinc-50/50">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Subtotal</p>
                  <p className="text-xl font-black">৳{total.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                >
                  Checkout Now
                </button>
                <p className="text-[9px] text-center opacity-40 uppercase font-bold tracking-wider">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
