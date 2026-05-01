export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  condition: string;
  images: string[];
  stock: number;
  tags: string[];
  colors: string[];
  status: 'active' | 'sold_out';
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  userId: string;
  customerEmail: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
};
