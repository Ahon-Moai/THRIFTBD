import React, { useState, useEffect } from 'react';
import { ChevronRight, ShieldCheck, Truck, MessageSquare, CreditCard, Phone, Smartphone, ArrowLeft, Loader2 } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../App';

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
}

export default function CheckoutPage({ items, onBack }: CheckoutPageProps) {
  const [shippingMethod, setShippingMethod] = useState<'dhaka' | 'outside' | 'chittagong'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'whatsapp'>('whatsapp');
  const [user, setUser] = useState<any>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    bkashLastDigits: ''
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    
    // Meta Track: InitiateCheckout
    trackEvent('InitiateCheckout', {
      content_ids: items.map(i => i.productId),
      contents: items.map(i => ({ id: i.productId, quantity: i.quantity })),
      currency: 'BDT',
      value: subtotal,
      num_items: items.reduce((acc, i) => acc + i.quantity, 0)
    });
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCharge = 
    shippingMethod === 'dhaka' ? 120 : 
    shippingMethod === 'chittagong' ? 80 : 140;
  const total = subtotal + shippingCharge;

  const handlePlaceOrder = async () => {
    if (!formData.phone || !formData.address || !formData.firstName) {
      alert('REQUIRED FIELDS: Please provide your core details to continue.');
      return;
    }

    setIsOrdering(true);

    try {
      // 1. Add order to Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null, // Allow guest checkout if needed, though usually auth is better
          customer_email: user?.email || null,
          items: items,
          total_amount: total,
          status: 'pending',
          customer: {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            bkashDigits: formData.bkashLastDigits
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Meta Track: Purchase
      trackEvent('Purchase', {
        content_ids: items.map(i => i.productId),
        contents: items.map(i => ({ id: i.productId, quantity: i.quantity })),
        currency: 'BDT',
        value: total,
        num_items: items.reduce((acc, i) => acc + i.quantity, 0),
        order_id: order.id
      });

      // 2. Open WhatsApp if selected
      if (paymentMethod === 'whatsapp') {
        const shippingLabel = 
          shippingMethod === 'dhaka' ? 'Dhaka' : 
          shippingMethod === 'chittagong' ? 'Chittagong' : 'Outside Dhaka';
        
        const message = `*NEW ORDER - THIRFTBD*%0A%0A` +
          `*Order ID:* ${order.id?.slice(-8).toUpperCase()}%0A` +
          `*Customer:* ${formData.firstName} ${formData.lastName}%0A` +
          `*Phone:* ${formData.phone}%0A` +
          `*Address:* ${formData.address}, ${formData.city}%0A%0A` +
          `*Items:*%0A${items.map(item => `- ${item.name} (${item.size}) x${item.quantity}`).join('%0A')}%0A%0A` +
          `*Shipping:* ${shippingLabel} (৳${shippingCharge})%0A` +
          `*Total:* ৳${total}%0A` +
          `*Payment:* WhatsApp / bKash Prefilled%0A` +
          `*bKash Digits:* ${formData.bkashLastDigits}`;
        
        window.open(`https://wa.me/8801825057141?text=${message}`, '_blank');
      } else {
        alert(`SUCCESS: Your order #${order.id?.slice(-8).toUpperCase()} has been submitted. Please wait for confirmation.`);
      }

      // 3. Clear cart/Redirect - for now just go back home
      onBack();
    } catch (error: any) {
      console.error('Order Fault:', error);
      alert(`ORDER FAILED: ${error.message || 'Unknown protocol error'}`);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-brand-offwhite min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-12">
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black">Checkout</h1>

            {/* 1. Shipping Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-display">1</span>
                <h2 className="text-lg font-display font-bold text-black">Shipping Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="First name" 
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
                />
                <input 
                  type="text" placeholder="Last name" 
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
                />
              </div>
              <input 
                type="text" placeholder="Street Address" 
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="City" 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                  className="px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
                />
                <input 
                  type="text" placeholder="State" 
                  value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                  className="px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="ZIP code" 
                  value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})}
                  className="px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
                />
                <input 
                  type="text" placeholder="Phone (11 Digits)" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="px-4 py-4 bg-white border border-black/5 text-sm focus:ring-0 focus:border-black/20 text-black" 
                />
              </div>
            </div>

            {/* 2. Shipping Method */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-display">2</span>
                <h2 className="text-lg font-display font-bold text-black">Shipping Method</h2>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShippingMethod('dhaka')}
                  className={`w-full flex items-center justify-between p-6 border transition-all ${shippingMethod === 'dhaka' ? 'border-brand-green bg-brand-green/5' : 'border-black/5 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-4 ${shippingMethod === 'dhaka' ? 'border-brand-green bg-white' : 'border-black/10 bg-transparent'}`} />
                    <span className="text-sm font-bold text-black">Standard Shipping (Inside Dhaka)</span>
                  </div>
                  <span className="text-sm font-black text-black">৳120.00</span>
                </button>

                <button 
                  onClick={() => setShippingMethod('chittagong')}
                  className={`w-full flex items-center justify-between p-6 border transition-all ${shippingMethod === 'chittagong' ? 'border-brand-green bg-brand-green/5' : 'border-black/5 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-4 ${shippingMethod === 'chittagong' ? 'border-brand-green bg-white' : 'border-black/10 bg-transparent'}`} />
                    <span className="text-sm font-bold text-black">Standard Shipping (Chittagong)</span>
                  </div>
                  <span className="text-sm font-black text-black">৳80.00</span>
                </button>

                <button 
                  onClick={() => setShippingMethod('outside')}
                  className={`w-full flex items-center justify-between p-6 border transition-all ${shippingMethod === 'outside' ? 'border-brand-green bg-brand-green/5' : 'border-black/5 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border-4 ${shippingMethod === 'outside' ? 'border-brand-green bg-white' : 'border-black/10 bg-transparent'}`} />
                    <span className="text-sm font-bold text-black">Express Shipping (Outside Dhaka)</span>
                  </div>
                  <span className="text-sm font-black text-black">৳140.00</span>
                </button>
              </div>
            </div>

            {/* 3. Payment */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-display">3</span>
                <h2 className="text-lg font-display font-bold text-black">Payment</h2>
              </div>

              <div className="border border-black/5 bg-white overflow-hidden">
                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center gap-4 p-6 border-b transition-all ${paymentMethod === 'cod' ? 'bg-zinc-50' : ''}`}
                >
                  <div className={`w-4 h-4 rounded-full border-4 ${paymentMethod === 'cod' ? 'border-black bg-white' : 'border-black/10'}`} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-black">Cash on Delivery (COD)</p>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-0.5">Advance shipping fee required to confirm</p>
                  </div>
                </button>

                <div className={`transition-all duration-300 ${paymentMethod === 'whatsapp' ? 'bg-brand-green/5' : ''}`}>
                  <button 
                    onClick={() => setPaymentMethod('whatsapp')}
                    className="w-full flex items-center gap-4 p-6"
                  >
                    <div className={`w-4 h-4 rounded-full border-4 ${paymentMethod === 'whatsapp' ? 'border-brand-green bg-white' : 'border-black/10'}`} />
                    <div className="p-2 bg-brand-green/10 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-brand-green" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-black">Order via WhatsApp</p>
                      <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-0.5">Handcrafting starts after shipping payment</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {paymentMethod === 'whatsapp' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 overflow-hidden"
                      >
                        <div className="p-6 bg-white border border-brand-green/20 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Payment Instructions</p>
                          <p className="text-sm text-black font-medium leading-relaxed">
                            Send shipping fee via bKash/Nagad (Send Money) to:<br/>
                            <span className="text-xl font-display font-black text-brand-green">01825057141</span>
                          </p>
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="p-3 bg-zinc-50 border border-black/5">
                              <p className="text-[8px] font-bold opacity-40 uppercase">Dhaka</p>
                              <p className="text-[11px] font-black text-black">৳120</p>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-black/5">
                              <p className="text-[8px] font-bold opacity-40 uppercase">CTG</p>
                              <p className="text-[11px] font-black text-black">৳80</p>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-black/5">
                              <p className="text-[8px] font-bold opacity-40 uppercase">Outside</p>
                              <p className="text-[11px] font-black text-black">৳140</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 pt-2 text-[11px] font-medium opacity-60 text-black">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-3 h-3" />
                              <span>Rocket: <span className="font-bold">01825057141</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>WhatsApp: <span className="font-bold">+8801825-057141</span></span>
                            </div>
                          </div>
                          
                          <div className="pt-4 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-black">Phone Number (bKash/Nagad)</label>
                            <input 
                              type="text" 
                              placeholder="Enter the last digits or full number"
                              value={formData.bkashLastDigits}
                              onChange={e => setFormData({...formData, bkashLastDigits: e.target.value})}
                              className="w-full px-4 py-3 bg-zinc-50 border border-black/5 text-sm focus:ring-0 focus:border-brand-green/40 text-black"
                            />
                            <p className="text-[9px] opacity-40 italic">Note: Order handcrafting starts only after advance shipping payment is verified via WhatsApp.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="w-full bg-[#00473e] text-white py-5 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] hover:bg-[#002e29] transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              Place Order
            </button>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-50/80 p-8 sticky top-32 border border-black/5">
              <h2 className="text-xl font-display font-bold mb-8 text-black">Order Summary</h2>
              
              <div className="space-y-6 mb-8">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-20 bg-zinc-100 flex-shrink-0 relative">
                      <img src={item.image} alt="" className="w-full h-full object-cover grayscale" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-[11px] font-bold uppercase tracking-tight text-black leading-tight">{item.name}</h3>
                      <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">{item.size}</p>
                    </div>
                    <p className="text-xs font-black self-center text-black">৳{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-8 border-t border-black/10">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60 text-black">Subtotal</span>
                  <span className="font-bold text-black">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60 text-black">Shipping</span>
                  <span className="font-bold text-black">৳{shippingCharge}</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-sm opacity-60 text-black">Total</span>
                  <span className="text-2xl font-display font-black text-black">৳{total}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                <input 
                  type="text" placeholder="Gift card or discount code" 
                  className="flex-1 px-4 py-3 bg-white border border-black/10 text-xs text-black"
                />
                <button className="bg-zinc-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest opacity-40">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
