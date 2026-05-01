import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Settings, 
  Plus, 
  Search, 
  Layers, 
  User, 
  Clock, 
  CheckCircle2, 
  Truck, 
  X, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronRight,
  Monitor,
  LayoutDashboard,
  Box,
  ClipboardList,
  Menu
} from 'lucide-react';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType,
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
  storage
} from '../lib/firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Tees', 'Sweatshirts', 'Outerwear', 'Denim', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];

type Tab = 'dashboard' | 'inventory' | 'orders';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Tees',
    condition: '9/10',
    stock: 1,
    status: 'active',
    images: [],
    tags: [],
    sizes: [],
    colors: [],
    description: ''
  });

  useEffect(() => {
    // Products Listener
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const prods = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || ''
        } as Product;
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    // Orders Listener
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ords);
    }, (error) => {
      console.warn('Orders permission notification:', error);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (!user) {
      alert('AUTHENTICATION REQUIRED: Please sign in to modify the archive.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const fileArray = Array.from(files);
    const base64Results: string[] = [];

    console.log('Initiating Design Lab Image Injection...', { count: fileArray.length });

    for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
            if (!file.type.startsWith('image/')) continue;
            
            // Limit to 2MB for Base64 to prevent Firestore payload size issues (max 1MB per document, but we can store a few small images)
            // Actually Base64 increases size by 33%. 1MB limit for Firestore doc. 
            // Better to warn user about size.
            if (file.size > 1 * 1024 * 1024) {
                console.warn(`File ${file.name} is large for Base64 injection. Optimization recommended.`);
            }

            const base64 = await handleImageToBase64(file);
            base64Results.push(base64);
            setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
        } catch (error) {
            console.error('Core Injection Fault:', error);
        }
    }

    if (base64Results.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...base64Results]
      }));
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('AUTHENTICATION REQUIRED: Please sign in to perform this action.');
      return;
    }
    try {
      const { id, createdAt, updatedAt, ...cleanData } = formData as any;
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...cleanData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...cleanData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!user) {
      alert('Authentication Required');
      return;
    }
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      console.error('Update order failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 pt-[80px] md:pt-[100px]">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-[80px] left-0 right-0 z-[20] bg-white border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 border border-black/10 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{activeTab}</span>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-64 border-r border-black/5 bg-white flex flex-col h-full 
        transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:z-10
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 lg:mt-0 mt-[80px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Management</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Box className="w-4 h-4" />} 
            label="Inventory" 
            isActive={activeTab === 'inventory'} 
            onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<ClipboardList className="w-4 h-4" />} 
            label="Live Orders" 
            isActive={activeTab === 'orders'} 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} 
            badge={pendingOrders.length > 0 ? pendingOrders.length : undefined}
          />
        </nav>

        <div className="p-6 mt-auto border-t border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {user ? user.email?.[0].toUpperCase() : '??'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-tight truncate">{user ? user.email?.split('@')[0] : 'Guest'}</span>
              <button 
                onClick={user ? () => auth.signOut() : login}
                className="text-[9px] text-brand-green uppercase font-bold text-left hover:underline"
              >
                {user ? 'Terminate Session' : 'Initiate Access'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full p-6 md:p-8 lg:p-12 mt-[60px] lg:mt-0 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none text-black">Insights</h1>
                  <p className="text-xs opacity-40 font-bold uppercase tracking-widest mt-2 px-1">Performance Overview</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-black/5 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">System Operational</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} icon={<BarChart3 />} trend="+12.5%" />
                <MetricCard title="Active Orders" value={pendingOrders.length} icon={<ShoppingCart />} color="bg-black" text="white" />
                <MetricCard title="Total Stock" value={products.reduce((a, b) => a + (b.stock || 0), 0)} icon={<Package />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[11px] font-black uppercase tracking-widest">Recent Activity</h3>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-brand-green/10 text-brand-green'}`}>
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-tight">Order #{order.id?.slice(-4)}</p>
                            <p className="text-[9px] opacity-40 uppercase tracking-widest">{order.customer?.name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black tracking-tight">৳{order.totalAmount}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-[11px] font-black uppercase tracking-widest mb-6">Inventory Health</h3>
                  <div className="text-center py-8">
                      <Layers className="w-12 h-12 mx-auto opacity-10 mb-4" />
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Operational Analytics Coming Soon</p>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none text-black">Inventory</h1>
                  <p className="text-xs opacity-40 font-bold uppercase tracking-widest mt-2 px-1">Storage Management</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ name: '', price: 0, category: 'Tees', stock: 1, images: [], sizes: [] });
                    setIsModalOpen(true);
                  }}
                  className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-zinc-800 transition-all rounded-full shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input 
                  type="text" 
                  placeholder="SEARCH ARCHIVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/5 pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl shadow-sm focus:border-black/20 focus:ring-0 transition-all"
                />
              </div>

              <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-zinc-50/50 border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-black">Entity</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-black">Pricing</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-black">Stock Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-black text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover grayscale" />}
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-tight text-black">{p.name}</p>
                                <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest mt-0.5">{p.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-black">৳{p.price}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${p.stock > 0 ? 'bg-brand-green' : 'bg-red-500'}`} />
                             <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                               {p.stock > 0 ? `${p.stock} Units` : 'Depleted'}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingProduct(p);
                                setFormData(p);
                                setIsModalOpen(true);
                              }}
                              className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={async () => {
                                if (!user) {
                                  alert('Authentication Required');
                                  return;
                                }
                                if (window.confirm('Delete Archive?')) {
                                  await deleteDoc(doc(db, 'products', p.id));
                                }
                              }}
                              className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-black">Live Feed</h1>
                <p className="text-xs opacity-40 font-bold uppercase tracking-widest mt-2 px-1">Active Fulfillment</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {orders.length === 0 ? (
                  <div className="bg-white border border-black/5 p-20 rounded-3xl text-center space-y-4">
                      <Monitor className="w-12 h-12 mx-auto opacity-10" />
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Listening for incoming signals...</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <motion.div 
                      layout
                      key={order.id} 
                      className={`bg-white border p-6 rounded-2xl flex flex-col md:flex-row gap-8 transition-all ${
                        order.status === 'pending' ? 'border-brand-green/20' : 'border-black/5 shadow-sm'
                      }`}
                    >
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-100 px-3 py-1 rounded-full">#{order.id?.slice(-6)}</span>
                                {order.status === 'pending' && <span className="flex items-center gap-1.5 text-[9px] font-black text-brand-green uppercase tracking-widest animate-pulse"><Clock className="w-3 h-3" /> New Packet</span>}
                            </div>
                            <span className="text-xs font-black">৳{order.totalAmount}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Recipient</p>
                                <p className="text-xs font-bold uppercase tracking-tight">{order.customer?.name}</p>
                                <p className="text-[10px] opacity-60 mt-0.5">{order.customer?.phone}</p>
                                <p className="text-[10px] opacity-60 leading-relaxed mt-1">{order.customer?.address}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Manifest</p>
                                <div className="space-y-1">
                                    {order.items?.map((item: any, idx: number) => (
                                        <p key={idx} className="text-[10px] font-bold uppercase tracking-tight flex justify-between">
                                            <span>{item.name} <span className="opacity-40">x{item.quantity}</span></span>
                                            <span className="opacity-40">{item.size}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                      </div>

                      <div className="w-px bg-black/5 hidden md:block" />

                      <div className="md:w-64 flex flex-col justify-center gap-2">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Action Sequence</p>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            order.status === 'processing' ? 'bg-black text-white' : 'bg-zinc-50 border border-black/5 hover:border-black/20'
                          }`}
                        >
                          Fulfillment
                        </button>
                        <button 
                           onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            order.status === 'shipped' ? 'bg-brand-green text-white shadow-lg' : 'bg-zinc-50 border border-black/5 hover:border-black/20 text-black/40'
                          }`}
                        >
                          Ship Packet
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Editor Sidebar Layout */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 md:p-10">
                <div className="flex items-center justify-between mb-8 md:mb-12">
                   <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Archive Entry</p>
                       <h2 className="text-3xl font-black uppercase tracking-tighter mt-1">{editingProduct ? 'Modify Item' : 'New Object'}</h2>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-3 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors">
                       <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Core Detail</label>
                            <input 
                              required
                              type="text" 
                              placeholder="OBJECT NAME"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-zinc-50 border-none p-4 md:p-5 text-sm font-bold uppercase tracking-tight focus:ring-2 focus:ring-black transition-all"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input 
                                  required
                                  type="number" 
                                  placeholder="VALUE (৳)"
                                  value={formData.price || ''}
                                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                  className="w-full bg-zinc-50 border-none p-4 md:p-5 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                                />
                                <input 
                                  type="number" 
                                  placeholder="QUANITTY"
                                  value={formData.stock || ''}
                                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                                  className="w-full bg-zinc-50 border-none p-4 md:p-5 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                                />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Specifications</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select 
                                  value={formData.category}
                                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                                  className="w-full bg-zinc-50 border-none p-4 md:p-5 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-black transition-all"
                                >
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select 
                                  value={formData.condition}
                                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                  className="w-full bg-zinc-50 border-none p-4 md:p-5 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-black transition-all"
                                >
                                  <option value="NEW">BRAND NEW</option>
                                  <option value="9/10">PRE-ARCHIVED (9/10)</option>
                                  <option value="8/10">USED (8/10)</option>
                                </select>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Categorization (Tags)</label>
                            <div className="flex flex-wrap gap-2">
                                {(formData.tags || []).map((tag, idx) => (
                                    <span key={idx} className="flex items-center gap-2 bg-brand-green/10 text-brand-green px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {tag}
                                        <button type="button" onClick={() => setFormData({...formData, tags: (formData.tags || []).filter((_, i) => i !== idx)})}>
                                            <X className="w-3 h-3 hover:scale-110 transition-transform" />
                                        </button>
                                    </span>
                                ))}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const tag = prompt('New Tag:');
                                        if (tag) setFormData({...formData, tags: [...(formData.tags || []), tag.toUpperCase()]});
                                    }}
                                    className="px-3 py-1 border-2 border-dashed border-black/10 text-[9px] font-black uppercase tracking-widest rounded-lg hover:border-black/30 transition-all"
                                >
                                    + Add Tag
                                </button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Dimensional Scan (Sizes)</label>
                            <div className="flex flex-wrap gap-2">
                                {SIZES.map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => {
                                        const sizes = formData.sizes || [];
                                        setFormData({...formData, sizes: sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size]});
                                      }}
                                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded-lg ${
                                        (formData.sizes || []).includes(size) ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-100 hover:border-black/10'
                                      }`}
                                    >
                                      {size}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Visual Proofs (Technical Manifest)</label>
                                <span className="text-[8px] font-mono opacity-20 uppercase tracking-[0.1em]">Slots Utilized: {formData.images?.length || 0}/8</span>
                            </div>
                            
                            <div 
                                className={`group relative aspect-[3/2] border-2 border-dashed rounded-3xl overflow-hidden flex flex-col items-center justify-center p-12 text-center gap-4 transition-all duration-500 cursor-copy ${
                                    uploading ? 'bg-brand-green/5 border-brand-green/30 scale-[0.98]' : 'bg-zinc-50 border-black/5 hover:bg-white hover:border-black/20 hover:shadow-xl'
                                }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                            >
                                {/* Decorative Glitch elements */}
                                <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-black/20" />
                                <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-black/20" />
                                <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-black/20" />
                                <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-black/20" />

                                {formData.images?.[0] ? (
                                    <div className="absolute inset-0 opacity-10 blur-xl scale-110 pointer-events-none transition-all group-hover:blur-2xl">
                                        <img src={formData.images[0]} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ) : null}
                                
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className={`w-6 h-6 z-10 transition-all ${uploading ? 'animate-pulse text-brand-green' : 'opacity-40'}`} />
                                </div>

                                <div className="z-10 space-y-2">
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-black">
                                        {uploading ? `Processing Bitstream: ${uploadProgress}%` : 'Ingest Visual Assets'}
                                    </p>
                                    <p className="text-[9px] font-medium opacity-30 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                        Drag & drop studio captures or click to select archives
                                    </p>
                                </div>

                                <input 
                                    type="file" multiple accept="image/*" 
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                                {formData.images?.map((url, idx) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={idx} 
                                        className="relative aspect-square rounded-2xl overflow-hidden border border-black/5 bg-zinc-100 group overflow-hidden"
                                    >
                                        <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-md text-[8px] font-mono text-white px-1.5 py-0.5 rounded uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                            BITMAP_0{idx + 1}
                                        </div>
                                        <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-xl text-black opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white transform hover:scale-110 shadow-lg z-30"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.div>
                                ))}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const url = prompt('Direct Link Injection:');
                                        if (url) setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
                                    }}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-black/5 flex flex-col items-center justify-center bg-zinc-50 hover:bg-white hover:border-black/20 transition-all group gap-2"
                                >
                                    <LinkIcon className="w-4 h-4 opacity-10 group-hover:opacity-40 group-hover:rotate-45 transition-all duration-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-20">Remote Link</span>
                                </button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Object Narrative</label>
                            <textarea 
                                rows={4}
                                placeholder="Describe the archive entry details..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-zinc-50 border-none p-5 text-sm leading-relaxed focus:ring-2 focus:ring-black transition-all"
                            />
                        </section>
                    </div>

                    <div className="pt-8">
                        <button 
                          type="submit" 
                          disabled={uploading}
                          className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-2xl disabled:opacity-50"
                        >
                            {editingProduct ? 'Update Entry' : 'Verify & Publish'}
                        </button>
                    </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ icon, label, isActive, onClick, badge }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
        isActive ? 'bg-black text-white shadow-lg' : 'hover:bg-zinc-50 text-black/50 hover:text-black'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}>{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-black' : 'bg-brand-green text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCard({ title, value, icon, trend, color, text }: { title: string, value: string | number, icon: React.ReactNode, trend?: string, color?: string, text?: string }) {
  return (
    <div className={`${color || 'bg-white'} border border-black/5 p-8 rounded-3xl shadow-sm space-y-4`}>
       <div className="flex justify-between items-start">
           <div className={`p-3 rounded-2xl ${color ? 'bg-white/10' : 'bg-black/5'}`}>
               <span className={text === 'white' ? 'text-white' : 'text-black'}>{icon}</span>
           </div>
           {trend && <span className="text-[9px] font-black text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">{trend}</span>}
       </div>
       <div>
           <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${text === 'white' ? 'text-white' : 'text-black'}`}>{title}</p>
           <p className={`text-3xl font-black mt-1 ${text === 'white' ? 'text-white' : 'text-black'}`}>{value}</p>
       </div>
    </div>
  );
}
