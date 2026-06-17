import React, { useState, useEffect, useMemo, Component, useRef } from 'react';
import Fuse from 'fuse.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Code,
  Copy,
  LayoutDashboard, 
  Users, 
  Package, 
  Box,
  ShoppingCart, 
  Wallet, 
  ShieldCheck, 
  Shield,
  Star,
  BarChart3, 
  Wrench, 
  Settings, 
  User, 
  Menu,
  Plus, 
  X,
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  MessageSquare, 
  Download, 
  Trash2, 
  Minus, 
  Moon, 
  Sun, 
  Home,
  UploadCloud,
  Leaf,
  Bell,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  FileText,
  Save,
  RefreshCcw,
  Calculator,
  Hammer,
  Construction,
  Server,
  Zap,
  Share2,
  Database,
  Smartphone,
  Sparkles,
  Send,
  CloudUpload,
  Info,
  Lock,
  Key,
  Edit2,
  Check,
  Calendar,
  Image as ImageIcon,
  Music,
  Wand2,
  Ticket,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  CreditCard,
  History,
  ArrowUpCircle,
  Megaphone,
  Headphones,
  Bot,
  LayoutGrid,
  ShoppingBag,
  Video,
  Plane,
  MapPin,
  Navigation,
  Locate,
  Truck,
  Map as MapIcon,
  Clock,
  LogOut,
  Cctv,
  Activity,
  Camera,
  Eye,
  LogIn,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Tooltip as LeafletTooltip,
  useMap,
  Circle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn, formatCurrency, numberToWords } from './lib/utils';
import { 
  Category,
  CategoryData,
  ClientStatus, 
  ExpenseCategory, 
  Product, 
  Client, 
  Expense, 
  CartItem,
  Order,
  OrderStatus,
  WorkHistory,
  PaymentHistory,
  PublicOrder
} from './types';

interface SalaryRecord {
  id: string;
  monthName: string;
  baseAmount: number;
  bonusAmount: number;
  totalPaid: number;
  status: 'Pending' | 'Paid';
  paidAt: string;
}

interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  image?: string;
  attendance?: string[] | Record<string, string>; // Array of YYYY-MM-DD dates or Object map of date to time
  salaries?: SalaryRecord[];
  lastKnownLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
    address?: string;
  };
  isActive: boolean;
}


// --- Default Data ---
const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: 'Dahua Ranger 2 Pro 3MP', price: 3200, stock: 15, category: 'indoor', badge: 'new', image: 'https://images.unsplash.com/photo-1558002038-1a2a4b9da8af?auto=format&fit=crop&q=80&w=400', description: '360° coverage with AI human detection and privacy mode.' },
  { id: 2, name: 'Hikvision Bullet 5MP HD', price: 4500, stock: 8, category: 'outdoor', badge: 'hot', image: 'https://images.unsplash.com/photo-1524333865981-d13b6831005b?auto=format&fit=crop&q=80&w=400', description: 'Ultra HD 5MP resolution with smart tracking and two-way talk.' },
  { id: 3, name: 'Smart Bulb Cam 3MP', price: 2800, stock: 3, category: 'indoor', badge: 'sale', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400', description: 'Easy installation in standard bulb socket with full color night vision.' },
  { id: 4, name: 'Dahua NVR 8CH 4K', price: 8500, stock: 5, category: 'nvr', badge: 'limited', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400', description: '8-channel network video recorder with 4K output support.' },
  { id: 5, name: 'Outdoor Smart PTZ Cam', price: 5200, stock: 12, category: 'outdoor', badge: 'new', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400', description: 'IP67 weatherproof outdoor camera with pan-tilt-zoom.' },
  { id: 6, name: 'Silent Dome Cam 2MP', price: 2100, stock: 20, category: 'indoor', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', description: 'Discreet ceiling mounted dome camera for offices.' },
  { id: 7, name: 'Wireless IP Portal Cam', price: 3900, stock: 7, category: 'wireless', badge: 'popular', image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=400', description: 'Truly wireless camera with long-lasting battery life.' },
  { id: 8, name: 'Network PoE Switch 8 Port', price: 1800, stock: 10, category: 'accessories', image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=400', description: 'High-speed PoE switch for powering multiple IP cameras.' }
];

const DEFAULT_CLIENTS: Client[] = [
  { 
    id: 1, name: 'Rahim Mia', phone: '8801711111111', address: 'Dhaka', status: ClientStatus.ACTIVE, 
    due: 5000, works: 2, totalPaid: 10000, workHistory: [], paymentHistory: [], orders: [],
    warrantyExpiry: '2026-12-31',
    installationDate: '2024-01-15',
    notes: 'Standard 4-camera setup with NVR.'
  },
  { 
    id: 2, name: 'Karim Hossain', phone: '8801822222222', address: 'Chittagong', status: ClientStatus.DUE, 
    due: 12000, works: 1, totalPaid: 0, workHistory: [], paymentHistory: [], orders: [],
    warrantyExpiry: '2025-06-15',
    installationDate: '2024-06-15',
    notes: 'Requested additional outdoor bullet cam next month.'
  }
];

import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc,
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  updateDoc,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  storage,
  loginWithGoogle, 
  loginWithEmail,
  registerWithEmail,
  logout, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL 
} from 'firebase/storage';

interface OfferComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

interface Offer {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  authorName: string;
  likes?: string[]; // Array of user UIDs
  comments?: OfferComment[];
  shares?: number;
  expiryDate?: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  area?: string;
  active: boolean;
  createdAt: string;
}

const UiverseSearch = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <div className="uiverse-minimal-search-wrapper">
    <div className="uiverse-minimal-search-glow"></div>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."} 
      className="uiverse-minimal-search-input"
    />
    <Search className="uiverse-minimal-search-icon" size={18} />
  </div>
);

const GlowingNav = ({ 
  items, 
  activeId, 
  onSelect,
  className
}: { 
  items: { id: string, label: string, icon: React.ReactNode }[], 
  activeId: string, 
  onSelect: (id: string) => void,
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [styles, setStyles] = useState({
    position: 0,
    width: 0,
    radialPosition: 0
  });

  const updatePositions = () => {
    if (!containerRef.current) return;
    const activeIndex = items.findIndex(item => item.id === activeId);
    if (activeIndex === -1) return;

    // Use a small timeout to ensure refs are ready
    const timer = setTimeout(() => {
      const activeElement = itemsRef.current[activeIndex];
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (activeElement && containerRect) {
        const rect = activeElement.getBoundingClientRect();
        const offsetLeft = rect.left - containerRect.left;
        const width = rect.width;
        const radialPosition = (rect.left + rect.width / 2) - containerRect.left;

        setStyles({
          position: offsetLeft,
          width: width,
          radialPosition: radialPosition
        });
      }
    }, 10);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [activeId, items]);

  const handleMouseMove = (index: number, e: React.MouseEvent) => {
    const el = itemsRef.current[index];
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tiltX = -(y - rect.height / 2) / 8;
    const tiltY = (x - rect.width / 2) / 8;

    el.style.setProperty("--tilt-bg-x", tiltX.toString());
    el.style.setProperty("--tilt-bg-y", tiltY.toString());
  };

  const handleMouseLeave = (index: number) => {
    const el = itemsRef.current[index];
    if (!el) return;
    el.style.setProperty("--tilt-bg-x", "0");
    el.style.setProperty("--tilt-bg-y", "0");
  };

  return (
    <div 
      ref={containerRef}
      className={cn("glowing-nav-container", className)}
      style={{
        "--after-bg-position": styles.position,
        "--after-bg-width": styles.width,
        "--after-radial-bg-position": styles.radialPosition,
        "--after-shadow-offset": activeId ? 15 : 0,
        "--after-bg-opacity": activeId ? 25 : 0
      } as React.CSSProperties}
    >
      <ul className="glowing-nav-list">
        {items.map((item, index) => (
          <li 
            key={item.id}
            ref={el => { itemsRef.current[index] = el; }}
            className={cn("glowing-nav-item", activeId === item.id && "active")}
            onMouseMove={(e) => handleMouseMove(index, e)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            <button 
              onClick={() => {
                playSound('click');
                onSelect(item.id);
              }}
              className={cn("glowing-nav-button", activeId === item.id && "active")}
            >
              {item.icon}
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProductPastaCard = ({ 
  product, 
  onSelect, 
  isAdmin, 
  onEdit, 
  onDelete,
  addToCart
}: { 
  product: Product, 
  onSelect?: (p: Product) => void,
  isAdmin?: boolean,
  onEdit?: (p: Product) => void,
  onDelete?: (id: number | string) => void,
  addToCart?: (p: Product) => void
}) => {
  // Generate random stable-looking review counts for professional touch
  const reviewCount = useMemo(() => {
    return Math.floor(((Number(product.id) || 1) * 17) % 85) + 12;
  }, [product.id]);

  return (
    <div 
      className="group relative h-full flex flex-col cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden"
      onClick={() => (onSelect ? onSelect(product) : (onEdit ? onEdit(product) : null))}
    >
      {/* Badge Overlay */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 bg-[#bf0528]/95 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-md">
            {product.badge}
          </span>
        </div>
      )}

      {/* Image Container with Soft Shading */}
      <div className="w-full aspect-square relative bg-slate-50 dark:bg-slate-950/60 flex items-center justify-center p-6 select-none overflow-hidden border-b border-gray-50 dark:border-slate-900">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-4/5 h-4/5 object-contain relative z-10 transition-transform duration-700 group-hover:scale-105" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f1f5f9/475569?text=${encodeURIComponent(product.name || 'Product')}`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <Package size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Quick Purchase Hover Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-20 border-t border-gray-100 dark:border-slate-800">
          <button 
            className="w-full py-2 bg-[#bf0528] hover:bg-red-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              if (addToCart) {
                addToCart(product);
              } else {
                // Trigger global cart addition if not directly passed
                const ev = new CustomEvent('add-product-to-cart', { detail: product });
                window.dispatchEvent(ev);
              }
            }}
          >
            <ShoppingCart size={11} />
            Quick Purchase
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 select-none">
        {/* Category Label */}
        <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 select-none">
          {product.category || 'Surveillance'}
        </span>

        {/* Title */}
        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-gray-100 uppercase tracking-tight line-clamp-1 group-hover:text-[#bf0528] transition-colors mb-2">
          {product.name}
        </h4>

        {/* Brand Rating Row */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex text-amber-400 text-xs tracking-tighter">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold dark:text-slate-500">({reviewCount})</span>
        </div>

        {/* Price Row at the bottom */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 dark:text-white font-black text-base tracking-tight text-[15px]">
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice || true ? (
              <span className="text-[10px] text-gray-400 dark:text-slate-500 line-through">
                {formatCurrency(product.oldPrice || (product.price * 1.15))}
              </span>
            ) : null}
          </div>

          {isAdmin && onEdit && onDelete && (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => onEdit(product)} 
                className="p-1 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[#bf0528] rounded-lg transition-colors text-[9px] font-black uppercase tracking-wider"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(product.id)} 
                className="p-1 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-lg transition-colors text-[9px] font-black uppercase tracking-wider"
              >
                Del
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helpers ---
export const playSound = (type: 'click' | 'hover' | 'success' | 'error' | 'pop') => {
  // Sound disabled per user request
};

export const getBase64Image = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (e) => reject(e);
  });
};

export const generateOrderPDF = async (order: PublicOrder, customLogo?: string | null) => {
  window.dispatchEvent(new Event('start-task-animation'));
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const formatCurrency = (v: number) => `BDT ${v.toLocaleString()}`;

    // Helper to fetch image as base64
    const getBase64Image = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    // Pre-load images to base64
    const itemsWithBase64 = await Promise.all(order.items.map(async (item) => {
      if (item.image) {
        try {
          const base64 = await getBase64Image(item.image);
          return { ...item, base64 };
        } catch (e) {
          console.error("Failed to load item image", e);
          return { ...item, base64: null };
        }
      }
      return { ...item, base64: null };
    }));

    // --- Header ---
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(0, 0, pageWidth, 45, 'F');

    if (customLogo) {
      try {
        const logoB64 = await getBase64Image(customLogo);
        doc.addImage(logoB64, 'PNG', margin, 5, 30, 30);
      } catch (e) {
        console.warn("Logo load fail", e);
      }
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('IT DEPARTMENT', (customLogo ? margin + 35 : margin), 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Trusted Technology Partner', (customLogo ? margin + 35 : margin), 26);
    doc.text('OFFICIAL ORDER INVOICE', (customLogo ? margin + 35 : margin), 34);

    // --- Order Info ---
    const startY = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', margin, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice ID: ${order.id}`, margin, startY + 8);
    doc.text(`Date: ${order.date}`, margin, startY + 14);
    doc.text(`Status: ${order.status.toUpperCase()}`, margin, startY + 20);

    // --- Customer Info ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To', pageWidth / 2, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${order.customerName}`, pageWidth / 2, startY + 8);
    doc.text(`Phone: ${order.customerPhone}`, pageWidth / 2, startY + 14);
    
    const addressLines = doc.splitTextToSize(`Address: ${order.customerAddress}`, (pageWidth / 2) - margin);
    doc.text(addressLines, pageWidth / 2, startY + 20);

    // --- Table ---
    const tableData = itemsWithBase64.map((item, index) => [
      index + 1,
      '', // Space for image
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price).replace('BDT', '').trim(),
      formatCurrency(item.price * item.quantity).replace('BDT', '').trim()
    ]);

    let finalY = 0;
    autoTable(doc, {
      startY: startY + 35,
      head: [['SL', 'Image', 'Item Name', 'Qty', 'Unit Price', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { minCellHeight: 25, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const item = itemsWithBase64[data.row.index];
          if (item.base64) {
            try {
              doc.addImage(item.base64, 'JPEG', data.cell.x + 2, data.cell.y + 2, 21, 21);
            } catch (e) {
              console.error("Error adding image in table", e);
            }
          }
        }
      },
      didDrawPage: (data) => {
        if (data.cursor) finalY = data.cursor.y;
      }
    });

    if (!finalY) finalY = 150;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${formatCurrency(order.total)}`, pageWidth - margin, finalY + 15, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for choosing Al Amin Technology. This is a computer-generated voucher.", margin, pageHeight - 15);

    // Robust download for iframes
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order_${order.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF Gen Error", err);
  } finally {
    setTimeout(() => {
      window.dispatchEvent(new Event('stop-task-animation'));
    }, 1500);
  }
};

export const generateReceiptPDF = (order: Order) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('IT DEPARTMENT', 20, 25);
  doc.setFontSize(10);
  doc.text('DIGITAL MONEY RECEIPT', 20, 32);
  doc.text('Your Trusted Technology Partner', 20, 37);
  doc.text('Email: itdepartmentpro33@gmail.com', 20, 42); // Shifted down
  
  // Order Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Order ID: ${order.id}`, 20, 55);
  doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 62);
  doc.text(`Status: ${order.status.toUpperCase()}`, 20, 69);
  
  // Table
  autoTable(doc, {
    startY: 80,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: order.items.map(item => [
      item.name,
      item.quantity,
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity)
    ]),
    foot: [['', '', 'Total BDT', formatCurrency(order.total).replace('BDT', '').trim()]],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 105, finalY, { align: 'center' });
  doc.text('This is a computer generated receipt.', 105, finalY + 7, { align: 'center' });
  
  // Robust download for iframes
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Receipt-${order.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Components ---

const AIHelpDesk = ({ user, isAdmin, businessData, isDarkMode }: { user: FirebaseUser | null, isAdmin?: boolean, businessData?: { products: Product[], clients: Client[], expenses: Expense[] }, isDarkMode: boolean }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let systemInstruction = "You are the IT Department Pro Assistant. You help users with internet issues, router settings, and billing questions for an ISP in Bangladesh. Be polite, professional, and helpful. You can speak both English and Bengali. If you don't know something, suggest they open a support ticket.";
      
      if (isAdmin && businessData) {
        const stats = {
          totalClients: businessData.clients.length,
          totalProducts: businessData.products.length,
          totalDue: businessData.clients.reduce((sum, c) => sum + (c.due || 0), 0),
          totalPaid: businessData.clients.reduce((sum, c) => sum + (c.totalPaid || 0), 0),
          lowStockItems: businessData.products.filter(p => (p.stock || 0) < 5).map(p => p.name)
        };
        
        systemInstruction += `\n\nYou are also an Admin Assistant. You have access to the following business data:
- Total Clients: ${stats.totalClients}
- Total Products: ${stats.totalProducts}
- Total Due from Clients: ${stats.totalDue}
- Total Paid by Clients: ${stats.totalPaid}
- Low Stock Items: ${stats.lowStockItems.join(', ')}

You can help the admin with business insights, stock alerts, and financial summaries based on this data.`;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', text: userMessage }],
          systemInstruction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with AI server");
      }

      const data = await response.json();
      const modelResponse = data.text || "I'm sorry, I couldn't process that. Please try again or contact support.";
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      if (error?.message?.includes("quota")) {
        errorMessage = "Sorry, I've reached my limit for now. Please try again in a few minutes.";
      } else if (error?.message?.includes("Gemini API key")) {
        errorMessage = "AI is not configured on the server. Please set the GEMINI_API_KEY in the environment.";
      } else if (error?.message) {
        errorMessage = `AI Error: ${error.message.substring(0, 100)}`;
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
      <div className={cn("p-6 text-white flex items-center gap-3", isDarkMode ? "bg-emerald-600" : "bg-orange-500")}>
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold">AI Help Desk</h3>
          <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Powered by Gemini</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", isDarkMode ? "bg-emerald-900/20 text-emerald-500" : "bg-orange-50/50 text-orange-500")}>
              <MessageCircle size={32} />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">How can I help you today?</h4>
            <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Ask me about your internet, router settings, or billing.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === 'user' 
                ? (isDarkMode ? "ml-auto bg-emerald-600 text-white rounded-tr-none" : "ml-auto bg-orange-500 text-white rounded-tr-none")
                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none"
            )}
          >
            {m.text}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none w-16">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className={cn("w-1.5 h-1.5 rounded-full", isDarkMode ? "bg-emerald-500" : "bg-orange-500")} />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className={cn("w-1.5 h-1.5 rounded-full", isDarkMode ? "bg-emerald-500" : "bg-orange-500")} />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className={cn("w-1.5 h-1.5 rounded-full", isDarkMode ? "bg-emerald-500" : "bg-orange-500")} />
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={cn("p-3 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg", isDarkMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20")}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};


const OutageAlerts = ({ isAdmin }: { isAdmin: boolean }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'info' as Alert['type'], area: '' });

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    getDocs(q).then((snapshot) => {
      setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert)));
    }).catch(error => handleFirestoreError(error, OperationType.LIST, 'alerts'));
    return () => {};
  }, []);

  const handleAddAlert = async () => {
    if (!newAlert.title || !newAlert.message) return;
    try {
      const id = `ALT-${Date.now()}`;
      await setDoc(doc(db, 'alerts', id), {
        ...newAlert,
        id,
        active: true,
        createdAt: new Date().toISOString()
      });
      setShowAddAlert(false);
      setNewAlert({ title: '', message: '', type: 'info', area: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'alerts');
    }
  };

  const toggleAlert = async (id: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'alerts', id), { active });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'alerts');
    }
  };

  const activeAlerts = alerts.filter(a => a.active);

  if (activeAlerts.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
          <Megaphone size={20} />
          <h3 className="font-bold">Maintenance & Alerts</h3>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddAlert(true)}
            className="text-xs font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-lg hover:bg-amber-200 transition-all"
          >
            Add Alert
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-lg space-y-3"
          >
            <input 
              placeholder="Alert Title"
              value={newAlert.title}
              onChange={e => setNewAlert({...newAlert, title: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none"
            />
            <textarea 
              placeholder="Message"
              value={newAlert.message}
              onChange={e => setNewAlert({...newAlert, message: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none"
            />
            <div className="flex gap-2">
              <select 
                value={newAlert.type}
                onChange={e => setNewAlert({...newAlert, type: e.target.value as any})}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <input 
                placeholder="Area (Optional)"
                value={newAlert.area}
                onChange={e => setNewAlert({...newAlert, area: e.target.value})}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddAlert} className="flex-1 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold">Post Alert</button>
              <button onClick={() => setShowAddAlert(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-bold">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {(isAdmin ? alerts : activeAlerts).map(alert => (
          <motion.div
            key={alert.id}
            className={cn(
              "p-4 rounded-2xl border flex items-start gap-3 relative overflow-hidden",
              alert.type === 'critical' ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" :
              alert.type === 'warning' ? "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30" :
              "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl shrink-0",
              alert.type === 'critical' ? "bg-red-100 text-red-600" :
              alert.type === 'warning' ? "bg-amber-100 text-amber-600" :
              "bg-blue-100 text-blue-600"
            )}>
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{alert.title}</h4>
                {isAdmin && (
                  <button 
                    onClick={() => toggleAlert(alert.id, !alert.active)}
                    className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                      alert.active ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {alert.active ? 'Active' : 'Inactive'}
                  </button>
                )}
              </div>
              <p className="text-xs opacity-80 mt-1">{alert.message}</p>
              {alert.area && (
                <span className="inline-block mt-2 text-[10px] font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  Area: {alert.area}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


const TrackOrderPage = ({ formatCurrency, clients }: { formatCurrency: (v: number) => string, clients: Client[] }) => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const unifiedOrders: any[] = [];
      
      // 1. Search in public_orders collection
      const q = query(collection(db, 'public_orders'), where('customerPhone', '==', phone));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        const data = doc.data() as PublicOrder;
        unifiedOrders.push({
          id: doc.id,
          source: 'public',
          date: data.date,
          status: data.status,
          total: data.total,
          items: data.items,
          original: data
        });
      });

      // 2. Search in registered clients
      const matchedClient = clients.find(c => c.phone === phone);
      if (matchedClient && matchedClient.orders) {
        matchedClient.orders.forEach(order => {
          unifiedOrders.push({
            id: order.id,
            source: 'client',
            date: order.date,
            status: order.status,
            total: order.total,
            items: order.items,
            original: order
          });
        });
      }

      setOrders(unifiedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-black">Track My Order</h2>
        <p className="text-gray-500 text-sm">Enter your phone number to see the status of your orders</p>
      </div>

      <form onSubmit={handleTrack} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Phone Number</label>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01817..." 
              required
              className="w-full bg-gray-50 dark:bg-slate-900 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !phone}
          className="w-full bg-orange-600 text-white font-bold tracking-widest uppercase rounded-xl py-3 shadow-lg shadow-orange-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Tracking...' : 'Track Orders'}
        </motion.button>
      </form>

      {hasSearched && !loading && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-gray-500">
              <Package size={40} className="mb-4 opacity-50" />
              <p>No orders found for this number.</p>
            </div>
          ) : (
            orders.map((order, idx) => (
              <div key={`${order.id}-${order.source}-${idx}`} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                  <div>
                    <h4 className="font-black">Order ID: {order.id.slice(-6)}</h4>
                    <span className="text-[10px] text-gray-400 font-bold">{order.date}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                    (order.status === 'pending' || order.status === 'processing') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                    (order.status === 'accepted' || order.status === 'delivered') ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30'
                  )}>
                    {order.status}
                  </div>
                </div>
                
                {/* Visual Status Tracker */}
                <div className="py-4 border-b border-gray-100 dark:border-slate-700">
                   <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-slate-700 z-0 rounded-full" />
                      <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-1 z-0 rounded-full transition-all duration-1000",
                        order.status === 'cancelled' || order.status === 'rejected' ? "bg-red-500 w-full" :
                        order.status === 'pending' ? "bg-yellow-500 w-[10%]" :
                        order.status === 'accepted' ? "bg-blue-500 w-[30%]" :
                        order.status === 'processing' ? "bg-blue-500 w-[50%]" :
                        order.status === 'shipped' ? "bg-orange-500 w-[75%]" :
                        order.status === 'delivered' ? "bg-green-500 w-full" : "bg-gray-300 w-0"
                      )} />
                      
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, stepId) => {
                         const isActive = 
                           (step === 'Pending' && ['pending', 'accepted', 'processing', 'shipped', 'delivered'].includes(order.status)) ||
                           (step === 'Processing' && ['processing', 'shipped', 'delivered'].includes(order.status)) ||
                           (step === 'Shipped' && ['shipped', 'delivered'].includes(order.status)) ||
                           (step === 'Delivered' && ['delivered'].includes(order.status));
                           
                         const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

                         return (
                           <div key={step} className="relative z-10 flex flex-col items-center gap-1 bg-white dark:bg-slate-800 px-2">
                             <div className={cn(
                               "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                               isCancelled ? "bg-red-500 border-red-500" :
                               isActive ? "bg-white dark:bg-slate-800 border-green-500" : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                             )}>
                               {isActive && !isCancelled && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                             </div>
                             <span className={cn(
                               "text-[9px] font-bold uppercase tracking-tighter absolute -bottom-4 truncate",
                               isCancelled ? "text-red-500" :
                               isActive ? "text-slate-800 dark:text-slate-200" : "text-gray-400"
                             )}>{step}</span>
                           </div>
                         );
                      })}
                   </div>
                </div>

                <div className="space-y-2 mt-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-slate-700 mt-2">
                  <span className="font-bold text-gray-500 uppercase text-xs">Total</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => generateOrderPDF(order.original)}
                      className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                      title="Download Invoice"
                    >
                      <Download size={14} />
                    </button>
                    <span className="font-black text-orange-600 text-lg">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const OffersPage = ({ isAdmin, offers, user, addNotification, withPassword }: { isAdmin: boolean, offers: Offer[], user: FirebaseUser | null, addNotification: (text: string) => void, withPassword: (action: () => void, strict?: boolean) => void }) => {
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        addNotification('File is too large. Please select an image under 20MB.');
        return;
      }

      // If it's a GIF, we MUST use Storage directly to preserve animation
      // Actually, let's use Storage for ALL offer images to avoid base64 document size limits
      addNotification("Uploading image...");
      try {
        const storageRef = ref(storage, `offers/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(uploadTask.ref);
        setImageUrl(url);
        addNotification("Image uploaded successfully!");
      } catch (error: any) {
        console.error("Offer image upload error:", error);
        addNotification("Image upload failed: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const offerId = `OFFER-${Date.now()}`;
      const newOffer: Offer = {
        id: offerId,
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
        authorName: user?.displayName || 'Admin',
        likes: [],
        comments: [],
        shares: 0
      };
      await setDoc(doc(db, 'offers', offerId), newOffer);
      setShowAddOffer(false);
      setTitle('');
      setContent('');
      setImageUrl('');
      addNotification("অফার পাবলিশ করা হয়েছে!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'offers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (offer: Offer) => {
    if (!user) {
      addNotification("লাইক দিতে লগইন করুন!");
      return;
    }
    const userId = user.uid;
    const likes = offer.likes || [];
    const isLiked = likes.includes(userId);
    const newLikes = isLiked ? likes.filter(id => id !== userId) : [...likes, userId];

    try {
      await updateDoc(doc(db, 'offers', offer.id), { likes: newLikes });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `offers/${offer.id}`);
    }
  };

  const addComment = async (offerId: string) => {
    if (!user) {
      addNotification("কমেন্ট করতে লগইন করুন!");
      return;
    }
    const text = commentText[offerId]?.trim();
    if (!text) return;

    const newComment: OfferComment = {
      id: `COM-${Date.now()}`,
      userId: user.uid,
      userName: user.displayName || 'User',
      userPhoto: user.photoURL || undefined,
      text,
      createdAt: new Date().toISOString()
    };

    try {
      const offerRef = doc(db, 'offers', offerId);
      const offerSnap = await getDoc(offerRef);
      if (offerSnap.exists()) {
        const currentComments = offerSnap.data().comments || [];
        await updateDoc(offerRef, { comments: [...currentComments, newComment] });
        setCommentText(prev => ({ ...prev, [offerId]: '' }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `offers/${offerId}`);
    }
  };

  const shareOffer = async (offer: Offer) => {
    const shareUrl = `${window.location.origin}?tab=offers&id=${offer.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: offer.title,
          text: offer.content,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        addNotification("লিঙ্ক কপি করা হয়েছে!");
      }
      
      const offerRef = doc(db, 'offers', offer.id);
      const offerSnap = await getDoc(offerRef);
      if (offerSnap.exists()) {
        const currentShares = offerSnap.data().shares || 0;
        await updateDoc(offerRef, { shares: currentShares + 1 });
      }
    } catch (error) {
      console.error("Sharing failed", error);
    }
  };

  const deleteOffer = (id: string) => {
    withPassword(async () => {
      try {
        await deleteDoc(doc(db, 'offers', id));
        addNotification("অফার মুছে ফেলা হয়েছে!");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `offers/${id}`);
      }
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">অফার ও আপডেট</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">সর্বশেষ অফার এবং গুরুত্বপূর্ণ ঘোষণা</p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddOffer(!showAddOffer)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {showAddOffer ? <X size={20} /> : <Plus size={20} />}
            {showAddOffer ? 'বন্ধ করুন' : 'নতুন পোস্ট'}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showAddOffer && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl"
          >
            <form onSubmit={handleAddOffer} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">পোস্টের শিরোনাম</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="অফারের নাম লিখুন..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">বিস্তারিত বর্ণনা</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="অফার সম্পর্কে বিস্তারিত লিখুন..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">ছবি আপলোড করুন (ঐচ্ছিক)</label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={20} />
                    {imageUrl ? 'ছবি পরিবর্তন করুন' : 'ছবি নির্বাচন করুন'}
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-5 bg-red-50 text-red-500 rounded-2xl font-bold"
                    >
                      মুছে ফেলুন
                    </button>
                  )}
                </div>
                {imageUrl && (
                  <div className="mt-4 relative rounded-[24px] overflow-hidden border dark:border-slate-800">
                    <img src={imageUrl} alt="Preview" className="w-full h-[400px] object-cover" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCcw className="animate-spin" size={20} /> : <Send size={20} />}
                {isSubmitting ? 'পোস্ট হচ্ছে...' : 'পাবলিশ করুন'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8">
        {offers.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">এখনও কোনো অফার পোস্ট করা হয়নি।</p>
          </div>
        ) : (
          offers.map((offer) => {
            const isLiked = user && offer.likes?.includes(user.uid);
            return (
              <motion.div
                key={offer.id}
                layout
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 overflow-hidden">
                      {(!offer.authorName || offer.authorName === 'Admin') ? <User size={24} /> : <div className="font-bold">{offer.authorName[0]}</div>}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{offer.authorName || 'Admin'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(offer.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => deleteOffer(offer.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <div className="px-6 pb-4">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3">{offer.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {offer.content}
                  </p>
                </div>

                {/* Post Image */}
                {offer.imageUrl && (
                  <div className="mt-2 overflow-hidden">
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.title}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[2/1] object-cover bg-slate-100 dark:bg-slate-800"
                    />
                  </div>
                )}

                {/* Stats Bar */}
                {( (offer.likes?.length || 0) > 0 || (offer.comments?.length || 0) > 0 || (offer.shares || 0) > 0 ) && (
                  <div className="px-6 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 border-b dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      { (offer.likes?.length || 0) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">
                            <Sparkles size={8} />
                          </div>
                          {offer.likes?.length}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      { (offer.comments?.length || 0) > 0 && <span>{offer.comments?.length} কমেন্ট</span> }
                      { (offer.shares || 0) > 0 && <span>{offer.shares} শেয়ার</span> }
                    </div>
                  </div>
                )}

                {/* Post Footer (Facebook style) */}
                <div className="p-2 flex items-center justify-around">
                  <button 
                    onClick={() => toggleLike(offer)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all",
                      isLiked ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Sparkles size={18} className={isLiked ? "fill-current" : ""} />
                    <span>লাইক</span>
                  </button>
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [offer.id]: !prev[offer.id] }))}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <MessageCircle size={18} />
                    <span>কমেন্ট</span>
                  </button>
                  <button 
                    onClick={() => shareOffer(offer)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <Share2 size={18} />
                    <span>শেয়ার</span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {showComments[offer.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        {/* Comment Input */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                            {user?.photoURL ? <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user?.displayName?.[0] || '?'}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text"
                              placeholder="কমেন্ট লিখুন..."
                              value={commentText[offer.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [offer.id]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && addComment(offer.id)}
                              className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <button 
                              onClick={() => addComment(offer.id)}
                              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {offer.comments?.length === 0 ? (
                            <p className="text-center py-4 text-xs text-slate-400 italic">প্রথম কমেন্টটি আপনি করুন!</p>
                          ) : (
                            offer.comments?.slice().reverse().map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 overflow-hidden">
                                  {comment.userPhoto ? <img src={comment.userPhoto} alt={comment.userName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : (comment.userName ? comment.userName[0] : 'U')}
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-800">
                                  <div className="flex justify-between items-center mb-1">
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{comment.userName || 'User'}</h5>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase">
                                      {new Date(comment.createdAt).toLocaleDateString('bn-BD')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        // @ts-ignore
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error.includes('resource-exhausted') || parsedError.error.includes('Quota limit exceeded')) {
          errorMessage = "Firestore free tier quota exceeded. This usually happens after 20,000 writes in a single day. The quota will reset automatically at midnight UTC. Please try again tomorrow.";
        } else {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} at ${parsedError.path}`;
        }
      } catch (e) {
        // @ts-ignore
        errorMessage = this.state.error?.message || String(this.state.error);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
          <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Application Error</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

const ProductDetailsModal = ({ 
  product, 
  onClose, 
  addToCart,
  formatCurrency,
  addNotification,
  isAdmin,
  onEdit,
  onDelete
}: { 
  product: Product, 
  onClose: () => void, 
  addToCart: (p: Product) => void,
  formatCurrency: (v: number) => string,
  addNotification: (msg: string) => void,
  isAdmin?: boolean,
  onEdit?: (p: Product) => void,
  onDelete?: (id: string | number) => void
}) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950 z-[150] overflow-y-auto font-sans text-white flex flex-col"
    >
      {/* Top Beautiful Header Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-bold tracking-wider uppercase">হোমপেজে ফিরুন (Back)</span>
        </button>
        
        <h3 className="hidden sm:block text-sm font-black tracking-widest text-slate-400 shortcut uppercase">
          Product Details Specification Page
        </h3>
        
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => onEdit?.(product)}
              className="p-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl hover:bg-blue-600 hover:text-white transition"
              title="Edit Product"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          
          {/* Left Column - Product Showcase (Huge media viewer) */}
          <div className="space-y-6">
            <div className="relative w-full aspect-square rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {showVideo && product.videoUrl ? (
                <video 
                  src={product.videoUrl} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay
                />
              ) : product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <Package size={100} className="text-slate-800" strokeWidth={1} />
              )}

              {product.videoUrl && (
                <button 
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-4 right-4 bg-blue-600 text-white rounded-2xl px-4 py-2 text-xs font-black shadow-lg flex items-center gap-2 uppercase tracking-widest hover:bg-blue-500 transition-colors"
                >
                  {showVideo ? <ImageIcon size={14} /> : <Video size={14} />}
                  {showVideo ? 'Show Image' : 'Play Video'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Product Meta, Info, Specs, Actions */}
          <div className="space-y-8 flex flex-col justify-start">
            <div>
              <span className="inline-block px-3 py-1.5 bg-blue-600/10 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-600/20 mb-3">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight break-words mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-3xl font-black text-blue-500 font-mono tracking-tight">৳{product.price}</p>
                {product.oldPrice && (
                  <p className="text-slate-500 line-through text-lg font-bold">৳{product.oldPrice}</p>
                )}
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${product.stock > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Core Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 p-5 bg-slate-900/40 border border-slate-800/80 rounded-[24px]">
              <button 
                onClick={() => {
                  addToCart(product);
                  addNotification(`${product.name} added to cart!`);
                }}
                disabled={product.stock <= 0}
                className={cn(
                  "flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg",
                  product.stock > 0 
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/10" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                <ShoppingCart size={18} />
                {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
              </button>

              <button 
                onClick={() => {
                  const text = `Hello! I'm interested in the ${product.name} (Price: ৳${product.price}). Is it available?`;
                  window.open(`https://wa.me/8801934279566?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="h-14 px-6 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/40 active:scale-95"
              >
                <MessageSquare size={18} /> Order on WhatsApp
              </button>
            </div>

            {/* Description Details Card */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                Product Description
              </h4>
              <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {product.description || `High-performance ${product.name} with advanced smart sensing and industrial-grade construction.`}
              </div>
            </div>

            {/* Specifications Tab */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                  Technical Specifications (স্পেসিফিকেশন)
                </h4>
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30">
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr 
                          key={i} 
                          className={cn("border-b last:border-0 border-slate-800/60 transition-colors hover:bg-slate-800/10")}
                        >
                          <td className="p-3.5 font-bold text-slate-400 w-1/3 bg-slate-900/30">{spec.key}</td>
                          <td className="p-3.5 text-slate-200 capitalize w-2/3 whitespace-pre-wrap">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* If Admin controls */}
            {isAdmin && (
              <div className="flex gap-2 pt-5 border-t border-slate-800/50">
                <button 
                  onClick={() => onEdit?.(product)}
                  className="flex-1 h-12 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Edit Product
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this product?')) {
                      onDelete?.(product.id);
                      onClose();
                    }
                  }}
                  className="flex-1 h-12 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Delete Product
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const CategoryManager = ({ 
  productCategories, 
  setProductCategories,
  products,
  setProducts,
  addNotification 
}: { 
  productCategories: CategoryData[], 
  setProductCategories: (cats: CategoryData[]) => void,
  products: Product[],
  setProducts: (products: Product[]) => void,
  addNotification: (msg: string) => void
}) => {
  const [newCat, setNewCat] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');

  const handleDeleteCategory = (idToDelete: string) => {
    const category = productCategories.find(c => c.id === idToDelete);
    if (!category) return;

    // Check if there are products in this category
    const linkedProducts = products.filter(p => p.category === category.name);
    if (linkedProducts.length > 0) {
      addNotification(`Cannot delete: ${linkedProducts.length} products are still in this category.`);
      return;
    }

    // Check if category is purely an enum value (base category)
    const baseCategories = ['CCTV', 'NVR', 'DVR', 'ACCESSORIES'];
    if (baseCategories.includes(category.name.toUpperCase())) {
      const confirm = window.confirm("This is a base category. Are you sure?");
      if (!confirm) return;
    }

    setProductCategories(productCategories.filter(c => c.id !== idToDelete));
    addNotification("Category deleted successfully.");
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) {
      addNotification("Please enter a category name.");
      return;
    }

    if (productCategories.find(c => c.name.toLowerCase() === newCat.trim().toLowerCase())) {
      addNotification("This category already exists.");
      return;
    }

    const newCategory: CategoryData = {
      id: Date.now().toString(),
      name: newCat.trim(),
      image: newCatImage
    };
    setProductCategories([...productCategories, newCategory]);
    setNewCat('');
    setNewCatImage('');
    addNotification(`Category "${newCat}" added successfully!`);
  };

  const handleUpdateCategory = (id: string) => {
    if (!editName.trim()) {
      addNotification("Name cannot be empty.");
      return;
    }

    const oldCategory = productCategories.find(c => c.id === id);
    if (!oldCategory) return;

    const oldName = oldCategory.name;
    const newName = editName.trim();
    
    // Update category
    setProductCategories(productCategories.map(c => 
      c.id === id ? { ...c, name: newName, image: editImage } : c
    ));

    // Update products if name changed
    if (oldName !== newName) {
      setProducts(products.map(p => 
        p.category === oldName ? { ...p, category: newName } : p
      ));
    }

    setEditingCatId(null);
    addNotification("Category updated successfully.");
  };

  const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 256;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setEditImage(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 256; // Smaller for category icons
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setNewCatImage(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">Manage Categories</h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Catalog Taxonomy Control</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="New category name..." 
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 outline-none font-bold text-sm focus:ring-2 focus:ring-green-500/20"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            
            <div className="flex items-center gap-3">
              <label 
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                  newCatImage ? "border-green-500/50 bg-green-500/5" : "border-gray-200 dark:border-slate-800 hover:border-blue-500/50"
                )}
              >
                <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
                <ImageIcon size={18} className={newCatImage ? "text-green-500" : "text-gray-400"} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {newCatImage ? "Category Image Added" : "Add Category Logo/Pic"}
                </span>
                {newCatImage && (
                  <button 
                    onClick={(e) => { e.preventDefault(); setNewCatImage(''); }}
                    className="ml-2 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </label>
              
              <button 
                onClick={handleAddCategory}
                className="px-8 py-4 glow-effect-container text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Add Category
              </button>
            </div>
          </div>
          
          {newCatImage && (
            <div className="w-32 h-32 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
              <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {productCategories.map(cat => {
            const productCount = products.filter(p => p.category === cat.name).length;
            const isEditing = editingCatId === cat.id;

            return (
              <div 
                key={cat.id} 
                className="p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-black/5"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex-shrink-0 relative group/img">
                  {isEditing ? (
                    <label className="w-full h-full flex items-center justify-center cursor-pointer bg-blue-500/10 text-blue-500">
                      <input type="file" className="hidden" accept="image/*" onChange={onEditImageChange} />
                      {editImage ? (
                        <img src={editImage} alt="Edit" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={14} />
                      )}
                    </label>
                  ) : (
                    cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <LayoutGrid size={14} />
                      </div>
                    )
                  )}
                </div>
                
                <div className="flex-1 flex flex-col min-w-0">
                  {isEditing ? (
                    <input 
                      autoFocus
                      className="w-full bg-transparent border-b border-blue-500 outline-none font-black text-[10px] uppercase px-0 py-0.5"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                    />
                  ) : (
                    <span className="font-black text-[10px] uppercase tracking-tight truncate">{cat.name}</span>
                  )}
                  <span className="text-[8px] text-gray-500 font-bold uppercase truncate">{productCount} Prod</span>
                </div>
                
                <div className="flex items-center gap-0.5">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="w-6 h-6 flex items-center justify-center text-green-500 hover:bg-green-500/10 rounded-md transition-all"
                      >
                        <Check size={12} />
                      </button>
                      <button 
                        onClick={() => setEditingCatId(null)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-all"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditName(cat.name);
                          setEditImage(cat.image || '');
                        }}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ 
  products, 
  inventoryMode, 
  setInventoryMode, 
  setShowAddProduct, 
  setSelectedProduct, 
  handleDeleteProduct,
  onEditProduct,
  addToCart,
  isDarkMode,
  formatCurrency,
  productCategories,
  isAdmin
}: { 
  products: Product[], 
  inventoryMode: boolean, 
  setInventoryMode: (v: boolean) => void, 
  setShowAddProduct: (v: boolean) => void, 
  setSelectedProduct: (p: Product) => void, 
  handleDeleteProduct: (id: number | string) => void, 
  onEditProduct: (p: Product) => void,
  addToCart: (p: Product) => void,
  isDarkMode: boolean,
  formatCurrency: (v: number) => string,
  productCategories: CategoryData[],
  isAdmin?: boolean
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fuse = useMemo(() => new Fuse(products, {
    keys: [
      'name', 
      'category', 
      'description', 
      { name: 'seoKeywords', weight: 1.5 },
      { name: 'specifications.key', weight: 0.8 },
      { name: 'specifications.value', weight: 1.2 }
    ],
    threshold: 0.45,
    includeScore: true
  }), [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (search) {
      const searchLower = search.toLowerCase().trim();
      const fuzzyResults = fuse.search(search).map(r => r.item);
      
      const substringResults = products.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchLower);
        const categoryMatch = p.category.toLowerCase().includes(searchLower);
        const descMatch = (p.description || '').toLowerCase().includes(searchLower);
        const seoMatch = (p.seoKeywords || '').toLowerCase().includes(searchLower);
        const specMatch = (p.specifications || []).some(spec => 
          spec.key.toLowerCase().includes(searchLower) || 
          spec.value.toLowerCase().includes(searchLower)
        );
        return nameMatch || categoryMatch || descMatch || seoMatch || specMatch;
      });

      const uniqueResults = new Set<Product>();
      substringResults.forEach(item => uniqueResults.add(item));
      fuzzyResults.forEach(item => uniqueResults.add(item));

      result = Array.from(uniqueResults);
    }

    if (filter !== 'all') {
      result = result.filter(p => p.category === filter);
    }

    return result;
  }, [search, filter, products, fuse]);

  // Find related categories based on search
  const suggestedCategories = useMemo(() => {
    if (!search) return [];
    return productCategories.filter(cat => 
      cat.name.toLowerCase().includes(search.toLowerCase()) && cat.name !== filter
    ).map(c => c.name);
  }, [search, productCategories, filter]);

  // Get all categories including custom ones
  const allCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'all', image: undefined } as any];
    if (!productCategories) return base;
    
    // Filter out potential 'all' collision and ensure unique IDs
    const seenIds = new Set(['all']);
    const uniqueProductCats = productCategories.filter(cat => {
      if (seenIds.has(cat.id)) return false;
      seenIds.add(cat.id);
      return true;
    });
    
    return [...base, ...uniqueProductCats];
  }, [productCategories]);

  return (
    <div className="space-y-8 pb-32 md:pb-0">
      {/* Hero Section */}
      {!inventoryMode && (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-[40px] overflow-hidden group mb-12">
          {/* Background with parallax effect simulation */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=2000")' }}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-center px-8 md:px-16 space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Protect What <br />
                <span className="text-blue-400">Matters Most</span>
              </h2>
              <p className="text-blue-100/80 text-lg md:text-xl font-medium max-w-md">
                High-Quality Security Cameras for Your Home & Business
              </p>
            </motion.div>
            
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('best-sellers');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-fit px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl transition-all flex items-center gap-3 group"
            >
              Shop Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Floaters (Icons of tech) */}
          <div className="absolute right-10 bottom-10 hidden lg:block">
            <div className="relative">
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="text-white">
                    <div className="text-[10px] font-bold opacity-60 uppercase">System Status</div>
                    <div className="font-black">Active & Secure</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6" id="best-sellers">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tighter leading-none">{inventoryMode ? 'MASTER INVENTORY' : 'SYSTEM MODULES'}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
              {inventoryMode ? 'Node Control & Management' : 'High-End Technology & Smart Hardware'}
            </p>
          </div>
          {isAdmin && (
            <div className="relative flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInventoryMode(!inventoryMode)}
                className={cn(
                  "h-12 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 font-bold text-sm glow-effect-container text-white shadow-xl shadow-blue-500/30 backdrop-blur-md"
                )}
              >
                <Edit2 size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{inventoryMode ? 'Exit Edit Mode' : 'Edit Mode'}</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowAddProduct(true);
                }}
                className="w-12 h-12 glow-effect-container text-white rounded-2xl flex items-center justify-center shadow-xl transition-all backdrop-blur-md"
              >
                <Plus size={24} strokeWidth={3} />
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar py-3 px-1">
          {allCategories.map(cat => (
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              key={cat.id}
              onClick={() => setFilter(cat.name)}
              className={cn(
                "group relative min-w-[80px] h-20 rounded-[20px] overflow-hidden flex flex-col items-center justify-center gap-1 transition-all duration-500 ring-1 shadow-sm",
                filter === cat.name 
                  ? "bg-blue-600 ring-blue-500 shadow-2xl shadow-blue-600/40 translate-y-[-2px]" 
                  : "bg-white dark:bg-slate-800/40 ring-gray-100 dark:ring-slate-700 hover:ring-blue-400/50"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg overflow-hidden mb-0.5 flex items-center justify-center p-0.5 transition-all duration-500",
                filter === cat.name ? "bg-white/20" : "bg-gray-50 dark:bg-slate-900"
              )}>
                {(cat as CategoryData).image ? (
                  <img src={(cat as CategoryData).image} alt={cat.name} className="w-full h-full object-cover rounded-[8px]" />
                ) : (
                  <LayoutGrid size={14} className={filter === cat.name ? "text-white" : "text-gray-400"} />
                )}
              </div>
              <span className={cn(
                "text-[7px] font-black tracking-widest uppercase px-1 text-center leading-tight transition-colors duration-500",
                filter === cat.name ? "text-white" : "text-gray-600 dark:text-gray-300 group-hover:text-blue-500"
              )}>
                {cat.name}
              </span>
              {filter === cat.name && (
                <motion.div 
                  layoutId="activeFilterDot"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-sm"
                />
              )}
            </motion.button>
          ))}
        </div>

        <UiverseSearch 
          value={search} 
          onChange={setSearch} 
          placeholder="Query infrastructure nodes..." 
        />

        {suggestedCategories.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Related:</span>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {suggestedCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilter(cat);
                    setSearch('');
                  }}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      <div className="py-8 text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex flex-col items-center gap-1 group">
          Our Best Sellers
          <div className="w-12 h-1 bg-blue-600 rounded-full transition-all duration-500 group-hover:w-24" />
        </h2>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">
          Premier Selection & Trusted Performance
        </p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4 pb-12">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (idx % 6) * 0.05 }}
              className="h-full"
            >
              <ProductPastaCard 
                product={product} 
                onSelect={setSelectedProduct}
                isAdmin={isAdmin}
                onEdit={onEditProduct}
                onDelete={handleDeleteProduct}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 py-20 text-center flex flex-col items-center justify-center gap-4 text-gray-400">
            <Package size={48} className="animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-widest leading-none">Infrastructure Offline</p>
              <p className="text-[10px] font-bold lowercase tracking-tight opacity-50">No matching assets identified in this sector</p>
            </div>
            <button 
              onClick={() => { setFilter('all'); setSearch(''); }}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-2 hover:bg-slate-200"
            >
              Recalibrate Sensors
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};


const AdminDashboard = ({ 
  products, 
  clients, 
  publicOrders,
  formatCurrency,
  setActiveTab,
  expenses,
  isAdmin,
  isDarkMode,
  setShowAddProduct,
  onEditProduct,
  deleteAnyOrder
}: { 
  products: Product[], 
  clients: Client[], 
  publicOrders: PublicOrder[],
  formatCurrency: (v: number) => string,
  setActiveTab: (t: string) => void,
  expenses: Expense[],
  isAdmin: boolean,
  isDarkMode: boolean,
  setShowAddProduct?: (v: boolean) => void,
  onEditProduct?: (p: Product) => void,
  deleteAnyOrder?: (order: any) => Promise<void>
}) => {
  const totalClients = clients.length;
  const totalProducts = products.length;
  const totalDue = clients.reduce((sum, c) => sum + c.due, 0);
  const monthlyIncome = clients.reduce((sum, c) => sum + c.totalPaid, 0);
  
  const chartData = useMemo(() => [
    { name: 'Jan', profit: 4000 },
    { name: 'Feb', profit: 3000 },
    { name: 'Mar', profit: 5000 },
    { name: 'Apr', profit: 2780 },
    { name: 'May', profit: 1890 },
    { name: 'Jun', profit: 2390 },
  ], []);

  return (
    <div className="space-y-12 pb-32">
      {/* Maintenance Alerts for Admin */}
      <OutageAlerts isAdmin={isAdmin} />

      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Elite <span className="text-orange-500 dark:text-emerald-500 transition-colors">Enterprise</span> Access
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm uppercase tracking-widest">Global Infrastructure Monitoring</p>
        </div>
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('products')}
            className="px-8 py-3 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all hover:bg-white/10"
          >
            <ShoppingCart size={18} strokeWidth={3} className="text-orange-500 dark:text-emerald-500" />
            Manage Products
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('support')}
            className="px-8 py-3 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all hover:bg-white/10"
          >
            <Headphones size={18} strokeWidth={3} className="text-orange-500 dark:text-emerald-500" />
            Satellite Support
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('ai-assistant')}
            className="px-8 py-3 bg-orange-600 dark:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-orange-600/30 dark:shadow-emerald-600/30 ring-1 ring-white/20 transition-all active:scale-95"
          >
            <Bot size={18} strokeWidth={3} />
            AI Nexus
          </motion.button>
        </div>
      </div>

      {/* Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Client Database', value: totalClients, color: 'text-orange-500 dark:text-emerald-500', bg: 'bg-orange-500/10 dark:bg-emerald-500/10' },
          { icon: Package, label: 'Global Assets', value: totalProducts, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { 
            label: 'Total Equity', 
            isIncomeCard: true 
          },
          { icon: Zap, label: 'Risk Exposure', value: formatCurrency(totalDue), color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "group transition-all",
              stat.isIncomeCard ? "income-card-theme h-full" : "glass-card p-8 hover:translate-y-[-8px] h-full"
            )}
          >
            {stat.isIncomeCard ? (
              <div className="card-outer h-full">
                <div className="card">
                  <div className="bg-custom">
                    <div className="flex-row">
                      <p className="heading">Income</p>
                      <div className="tag-svg">
                        <svg viewBox="0 0 925.1 925.1" className="w-5 h-5 fill-white">
                          <path d="M453.5,26.514l-345.6,187.3l15.2-3.8l412.9-104.7l-35-64.6C491.8,23.614,470.5,17.313,453.5,26.514z"></path>
                          <path d="M780.9,222.313l-26.2-103.4c-4-15.9-18.3-26.4-33.9-26.4c-2.8,0-5.7,0.3-8.6,1.1l-160.5,40.7l-347.4,88.1H599.4h181.5V222.313z"></path>
                          <path d="M546.7,665.513v-176c0-36.699,29.8-66.5,66.5-66.5h218.6h16.5h16.5H878v-135.7c0-19.3-15.7-35-35-35h-21.5H805h-16.5H615.7H133.8h-16.5h-16.5h-64H35c-12.9,0-24.1,7-30.2,17.3c-3,5.2-4.8,11.2-4.8,17.7v5.6v574.9c0,19.301,15.7,35,35,35h807.9c19.3,0,35-15.699,35-35V732.114H613.2C576.5,732.114,546.7,702.214,546.7,665.513z"></path>
                          <path d="M908,459.513c-4.5-2.699-9.6-4.3-15-4.8c-1-0.1-1.9-0.1-2.9-0.1H878h-5.2h-16.5h-39.6H613.2c-19.3,0-35,15.7-35,35v176c0,19.299,15.7,35,35,35H878h12.1c1,0,1.9-0.102,2.9-0.102c5.4-0.398,10.5-2.1,15-4.799c10.2-6.1,17.1-17.301,17.1-30.1v-176C925.1,476.813,918.2,465.614,908,459.513z M700.5,634.313c-31.3,0-56.8-25.4-56.8-56.801c0-31.299,25.399-56.799,56.8-56.799c31.3,0,56.8,25.4,56.8,56.799C757.3,608.913,731.9,634.313,700.5,634.313z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="amount">
                      <span className="typing">{formatCurrency(monthlyIncome)}</span>
                      <span className="main-pr">↑ 26.5%</span>
                    </div>
                    <div className="compare text-light">Real-time enterprise metrics integration</div>
                  </div>
                  <div className="tags">
                    <span>Fiscal Summary</span>
                    <span>Stats</span>
                  </div>
                  <div className="chart">
                    <div className="bar"><div className="pr-day">5%</div><div className="bar-label">S</div></div>
                    <div className="bar"><div className="pr-day">-1.7%</div><div className="bar-label">M</div></div>
                    <div className="bar"><div className="pr-day">2.3%</div><div className="bar-label">T</div></div>
                    <div className="bar"><div className="pr-day">-3.8%</div><div className="bar-label">W</div></div>
                    <div className="bar"><div className="pr-day">6.3%</div><div className="bar-label">T</div></div>
                    <div className="bar"><div className="pr-day">-2.3%</div><div className="bar-label">F</div></div>
                    <div className="bar"><div className="pr-day">2.0%</div><div className="bar-label">S</div></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg, stat.color)}>
                    {stat.icon && <stat.icon size={24} strokeWidth={2.5} />}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                </div>
                <p className={cn("text-3xl font-black tracking-tighter mb-1", stat.color)}>{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Graphs & Fast Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2 glass-card p-10 overflow-hidden relative">
          <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Revenue Analytics</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">6-Month Fiscal Trajectory</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDarkMode ? "#10b981" : "#f97316"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isDarkMode ? "#10b981" : "#f97316"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', border: 'none', borderRadius: '16px', color: isDarkMode ? '#fff' : '#1e293b' }}
                />
                <Area type="monotone" dataKey="profit" stroke={isDarkMode ? "#10b981" : "#f97316"} strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="glass-card p-10">
          <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Admin Shortcuts</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">Quick Access Nodes</p>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('products')} className="flex-1 p-6 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl transition-all hover:scale-[1.02] bg-orange-500 dark:bg-emerald-600 gap-2">
                <Package size={24} />
                <span className="font-black text-[10px] uppercase tracking-widest text-center">Manage Panel</span>
              </button>
              <button onClick={() => setActiveTab('categories')} className="flex-1 p-6 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl transition-all hover:scale-[1.02] bg-blue-500 dark:bg-blue-600 gap-2">
                <LayoutGrid size={24} />
                <span className="font-black text-[10px] uppercase tracking-widest text-center">Categories</span>
              </button>
            </div>
            {[
              { label: 'Client Log', icon: Users, action: () => setActiveTab('clients'), color: 'bg-emerald-500 dark:bg-emerald-700' },
              { label: 'Fiscal Ledger', icon: Wallet, action: () => setActiveTab('expenses'), color: 'bg-slate-900 dark:bg-slate-800 border border-green-500/20' },
            ].map((node, i) => (
              <button key={i} onClick={node.action} className={cn("w-full p-6 rounded-3xl flex items-center justify-between text-white shadow-2xl transition-all hover:scale-[1.02]", node.color)}>
                <span className="font-black text-xs uppercase tracking-widest">{node.label}</span>
                <node.icon size={20} />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders History Table */}
      <div className="glass-card p-10 mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-1 leading-none">Order Activity History</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time status of all public orders</p>
          </div>
          <button 
            onClick={() => setActiveTab('clients')}
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-emerald-500 hover:opacity-75 transition-opacity"
          >
            Deep Analytics →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800/30">
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Name</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/20">
              {[
                ...publicOrders.map(o => ({ ...o, clientName: o.customerName, type: 'Public' })),
                ...clients.flatMap(c => (c.orders || []).map(o => ({ ...o, clientName: c.name, type: 'CRM', clientId: c.id })))
              ].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 12).map((order, idx) => (
                <tr key={`${order.id}-${order.type}-${idx}`} className="group hover:bg-gray-50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="py-5 font-mono text-[10px] font-bold text-blue-600 dark:text-emerald-400">{order.id}</td>
                  <td className="py-5 text-xs font-bold text-slate-900 dark:text-white capitalize">{order.clientName}</td>
                  <td className="py-5 text-xs font-black tracking-tighter text-slate-900 dark:text-white">{formatCurrency(order.total)}</td>
                  <td className="py-5">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full",
                      order.status === 'pending' ? "bg-amber-100 text-amber-600" : 
                      order.status === 'accepted' ? "bg-emerald-100 text-emerald-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 text-[10px] font-bold text-gray-400">{order.date}</td>
                  <td className="py-5 text-right">
                    {deleteAnyOrder && (
                      <button 
                        onClick={() => deleteAnyOrder(order)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Delete order record"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && publicOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] italic">No persistent records found in neural-link</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PublicStore = ({ 
  products, 
  sliderImages,
  offers = [],
  formatCurrency,
  addToCart,
  setActiveTab,
  setSelectedProduct,
  productCategories
}: {
  products: Product[],
  sliderImages: string[],
  offers?: Offer[],
  formatCurrency: (v: number) => string,
  addToCart: (p: Product) => void,
  setActiveTab: (t: string) => void,
  setSelectedProduct: (p: Product) => void,
  productCategories: CategoryData[]
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fuse = useMemo(() => new Fuse(products, {
    keys: [
      'name', 
      'category', 
      'description', 
      { name: 'seoKeywords', weight: 1.5 },
      { name: 'specifications.key', weight: 0.8 },
      { name: 'specifications.value', weight: 1.2 }
    ],
    threshold: 0.45,
    includeScore: true
  }), [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (search) {
      const searchLower = search.toLowerCase().trim();
      const fuzzyResults = fuse.search(search).map(r => r.item);
      
      const substringResults = products.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchLower);
        const categoryMatch = p.category.toLowerCase().includes(searchLower);
        const descMatch = (p.description || '').toLowerCase().includes(searchLower);
        const seoMatch = (p.seoKeywords || '').toLowerCase().includes(searchLower);
        const specMatch = (p.specifications || []).some(spec => 
          spec.key.toLowerCase().includes(searchLower) || 
          spec.value.toLowerCase().includes(searchLower)
        );
        return nameMatch || categoryMatch || descMatch || seoMatch || specMatch;
      });

      const uniqueResults = new Set<Product>();
      substringResults.forEach(item => uniqueResults.add(item));
      fuzzyResults.forEach(item => uniqueResults.add(item));

      result = Array.from(uniqueResults);
    }
    if (filter !== 'all') {
      result = result.filter(p => p.category === filter);
    }
    return result;
  }, [search, filter, products, fuse]);

  // All categories including 'all'
  const allCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'all', image: undefined } as any];
    if (!productCategories) return base;
    
    // Filter out potential 'all' collision and ensure unique IDs
    const seenIds = new Set(['all']);
    const uniqueProductCats = (productCategories || []).filter(cat => {
      if (seenIds.has(cat.id)) return false;
      seenIds.add(cat.id);
      return true;
    });
    
    return [...base, ...uniqueProductCats];
  }, [productCategories]);

  useEffect(() => {
    if (!sliderImages || sliderImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderImages]);

  return (
    <div className="w-full pb-32 -mt-4">
      {/* Daraz-Style Search Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <UiverseSearch 
              value={search} 
              onChange={setSearch} 
              placeholder="Search cameras, NVR, DVR..." 
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab('me')}
            className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 border border-orange-200 dark:border-orange-800/50"
          >
            <User size={20} />
          </motion.button>
        </div>
      </div>

      {/* Promo Banner Slider - Hide when searching */}
      {!search && (
        <>
          <div className="relative overflow-hidden rounded-3xl h-48 md:h-[350px] lg:h-[450px] group shadow-2xl bg-slate-900">
            <AnimatePresence mode="wait">
              {sliderImages && sliderImages.length > 0 ? (
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full relative"
                >
                  <img src={sliderImages[currentSlide]} alt={`Slide ${currentSlide}`} className="w-full h-full object-cover" />
                </motion.div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 flex items-center px-8">
                  <div className="flex-1 space-y-2">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Flash Sale Now Live</span>
                    <h3 className="text-3xl font-black text-white tracking-tighter leading-none">UP TO 80% OFF<br/><span className="text-orange-200">SUPER DEALS</span></h3>
                    <button className="mt-2 bg-white text-orange-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Shop Now</button>
                  </div>
                  <div className="hidden sm:block w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                </div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {sliderImages && sliderImages.length > 0 ? (
                sliderImages.map((_, i) => (
                  <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", i === currentSlide ? "bg-white w-4" : "bg-white/40")} />
                ))
              ) : (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 1 ? "bg-white w-4" : "bg-white/40")} />
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2.5 overflow-x-auto hide-scrollbar py-2.5 px-1">
            {allCategories.map(cat => (
              <motion.button 
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                key={cat.id}
                onClick={() => setFilter(cat.name)}
                className={cn(
                   "group relative min-w-[85px] h-24 rounded-[24px] overflow-hidden flex flex-col items-center justify-center gap-1 transition-all duration-500 shadow-sm",
                   filter === cat.name 
                     ? "glow-effect-container text-white scale-[1.05] z-10" 
                     : "bg-white dark:bg-slate-800/40 ring-1 ring-gray-100 dark:ring-slate-700 hover:ring-blue-400/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl overflow-hidden mb-0.5 flex items-center justify-center p-0.5 transition-all duration-500",
                  filter === cat.name ? "bg-white/20" : "bg-gray-50 dark:bg-slate-900"
                )}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-[8px]" />
                  ) : (
                    <LayoutGrid size={16} className={filter === cat.name ? "text-white" : "text-gray-400"} />
                  )}
                </div>
                <span className={cn(
                  "text-[8px] font-black tracking-widest uppercase px-1 text-center leading-tight transition-colors duration-500",
                  filter === cat.name ? "text-white" : "text-gray-600 dark:text-gray-300 group-hover:text-blue-500"
                )}>
                  {cat.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Category Icon Grid - Modern Single Row */}
          <div className="flex items-start justify-between gap-1 py-6 overflow-x-auto no-scrollbar">
            {[
              { label: 'Track Order', icon: Package, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20', action: () => setActiveTab('track-order') },
              { label: 'Hot Deals', icon: Sparkles, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20', action: () => setActiveTab('offers') },
              { label: 'Free Delivery', icon: Truck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', action: () => setActiveTab('products') },
              { label: 'Support', icon: Headphones, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20', action: () => window.open('https://wa.me/8801817681233', '_blank') },
              { label: 'Market', icon: ShoppingBag, color: 'from-blue-900 to-blue-950', shadow: 'shadow-blue-900/20', action: () => setActiveTab('products') },
            ].map((cat, i) => (
              <motion.button 
                key={i}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={cat.action}
                className="flex flex-col items-center gap-2 min-w-[60px] group flex-1"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:brightness-110 group-active:shadow-none",
                  cat.color,
                  cat.shadow
                )}>
                  <cat.icon size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 text-center uppercase tracking-tighter leading-tight whitespace-normal h-5 flex items-center justify-center px-1">
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Latest Marketing Offers */}
          {offers && offers.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <Megaphone size={18} className="text-orange-500" />
                  সাম্প্রতিক অফার
                </h3>
                <button onClick={() => setActiveTab('offers')} className="text-orange-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  সব দেখুন <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x">
                {offers.slice(0, 5).map((offer, i) => (
                  <motion.div 
                    key={offer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setActiveTab('offers')}
                    className="min-w-[280px] w-[280px] bg-white dark:bg-slate-800 rounded-[20px] shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer snap-center group relative"
                  >
                    {offer.imageUrl ? (
                      <div className="h-[150px] w-full overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                        <img 
                          src={offer.imageUrl} 
                          alt={offer.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h4 className="text-white font-bold text-base line-clamp-1 drop-shadow-md tracking-tight">{offer.title}</h4>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[150px] w-full bg-gradient-to-br from-indigo-500 to-pink-600 flex items-center justify-center p-4 relative">
                         <Megaphone size={40} className="text-white/10 absolute -right-2 -bottom-2 rotate-12" />
                         <h4 className="text-white font-black text-lg line-clamp-2 drop-shadow-lg z-10 text-center uppercase tracking-tighter">{offer.title}</h4>
                      </div>
                    )}
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded-lg font-bold text-[8px] uppercase tracking-wider">
                          {offer.expiryDate || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                        <Sparkles size={10} />
                        <span className="text-[9px] uppercase">View</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Flash Sale Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tighter text-orange-600 italic">FLASH SALE</h3>
              <div className="flex gap-1">
                <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">02</span>
                <span className="text-orange-600 font-bold">:</span>
                <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">45</span>
                <span className="text-orange-600 font-bold">:</span>
                <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">12</span>
              </div>
            </div>
            <button onClick={() => setActiveTab('products')} className="text-orange-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              View More <ChevronRight size={14} />
            </button>
          </div>

          {/* Horizontal Flash Sale Products */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
            {products.slice(0, 6).map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProduct(product)}
                className="min-w-[180px] rounded-2xl p-3 cursor-pointer group glow-effect-container text-white"
              >
                <div className="h-44 rounded-xl mb-3 overflow-hidden relative bg-png flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x400/07182e/ffffff?text=${encodeURIComponent(product.name || 'Product')}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Package size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-lg">Save 15%</div>
                </div>
                <h4 className="text-[11px] font-black line-clamp-1 mb-1 uppercase tracking-tight group-hover:text-orange-400 transition-colors">{product.name}</h4>
                <div className="flex flex-col gap-0.5">
                  <span className="text-orange-500 font-black text-sm italic">{formatCurrency(product.price)}</span>
                  <span className="text-gray-500 text-[9px] line-through">{formatCurrency(product.price * 1.15)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Main Product Feed Header */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-xl font-black tracking-tighter">{search ? 'SEARCH RESULTS' : 'RECOMMENDED FOR YOU'}</h3>
        <Filter size={18} className="text-gray-400" />
      </div>

      {/* Daraz-Style Main Product Grid */}
      <div className="grid grid-cols-2 gap-2 px-1 py-4 min-h-[400px]">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 6) * 0.1 }}
              className="h-full"
            >
              <ProductPastaCard 
                product={product} 
                onSelect={setSelectedProduct}
                addToCart={addToCart}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 py-20 text-center flex flex-col items-center justify-center gap-4 text-white/40">
            <Package size={48} className="animate-pulse" />
            <div>
              <p className="text-sm font-black uppercase tracking-widest">No Products Found</p>
              <p className="text-[10px] tracking-tight">Try adjusting your filters or search term</p>
            </div>
            <button 
              onClick={() => { setFilter('all'); setSearch(''); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-2 hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Support Contact Section for Clients */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                <Headphones size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-lg">Need Assistance?</h3>
                <p className="text-xs text-slate-400">Our support team is ready to help</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a 
                href="https://wa.me/8801817681233"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 transition-colors group"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest">WhatsApp Us</p>
                  <p className="font-bold text-emerald-300">01817681233</p>
                </div>
              </a>
              
              <a 
                href="tel:01410381233"
                className="flex items-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl p-3 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest">Call Now</p>
                  <p className="font-bold text-blue-300">01410381233</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

const Dashboard = ({ 
  products, 
  clients, 
  publicOrders,
  expenses, 
  sliderImages,
  offers = [],
  formatCurrency,
  addToCart,
  setActiveTab,
  setSelectedProduct,
  setShowAddProduct,
  onEditProduct,
  isAdmin,
  isDarkMode,
  productCategories,
  deleteAnyOrder
}: { 
  products: Product[], 
  clients: Client[], 
  publicOrders: PublicOrder[],
  expenses: Expense[], 
  sliderImages: string[],
  offers?: Offer[],
  formatCurrency: (v: number) => string,
  addToCart: (p: Product) => void,
  setActiveTab: (t: string) => void,
  setSelectedProduct: (p: Product) => void,
  setShowAddProduct: (v: boolean) => void,
  onEditProduct: (p: Product) => void,
  isAdmin: boolean,
  isDarkMode: boolean,
  productCategories: CategoryData[],
  deleteAnyOrder?: (order: any) => Promise<void>
}) => {
  if (!isAdmin) {
    return (
      <PublicStore 
        products={products} 
        sliderImages={sliderImages}
        offers={offers}
        formatCurrency={formatCurrency} 
        addToCart={addToCart} 
        setActiveTab={setActiveTab}
        setSelectedProduct={setSelectedProduct}
        productCategories={productCategories}
      />
    );
  }

  return (
    <AdminDashboard 
      products={products} 
      clients={clients} 
      publicOrders={publicOrders}
      formatCurrency={formatCurrency} 
      setActiveTab={setActiveTab} 
      expenses={expenses}
      isAdmin={isAdmin}
      isDarkMode={isDarkMode}
      setShowAddProduct={setShowAddProduct}
      onEditProduct={onEditProduct}
      deleteAnyOrder={deleteAnyOrder}
    />
  );
};


const ClientList = ({ 
  clients, 
  formatCurrency, 
  setShowClientProfile, 
  withPassword, 
  setShowAddClient 
}: { 
  clients: Client[], 
  formatCurrency: (v: number) => string, 
  setShowClientProfile: (c: Client) => void, 
  withPassword: (fn: () => void, adminOnly: boolean) => void, 
  setShowAddClient: (v: boolean) => void 
}) => {
  const [search, setSearch] = useState('');
  const filteredClients = clients.filter(c => 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) || 
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-4 pb-20">
      <UiverseSearch 
        value={search} 
        onChange={setSearch} 
        placeholder="Search clients..." 
      />

      <div className="space-y-3">
        {filteredClients.map((client, idx) => (
          <motion.div 
            key={client.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setShowClientProfile(client)}
            className="glass-card p-4 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">
                {client.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm">{client.name}</h4>
                <p className="text-xs text-gray-500">{client.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn("text-xs font-bold px-2 py-1 rounded-full inline-block", 
                client.status === ClientStatus.ACTIVE ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {client.status.toUpperCase()}
              </p>
              <p className="text-xs font-bold mt-1 text-gray-700 dark:text-gray-300">Due: {formatCurrency(client.due)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => withPassword(() => setShowAddClient(true), true)}
        aria-label="Add new client"
        className="fixed bottom-24 right-6 w-14 h-14 glow-effect-container text-white rounded-full shadow-2xl flex items-center justify-center btn-ripple z-40"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
};

const ManageServices = ({ withPassword }: { withPassword: (action: () => void) => void }) => {
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', icon: 'bx-code-alt', imageUrl: '' });

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.description) return;

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), formData);
      } else {
        await addDoc(collection(db, 'services'), formData);
      }
      playSound('success');
      setShowModal(false);
      setEditingService(null);
      setFormData({ title: '', description: '', icon: 'bx-code-alt', imageUrl: '' });
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = (id: string) => {
    withPassword(async () => {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <button 
          onClick={() => { 
            playSound('click'); 
            setEditingService(null); 
            setFormData({ title: '', description: '', icon: 'bx-code-alt', imageUrl: '' }); 
            setShowModal(true); 
          }}
          className="px-4 py-2 glow-effect-container text-white rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-all"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="p-4 border dark:border-slate-800 rounded-2xl relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#dc143c] overflow-hidden">
                {service.imageUrl ? <img src={service.imageUrl} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" /> : <i className={`bx ${service.icon} text-2xl`}></i>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingService(service); setFormData({ title: service.title, description: service.description, icon: service.icon || 'bx-code-alt', imageUrl: service.imageUrl || '' }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{service.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glow-effect-container text-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Title</label>
                  <input 
                    type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-[#dc143c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Description</label>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-[#dc143c] h-24"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Icon Class (from BoxIcons)</label>
                  <input 
                    type="text" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="bx-code-alt"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-[#dc143c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Image URL (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..."
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-[#dc143c]"
                    />
                    <label className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                      <CloudUpload size={20} />
                      <input 
                        type="file" accept="image/*" className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                {formData.imageUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border dark:border-slate-800">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-3 glow-effect-container text-white rounded-xl font-bold hover:scale-[1.02] transition-all">Save Service</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StaffTrackingMap = ({ staff }: { staff: Staff[] }) => {
  const center: [number, number] = [23.8103, 90.4125]; // Default and fallback to Dhaka
  
  // Custom component to handle bounds and centering
  const ChangeView = ({ staff }: { staff: Staff[] }) => {
    const map = useMap();
    useEffect(() => {
      const activeStaff = staff.filter(s => s.lastKnownLocation);
      if (activeStaff.length > 0) {
        const bounds = L.latLngBounds(activeStaff.map(s => [s.lastKnownLocation!.lat, s.lastKnownLocation!.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }, [staff, map]);
    return null;
  };

  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl relative z-0 border-4 border-white dark:border-slate-800">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <ChangeView staff={staff} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {staff.filter(s => s.lastKnownLocation).map(member => (
          <Marker 
            key={member.id} 
            position={[member.lastKnownLocation!.lat, member.lastKnownLocation!.lng]}
          >
            <LeafletTooltip permanent direction="top" offset={[0, -10]} opacity={1}>
              <div className="font-bold text-[10px] text-[#dc143c] bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#dc143c]/20 whitespace-nowrap">
                {member.name}
              </div>
            </LeafletTooltip>
            <Popup>
              <div className="p-1 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                  <div className="w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-inner">
                    {member.image ? (
                      <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm m-0 truncate">{member.name}</h3>
                    <p className="text-[10px] text-[#dc143c] m-0 font-medium">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Clock size={10} className="text-[#dc143c]" />
                    {new Date(member.lastKnownLocation!.updatedAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, day: 'numeric', month: 'short' })}
                  </div>
                  {member.lastKnownLocation?.address ? (
                    <div className="flex items-start gap-2 text-[10px] text-gray-700 bg-slate-50 p-2 rounded-lg">
                      <MapPin size={12} className="text-[#dc143c] shrink-0 mt-0.5" />
                      <span className="leading-tight">{member.lastKnownLocation.address}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 italic">
                      <Navigation size={10} /> Lat: {member.lastKnownLocation!.lat.toFixed(4)}, Lng: {member.lastKnownLocation!.lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const StaffFlipCard = ({ 
  member, 
  onEdit, 
  onDelete, 
  onPaySalary,
  renderCalendar
}: { 
  member: Staff, 
  onEdit: (m: Staff) => void, 
  onDelete: (id: string) => void,
  onPaySalary: (m: Staff) => void,
  renderCalendar: (attendance?: any) => React.ReactNode
}) => {
  return (
    <div className="uiverse-staff-container mx-auto">
      <div className="uiverse-staff-card">
        <div className="uiverse-staff-front bg-slate-900">
          <div className="uiverse-staff-card-top">
            <p className="uiverse-staff-card-top-para">Staff</p>
          </div>
          
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[#dc143c]">
                <User size={48} />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="uiverse-staff-heading truncate max-w-[200px]">{member.name}</p>
            <p className="text-[#dc143c] font-black text-[10px] uppercase tracking-[0.2em] mt-1">{member.role}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              member.isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
            )} />
            <p className="uiverse-staff-follow">
              {member.isActive ? 'Active' : 'Inactive'} member
            </p>
          </div>
        </div>

        <div className="uiverse-staff-back bg-slate-950">
          <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Management</p>
          
          <div className="flex flex-col gap-3 w-full px-6">
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                className="flex-1 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
              >
                <Edit2 size={12} /> Edit
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
                className="flex-1 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all text-[10px] font-bold"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); onPaySalary(member); }}
              className="w-full py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-bold"
            >
              <DollarSign size={12} /> Pay Salary
            </button>
          </div>

          <div className="mt-4 scale-75 origin-top">
            {renderCalendar(member.attendance)}
          </div>

          <div className="uiverse-staff-icons mt-auto pb-4">
            <Smartphone size={16} className="text-white/40" />
            <Send size={16} className="text-white/40" />
            <ShieldCheck size={16} className="text-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageStaff = ({ withPassword, addNotification }: { withPassword: (action: () => void) => void, addNotification: (text: string) => void }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Technician', isActive: true, image: '' });
  const [activeView, setActiveView] = useState<'list' | 'map'>('map');

  const [showSalaryModal, setShowSalaryModal] = useState<Staff | null>(null);
  const [salaryFormData, setSalaryFormData] = useState({ baseAmount: '', bonusAmount: '', notes: '' });

  const handlePaySalary = async () => {
    if (!showSalaryModal) return;
    try {
      const base = Number(salaryFormData.baseAmount) || 0;
      const bonus = Number(salaryFormData.bonusAmount) || 0;
      if (base <= 0) {
        addNotification("Please enter a valid base amount.");
        return;
      }
      const total = base + bonus;
      const now = new Date();
      const monthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      const newSalary: SalaryRecord = {
        id: monthId,
        monthName,
        baseAmount: base,
        bonusAmount: bonus,
        totalPaid: total,
        status: 'Paid',
        paidAt: now.toISOString()
      };
      
      const currentSalaries = showSalaryModal.salaries || [];
      const updatedSalaries = [
        ...currentSalaries.filter(s => s.id !== monthId),
        newSalary
      ];

      await updateDoc(doc(db, 'staff', showSalaryModal.id), {
        salaries: updatedSalaries
      });
      
      addNotification(`Salary of BDT ${total} paid to ${showSalaryModal.name}!`);
      setShowSalaryModal(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `staff/${showSalaryModal.id}`);
    }
  };

  const isOnline = (updatedAt: string | undefined) => {
    if (!updatedAt) return false;
    const diff = Date.now() - new Date(updatedAt).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (member: Staff) => {
    if (!member.lastKnownLocation) return "bg-gray-300";
    return isOnline(member.lastKnownLocation.updatedAt) ? "bg-green-500 animate-pulse" : "bg-orange-400";
  };

  const getStatusLabel = (member: Staff) => {
    if (!member.lastKnownLocation) return "No Signal";
    return isOnline(member.lastKnownLocation.updatedAt) ? "Live Now" : `Last seen ${new Date(member.lastKnownLocation.updatedAt).toLocaleTimeString()}`;
  };

  const renderAttendanceCalendarForAdmin = (att: string[] | Record<string, string> | undefined) => {
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
    const todayStr = today.toISOString().split('T')[0];
    
    let attendanceMap: Record<string, string> = {};
    if (Array.isArray(att)) {
      att.forEach(d => attendanceMap[d] = '✔');
    } else if (att) {
      attendanceMap = att;
    }

    return (
      <div className="mt-4 border-t border-slate-50 dark:border-slate-800 pt-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Attendance (Last 30 Days)</h4>
        <div className="grid grid-cols-7 gap-1">
          {dates.map(dateObj => {
            const dateStr = dateObj.toISOString().split('T')[0];
            const isPresent = !!attendanceMap[dateStr];
            const isToday = dateStr === todayStr;
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            
            return (
              <div key={dateStr} className={`relative flex flex-col items-center justify-center py-1 rounded border ${isPresent ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-600' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-500'}`} title={isPresent ? `Present (${attendanceMap[dateStr]})` : 'Absent'}>
                {isToday && !isPresent && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>}
                <span className="text-[7px] font-bold uppercase opacity-60">{dayName}</span>
                <span className="text-[9px] font-bold mt-0.5">{dateObj.getDate()}</span>
                {isPresent && attendanceMap[dateStr] !== '✔' && (
                  <span className="text-[5px] font-bold mt-0.5 opacity-80 whitespace-nowrap">{attendanceMap[dateStr]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const q = query(collection(db, 'staff'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'staff');
    });
    return () => unsubscribe();
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshData = async () => {
    setIsRefreshing(true);
    playSound('click');
    try {
      const q = query(collection(db, 'staff'));
      const snapshot = await getDocs(q);
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'staff');
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;

    try {
      if (editingStaff) {
        await updateDoc(doc(db, 'staff', editingStaff.id), formData);
      } else {
        await addDoc(collection(db, 'staff'), { ...formData, lastKnownLocation: null });
      }
      setShowModal(false);
      setEditingStaff(null);
      setFormData({ name: '', phone: '', email: '', role: 'Technician', isActive: true, image: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'staff');
    }
  };

  const handleDelete = (id: string) => {
    withPassword(async () => {
      try {
        await deleteDoc(doc(db, 'staff', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'staff');
      }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <Users className="text-[#dc143c]" /> Staff Tracking
          </h2>
          <p className="text-slate-500 text-sm">Monitor staff locations and manage team members via Gmail access</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <UiverseSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search staff..." />
          <div className="flex gap-2">
            <div className="w-64 h-12">
              <GlowingNav 
                activeId={activeView}
                items={[
                  { id: 'map', icon: <MapIcon size={16} />, label: 'Live Map' },
                  { id: 'list', icon: <Users size={16} />, label: 'Staff List' },
                ]}
                onSelect={(id) => setActiveView(id as 'list' | 'map')}
                className="h-full scale-90"
              />
            </div>
            <button 
            onClick={refreshData}
            className="p-2 glow-effect-container text-white rounded-xl hover:opacity-90 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
          </button>
          <button 
            onClick={() => { setEditingStaff(null); setFormData({ name: '', phone: '', email: '', role: 'Technician', isActive: true, image: '' }); setShowModal(true); }}
            className="px-4 py-2 glow-effect-container text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={20} /> Add Staff
          </button>
        </div>
      </div>
    </div>

      {activeView === 'map' ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <StaffTrackingMap staff={filteredStaff} />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStaff.map(member => (
              <div key={member.id} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="relative shrink-0">
                  {member.image ? (
                    <img src={member.image} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" alt={member.name} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#dc143c] font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                    getStatusColor(member)
                  )} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm truncate">{member.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate">
                    {getStatusLabel(member)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 py-6">
          {filteredStaff.map(member => (
            <motion.div 
              key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <StaffFlipCard 
                member={member}
                onEdit={(m) => {
                  setEditingStaff(m);
                  setFormData({ 
                    name: m.name, 
                    phone: m.phone, 
                    email: m.email, 
                    role: m.role, 
                    isActive: m.isActive, 
                    image: m.image || '' 
                  });
                  setShowModal(true);
                }}
                onDelete={handleDelete}
                onPaySalary={(m) => {
                  setShowSalaryModal(m);
                  setSalaryFormData({ baseAmount: '', bonusAmount: '', notes: '' });
                }}
                renderCalendar={renderAttendanceCalendarForAdmin}
              />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glow-effect-container text-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#dc143c]" />
              <h3 className="text-2xl font-bold mb-6">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#dc143c] shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <Users size={24} className="text-slate-400" />
                      </div>
                    )}
                    <label className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex justify-center items-center gap-2">
                      <CloudUpload size={16} className="text-[#dc143c]" />
                      <span className="text-sm font-bold">Upload Photo</span>
                      <input 
                        type="file" accept="image/*" className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#dc143c] transition-all"
                    placeholder="Enter name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest">Phone</label>
                    <input 
                      type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#dc143c] transition-all"
                      placeholder="017..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest">Role</label>
                    <select 
                      value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#dc143c] transition-all"
                    >
                      <option>Technician</option>
                      <option>Support Engineeer</option>
                      <option>Project Manager</option>
                      <option>IT Administrator</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest underline decoration-[#dc143c]">Gmail Address for Access</label>
                  <input 
                    type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#dc143c] transition-all"
                    placeholder="staff-gmail@gmail.com"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 italic font-medium">✨ This staff member must log in with this exact Gmail.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-4 glow-effect-container text-white rounded-2xl font-bold shadow-lg shadow-red-500/30 hover:opacity-90 transition-all">Save Staff</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSalaryModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-emerald-600">
                <DollarSign /> Issue Salary
              </h3>
              <p className="text-sm text-slate-500 mb-6">For: <span className="font-bold text-slate-800 dark:text-slate-200">{showSalaryModal.name}</span></p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest">Base Salary (BDT)</label>
                  <input 
                    type="number" value={salaryFormData.baseAmount} onChange={e => setSalaryFormData({ ...salaryFormData, baseAmount: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                    placeholder="e.g. 15000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-widest">Bonus (BDT)</label>
                  <input 
                    type="number" value={salaryFormData.bonusAmount} onChange={e => setSalaryFormData({ ...salaryFormData, bonusAmount: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                    placeholder="e.g. 2000"
                  />
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800/50">
                  <span>Total Payload:</span>
                  <span className="text-xl inline-flex items-center gap-1.5"><DollarSign size={18} /> {Number(salaryFormData.baseAmount || 0) + Number(salaryFormData.bonusAmount || 0)}</span>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setShowSalaryModal(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button onClick={handlePaySalary} className="flex-1 py-4 glow-effect-container text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-all">Submit Payment</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StaffCheckIn = ({ user, staffUser }: { user: FirebaseUser | null, staffUser: Staff | null }) => {
  const [staffInfo, setStaffInfo] = useState<Staff | null>(staffUser);
  const [tracking, setTracking] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const watchId = useRef<number | null>(null);
  const wakeLock = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.error('Wake Lock failed:', err);
    }
  };

  const handleAttendanceCheckIn = async () => {
    if (!staffInfo) return;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    let currentAttendance: Record<string, string> = {};
    if (Array.isArray(staffInfo.attendance)) {
        staffInfo.attendance.forEach(d => currentAttendance[d] = '✔');
    } else if (staffInfo.attendance) {
        currentAttendance = staffInfo.attendance;
    }

    if (currentAttendance[today]) {
      setError("You have already given attendance today!");
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      const staffRef = doc(db, 'staff', staffInfo.id);
      await updateDoc(staffRef, {
        attendance: { ...currentAttendance, [today]: timeStr }
      });
      setSuccess("Attendance submitted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'staff');
    }
  };

  const renderAttendanceCalendar = () => {
    const dates = [];
    const today = new Date();
    // Start from 29 days ago up to today
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
    
    let attendanceMap: Record<string, string> = {};
    if (Array.isArray(staffInfo?.attendance)) {
      staffInfo.attendance.forEach(d => attendanceMap[d] = '✔');
    } else if (staffInfo?.attendance) {
      attendanceMap = staffInfo.attendance;
    }
    const todayStr = today.toISOString().split('T')[0];

    return (
      <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
        <h3 className="text-sm font-bold mb-3">Attendance History (Last 30 Days)</h3>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((dateObj, i) => {
            const dateStr = dateObj.toISOString().split('T')[0];
            const isPresent = !!attendanceMap[dateStr];
            const isToday = dateStr === todayStr;
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            
            // Red mark for absent days
            return (
              <div key={dateStr} className={`relative flex flex-col items-center justify-center py-2 rounded-lg border ${isPresent ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                {isToday && !isPresent && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>}
                <span className="text-[8px] text-gray-400 font-bold uppercase">{dayName}</span>
                <span className="text-[10px] font-bold mt-0.5">{dateObj.getDate()}</span>
                {isPresent && attendanceMap[dateStr] !== '✔' && (
                  <span className="text-[8px] font-bold text-green-600 mt-0.5 tracking-tighter">{attendanceMap[dateStr]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  useEffect(() => {
    if (staffUser) {
      setStaffInfo(staffUser);
      startTrackingService();
    }
    
    if (!user?.email) return;
    const q = query(collection(db, 'staff'), where('email', '==', user.email));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Staff;
        setStaffInfo(data);
        if (data.lastKnownLocation) {
          setLastCheckIn(data.lastKnownLocation.updatedAt);
        }
      }
      setLoading(false);
    });

    return () => {
       unsubscribe();
       if (watchId.current !== null) {
         navigator.geolocation.clearWatch(watchId.current);
       }
       if (trackingInterval.current) {
         clearInterval(trackingInterval.current);
       }
       if (wakeLock.current) {
         wakeLock.current.release().catch((e: any) => console.error(e));
         wakeLock.current = null;
       }
    };
  }, [user?.email, staffUser]);

  const lastAddressUpdate = useRef<{lat: number, lng: number, time: number} | null>(null);
  const lastAddress = useRef<string>("Address retrieving...");

  const handleLocationUpdate = async (position: GeolocationPosition) => {
    if (!staffInfo) return;
    
    const { latitude, longitude } = position.coords;
    const now = new Date().toISOString();
    const nowTimestamp = Date.now();
    
    try {
      // Significant throttling: Only update DB if moved > 50 meters OR > 5 minutes since last update
      const lastUpdate = lastAddressUpdate.current;
      const timeElapsed = lastUpdate ? nowTimestamp - lastUpdate.time : Infinity;
      
      // Simple distance approx (0.0005 is roughly 50-60 meters)
      const distLat = lastUpdate ? Math.abs(latitude - lastUpdate.lat) : Infinity;
      const distLng = lastUpdate ? Math.abs(longitude - lastUpdate.lng) : Infinity;
      
      if (timeElapsed < 300000 && distLat < 0.0005 && distLng < 0.0005) {
        return; // Skip early to save quota
      }

      // Throttle reverse geocoding even more: Once every 10 minutes OR if moved > ~200 meters
      const shouldUpdateAddress = !lastUpdate || 
        (nowTimestamp - lastUpdate.time > 600000) ||
        (distLat > 0.002) ||
        (distLng > 0.002);

      if (shouldUpdateAddress) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          lastAddress.current = data.display_name || "Location found, address unknown";
        } catch (e) {
          lastAddress.current = lastAddress.current || `Coord: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
      }
      
      await updateDoc(doc(db, 'staff', staffInfo.id), {
        lastKnownLocation: {
          lat: latitude,
          lng: longitude,
          updatedAt: now,
          address: lastAddress.current
        }
      });

      // Save history ONLY every 5 minutes to keep quota low
      const lastHistoryTime = parseInt(localStorage.getItem(`last_history_${staffInfo.id}`) || '0');
      if (nowTimestamp - lastHistoryTime > 300000) {
        await addDoc(collection(db, 'staff', staffInfo.id, 'history'), {
          lat: latitude,
          lng: longitude,
          timestamp: now,
          address: lastAddress.current
        });
        localStorage.setItem(`last_history_${staffInfo.id}`, nowTimestamp.toString());
      }

      // Update our throttle ref
      lastAddressUpdate.current = { lat: latitude, lng: longitude, time: nowTimestamp };
      setLastCheckIn(now);
      setError(null);
    } catch (err) {
      console.error("Tracking update error:", err);
    }
  };

  const trackingInterval = useRef<any>(null);

  const startTrackingService = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);
    requestWakeLock();
    
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
    }

    // Regular frequency position watching
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        handleLocationUpdate(position);
        setLoading(false);
        setTracking(true);
      },
      (err) => {
        let msg = "Location unavailable. Please check permissions.";
        if (err.code === 1) msg = "Access denied. Please enable 'Always' permission.";
        setError(msg);
        setTracking(false);
        setLoading(false);
        // Automatic retry
        setTimeout(startTrackingService, 30000); // Back off to 30s
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 } // Allow cached positions
    );

    // Heartbeat update every 5 minutes (instead of 1m) to preserve quota
    trackingInterval.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => handleLocationUpdate(pos),
            () => {},
            { enableHighAccuracy: true, maximumAge: 60000 }
        );
    }, 300000);
  };

  if (loading && !tracking) return (
    <div className="flex items-center justify-center p-20 text-[#dc143c] flex-col gap-4">
      <RefreshCw className="animate-spin" size={48} />
      <p className="font-black uppercase tracking-widest text-xs">Initializing Satellite Protocol...</p>
    </div>
  );

  if (!staffInfo) return (
    <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-3xl border border-orange-100 dark:border-orange-800 text-center">
      <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
      <h2 className="text-xl font-bold mb-2">Staff Only Page</h2>
      <p className="text-slate-500 text-sm">Your email ({user?.email}) is not registered in our staff directory. Please contact your IT administrator.</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-[#dc143c]" />
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#dc143c] font-black text-2xl overflow-hidden shadow-md">
            {staffInfo.image ? (
              <img src={staffInfo.image} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              staffInfo.name.charAt(0)
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{staffInfo.name}</h2>
            <p className="text-sm text-gray-500 font-medium">{staffInfo.role}</p>
          </div>
        </div>

        {/* The tracking UI elements are hidden but the system works in the background via useEffect */}
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Welcome to Staff Portal</h3>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Session ID: {user?.uid.slice(0, 8)}</p>
          </div>
          
          {staffInfo.salaries && staffInfo.salaries.length > 0 && (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
               <h4 className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-3"><DollarSign size={16} /> Salary History</h4>
               <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                 {[...staffInfo.salaries].sort((a, b) => b.id.localeCompare(a.id)).map(salary => (
                   <div key={salary.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
                     <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                       <span className="font-bold text-slate-700 dark:text-slate-200">{salary.monthName}</span>
                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{salary.status}</span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                       <span>Base Salary:</span>
                       <span className="font-medium text-slate-600 dark:text-slate-300">BDT {salary.baseAmount}</span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                       <span>Bonus:</span>
                       <span className="font-medium text-slate-600 dark:text-slate-300">BDT {salary.bonusAmount}</span>
                     </div>
                     <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                       <span>Total Paid:</span>
                       <span className="text-emerald-600">BDT {salary.totalPaid}</span>
                     </div>
                     {salary.paidAt && (
                       <p className="text-[9px] text-slate-400 mt-2 text-right">
                         Paid on: {new Date(salary.paidAt).toLocaleDateString()} {new Date(salary.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          )}
          
          <button 
            onClick={handleAttendanceCheckIn}
            className="w-full bg-[#dc143c] hover:bg-[#b01030] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              Array.isArray(staffInfo.attendance) 
                ? staffInfo.attendance.includes(new Date().toISOString().split('T')[0]) 
                : !!staffInfo.attendance?.[new Date().toISOString().split('T')[0]]
            }
          >
            <CheckCircle size={20} />
            {
              (Array.isArray(staffInfo.attendance) 
                ? staffInfo.attendance.includes(new Date().toISOString().split('T')[0]) 
                : !!staffInfo.attendance?.[new Date().toISOString().split('T')[0]])
              ? 'Attendance Given Today' : 'Give Daily Attendance (হাজিরা দিন)'
            }
          </button>

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-xs font-bold text-center">
              {success}
            </div>
          )}

          {error && error !== "Location unavailable. Please check permissions." && error !== "Access denied. Please enable 'Always' permission." && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          {renderAttendanceCalendar()}
          
          {(error === "Location unavailable. Please check permissions." || error === "Access denied. Please enable 'Always' permission.") && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-[10px] font-bold text-center uppercase tracking-tighter mt-4">
              System Syncing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SupportPage = () => {

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support</h2>
          <p className="text-xs text-gray-500 font-medium">Get help and open tickets</p>
        </div>
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
          <Headphones size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 space-y-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
            <Bot size={24} />
          </div>
          <h3 className="font-bold">AI Assistant</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our AI assistant can help you with common internet issues, router settings, and billing questions instantly.
          </p>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('changeTab', { detail: 'ai-assistant' }));
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm"
          >
            Chat with AI
          </button>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold">Live Support</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Reach out to our team directly via WhatsApp or Phone Call for immediate assistance.
          </p>
          <div className="flex flex-col gap-2">
            <a 
              href="https://wa.me/8801817681233"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare size={16} /> WhatsApp Us
            </a>
            <a 
              href="tel:01410381233"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone size={16} /> Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const WarrantyPage = ({ clients }: { clients: Client[] }) => {
  const clientsWithWarranty = clients.filter(c => c.warrantyExpiry);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warranty</h2>
          <p className="text-xs text-gray-500 font-medium">Service & Support tracking</p>
        </div>
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
          <ShieldCheck size={20} />
        </div>
      </div>

      {clientsWithWarranty.length === 0 ? (
        <div className="glass-card p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-lg font-bold">No Active Claims</h3>
          <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
            All your products are currently within their service periods.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientsWithWarranty.map(client => (
            <div key={client.id} className="glass-card p-4 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                  {client.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{client.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <ShieldCheck size={10} /> Expires: {client.warrantyExpiry}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black rounded-full uppercase">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddProductModal = ({ 
  onClose, 
  onAdd,
  productCategories,
  setProductCategories,
  addNotification
}: { 
  onClose: () => void, 
  onAdd: (p: any) => void,
  productCategories: CategoryData[],
  setProductCategories: (categories: CategoryData[]) => void,
  addNotification: (msg: string) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: productCategories[0]?.name || 'indoor',
    stock: '',
    image: '',
    videoUrl: '',
    description: '',
    seoKeywords: ''
  });
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([
    { key: 'Brand', value: '' },
    { key: 'Model', value: '' }
  ]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIMENSION = 512;
          
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setFormData({...formData, image: canvas.toDataURL(file.type || 'image/jpeg', 0.7)});
          } else {
            setFormData({...formData, image: reader.result as string});
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Video size too large. Max 50MB.");
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 180) {
          alert("Video duration must be less than 3 minutes.");
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({...formData, videoUrl: reader.result as string});
        };
        reader.readAsDataURL(file);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const nameWordCount = formData.name.trim() === "" ? 0 : formData.name.trim().split(/\s+/).length;
  const descriptionCharCount = formData.description.length;
  const totalSpecsLength = specs.reduce((acc, item) => acc + item.key.length + item.value.length, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[160] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-[600px] max-h-[92vh] overflow-y-auto glow-effect-container text-white rounded-[32px] p-6 md:p-8 shadow-2xl space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold">নতুন প্রোডাক্ট যোগ করুন (Add Product)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Fill out product specs, SEO keywords, and description</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image & Video Inputs */}
          <div className="flex justify-center gap-8 py-2">
            <div className="flex flex-col items-center gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image</label>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-600" size={28} />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video (Max 3m)</label>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                {formData.videoUrl ? (
                  <video src={formData.videoUrl} className="w-full h-full object-cover" />
                ) : (
                  <Video className="text-slate-600" size={28} />
                )}
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {formData.videoUrl && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({...formData, videoUrl: ''});
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product Title / Input with Counter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name / Title (নাম/টাইটেল)</label>
              <span className="text-[10px] text-gray-500 font-mono font-bold">
                {nameWordCount} শব্দ (Word count)
              </span>
            </div>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none text-white placeholder-slate-600 transition"
              placeholder="যেমন: Dahua 2MP Full HD CCTV Camera IP Dome Style (Supports 100+ words easily)"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (৳)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white placeholder-slate-600 transition"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white placeholder-slate-600 transition"
                placeholder="0"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category (ক্যাটাগরি)</label>
            {showNewCategoryInput ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white"
                  placeholder="New Category Name"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => {
                    const existing = productCategories.find(c => c.name.toLowerCase() === newCategory.trim().toLowerCase());
                    if (newCategory.trim() && !existing) {
                      const newCatObj = { id: Date.now().toString(), name: newCategory.trim() };
                      setProductCategories([...productCategories, newCatObj]);
                      setFormData({...formData, category: newCategory.trim()});
                    } else if (existing) {
                      setFormData({...formData, category: existing.name});
                    }
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition text-xs uppercase tracking-wider"
                >
                  Add
                </button>
                <button 
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-2xl font-bold transition text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm text-white"
                value={formData.category}
                onChange={e => {
                  if (e.target.value === 'add_new') {
                    setShowNewCategoryInput(true);
                  } else {
                    setFormData({...formData, category: e.target.value});
                  }
                }}
              >
                {productCategories.map(cat => (
                  <option key={cat.id} value={cat.name} className="bg-slate-900 text-white">{cat.name}</option>
                ))}
                <option value="add_new" className="bg-slate-900 text-blue-400 font-bold">+ Add New Category</option>
              </select>
            )}
          </div>
          
          {/* Description (Supports 5000 characters) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description (ডেসক্রিপশন)</label>
              <span className="text-[10px] text-gray-500 font-mono font-bold">
                {descriptionCharCount} / 5000 বর্ণ (Char count)
              </span>
            </div>
            <textarea 
              maxLength={5000}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm text-white placeholder-slate-600 transition"
              placeholder="Product details and explanation (Supports up to 5000 text capacity beautifully)"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Dynamic Specifications Key-Value Builder */}
          <div className="space-y-2 select-none border-t border-slate-800/80 pt-4">
            <div className="flex justify-between items-center ml-1">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Specifications (প্রোডাক্ট স্পেসিফিকেশন)
                </label>
                <p className="text-[9px] text-gray-500">Supports at least 2000 characters total</p>
              </div>
              <button 
                type="button"
                onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                className="text-xs text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-xl transition-all border border-blue-500/10"
              >
                <Plus size={14} /> আইটেম যোগ করুন (Add Item)
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {specs.length === 0 ? (
                <p className="text-xs text-gray-650 italic pl-1">No specifications added yet.</p>
              ) : (
                specs.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                    <input 
                      type="text"
                      className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-white placeholder-slate-650"
                      placeholder="আইটেমের নাম (যেমন: Sensor)"
                      value={item.key}
                      onChange={e => {
                        const updated = [...specs];
                        updated[idx].key = e.target.value;
                        setSpecs(updated);
                      }}
                    />
                    <span className="text-gray-500 text-xs font-bold">:</span>
                    <textarea 
                      rows={1}
                      className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-white placeholder-slate-650 resize-none"
                      placeholder="আইটেমের বিস্তারিত (যেমন: 1/2.8 CMOS)"
                      value={item.value}
                      onChange={e => {
                        const updated = [...specs];
                        updated[idx].value = e.target.value;
                        setSpecs(updated);
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-gray-500 px-1 pt-1 font-mono">
              <span>মোট স্পেক বর্ণ (Specifications capacity)</span>
              <span>
                চলতি মোট: <strong className="text-blue-500">{totalSpecsLength}</strong>
              </span>
            </div>
          </div>

          {/* SEO Keywords Input */}
          <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search SEO Keywords (সার্চ এসইও কি-ওয়ার্ড)</label>
              <span className="text-[9px] text-gray-500">Comma separated, helps instant search match</span>
            </div>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white placeholder-slate-600 transition"
              placeholder="যেমন: dahua, ip camera, dome, waterproof"
              value={formData.seoKeywords}
              onChange={e => setFormData({...formData, seoKeywords: e.target.value})}
            />
          </div>
          
          {/* Action Submission */}
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!formData.name.trim()) {
                alert("Product name is required");
                return;
              }
              onAdd({
                ...formData,
                price: Number(formData.price) || 0,
                stock: Number(formData.stock) || 0,
                specifications: specs
              });
              addNotification("Product successfully created!");
            }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-550 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg mt-6"
          >
            Create Product
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EditProductModal = ({ 
  product,
  onClose, 
  onSave,
  productCategories,
  setProductCategories,
  addNotification
}: { 
  product: Product,
  onClose: () => void, 
  onSave: (p: Product) => void,
  productCategories: CategoryData[],
  setProductCategories: (categories: CategoryData[]) => void,
  addNotification: (msg: string) => void
}) => {
  const [formData, setFormData] = useState({
    ...product,
    price: product.price.toString(),
    stock: product.stock.toString(),
    description: product.description || '',
    seoKeywords: product.seoKeywords || ''
  });
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>(() => {
    return product.specifications || [];
  });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIMENSION = 512;
          
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setFormData({...formData, image: canvas.toDataURL(file.type || 'image/jpeg', 0.7)});
          } else {
            setFormData({...formData, image: reader.result as string});
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Video size too large. Max 50MB.");
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 180) {
          alert("Video duration must be less than 3 minutes.");
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({...formData, videoUrl: reader.result as string});
        };
        reader.readAsDataURL(file);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const nameWordCount = formData.name.trim() === "" ? 0 : formData.name.trim().split(/\s+/).length;
  const descriptionCharCount = formData.description.length;
  const totalSpecsLength = specs.reduce((acc, item) => acc + item.key.length + item.value.length, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[160] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-[600px] max-h-[92vh] overflow-y-auto glow-effect-container text-white rounded-[32px] p-6 md:p-8 shadow-2xl space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold">প্রোডাক্ট এডিট করুন (Edit Product)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Modify specifications, word counts, and search keywords</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-8 py-2">
            <div className="flex flex-col items-center gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image</label>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-600" size={28} />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video (Max 3m)</label>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                {formData.videoUrl ? (
                  <video src={formData.videoUrl} className="w-full h-full object-cover" />
                ) : (
                  <Video className="text-slate-600" size={28} />
                )}
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {formData.videoUrl && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({...formData, videoUrl: ''});
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
              <span className="text-[10px] text-gray-500 font-mono font-bold">
                {nameWordCount} শব্দ (Word count)
              </span>
            </div>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none text-white placeholder-slate-600 transition"
              placeholder="e.g. 4K Dome Camera"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (৳)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white transition"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white transition"
                placeholder="0"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
            {showNewCategoryInput ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white"
                  placeholder="New Category Name"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => {
                    const existing = productCategories.find(c => c.name.toLowerCase() === newCategory.trim().toLowerCase());
                    if (newCategory.trim() && !existing) {
                      const newCatObj = { id: Date.now().toString(), name: newCategory.trim() };
                      setProductCategories([...productCategories, newCatObj]);
                      setFormData({...formData, category: newCategory.trim()});
                    } else if (existing) {
                      setFormData({...formData, category: existing.name});
                    }
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-550 text-white rounded-2xl font-bold transition text-xs uppercase tracking-wider"
                >
                  Add
                </button>
                <button 
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-2xl font-bold transition text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm text-white"
                value={formData.category}
                onChange={e => {
                  if (e.target.value === 'add_new') {
                    setShowNewCategoryInput(true);
                  } else {
                    setFormData({...formData, category: e.target.value});
                  }
                }}
              >
                {productCategories.map(cat => (
                  <option key={cat.id} value={cat.name} className="bg-slate-900 text-white">{cat.name}</option>
                ))}
                <option value="add_new" className="bg-slate-900 text-blue-400 font-bold">+ Add New Category</option>
              </select>
            )}
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <span className="text-[10px] text-gray-500 font-mono font-bold">
                {descriptionCharCount} / 5000 chars
              </span>
            </div>
            <textarea 
              maxLength={5000}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm text-white placeholder-slate-600 transition"
              placeholder="Product features, specifications, etc."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Dynamic Specifications Key-Value Builder */}
          <div className="space-y-2 select-none border-t border-slate-800/80 pt-4">
            <div className="flex justify-between items-center ml-1">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Specifications (প্রোডাক্ট স্পেসিফিকেশন)
                </label>
                <p className="text-[9px] text-gray-500">Supports at least 2000 characters total</p>
              </div>
              <button 
                type="button"
                onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                className="text-xs text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-xl transition-all border border-blue-500/10"
              >
                <Plus size={14} /> আইটেম যোগ করুন (Add Item)
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {specs.length === 0 ? (
                <p className="text-xs text-gray-650 italic pl-1">No specifications added yet.</p>
              ) : (
                specs.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                    <input 
                      type="text"
                      className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-white placeholder-slate-650"
                      placeholder="আইটেমের নাম (যেমন: Sensor)"
                      value={item.key}
                      onChange={e => {
                        const updated = [...specs];
                        updated[idx].key = e.target.value;
                        setSpecs(updated);
                      }}
                    />
                    <span className="text-gray-500 text-xs font-bold">:</span>
                    <textarea 
                      rows={1}
                      className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-white placeholder-slate-650 resize-none"
                      placeholder="আইটেমের বিস্তারিত (যেমন: 1/2.8 CMOS)"
                      value={item.value}
                      onChange={e => {
                        const updated = [...specs];
                        updated[idx].value = e.target.value;
                        setSpecs(updated);
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-gray-500 px-1 pt-1 font-mono">
              <span>মোট স্পেক বর্ণ (Specifications capacity)</span>
              <span>
                চলতি মোট: <strong className="text-blue-500">{totalSpecsLength}</strong>
              </span>
            </div>
          </div>

          {/* SEO Keywords Input */}
          <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search SEO Keywords (সার্চ এসইও কি-ওয়ার্ড)</label>
              <span className="text-[9px] text-gray-500">Comma separated, helps instant search match</span>
            </div>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white placeholder-slate-600 transition"
              placeholder="e.g. dahua, camera, ip"
              value={formData.seoKeywords}
              onChange={e => setFormData({...formData, seoKeywords: e.target.value})}
            />
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!formData.name.trim()) {
                alert("Product name is required");
                return;
              }
              onSave({
                ...formData,
                price: Number(formData.price) || 0,
                stock: Number(formData.stock) || 0,
                specifications: specs
              });
              addNotification("Product successfully updated!");
            }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-550 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg mt-6"
          >
            Update Product
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CalculatorModal = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (n: string) => {
    if (display === '0') setDisplay(n);
    else setDisplay(display + n);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // Use Function constructor instead of eval for better security and to avoid build warnings
      const result = new Function(`return ${equation + display}`)();
      setDisplay(result.toString());
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-[320px] bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold">Calculator</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl mb-4 text-right">
          <p className="text-xs text-gray-400 h-4">{equation}</p>
          <p className="text-2xl font-bold text-white truncate">{display}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9', '/'].map(btn => (
            <button key={btn} onClick={() => isNaN(Number(btn)) ? handleOperator(btn) : handleNumber(btn)} className="h-12 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">{btn}</button>
          ))}
          {['4', '5', '6', '*'].map(btn => (
            <button key={btn} onClick={() => isNaN(Number(btn)) ? handleOperator(btn) : handleNumber(btn)} className="h-12 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">{btn}</button>
          ))}
          {['1', '2', '3', '-'].map(btn => (
            <button key={btn} onClick={() => isNaN(Number(btn)) ? handleOperator(btn) : handleNumber(btn)} className="h-12 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">{btn}</button>
          ))}
          <button onClick={clear} className="h-12 bg-rose-600 text-white rounded-xl font-bold">C</button>
          <button onClick={() => handleNumber('0')} className="h-12 bg-slate-800 text-white rounded-xl font-bold">0</button>
          <button onClick={calculate} className="h-12 bg-blue-600 text-white rounded-xl font-bold">=</button>
          <button onClick={() => handleOperator('+')} className="h-12 bg-slate-800 text-white rounded-xl font-bold">+</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SplashScreen = ({ customLogo, onEnter, onPlay, hasMusic, isLoading }: { customLogo: string | null, onEnter: () => void, onPlay: () => void, hasMusic: boolean, isLoading: boolean }) => {
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(true);

  const startIntro = () => {
    // Component now starts automatically
  };

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onEnter, 100);
          return 100;
        }
        if (prev >= 95 && isLoading) {
          return 95;
        }
        return prev + Math.random() * 40;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [started, onEnter, isLoading]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 splash-bg z-[200] flex flex-col items-center justify-center overflow-hidden bg-slate-950 transition-colors duration-500"
    >
      {/* Premium Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black/40 backdrop-blur-sm">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Glow behind logo */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute w-64 h-64 bg-blue-500/30 blur-[60px] rounded-full"
        />

        {/* Logo Container */}
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-36 h-36 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] mb-10 overflow-hidden border border-white/20 relative z-20 backdrop-blur-xl"
        >
          {customLogo ? (
            <img src={customLogo} alt="Company Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <ShieldCheck size={70} className="text-white" />
          )}
        </motion.div>

        {/* Text Content */}
        <div className="text-center relative z-20 px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black text-white mb-2 tracking-tighter"
          >
            IT DEPARTMENT
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.6 }}
            className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-12"
          >
            Your Trusted Technology Partner
          </motion.p>
          
          <div className="h-16 flex flex-col items-center justify-center relative w-72 mx-auto">
            <div className="w-full flex justify-center">
              <div className="w-72 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 via-emerald-400 to-green-600"
                />
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
                />
              </div>
            </div>
            
            <AnimatePresence>
              {started && (
                <motion.p 
                  key="init-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest absolute bottom-0 translate-y-full"
                >
                  {progress < 100 ? 'System Initializing...' : 'Ready to Launch'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 text-[10px] text-white font-bold tracking-[0.2em] uppercase"
      >
        Enterprise Edition v2.0
      </motion.div>
    </motion.div>
  );
};

const TaskAnimationOverlay = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const start = () => setIsActive(true);
    const stop = () => setIsActive(false);
    window.addEventListener('start-task-animation', start);
    window.addEventListener('stop-task-animation', stop);
    return () => {
      window.removeEventListener('start-task-animation', start);
      window.removeEventListener('stop-task-animation', stop);
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex flex-col justify-center items-center">
      <div className="p-16 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-[40px] shadow-2xl flex flex-col items-center transform scale-90 sm:scale-100">
        <div className="typewriter transform scale-[1.5] mb-12">
            <div className="slide"><i></i></div>
            <div className="paper"></div>
            <div className="keyboard"></div>
        </div>
        <p className="font-black text-xl text-blue-600 dark:text-blue-400 tracking-widest uppercase animate-pulse text-center">Processing...</p>
      </div>
    </div>
  );
};

const TopHeader = ({ 
  user, 
  isAdmin, 
  cartCount, 
  onShowCart, 
  onLogout,
  onShowLogin,
  activeTab,
  setActiveTab,
  customLogo
}: { 
  user: any, 
  isAdmin: boolean, 
  cartCount: number, 
  onShowCart: () => void, 
  onLogout: () => void,
  onShowLogin: () => void,
  activeTab: string,
  setActiveTab: (t: string) => void,
  customLogo: string | null
}) => {
  return (
    <div className="w-full flex flex-col z-[60] sticky top-0 shadow-sm select-none">
      <header className={cn(
        "w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-all duration-300"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setActiveTab('shop-view');
              }}
            >
              <div className="w-12 h-12 bg-[#111111] dark:bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-all overflow-hidden border border-white/10 shrink-0">
                 {customLogo ? (
                   <img src={customLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                   <ShieldCheck size={28} className="text-white" />
                 )}
              </div>
              <div className="block">
                <h1 className="text-base sm:text-lg font-black tracking-tighter leading-none dark:text-white uppercase text-slate-900">IT Department</h1>
                <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Technology Partner</p>
              </div>
            </div>

            {/* Custom Premium Horizontal Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => setActiveTab('shop-view')}
                className={cn(
                  "text-xs font-black uppercase tracking-widest transition-all hover:text-[#bf0528]",
                  activeTab === 'shop-view' 
                    ? "text-[#bf0528] border-b-2 border-[#bf0528] pb-1" 
                    : "text-slate-700 dark:text-gray-300"
                )}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop-view');
                  const ev = new CustomEvent('set-product-filter', { detail: 'indoor' });
                  window.dispatchEvent(ev);
                }}
                className="text-xs font-black uppercase tracking-widest transition-all text-slate-700 dark:text-gray-300 hover:text-[#bf0528]"
              >
                Cameras
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop-view');
                  const ev = new CustomEvent('set-product-filter', { detail: 'nvr' });
                  window.dispatchEvent(ev);
                }}
                className="text-xs font-black uppercase tracking-widest transition-all text-slate-700 dark:text-gray-300 hover:text-[#bf0528]"
              >
                NVR & DVR
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={cn(
                  "text-xs font-black uppercase tracking-widest transition-all hover:text-[#bf0528]",
                  activeTab === 'offers' 
                    ? "text-[#bf0528] border-b-2 border-[#bf0528] pb-1" 
                    : "text-slate-700 dark:text-gray-300"
                )}
              >
                Special Offers
              </button>
              <button
                onClick={() => setActiveTab('my-orders')}
                className={cn(
                  "text-xs font-black uppercase tracking-widest transition-all hover:text-[#bf0528]",
                  activeTab === 'my-orders' 
                    ? "text-[#bf0528] border-b-2 border-[#bf0528] pb-1" 
                    : "text-slate-700 dark:text-gray-300"
                )}
              >
                Track Orders
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex relative group">
                <input 
                  type="text" 
                  placeholder="Premium Search..."
                  className="w-48 xl:w-64 px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#bf0528] rounded-2xl text-xs font-semibold tracking-wide transition-all outline-none"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bf0528] transition-colors" size={14} />
              </div>

              <button 
                onClick={onShowCart}
                className="relative p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm group"
              >
                <ShoppingCart size={20} className="group-hover:text-[#bf0528] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#bf0528] text-white text-[10px] font-black flex items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-950 animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2 pl-2">
                  <button 
                    onClick={() => setActiveTab('me')}
                    className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#bf0528] transition-all p-0.5 bg-gray-100 dark:bg-slate-800 shrink-0"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-[14px]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-blue-600 font-black">
                        {user.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="hidden xl:block max-w-[100px]">
                    <p className="text-xs font-black dark:text-white truncate leading-none mb-1">{user.displayName || 'Guest User'}</p>
                    <button onClick={onLogout} className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors block">LOGOUT</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={onShowLogin}
                  className="px-6 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  SIGN IN
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

const CartDrawer = ({ 
  show, 
  onClose, 
  cart, 
  user,
  clients,
  updateQuantity, 
  removeItem, 
  onPlaceOrder,
  formatCurrency
}: { 
  show: boolean, 
  onClose: () => void, 
  cart: CartItem[], 
  user: FirebaseUser | null,
  clients: Client[],
  updateQuantity: (id: any, d: number) => void, 
  removeItem: (id: any) => void,
  onPlaceOrder: (details: {name: string, phone: string, address: string}) => void,
  formatCurrency: (v: number) => string
}) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Auto-fill if user is logged in
  useEffect(() => {
    if (user && show) {
      setCustomerName(user.displayName || '');
      setCustomerPhone(user.phoneNumber || '');
      // Try to find client address
      const client = clients.find(c => c.phone === user.phoneNumber || c.email === user.email);
      if (client?.address) setCustomerAddress(client.address);
    }
  }, [user, show, clients]);

  const handleCheckoutRequest = () => {
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Please fill all contact details correctly.");
      return;
    }
    onPlaceOrder({ name: customerName, phone: customerPhone, address: customerAddress });
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white dark:bg-slate-950 shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight dark:text-white">Shopping Cart</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{cart.length} Articles</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 dark:custom-scrollbar space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[40px] flex items-center justify-center text-blue-600">
                    <ShoppingBag size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white">Empty Cart</h3>
                    <p className="text-sm text-gray-500 font-medium mt-2">Looks like you haven't added anything yet.</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    START SHOPPING
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Summary</h3>
                    {cart.map((item, idx) => (
                      <motion.div 
                        key={item.productId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-6 group"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-900 overflow-hidden shrink-0 border border-gray-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col py-1">
                          <div className="flex justify-between items-start mb-auto">
                            <h4 className="font-black text-sm dark:text-white line-clamp-1 pr-4">{item.name}</h4>
                            <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                              <X size={16} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center bg-gray-50 dark:bg-slate-900 rounded-xl p-1 border border-gray-100 dark:border-slate-800">
                              <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 px-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500">
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-[10px] font-black dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 px-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500">
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-xs font-black dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t dark:border-slate-800">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">ডেলিভারি তথ্য (Delivery Information)</h3>
                    <div className="space-y-3">
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">আপনার নাম (Full Name)</label>
                         <input 
                           type="text" 
                           placeholder="যেমন: আল আমিন"
                           value={customerName}
                           onChange={e => setCustomerName(e.target.value)}
                           className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">মোবাইল নাম্বার (Phone)</label>
                         <input 
                           type="tel" 
                           placeholder="যেমন: 017xxxxxxxx"
                           value={customerPhone}
                           onChange={e => setCustomerPhone(e.target.value)}
                           className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">ঠিকানা (Full Address)</label>
                         <textarea 
                           placeholder="আপনার পূর্ণ ঠিকানা লিখুন..."
                           value={customerAddress}
                           onChange={e => setCustomerAddress(e.target.value)}
                           className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold h-24 resize-none focus:ring-2 focus:ring-blue-500/20"
                         />
                       </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Subtotal</span>
                  <span className="font-black dark:text-white">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Shipping</span>
                  <span className="font-black text-emerald-500">FREE</span>
                </div>
                <div className="pt-3 border-t dark:border-slate-800 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Amount</span>
                  <span className="text-3xl font-black dark:text-white leading-none">{formatCurrency(total)}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckoutRequest}
                disabled={cart.length === 0 || !customerName || !customerPhone || !customerAddress}
                className="w-full py-5 bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white rounded-[24px] font-black text-sm tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  PLACE ORDER NOW
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <>
      <div className="lines z-[-1] opacity-20 pointer-events-none fixed inset-0">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
      <ErrorBoundary>
        <AppContent />
        <TaskAnimationOverlay />
      </ErrorBoundary>
    </>
  );
}

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const settingsLoadedOnce = useRef(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'dashboard');

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('cctv_theme_preference');
    return saved !== null ? saved === 'true' : true;
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryMode, setInventoryMode] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('cctv_custom_logo'));
  const [sliderImages, setSliderImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('cctv_slider_images');
    return saved ? JSON.parse(saved) : [];
  });
  const [customIntroMusic, setCustomIntroMusic] = useState<string | null>(() => localStorage.getItem('cctv_custom_intro_music'));
  const [customClickSound, setCustomClickSound] = useState<string | null>(() => localStorage.getItem('cctv_custom_click_sound'));
  const [offersMusic, setOffersMusic] = useState<string | null>(() => localStorage.getItem('cctv_offers_music'));
  const offersAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const adminEmails = [
    'itdepartmentpro33@gmail.com', 
    'djbmremix87@gmail.com',
    'itdepartmentpro33@app.internal',
    'djbmremix87@app.internal'
  ];
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());

  // Removed automatic redirection to shop-view for admins to avoid confusion
  useEffect(() => {
    if (isAuthReady && isAdmin && activeTab === 'dashboard') {
      // Only set to shop-view if they are on dashboard initially
      // but maybe it's better to just let them choose
    }
  }, [isAuthReady, isAdmin]);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cctv_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('cctv_clients');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('cctv_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [publicOrders, setPublicOrders] = useState<PublicOrder[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordCallback, setPasswordCallback] = useState<{ onSuccess: () => void } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('adminPassword') || '1233@';
  });
  const [notifications, setNotifications] = useState<{id: number, text: string, type?: 'info' | 'success' | 'admin-order' | 'error', order?: PublicOrder}[]>([]);
  const [staffUser, setStaffUser] = useState<Staff | null>(null);
  const [clientProfile, setClientProfile] = useState<any | null>(null);
  const [isMobileNavHidden, setIsMobileNavHidden] = useState(false);

  const handleLogout = () => {
    playSound('pop');
    auth.signOut();
    setStaffUser(null);
    setClientProfile(null);
    setActiveTab('dashboard');
  };

  useEffect(() => {
    if (isAuthReady && user) {
      const checkRoles = async () => {
        try {
          // 1. Check if Staff
          const staffQuery = query(collection(db, 'staff'), where('email', '==', user.email));
          const staffSnap = await getDocs(staffQuery);
          if (!staffSnap.empty) {
            const data = { id: staffSnap.docs[0].id, ...staffSnap.docs[0].data() } as Staff;
            setStaffUser(data);
            if (!isAdmin) setActiveTab('staff-tracking');
            
            // Notification for recently paid salary
            const salaries = data.salaries || [];
            if (salaries.length > 0) {
              const latestSalary = [...salaries].sort((a, b) => b.id.localeCompare(a.id))[0];
              const paidAt = new Date(latestSalary.paidAt).getTime();
              if (Date.now() - paidAt < 3 * 24 * 60 * 60 * 1000) {
                setTimeout(() => addNotification(`🎉 Salary Paid: BDT ${latestSalary.totalPaid} for ${latestSalary.monthName}.`), 2000);
              }
            }
            return;
          }

          // 2. Check if Client
          const clientQuery = query(collection(db, 'clients'), where('email', '==', user.email));
          const clientSnap = await getDocs(clientQuery);
          if (!clientSnap.empty) {
            setClientProfile({ id: clientSnap.docs[0].id, ...clientSnap.docs[0].data() });
          }
        } catch (e) {
          console.error("Role detection error:", e);
        }
      };
      checkRoles();
    }
  }, [isAuthReady, user, isAdmin]);

  useEffect(() => {
    if (isAuthReady && isAdmin) {
      const now = new Date();
      const date = now.getDate();
      if (date >= 27 || date <= 5) {
        const q = query(collection(db, 'staff'));
        getDocs(q).then(snapshot => {
          let unpaidStaff = 0;
          const monthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
          snapshot.docs.forEach(doc => {
            const salaries = doc.data().salaries || [];
            if (!salaries.find((s: any) => s.id === monthId)) {
              unpaidStaff++;
            }
          });
          if (unpaidStaff > 0) {
            setTimeout(() => addNotification(`⚠️ Reminder: Salary is pending for ${unpaidStaff} staff member(s)!`), 5000);
          }
        }).catch(() => {});
      }
    }
  }, [isAuthReady, isAdmin]);

  useEffect(() => {
    if (isAuthReady && !isAdmin) {
      if (['categories', 'clients', 'expenses', 'warranty', 'manage-staff'].includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [isAdmin, isAuthReady, activeTab]);

  const lastPublicOrderCount = useRef(0);
  useEffect(() => {
    if (isAdmin && publicOrders.length > lastPublicOrderCount.current && !isInitialLoad) {
      const newOrders = publicOrders.filter(order => order.status === 'pending' || order.status as any === 'new');
      if (newOrders.length > 0) {
        playSound('pop');
        const latestOrder = newOrders[0];
        addNotification(`${latestOrder.customerName} has placed a new order of BDT ${latestOrder.total}`, 'admin-order', latestOrder);
      }
    }
    lastPublicOrderCount.current = publicOrders.length;
  }, [publicOrders, isAdmin, isInitialLoad]);

  const withPassword = (action: () => void, strict = false) => {
    // If strict is false and user is logged in via Firebase, they are the admin
    if (!strict && (isAdmin || isVerified)) {
      action();
      return;
    }
    
    if (strict && !isAdmin) {
      addNotification("Only the owner can perform this action. Please log in.");
      return;
    }

    setShowPasswordModal(true);
    setPasswordCallback({ 
      onSuccess: () => {
        setIsVerified(true);
        action();
      } 
    });
  };

  const lockAdmin = () => {
    setIsVerified(false);
    addNotification("Admin session locked.");
  };
  const [productCategories, setProductCategories] = useState<CategoryData[]>(() => {
    const saved = localStorage.getItem('cctv_product_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if saved items are strings, convert to CategoryData objects
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed.map((name: string) => ({ id: name.toLowerCase().replace(/\s+/g, '_'), name }));
      }
      return parsed;
    }
    return Object.values(Category).map(cat => ({ id: cat, name: cat }));
  });
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('cctv_expense_categories');
    return saved ? JSON.parse(saved) : Object.values(ExpenseCategory);
  });

  const lastSyncedSettings = useRef({
    darkMode: isDarkMode,
    customLogo: customLogo,
    customIntroMusic: customIntroMusic,
    customClickSound: customClickSound,
    offersMusic: offersMusic,
    expenseCategories: JSON.stringify(expenseCategories),
    productCategories: JSON.stringify(productCategories),
    sliderImages: JSON.stringify(sliderImages)
  });
  const isSeeding = useRef(false);

  // Bill Reminder for Clients
  useEffect(() => {
    if (isAuthReady && user && !isAdmin && clients.length > 0) {
      const clientData = clients.find(c => c.phone === user.phoneNumber || c.name === user.displayName);
      if (clientData && clientData.due > 0) {
        setTimeout(() => {
          addNotification(`Reminder: You have a pending bill of ${formatCurrency(clientData.due)}. Please pay to avoid service interruption.`);
        }, 3000);
      }
    }
  }, [isAuthReady, user, isAdmin, clients]);

  useEffect(() => {
    const handleChangeTab = (e: any) => setActiveTab(e.detail);
    window.addEventListener('changeTab', handleChangeTab);
    return () => window.removeEventListener('changeTab', handleChangeTab);
  }, []);

  // Admin Notification for new public orders
  useEffect(() => {
    if (isAdmin && publicOrders.length > 0) {
      const pendingCount = publicOrders.filter(o => o.status === 'pending').length;
      if (pendingCount > 0) {
        addNotification(`You have ${pendingCount} new order(s) waiting for confirmation!`, 'admin-order');
      }
    }
  }, [publicOrders.length, isAdmin]);

  // Global Geolocation Permission Request on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Success - Permission granted or already have it
          console.log("Location access granted.");
        },
        () => {
          // Error/Denied - silent fail as requested, just trigger the prompt
          console.log("Location access denied or unavailable.");
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      setIsInitialLoad(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    // Fetch global data even if not logged in (for public sharing)
    
    // Global Settings
    const userDocRef = doc(db, 'settings', 'global');
    const unsubGlobal = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Update local state and ref to prevent redundant sync back
        if (data.darkMode !== undefined) {
          // Device preference from localStorage always wins for dark mode to prevent reload flash
          lastSyncedSettings.current.darkMode = data.darkMode;
        }
        if (data.customLogo !== undefined) {
          setCustomLogo(data.customLogo);
          lastSyncedSettings.current.customLogo = data.customLogo;
          if (data.customLogo) localStorage.setItem('cctv_custom_logo', data.customLogo);
          else localStorage.removeItem('cctv_custom_logo');
        }
        if (data.sliderImages !== undefined) {
          setSliderImages(data.sliderImages);
          lastSyncedSettings.current.sliderImages = JSON.stringify(data.sliderImages);
          localStorage.setItem('cctv_slider_images', JSON.stringify(data.sliderImages));
        }
        if (data.expenseCategories !== undefined) {
          setExpenseCategories(data.expenseCategories);
          lastSyncedSettings.current.expenseCategories = JSON.stringify(data.expenseCategories);
          localStorage.setItem('cctv_expense_categories', JSON.stringify(data.expenseCategories));
        }
        if (data.productCategories !== undefined) {
          let updatedCats = data.productCategories;
          if (updatedCats.length > 0 && typeof updatedCats[0] === 'string') {
            updatedCats = updatedCats.map((name: string) => ({ id: name.toLowerCase().replace(/\s+/g, '_'), name }));
          }
          setProductCategories(updatedCats);
          lastSyncedSettings.current.productCategories = JSON.stringify(updatedCats);
          localStorage.setItem('cctv_product_categories', JSON.stringify(updatedCats));
        }
        if (data.customIntroMusic !== undefined) {
          setCustomIntroMusic(data.customIntroMusic);
          lastSyncedSettings.current.customIntroMusic = data.customIntroMusic;
          if (data.customIntroMusic) localStorage.setItem('cctv_custom_intro_music', data.customIntroMusic);
          else localStorage.removeItem('cctv_custom_intro_music');
        }
        if (data.customClickSound !== undefined) {
          setCustomClickSound(data.customClickSound);
          lastSyncedSettings.current.customClickSound = data.customClickSound;
          if (data.customClickSound) localStorage.setItem('cctv_custom_click_sound', data.customClickSound);
          else localStorage.removeItem('cctv_custom_click_sound');
        }
        if (data.offersMusic !== undefined) {
          setOffersMusic(data.offersMusic);
          lastSyncedSettings.current.offersMusic = data.offersMusic;
          if (data.offersMusic) localStorage.setItem('cctv_offers_music', data.offersMusic);
          else localStorage.removeItem('cctv_offers_music');
        }
        
        // Seed if not already seeded and user is logged in
        if (!data.seeded && user && !isSeeding.current) {
          seedUserData(user.uid);
        }
        
        // Mark as loaded once we've processed the first snapshot with content
        settingsLoadedOnce.current = true;
        setIsInitialLoad(false);
      } else if (user && !isSeeding.current) {
        // Initialize user doc if it doesn't exist
        isSeeding.current = true;
        setDoc(userDocRef, { 
          // darkMode: isDarkMode, // Removed from global sync to prevent multi-device loops
          customLogo, 
          expenseCategories,
          productCategories,
          seeded: true 
        }, { merge: true }).then(() => {
          seedUserData(user.uid);
          settingsLoadedOnce.current = true;
          setIsInitialLoad(false);
        }).finally(() => {
          isSeeding.current = false;
        });
      } else {
        // Doc doesn't exist and not seeding or no user
        setIsInitialLoad(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `settings/global`);
      setIsInitialLoad(false);
    });

    // Products
    const productsRef = collection(db, 'products');
    const unsubProducts = onSnapshot(query(productsRef, orderBy('name')), (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: data.id || doc.id,
          ...data 
        } as Product;
      });
      setProducts(items);
      localStorage.setItem('cctv_products', JSON.stringify(items));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'products'));

    let unsubClients = () => {};
    let unsubClientsNonAdmin1 = () => {};
    let unsubClientsNonAdmin2 = () => {};

    // Clients
    if (isAdmin) {
      const clientsRef = collection(db, 'clients');
      unsubClients = onSnapshot(query(clientsRef, orderBy('name')), (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.id || doc.id,
            ...data
          } as Client;
        });
        
        setClients(items);
        try {
          localStorage.setItem('cctv_clients', JSON.stringify(items));
        } catch (e) {
          console.warn("localStorage quota exceeded");
        }
      }, (error) => {
        if (error.code === 'permission-denied') {
          console.warn("Clients list access denied - user might not be admin.");
        } else {
          handleFirestoreError(error, OperationType.LIST, `clients`);
        }
      });
    } else if (user) {
      // For non-admins, try to fetch their own client record
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('email', '==', user.email || ''));
      unsubClientsNonAdmin1 = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: data.id || doc.id, ...data } as Client;
        });
        if (items.length > 0) {
          setClients(items);
        } else {
          // Try by name if email fails
          unsubClientsNonAdmin2();
          const q2 = query(clientsRef, where('name', '==', user.displayName || ''));
          unsubClientsNonAdmin2 = onSnapshot(q2, (snap2) => {
            const items2 = snap2.docs.map(doc => {
              const data = doc.data();
              return { id: data.id || doc.id, ...data } as Client;
            });
            if (items2.length > 0) setClients(items2);
          });
        }
      }, (error) => {
        // Silent error for non-admins if they don't have a record yet
        console.log("Non-admin client record fetch error or not found");
      });
    }

    let unsubExpenses = () => {};
    let unsubPublicOrders = () => {};

    // Expenses (Only for admin)
    if (isAdmin) {
      const expensesRef = collection(db, 'expenses');
      unsubExpenses = onSnapshot(query(expensesRef, orderBy('date', 'desc')), (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: data.id || doc.id, ...data } as Expense;
        });
        
        setExpenses(items);
        try {
          localStorage.setItem('cctv_expenses', JSON.stringify(items));
        } catch (e) {
          console.warn("localStorage quota exceeded");
        }
      }, (error) => {
        // If it's a permission error, we might have lost auth state or roles changed
        if (error.code === 'permission-denied') {
          console.warn("Expenses access denied - user might not be admin in rules yet.");
        } else {
          handleFirestoreError(error, OperationType.LIST, `expenses`);
        }
      });
    } else {
      setExpenses([]);
    }

    // Public Orders (Only for admin)
    if (isAdmin) {
      const poRef = collection(db, 'public_orders');
      unsubPublicOrders = onSnapshot(query(poRef, where('status', '==', 'pending')), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PublicOrder));
        setPublicOrders(items);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `public_orders`));
    } else {
      setPublicOrders([]);
    }

    // Offers
    const offersRef = collection(db, 'offers');
    const unsubOffers = onSnapshot(query(offersRef, orderBy('createdAt', 'desc')), (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Offer)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `offers`));

    return () => {
      if (typeof unsubGlobal !== 'undefined') unsubGlobal();
      if (typeof unsubProducts !== 'undefined') unsubProducts();
      unsubClients();
      unsubClientsNonAdmin1();
      unsubClientsNonAdmin2();
      unsubExpenses();
      unsubPublicOrders();
      if (typeof unsubOffers !== 'undefined') unsubOffers();
    };
  }, [isAdmin, user]);

  // Offers Music Playback
  useEffect(() => {
    // Offers music disabled per user request
  }, [activeTab, offersMusic]);

  // Sync Settings to Firestore (Only if changed by admin after load)
  useEffect(() => {
    if (user && isAdmin && !isInitialLoad && settingsLoadedOnce.current) {
      const categoriesJson = JSON.stringify(expenseCategories);
      const productCategoriesJson = JSON.stringify(productCategories);
      const sliderImagesJson = JSON.stringify(sliderImages);
      
      // Only sync if values actually differ from what's in Firestore
      // darkMode removed from global sync to avoid infinite write loops between devices
      if (
        customLogo !== lastSyncedSettings.current.customLogo ||
        customIntroMusic !== lastSyncedSettings.current.customIntroMusic ||
        customClickSound !== lastSyncedSettings.current.customClickSound ||
        offersMusic !== lastSyncedSettings.current.offersMusic ||
        categoriesJson !== lastSyncedSettings.current.expenseCategories ||
        productCategoriesJson !== lastSyncedSettings.current.productCategories ||
        sliderImagesJson !== lastSyncedSettings.current.sliderImages
      ) {
        const userDocRef = doc(db, 'settings', 'global');
        
        // Update ref immediately to prevent multiple triggers
        lastSyncedSettings.current = {
          ...lastSyncedSettings.current,
          customLogo: customLogo,
          customIntroMusic: customIntroMusic,
          customClickSound: customClickSound,
          offersMusic: offersMusic,
          expenseCategories: categoriesJson,
          productCategories: productCategoriesJson,
          sliderImages: sliderImagesJson
        };

        // Use a small timeout to debounce rapid changes
        const timer = setTimeout(() => {
          setDoc(userDocRef, { 
            // darkMode: isDarkMode,
            customLogo, 
            customIntroMusic, 
            customClickSound, 
            offersMusic, 
            expenseCategories, 
            productCategories, 
            sliderImages 
          }, { merge: true })
            .catch(error => {
              handleFirestoreError(error, OperationType.WRITE, `settings/global`);
            });
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [customLogo, customIntroMusic, customClickSound, offersMusic, expenseCategories, productCategories, sliderImages, user, isInitialLoad]);

  // Dynamic SEO Metadata
  useEffect(() => {
    const tabNames: Record<string, string> = {
      dashboard: 'Admin Dashboard',
      clients: 'Clients Management',
      products: 'Dahua & Hikvision Orders',
      expenses: 'Expense Tracker',
      bandwidth: 'Network Speed Test',
      warranty: 'Warranty Check',
      me: 'Business Settings',
      'track-order': 'Service Tracking'
    };
    
    const descriptions: Record<string, string> = {
      dashboard: 'Overview of IT Department services: CCTV installation, AC and Fridge repair stats.',
      clients: 'Client database for CCTV installation, repair, and maintenance services in Dhaka.',
      products: 'Best prices for Dahua and Hikvision CCTV cameras. Track your installation orders.',
      bandwidth: 'Test your internet speed for smooth CCTV remote monitoring.',
      warranty: 'Check warranty for your Dahua, Hikvision CCTV and AC Fridge parts.',
      'track-order': 'Track your CCTV camera repair or AC Fridge service status live.'
    };

    const currentTab = tabNames[activeTab] || activeTab;
    document.title = `${currentTab} | IT Department`;
    
    // Update meta description dynamically for better context
    const description = descriptions[activeTab] || 'IT Department - Expert CCTV, AC & Fridge Repair Services in Dhaka.';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [activeTab]);

  // Dark Mode Class & Persist
  useEffect(() => {
    localStorage.setItem('cctv_theme_preference', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Global Click Sound
  useEffect(() => {
    // Sound disabled per user request
  }, []);

  // Splash Screen Timer
  useEffect(() => {
    // We now always require a tap to enter for iOS/browser audio policies
    // The timer logic is handled entirely inside the SplashScreen component
  }, []);

  const handlePlayIntro = () => {
    // Intro sound disabled per user request
  };

  const handleSplashEnter = () => {
    playSound('pop');
    setShowSplash(false);
  };

  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (file.size > 10 * 1024 * 1024) {
        addNotification("Logo file too large! Max 10MB.");
        return;
      }
      
      setIsLogoUploading(true);
      addNotification("Uploading logo...");
      try {
        const storageRef = ref(storage, `settings/logo_${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(uploadTask.ref);
        setCustomLogo(url);
        localStorage.setItem('cctv_custom_logo', url);
        addNotification("Logo updated successfully!");
      } catch (error: any) {
        console.error("Logo upload error:", error);
        addNotification("Logo upload failed: " + (error.message || "Unknown error"));
      } finally {
        setIsLogoUploading(false);
      }
    } else if (!user) {
      addNotification("Please login to upload logo.");
    }
  };

  const addNotification = (text: string, type: 'info' | 'success' | 'admin-order' | 'error' = 'info', order?: PublicOrder) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, text, type, order }]);
    
    // Admin orders stay longer
    const duration = type === 'admin-order' ? 10000 : 3000;
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  // --- Logic Functions ---

  const handleAddWork = async (clientId: number, description: string, amount: number) => {
    if (!user) {
      addNotification("Please login to add work.");
      return;
    }
    const userId = user.uid;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newWork: WorkHistory = {
      id: `WORK-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      description,
      amount,
      paid: 0
    };

    const updatedClient = {
      ...client,
      due: client.due + amount,
      works: client.works + 1,
      workHistory: [newWork, ...client.workHistory]
    };

    try {
      await setDoc(doc(db, 'clients', String(clientId)), updatedClient);
      addNotification("Work added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleAddPayment = async (clientId: number, amount: number, type: 'Cash' | 'Bkash' | 'Bank' | 'Nagad', purpose: string = 'General Payment') => {
    if (!user) {
      addNotification("Please login to record payment.");
      return;
    }
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newPayment: PaymentHistory = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString(),
      amount,
      type,
      purpose
    };

    const updatedClient = {
      ...client,
      due: Math.max(0, client.due - amount),
      totalPaid: client.totalPaid + amount,
      paymentHistory: [newPayment, ...(client.paymentHistory || [])]
    };

    setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));

    try {
      await setDoc(doc(db, 'clients', String(clientId)), updatedClient);
      addNotification("Payment recorded successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleDeletePayment = async (clientId: number, paymentId: string) => {
    if (!user) {
      addNotification("Please login to delete payment.");
      return;
    }
    const userId = user.uid;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const payment = client.paymentHistory.find(p => p.id === paymentId);
    if (!payment) return;

    const updatedClient = {
      ...client,
      due: client.due + payment.amount,
      totalPaid: client.totalPaid - payment.amount,
      paymentHistory: client.paymentHistory.filter(p => p.id !== paymentId)
    };

    try {
      await setDoc(doc(db, 'clients', String(clientId)), updatedClient);
      addNotification("Payment deleted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleDeleteWork = async (clientId: number, workId: string) => {
    if (!user) {
      addNotification("Please login to delete work.");
      return;
    }
    const userId = user.uid;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const work = client.workHistory.find(w => w.id === workId);
    if (!work) return;

    const updatedClient = {
      ...client,
      due: client.due - work.amount,
      works: client.works - 1,
      workHistory: client.workHistory.filter(w => w.id !== workId)
    };

    try {
      await setDoc(doc(db, 'clients', String(clientId)), updatedClient);
      addNotification("Work deleted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const updateOrderStatus = async (clientId: number, orderId: string, newStatus: OrderStatus) => {
    if (!user) {
      addNotification("Please login to update status.");
      return;
    }
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Update local state first to make it snappy
    setClients(prev => prev.map(c => 
      c.id === clientId 
        ? { ...c, orders: (c.orders || []).map(o => o.id === orderId ? { ...o, status: newStatus } : o) } 
        : c
    ));

    const updatedClient = {
      ...client,
      orders: (client.orders || []).map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    };

    try {
      // 1. Update in clients collection
      await setDoc(doc(db, 'clients', String(clientId)), updatedClient);
      
      // 2. Try to update in public_orders collection if it exists there too
      // The orderId might match a document in 'public_orders' if the admin moved it from public_orders to clients.
      try {
         const publicOrderRef = doc(db, 'public_orders', orderId);
         const publicOrderSnap = await getDoc(publicOrderRef);
         if (publicOrderSnap.exists()) {
           await updateDoc(publicOrderRef, { status: newStatus });
         }
      } catch (err) {
         console.error("No public order found with this id, which is fine.", err);
      }
      
      addNotification(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Update status error:", err);
      addNotification("Failed to update status.");
    }
  };

  const handleDeleteOrder = async (clientId: number, orderId: string) => {
    if (!user) {
      addNotification("Please login to delete order.");
      return;
    }
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      // 1. Delete from public_orders (always check both places)
      await deleteDoc(doc(db, 'public_orders', String(orderId)));

      // 2. Delete from CRM
      const client = clients.find(c => c.id === clientId);
      if (client) {
        const orderToDelete = (client.orders || []).find(o => String(o.id) === String(orderId));
        const orderTotal = orderToDelete ? orderToDelete.total : 0;
        const updatedOrders = (client.orders || []).filter(o => String(o.id) !== String(orderId));
        
        await updateDoc(doc(db, 'clients', String(clientId)), { 
          orders: updatedOrders,
          due: Math.max(0, (client.due || 0) - orderTotal)
        });
      }
      
      addNotification("Order deleted successfully!", "success");
    } catch (error: any) {
      console.error("Order delete error:", error);
      addNotification("Delete failed: " + (error.message || error), "error");
    }
  };

  const deleteAnyOrder = async (order: any) => {
    if (!isAdmin) {
       addNotification("Admin access required.");
       return;
    }
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    const orderId = order.id;
    try {
      // 1. Force delete from public_orders
      await deleteDoc(doc(db, 'public_orders', String(orderId)));
      
      // 2. Scan all clients to ensure it's removed from CRM too
      const deletePromises = clients.map(async (client) => {
        const hasOrder = (client.orders || []).some(o => String(o.id) === String(orderId));
        if (hasOrder) {
          const orderToDelete = (client.orders || []).find(o => String(o.id) === String(orderId));
          const orderTotal = orderToDelete ? orderToDelete.total : 0;
          const updatedOrders = (client.orders || []).filter(o => String(o.id) !== String(orderId));
          
          await updateDoc(doc(db, 'clients', String(client.id)), {
            orders: updatedOrders,
            due: Math.max(0, (client.due || 0) - orderTotal)
          });
          return true;
        }
        return false;
      });

      await Promise.all(deletePromises);
      addNotification("Order deleted from all records successfully.", "success");
    } catch (err: any) {
      console.error("Critical Order delete error:", err);
      addNotification("Delete failed: " + (err.message || err), "error");
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      playSound('error');
      addNotification("Out of stock!");
      return;
    }
    playSound('success');
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
    addNotification(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: number) => {
    playSound('click');
    setCart(prev => prev.filter(item => item.productId !== productId));
    addNotification("Item removed from cart");
  };

  const updateCartQuantity = (productId: number | string, delta: number) => {
    playSound('click');
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const placePublicOrder = async (
    customerDetails: {name: string, phone: string, address: string},
    isPaid: boolean = false,
    paymentType: string = 'Cash'
  ) => {
    if (cart.length === 0) return;
    
    window.dispatchEvent(new Event('start-task-animation'));

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ORD-${Date.now()}`;
    
    const publicOrder: any = {
      id: orderId,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
      items: cart,
      total,
      date: new Date().toISOString().split('T')[0],
      status: 'pending', // Always mark 'pending' so admin can review and confirm!
      isPaid,
      paymentType,
    };

    try {
      console.log("Saving public order...");
      try {
        await setDoc(doc(db, 'public_orders', orderId), publicOrder);
        console.log("Public order saved successfully");
      } catch (orderErr) {
        console.error("Order save failed:", orderErr);
        handleFirestoreError(orderErr, OperationType.WRITE, `public_orders/${orderId}`);
        return; // Stop if order itself fails
      }
      
      // Decrease stock
      for (const item of cart) {
        try {
          console.log(`Updating stock for product ${item.productId}...`);
          const productRef = doc(db, 'products', String(item.productId));
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock;
            await updateDoc(productRef, {
              stock: Math.max(0, currentStock - item.quantity)
            });
            console.log(`Stock updated for product ${item.productId}`);
          }
        } catch (stockErr) {
          console.warn(`Stock update failed for product ${item.productId}:`, stockErr);
          // We don't stop the whole process if stock update fails, but we'll log it
        }
      }

      setCart([]);
      setShowCart(false);
      playSound('success');
      addNotification(isPaid ? `Order placed and paid via ${paymentType}!` : "Order placed successfully! We will contact you soon.");
      
      // Generate PDF for the client
      try {
        await generateOrderPDF(publicOrder, customLogo);
      } catch (pdfErr) {
        console.error("PDF generation failed:", pdfErr);
      }
    } catch (error) {
      console.error("Error in placePublicOrder catch-all:", error);
    } finally {
      window.dispatchEvent(new Event('stop-task-animation'));
    }
  };

  const acceptPublicOrder = async (order: PublicOrder) => {
    // Find client by phone
    let client = clients.find(c => c.phone === order.customerPhone);
    let clientId = client ? client.id : Date.now();

    const newOrder: Order = {
      id: order.id,
      date: order.date,
      items: order.items,
      total: order.total,
      dueDate: null,
      status: OrderStatus.PENDING
    };

    try {
      const isPaid = (order as any).isPaid;
      const paymentType = (order as any).paymentType || 'Digital';
      const orderTotal = order.total;

      let paymentHistoryPayload: PaymentHistory[] = [];
      if (isPaid) {
        paymentHistoryPayload = [{
          id: `PAY-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          amount: orderTotal,
          type: paymentType as any,
          purpose: `Product Order (${order.id})`
        }];
      }

      if (client) {
        // Update existing client with new order and ensure details are refreshed
        const updatedClient = {
          ...client,
          name: order.customerName, // Synchronize name
          address: order.customerAddress || client.address, // Synchronize address
          orders: [newOrder, ...(client.orders || [])],
          due: (client.due || 0) + (isPaid ? 0 : orderTotal),
          totalPaid: (client.totalPaid || 0) + (isPaid ? orderTotal : 0),
          paymentHistory: [...paymentHistoryPayload, ...(client.paymentHistory || [])]
        };
        await setDoc(doc(db, 'clients', String(clientId)), updatedClient);
        addNotification(`Updated profile for ${order.customerName}`, 'success');
      } else {
        // Create brand new client
        const newClient: Client = {
          id: clientId as number,
          name: order.customerName,
          phone: order.customerPhone,
          address: order.customerAddress || '',
          status: ClientStatus.ACTIVE,
          orders: [newOrder],
          due: isPaid ? 0 : orderTotal,
          totalPaid: isPaid ? orderTotal : 0,
          works: 0,
          workHistory: [],
          paymentHistory: paymentHistoryPayload
        };
        await setDoc(doc(db, 'clients', String(clientId)), newClient);
        addNotification(`New client added: ${order.customerName}`, 'success');
      }

      // Delete public order after it's moved to CRM to avoid duplicates in Manage All Orders
      await deleteDoc(doc(db, 'public_orders', order.id));
      
      addNotification(`Order from ${order.customerName} accepted!`);
      setShowPendingOrders(false);
    } catch (error) {
      console.error("Error accepting order:", error);
      addNotification("Failed to accept order.");
    }
  };

  const placeOrder = async (clientId: number, isPaid: boolean = false, paymentType: 'Cash' | 'Bkash' | 'Bank' = 'Cash') => {
    const client = clients.find(c => c.id === clientId);
    if (!client || cart.length === 0) return;

    window.dispatchEvent(new Event('start-task-animation'));

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      total,
      dueDate: null,
      status: OrderStatus.PENDING
    };

    // Update Client
    let updatedClient = {
      ...client,
      orders: [newOrder, ...(client.orders || [])],
      due: (client.due || 0) + total
    };

    if (isPaid) {
      const newPayment: PaymentHistory = {
        id: `PAY-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        amount: total,
        type: paymentType,
        purpose: `Product Order (${orderId})`
      };
      updatedClient = {
        ...updatedClient,
        due: updatedClient.due - total,
        totalPaid: (updatedClient.totalPaid || 0) + total,
        paymentHistory: [newPayment, ...(updatedClient.paymentHistory || [])]
      };
    }

    try {
      // Update Client in Firestore
      await setDoc(doc(db, 'clients', String(clientId)), updatedClient);

      // Update Stock in Firestore
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
          await updateDoc(doc(db, 'products', String(product.id)), {
            stock: newStock
          });
        }
      }

      await generatePDF(client, cart, total, isPaid, paymentType);
      generateWhatsAppMessage(client, cart, total, isPaid, paymentType);

      setCart([]);
      setShowCart(false);
      addNotification(isPaid ? "Order placed & Payment recorded!" : "Order placed successfully!");
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insufficient stock')) {
        addNotification(error.message);
        return;
      }
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    } finally {
      window.dispatchEvent(new Event('stop-task-animation'));
    }
  };

  const migrateDataToGlobal = async () => {
    if (!user) return;
    const userId = user.uid;
    addNotification("Starting data migration...");
    
    try {
      let productCount = 0;
      let clientCount = 0;
      let expenseCount = 0;

      // 1. Migrate Products
      const oldProductsRef = collection(db, 'users', userId, 'products');
      const productsSnap = await getDocs(oldProductsRef);
      for (const pDoc of productsSnap.docs) {
        await setDoc(doc(db, 'products', pDoc.id), pDoc.data());
        productCount++;
      }

      // 2. Migrate Clients
      const oldClientsRef = collection(db, 'users', userId, 'clients');
      const clientsSnap = await getDocs(oldClientsRef);
      for (const cDoc of clientsSnap.docs) {
        await setDoc(doc(db, 'clients', cDoc.id), cDoc.data());
        clientCount++;
      }

      // 3. Migrate Expenses
      const oldExpensesRef = collection(db, 'users', userId, 'expenses');
      const expensesSnap = await getDocs(oldExpensesRef);
      for (const eDoc of expensesSnap.docs) {
        await setDoc(doc(db, 'expenses', eDoc.id), eDoc.data());
        expenseCount++;
      }

      // 4. Migrate Settings
      const oldSettingsRef = doc(db, 'users', userId);
      const settingsSnap = await getDoc(oldSettingsRef);
      if (settingsSnap.exists()) {
        await setDoc(doc(db, 'settings', 'global'), settingsSnap.data(), { merge: true });
      }

      addNotification(`Migration complete! ${productCount} products, ${clientCount} clients, ${expenseCount} expenses moved.`);
    } catch (error) {
      console.error("Migration error:", error);
      addNotification("Migration failed. Check console for details.");
    }
  };

  // Helper to convert Image URL to Base64 (needed for jsPDF)
  const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (e) => reject(e);
    });
  };

  const generatePDF = async (client: Client, items: CartItem[], total: number, isPaid: boolean = false, paymentType: string = 'Cash') => {
    window.dispatchEvent(new Event('start-task-animation'));
    try {
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Pre-load images to base64
    const itemsWithBase64 = await Promise.all(items.map(async (item) => {
      if (item.image) {
        try {
          const base64 = await getBase64Image(item.image);
          return { ...item, base64 };
        } catch (e) {
          console.error("Failed to load item image", e);
          return { ...item, base64: null };
        }
      }
      return { ...item, base64: null };
    }));

    // --- Header ---
    // Blue background for header
    doc.setFillColor(37, 99, 235); 
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Logo if available
    if (customLogo) {
      try {
        doc.addImage(customLogo, 'PNG', margin, 10, 30, 30);
        // Company Name shifted
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IT DEPARTMENT', margin + 35, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Trusted Technology Partner', margin + 35, 32);
        doc.text('Phone: 01817681233 | Email: itdepartmentpro33@gmail.com', margin + 35, 38);
      } catch (e) {
        // Fallback if logo fails
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IT DEPARTMENT', margin, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Trusted Technology Partner', margin, 32);
        doc.text('Phone: 01817681233 | Email: itdepartmentpro33@gmail.com', margin, 38);
      }
    } else {
      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('IT DEPARTMENT', margin, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Trusted Technology Partner', margin, 32);
      doc.text('Phone: 01817681233 | Email: itdepartmentpro33@gmail.com', margin, 38);
    }

    // --- Invoice Info ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', margin, 65);
    
    doc.setFont('helvetica', 'normal');
    doc.text(client.name, margin, 72);
    doc.text(client.address, margin, 78);
    doc.text(`Phone: ${client.phone}`, margin, 84);

    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS:', pageWidth - margin - 60, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: INV-${Date.now().toString().slice(-6)}`, pageWidth - margin - 60, 72);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, 78);
    
    if (isPaid) {
      doc.setTextColor(22, 163, 74); // green-600
      doc.setFont('helvetica', 'bold');
      doc.text(`Status: PAID`, pageWidth - margin - 60, 84);
      doc.setFontSize(8);
      doc.text(`Method: ${paymentType}`, pageWidth - margin - 60, 89);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(220, 38, 38); // red-600
      doc.setFont('helvetica', 'bold');
      doc.text(`Status: UNPAID`, pageWidth - margin - 60, 84);
      doc.setTextColor(0, 0, 0);
    }

    // --- Table ---
    const tableData = itemsWithBase64.map((item, index) => [
      index + 1,
      '', // Space for product image
      item.name,
      item.quantity,
      formatCurrency(item.price).replace('BDT', '').trim(),
      formatCurrency(item.price * item.quantity).replace('BDT', '').trim()
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['SL', 'PIC', 'DESCRIPTION', 'QTY', 'PRICE (BDT)', 'TOTAL (BDT)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 25 }, // PIC column
        2: { cellWidth: 'auto' },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right', cellWidth: 30 },
        5: { halign: 'right', cellWidth: 30 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        minCellHeight: 25 // Ensure enough height for image
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const item = itemsWithBase64[data.row.index];
          if (item.base64) {
            try {
              doc.addImage(item.base64, 'JPEG', data.cell.x + 2, data.cell.y + 2, 21, 21);
            } catch (e) {
              console.error("Error adding image to cell", e);
            }
          }
        }
      }
    });

    // --- Summary ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', pageWidth - margin - 60, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - margin - 60, finalY + 8);
    doc.text(formatCurrency(total).replace('BDT', '').trim(), pageWidth - margin - 10, finalY + 8, { align: 'right' });
    
    doc.text('Tax (0%):', pageWidth - margin - 60, finalY + 14);
    doc.text('0.00', pageWidth - margin - 10, finalY + 14, { align: 'right' });

    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 60, finalY + 18, pageWidth - margin, finalY + 18);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`TOTAL BDT: ${formatCurrency(total).replace('BDT', '').trim()}`, pageWidth - margin - 10, finalY + 25, { align: 'right' });

    // In Words
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`In Words: ${numberToWords(total)}`, margin, finalY + 35);

    // --- Footer ---
    const footerY = pageHeight - 40;
    
    // Signatures
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY, margin + 50, footerY);
    doc.line(pageWidth - margin - 50, footerY, pageWidth - margin, footerY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Customer Signature', margin + 25, footerY + 5, { align: 'center' });
    doc.text('Authorized Signature', pageWidth - margin - 25, footerY + 5, { align: 'center' });

    // THANK YOU FOR YOUR BUSINESS!
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('THANK YOU FOR YOUR BUSINESS!', pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Robust download for iframes
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${client.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    } finally {
      window.dispatchEvent(new Event('stop-task-animation'));
    }
  };

  const generateWhatsAppMessage = (client: Client, items: CartItem[], total: number, isPaid: boolean = false, paymentType: string = 'Cash') => {
    let message = `*IT DEPARTMENT Order Confirmation*\n\n`;
    message += `Client: ${client.name}\n`;
    message += `Phone: ${client.phone}\n`;
    message += `Date: ${new Date().toLocaleDateString()}\n`;
    message += `Status: ${isPaid ? `PAID (${paymentType})` : 'UNPAID'}\n\n`;
    message += `*Product List:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
    });
    message += `\n*Total Amount: ${formatCurrency(total)}*\n\n`;
    message += `Your Trusted Technology Partner\n`;
    message += `Thank you for choosing us!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${client.phone}?text=${encoded}`, '_blank');
  };

  const generateClientProfilePDF = (client: Client) => {
    window.dispatchEvent(new Event('start-task-animation'));
    try {
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);

    if (customLogo) {
      try {
        doc.addImage(customLogo, 'PNG', margin, 5, 30, 30);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('IT DEPARTMENT', margin + 35, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Trusted Technology Partner', margin + 35, 26);
        doc.text('CLIENT PROFILE REPORT', margin + 35, 34);
      } catch (e) {
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IT DEPARTMENT', margin, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('CLIENT PROFILE REPORT', margin, 30);
      }
    } else {
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('IT DEPARTMENT', margin, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('CLIENT PROFILE REPORT', margin, 30);
    }

    // Client Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT INFORMATION', margin, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${client.name}`, margin, 65);
    doc.text(`Phone: ${client.phone}`, margin, 72);
    doc.text(`Address: ${client.address}`, margin, 79);
    doc.text(`Status: ${client.status.toUpperCase()}`, margin, 86);
    doc.text(`Total Due: ${formatCurrency(client.due)}`, margin, 93);
    doc.text(`Total Paid: ${formatCurrency(client.totalPaid)}`, margin, 100);
    doc.text(`Warranty Expiry: ${client.warrantyExpiry || 'N/A'}`, margin, 107);

    // Work History Table
    doc.setFont('helvetica', 'bold');
    doc.text('WORK HISTORY', margin, 120);
    autoTable(doc, {
      startY: 125,
      head: [['Date', 'Description', 'Amount', 'Paid']],
      body: client.workHistory.map(w => [
        w.date,
        w.description,
        formatCurrency(w.amount),
        formatCurrency(w.paid)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Payment History Table
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT HISTORY', margin, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Date', 'Type', 'Purpose', 'Amount']],
      body: client.paymentHistory.map(p => [
        p.date,
        p.type,
        p.purpose || 'N/A',
        formatCurrency(p.amount)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }
    });

    // Robust download for iframes
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${client.name.replace(/\s+/g, '_')}_Profile.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    } finally {
      window.dispatchEvent(new Event('stop-task-animation'));
    }
  };

  const generateInventoryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);

    if (customLogo) {
      try {
        doc.addImage(customLogo, 'PNG', margin, 5, 30, 30);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('IT DEPARTMENT', margin + 35, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Trusted Technology Partner', margin + 35, 26);
        doc.text('INVENTORY BACKUP REPORT', margin + 35, 34);
      } catch (e) {
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IT DEPARTMENT', margin, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('INVENTORY BACKUP REPORT', margin, 30);
      }
    } else {
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('IT DEPARTMENT', margin, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('INVENTORY BACKUP REPORT', margin, 30);
    }

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Product Name', 'Category', 'Stock', 'Price', 'Value']],
      body: products.map((p, i) => [
        i + 1,
        p.name,
        p.category.toUpperCase(),
        p.stock,
        formatCurrency(p.price),
        formatCurrency(p.price * p.stock)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Inventory Value: ${formatCurrency(totalValue)}`, pageWidth - margin, finalY, { align: 'right' });

    // Robust download for iframes
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventory_Backup_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addNotification("Inventory PDF downloaded!");
  };

  // --- Views ---

  const seedUserData = async (userId: string) => {
    if (isSeeding.current) return;
    isSeeding.current = true;
    
    try {
      const batch = writeBatch(db);
      let hasChanges = false;

      // Seed Products
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);
      if (productsSnap.empty) {
        const localProducts = localStorage.getItem('cctv_products');
        if (localProducts && JSON.parse(localProducts).length > 0) {
          const items = JSON.parse(localProducts);
          for (const p of items) {
            batch.set(doc(db, 'products', String(p.id)), p);
          }
        } else {
          for (const p of DEFAULT_PRODUCTS) {
            batch.set(doc(db, 'products', String(p.id)), p);
          }
        }
        hasChanges = true;
      }

      // Seed Clients
      const clientsRef = collection(db, 'clients');
      const clientsSnap = await getDocs(clientsRef);
      if (clientsSnap.empty) {
        const localClients = localStorage.getItem('cctv_clients');
        if (localClients && JSON.parse(localClients).length > 0) {
          const items = JSON.parse(localClients);
          for (const c of items) {
            batch.set(doc(db, 'clients', String(c.id)), c);
          }
        } else {
          for (const c of DEFAULT_CLIENTS) {
            batch.set(doc(db, 'clients', String(c.id)), c);
          }
        }
        hasChanges = true;
      }

      // Mark as seeded
      batch.set(doc(db, 'settings', 'global'), { seeded: true }, { merge: true });
      hasChanges = true;

      if (hasChanges) {
        await batch.commit();
        addNotification("Data synchronized with cloud!");
      }
    } catch (error) {
      console.error("Error seeding user data:", error);
    } finally {
      isSeeding.current = false;
    }
  };

  const uploadProductFile = async (dataUrl: string, path: string) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Storage upload failed:", error);
      return dataUrl; 
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    const productId = Date.now();
    let product: Product = {
      ...newProduct,
      id: productId
    };

    const updateLocalStorage = (updatedProducts: Product[]) => {
      try {
        localStorage.setItem('cctv_products', JSON.stringify(updatedProducts));
      } catch (e) {
        console.warn("Storage quota exceeded, updating memory state only.");
      }
    };

    setProducts(prev => {
      const updated = [...prev, product];
      updateLocalStorage(updated);
      return updated;
    });
    
    setShowAddProduct(false);
    addNotification("Product added!");

    if (!user) {
      addNotification("Saved locally! Login to sync to cloud.");
      return;
    }
    
    try {
      // Background upload of media to Storage for cloud sync
      if (product.image && product.image.startsWith('data:')) {
        const uploadedUrl = await uploadProductFile(product.image, `products/${productId}/image`);
        // If upload to storage failed and we still have data URL, check size before firestore
        if (uploadedUrl.startsWith('data:') && uploadedUrl.length > 800000) {
          throw new Error("Image too large to sync without cloud storage. Please try a smaller image.");
        }
        product.image = uploadedUrl;
      }
      if (product.videoUrl && product.videoUrl.startsWith('data:')) {
        const uploadedUrl = await uploadProductFile(product.videoUrl, `products/${productId}/video`);
        if (uploadedUrl.startsWith('data:') && uploadedUrl.length > 800000) {
          throw new Error("Video too large to sync without cloud storage. Please upload a smaller video.");
        }
        product.videoUrl = uploadedUrl;
      }

      await setDoc(doc(db, 'products', String(productId)), product);
      
      // Update local state with the actual cloud URLs
      setProducts(prev => {
        const updated = prev.map(p => p.id === productId ? product : p);
        updateLocalStorage(updated);
        return updated;
      });
      
      addNotification("Product successfully synced to cloud!", "success");
    } catch (error: any) {
      console.error("Cloud sync failed:", error);
      const errorMsg = error.message?.includes('permission') ? "Permission denied. Check admin status." : (error.message || "Cloud sync failed.");
      addNotification(`Cloud Sync Error: ${errorMsg}`, "error");
      handleFirestoreError(error, OperationType.WRITE, `products/${productId}`);
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('cctv_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addNotification("Product deleted!");

    if (!user) return;
    
    try {
      const docRef = doc(db, 'products', String(id));
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    const updateLocalStorage = (updatedProducts: Product[]) => {
      try {
        localStorage.setItem('cctv_products', JSON.stringify(updatedProducts));
      } catch (e) {
        console.warn("Storage quota exceeded.");
      }
    };

    setProducts(prev => {
      const updated = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      updateLocalStorage(updated);
      return updated;
    });
    
    setShowEditProduct(null);
    addNotification("Product updated!");

    if (!user) return;
    
    try {
      let product = { ...updatedProduct };
      if (product.image && product.image.startsWith('data:')) {
        const uploadedUrl = await uploadProductFile(product.image, `products/${product.id}/image`);
        if (uploadedUrl.startsWith('data:') && uploadedUrl.length > 800000) {
          throw new Error("Image too large. Please use a smaller file.");
        }
        product.image = uploadedUrl;
      }
      if (product.videoUrl && product.videoUrl.startsWith('data:')) {
        const uploadedUrl = await uploadProductFile(product.videoUrl, `products/${product.id}/video`);
        if (uploadedUrl.startsWith('data:') && uploadedUrl.length > 800000) {
          throw new Error("Video too large. Please use a smaller file.");
        }
        product.videoUrl = uploadedUrl;
      }

      await setDoc(doc(db, 'products', String(product.id)), product);
      
      setProducts(prev => {
        const updated = prev.map(p => p.id === product.id ? product : p);
        updateLocalStorage(updated);
        return updated;
      });
      addNotification("Changes saved to cloud!", "success");
    } catch (error: any) {
      console.error("Cloud update failed:", error);
      const errorMsg = error.message?.includes('permission') ? "Permission denied." : (error.message || "Sync failed.");
      addNotification(`Update Error: ${errorMsg}`, "error");
      handleFirestoreError(error, OperationType.WRITE, `products/${updatedProduct.id}`);
    }
  };

  const handleUpdateClientImage = async (clientId: number, image: string | null) => {
    // Update local state immediately
    setClients(prev => {
      const updated = prev.map(c => c.id === clientId ? { ...c, image: image || undefined } : c);
      try {
        localStorage.setItem('cctv_clients', JSON.stringify(updated));
      } catch (e) {
        console.warn("Client images storage quota exceeded locally.");
      }
      return updated;
    });
    
    addNotification(image ? "Profile picture updated!" : "Profile picture reset!");

    if (!user) return;
    
    try {
      let finalImage = image;
      if (image && image.startsWith('data:')) {
        finalImage = await uploadProductFile(image, `clients/${clientId}/profile`);
      }

      await updateDoc(doc(db, 'clients', String(clientId)), {
        image: finalImage
      });

      // Update local state again with the cloud URL
      setClients(prev => {
        const updated = prev.map(c => c.id === clientId ? { ...c, image: finalImage || undefined } : c);
        try {
          localStorage.setItem('cctv_clients', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleSetWarranty = async (clientId: number, expiryDate: string) => {
    // Update local state immediately
    setClients(prev => {
      const updated = prev.map(c => c.id === clientId ? { ...c, warrantyExpiry: expiryDate } : c);
      localStorage.setItem('cctv_clients', JSON.stringify(updated));
      return updated;
    });
    addNotification("Warranty updated!");

    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'clients', String(clientId)), {
        warrantyExpiry: expiryDate
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleSetInstallationDate = async (clientId: number, date: string) => {
    setClients(prev => {
      const updated = prev.map(c => c.id === clientId ? { ...c, installationDate: date } : c);
      localStorage.setItem('cctv_clients', JSON.stringify(updated));
      return updated;
    });
    addNotification("Installation date updated!");

    if (!user) return;
    try {
      await updateDoc(doc(db, 'clients', String(clientId)), {
        installationDate: date
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleUpdateClientDetails = async (clientId: number, details: { name: string, phone: string, email?: string, address: string }) => {
    setClients(prev => {
      const updated = prev.map(c => c.id === clientId ? { ...c, ...details } : c);
      localStorage.setItem('cctv_clients', JSON.stringify(updated));
      return updated;
    });
    addNotification("Client details updated!");

    if (!user) return;
    try {
      await updateDoc(doc(db, 'clients', String(clientId)), details);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleUpdateNotes = async (clientId: number, notes: string) => {
    setClients(prev => {
      const updated = prev.map(c => c.id === clientId ? { ...c, notes } : c);
      localStorage.setItem('cctv_clients', JSON.stringify(updated));
      return updated;
    });
    addNotification("Notes updated!");

    if (!user) return;
    try {
      await updateDoc(doc(db, 'clients', String(clientId)), {
        notes
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    // Save client info before deleting so we can use phone to clean up public_orders
    const clientToDelete = clients.find(c => c.id === clientId);
    
    // Update local state immediately
    setClients(prev => {
      const updated = prev.filter(c => c.id !== clientId);
      localStorage.setItem('cctv_clients', JSON.stringify(updated));
      return updated;
    });
    setShowClientProfile(null);
    addNotification("Client deleted!");

    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'clients', String(clientId)));
      
      // Also delete any public_orders associated with this client's phone number
      if (clientToDelete?.phone) {
        const q = query(collection(db, 'public_orders'), where('customerPhone', '==', clientToDelete.phone));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'public_orders', docSnap.id)));
        await Promise.all(deletePromises);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
    }
  };

  const handleAddClient = async (newClient: Omit<Client, 'id' | 'works' | 'totalPaid' | 'workHistory' | 'paymentHistory' | 'orders' | 'due'>) => {
    const clientId = Date.now();
    const client: Client = {
      ...newClient,
      id: clientId,
      works: 0,
      totalPaid: 0,
      due: 0,
      workHistory: [],
      paymentHistory: [],
      orders: [],
      status: ClientStatus.ACTIVE,
      installationDate: newClient.installationDate || new Date().toISOString().split('T')[0],
      warrantyExpiry: newClient.warrantyExpiry || '',
      notes: newClient.notes || ''
    };

    // Update local state immediately
    setClients(prev => {
      const updated = [...prev, client];
      localStorage.setItem('cctv_clients', JSON.stringify(updated));
      return updated;
    });
    setShowAddClient(false);
    addNotification("Client added!");

    try {
      await setDoc(doc(db, 'clients', String(clientId)), client);
      addNotification("Client synced to cloud!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${clientId}`);
    }
  };

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    const expenseId = `EXP-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const expense: Expense = {
      ...newExpense,
      id: expenseId
    };

    // Update local state immediately
    setExpenses(prev => {
      const updated = [expense, ...prev];
      localStorage.setItem('cctv_expenses', JSON.stringify(updated));
      return updated;
    });
    addNotification("Expense added!");

    if (!user) {
      addNotification("Saved locally! Login to sync to cloud.");
      return;
    }
    
    const userId = user.uid;
    try {
      await setDoc(doc(db, 'expenses', expenseId), expense);
      addNotification("Expense synced to cloud!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `expenses/${expenseId}`);
    }
  };

    // Remove local Dashboard and ClientList definitions to use global ones




    // Remove local ClientProfile, AddWorkModal, and AddPaymentModal definitions to use global ones


  const PasswordModal = ({ onClose }: { onClose: () => void }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input === adminPassword) {
        setShowPasswordModal(false);
        if (passwordCallback) {
          passwordCallback.onSuccess();
          setPasswordCallback(null);
        }
      } else {
        setError(true);
        setTimeout(() => setError(false), 500);
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={cn(
            "glow-effect-container text-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl ",
            error && "animate-shake"
          )}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <Lock size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Security Check</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
              Please enter the administrative password to continue with this action.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  autoFocus
                  type="password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter Password"
                  className={cn(
                    "w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 dark:focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-center tracking-[0.5em]",
                    error ? "border-red-500 text-red-500" : "text-slate-900 dark:text-white"
                  )}
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordCallback(null);
                  }}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 glow-effect-container text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };

const PaymentGateway = ({ amount, onComplete, onClose }: { amount: number, onComplete: (type: 'Bkash' | 'Nagad') => void, onClose: () => void }) => {
  const [step, setStep] = useState<'select' | 'process'>('select');
  const [method, setMethod] = useState<'Bkash' | 'Nagad' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      if (method) onComplete(method);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glow-effect-container text-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black">Digital Payment</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
              <X size={20} />
            </button>
          </div>

          {step === 'select' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4 text-center">Select your preferred payment method to pay <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(amount)}</span></p>
              <button 
                onClick={() => { setMethod('Bkash'); setStep('process'); }}
                className="w-full p-4 bg-[#D12053] text-white rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bkash_logo.png/640px-Bkash_logo.png" alt="Bkash" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold">bKash</span>
                </div>
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => { setMethod('Nagad'); setStep('process'); }}
                className="w-full p-4 bg-[#F7941D] text-white rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Nagad_logo.png/640px-Nagad_logo.png" alt="Nagad" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold">Nagad</span>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-2xl flex items-center gap-3 mb-4",
                method === 'Bkash' ? "bg-[#D12053]/10 text-[#D12053]" : "bg-[#F7941D]/10 text-[#F7941D]"
              )}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1">
                  <img src={method === 'Bkash' ? "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bkash_logo.png/640px-Bkash_logo.png" : "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Nagad_logo.png/640px-Nagad_logo.png"} alt={method || ''} className="w-full h-full object-contain" />
                </div>
                <span className="font-black">{method} Payment</span>
              </div>

              <div className="space-y-3">
                <input 
                  type="tel" 
                  placeholder="Your Account Number" 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Enter PIN" 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                />
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing || !phoneNumber || !pin || !otp}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden",
                  method === 'Bkash' ? "bg-[#D12053]" : "bg-[#F7941D]",
                  (isProcessing || !phoneNumber || !pin || !otp) && "opacity-50"
                )}
              >
                {isProcessing ? (
                  <>
                    <motion.div 
                      initial={{ x: -100 }}
                      animate={{ x: 400 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0"
                    >
                      <Plane size={24} className="rotate-90 opacity-50" />
                    </motion.div>
                    <span className="animate-pulse">Processing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Pay {formatCurrency(amount)}
                  </>
                )}
              </button>
              <button 
                onClick={() => setStep('select')}
                className="w-full py-2 text-xs font-bold text-gray-500"
              >
                Change Payment Method
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

  const CartModal = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [orderClientId, setOrderClientId] = useState<number | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [paymentType, setPaymentType] = useState<'Cash' | 'Bkash' | 'Bank'>('Cash');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [showGateway, setShowGateway] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    const handleDigitalPayment = (type: 'Bkash' | 'Nagad') => {
      setShowGateway(false);
      setIsOrdering(true);
      setTimeout(async () => {
        try {
          if (isAdmin && orderClientId) {
            await placeOrder(orderClientId, true, type as any);
          } else {
            await placePublicOrder({ name: customerName, phone: customerPhone, address: customerAddress }, true, type as any);
          }
        } finally {
          setIsOrdering(false);
        }
      }, 500);
    };

    const handleConfirmOrder = () => {
      setIsOrdering(true);
      setTimeout(async () => {
        try {
          if (isAdmin && orderClientId) {
            await placeOrder(orderClientId, isPaid, paymentType);
          } else {
            // For clients, always go through the public/pending flow
            await placePublicOrder({ name: customerName, phone: customerPhone, address: customerAddress }, isPaid, paymentType);
          }
        } finally {
          setIsOrdering(false);
        }
      }, 500);
    };

    const handlePlacePublicOrder = () => {
      setIsOrdering(true);
      setTimeout(async () => {
        try {
          await placePublicOrder({name: customerName, phone: customerPhone, address: customerAddress}, isPaid, paymentType);
        } finally {
          setIsOrdering(false);
        }
      }, 500);
    };

    return (
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={() => setShowCart(false)}
      >
        <AnimatePresence>
          {showGateway && (
            <PaymentGateway 
              amount={total} 
              onClose={() => setShowGateway(false)} 
              onComplete={handleDigitalPayment} 
            />
          )}
        </AnimatePresence>
        <div 
          className="w-full max-w-[450px] md:max-w-xl max-h-[90vh] md:max-h-[85vh] glow-effect-container text-white rounded-t-[40px] md:rounded-[40px] md:mb-8 shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8 pb-4">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Checkout</h2>
                <p className="text-xs text-gray-500 font-medium">Review your premium selection</p>
              </div>
              <button 
                onClick={() => setShowCart(false)}
                className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Minus size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4 hide-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart size={40} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mt-2">Add some premium gear to get started</p>
                <button 
                  onClick={() => setShowCart(false)}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {cart.map(item => (
                    <motion.div 
                      key={item.productId} 
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                          <Package size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-[10px] text-blue-600 font-black">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateCartQuantity(item.productId, -1);
                          }}
                          className="w-8 h-8 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateCartQuantity(item.productId, 1);
                          }}
                          className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="space-y-4 pt-4 mb-4 border-b pb-6 dark:border-slate-800">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Assign to Existing Client</h3>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-3xl outline-none text-sm font-bold appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        onChange={(e) => setOrderClientId(Number(e.target.value) || null)}
                        value={orderClientId || ''}
                      >
                        <option value="">New Customer (Public Order)...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                )}

                {(!isAdmin || !orderClientId) && (
                  <div className="space-y-4 pt-4 mb-4 border-b pb-6 dark:border-slate-800">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isAdmin ? "New Customer Details" : "Your Details"}</h3>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                    <textarea
                      placeholder="Delivery Address"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold h-24 resize-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Status</h3>
                    <div className="flex gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsPaid(false)}
                        className={cn(
                          "flex-1 py-3 rounded-2xl font-bold text-xs transition-all border",
                          !isPaid 
                            ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30" 
                            : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        )}
                      >
                        Unpaid (Add to Due)
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsPaid(true)}
                        className={cn(
                          "flex-1 py-3 rounded-2xl font-bold text-xs transition-all border",
                          isPaid 
                            ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30" 
                            : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        )}
                      >
                        Paid Now
                      </motion.button>
                    </div>

                    {isPaid && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Payment Method</p>
                        <div className="flex gap-2">
                          {['Cash', 'Bkash', 'Bank'].map(type => (
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              key={type}
                              onClick={() => setPaymentType(type as any)}
                              className={cn(
                                "flex-1 py-2.5 rounded-xl font-bold text-[10px] transition-all border",
                                paymentType === type 
                                  ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30" 
                                  : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                              )}
                            >
                              {type}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 bg-gray-50 dark:bg-slate-800/30 border-t dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Investment</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold">Items</p>
                  <p className="text-sm font-black text-blue-600">{cart.reduce((s, i) => s + i.quantity, 0)}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  {(isAdmin && orderClientId) ? (
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      disabled={!orderClientId}
                      onClick={() => {
                        const client = clients.find(c => c.id === orderClientId);
                        if (client) generateWhatsAppMessage(client, cart, total, isPaid, paymentType);
                      }}
                      className="flex-1 py-5 bg-emerald-500 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={20} />
                      WhatsApp Quote
                    </motion.button>
                  ) : null}

                  <LaunchOrderButton 
                    label={(!isAdmin || !orderClientId) ? "Place Cash Order" : "Confirm & Order"}
                    onClick={(!isAdmin || !orderClientId) ? handlePlacePublicOrder : handleConfirmOrder}
                    disabled={(!isAdmin || !orderClientId) ? (!customerName || !customerPhone || !customerAddress) : !orderClientId}
                    isOrdering={isOrdering}
                    themeColor={(!isAdmin || !orderClientId) ? 160 : 140}
                  />
                </div>
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  disabled={
                    (!isAdmin || !orderClientId) 
                      ? (!customerName || !customerPhone || !customerAddress || isOrdering)
                      : (!orderClientId || isOrdering)
                  }
                  onClick={() => setShowGateway(true)}
                  className="w-full py-5 glow-effect-container text-white rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {isOrdering ? (
                     <div className="flex items-center gap-2">
                       <motion.div 
                          animate={{ x: [0, 400], opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute left-0"
                       >
                         <Plane size={20} className="rotate-90 text-white/50" />
                       </motion.div>
                       <span className="animate-pulse tracking-widest uppercase text-[10px] font-bold">Connecting Secure Gateway...</span>
                     </div>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      {(!isAdmin || !orderClientId) ? "Pay Now (Bkash/Nagad)" : "Digital Payment (Bkash/Nagad)"}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PendingOrdersModal = () => {
    return (
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowPendingOrders(false)}
      >
        <div 
          className="w-full max-w-2xl max-h-[90vh] glow-effect-container text-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black">Pending Orders</h2>
              <p className="text-xs text-gray-500">Orders placed by clients</p>
            </div>
            <button 
              onClick={() => setShowPendingOrders(false)}
              className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {publicOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No pending orders.</div>
            ) : (
              publicOrders.map((order, idx) => (
                <div key={`${order.id}-${idx}`} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{order.customerName}</h3>
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      <p className="text-xs text-gray-400 mt-1">{order.customerAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-600">{formatCurrency(order.total)}</p>
                      <p className="text-[10px] text-gray-400">{order.date}</p>
                      {(order as any).isPaid && (
                        <p className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-sm inline-block mt-1 uppercase tracking-tighter">
                          Paid: {(order as any).paymentType}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, iidx) => (
                      <div key={`${item.productId}-${iidx}`} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => generateOrderPDF(order)}
                      className="w-10 h-10 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => acceptPublicOrder(order)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, 'public_orders', order.id), { status: 'rejected' });
                        addNotification("Order rejected.");
                      }}
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

const BandwidthTestPage = () => {
    const [isTesting, setIsTesting] = useState(false);
    const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'upload'>('idle');
    const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
    const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [isTurbo, setIsTurbo] = useState(false);
    const [testHistory, setTestHistory] = useState<{download: number, upload: number, date: string}[]>([]);
    const [ping, setPing] = useState<number>(24);
    const [jitter, setJitter] = useState<number>(3);

    const runTest = async (turbo = false) => {
      setIsTesting(true);
      setIsTurbo(turbo);
      setDownloadSpeed(null);
      setUploadSpeed(null);
      setProgress(0);

      try {
        // Phase 1: Ping
        setTestPhase('ping');
        const pings = [];
        for(let i=0; i<3; i++) {
          const start = performance.now();
          await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
          pings.push(performance.now() - start);
          setProgress((i + 1) * 10);
        }
        const avgPing = Math.round(pings.reduce((a, b) => a + b) / pings.length);
        setPing(avgPing);
        setJitter(Math.round(Math.max(...pings) - Math.min(...pings)));

        // Phase 2: Download
        setTestPhase('download');
        const dlStart = performance.now();
        const dlUrl = `https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop&sig=${Math.random()}`;
        const dlRes = await fetch(dlUrl, { cache: 'no-store' });
        const reader = dlRes.body?.getReader();
        if (!reader) throw new Error('No reader');
        
        const cl = dlRes.headers.get('Content-Length');
        const total = cl ? parseInt(cl) : 5000000;
        let received = 0;
        
        while(true) {
          const {done, value} = await reader.read();
          if (done) break;
          received += value.length;
          const p = 30 + (received / total) * 35;
          setProgress(Math.min(p, 65));
          const elapsed = (performance.now() - dlStart) / 1000;
          if (elapsed > 0.1) setDownloadSpeed(parseFloat(((received * 8) / (elapsed * 1024 * 1024)).toFixed(2)));
        }
        const finalDl = ((received * 8) / ((performance.now() - dlStart) / 1000 * 1024 * 1024));
        setDownloadSpeed(parseFloat(finalDl.toFixed(2)));

        // Phase 3: Upload
        setTestPhase('upload');
        const ulStart = performance.now();
        const ulSize = turbo ? 2000000 : 1000000; // 1-2MB blob
        const blob = new Blob([new Uint8Array(ulSize)]);
        
        // We use a dummy POST to a reliable endpoint
        await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: blob,
          mode: 'cors'
        });
        
        const ulEnd = performance.now();
        const finalUl = (ulSize * 8) / ((ulEnd - ulStart) / 1000 * 1024 * 1024);
        setUploadSpeed(parseFloat(finalUl.toFixed(2)));
        setProgress(100);

        setTestHistory(prev => [{
          download: parseFloat(finalDl.toFixed(2)),
          upload: parseFloat(finalUl.toFixed(2)),
          date: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 5));
        
        addNotification(`Test Complete: DL ${finalDl.toFixed(1)} / UL ${finalUl.toFixed(1)} Mbps`);
      } catch (error) {
        console.error("Test failed:", error);
        addNotification("Test failed. Check connection.");
      } finally {
        setIsTesting(false);
        setTestPhase('idle');
      }
    };

    return (
      <div className="space-y-6 pb-24">
        <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
          {isTurbo && isTesting && (
            <motion.div 
              className="absolute inset-0 bg-orange-500/5 -z-10"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-500 relative",
            isTesting 
              ? (isTurbo ? "bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_50px_rgba(249,115,22,0.6)] scale-110" : "bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)]") 
              : "bg-gray-100 dark:bg-slate-800"
          )}>
            <Zap size={48} className={cn(isTesting ? "text-white animate-pulse" : "text-blue-600")} />
            {isTesting && (
              <motion.div 
                className={cn("absolute inset-0 rounded-full border-4", isTurbo ? "border-orange-300/50" : "border-white/30")}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                transition={{ duration: isTurbo ? 0.5 : 1, repeat: Infinity }}
              />
            )}
            {isTurbo && isTesting && (
              <motion.div 
                className="absolute -inset-4 rounded-full border-2 border-orange-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Network Bandwidth Test</h2>
          <p className="text-gray-500 text-sm mb-8">
            {testPhase === 'idle' ? 'Measure your connection speed' : 
             testPhase === 'ping' ? 'Testing Latency...' :
             testPhase === 'download' ? 'Testing Download Speed...' : 'Testing Upload Speed...'}
          </p>

          <div className="grid grid-cols-2 gap-8 w-full mb-8">
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Download</p>
              <p className={cn("text-4xl font-black", downloadSpeed ? "text-blue-600" : "text-gray-300")}>
                {downloadSpeed || '0.0'} <span className="text-xs">Mbps</span>
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Upload</p>
              <p className={cn("text-4xl font-black", uploadSpeed ? "text-purple-600" : "text-gray-300")}>
                {uploadSpeed || '0.0'} <span className="text-xs">Mbps</span>
              </p>
            </div>
          </div>

          {isTesting && (
            <div className="w-full max-w-xs bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-8 p-0.5">
              <motion.div 
                className={cn("h-full rounded-full", isTurbo ? "bg-orange-500" : "bg-blue-600")}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => runTest(false)}
              disabled={isTesting}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95 transition-all"
            >
              <Zap size={20} /> Start Standard Test
            </button>
            <button 
              onClick={() => runTest(true)}
              disabled={isTesting}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 active:scale-95 transition-all"
            >
              <Zap size={20} /> Start Turbo Test
            </button>
          </div>
        </div>

        {testHistory.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-500">
              <RefreshCcw size={14} /> Recent Tests
            </h3>
            <div className="space-y-3">
              {testHistory.map((test, i) => (
                <div key={i} className="flex justify-between items-center border-b dark:border-slate-800 pb-2 last:border-0">
                  <div>
                    <p className="text-xs font-bold">DL: {test.download} / UL: {test.upload}</p>
                    <p className="text-[10px] text-gray-400">{test.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">DL</span>
                    <span className="text-[10px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">UL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ping</p>
            <p className="text-lg font-bold">{ping} ms</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jitter</p>
            <p className="text-lg font-bold">{jitter} ms</p>
          </div>
        </div>
      </div>
    );
  };

  const LaunchOrderButton = ({ 
    label, 
    onClick, 
    disabled, 
    isOrdering,
    themeColor = 260
  }: { 
    label: string, 
    onClick: () => void, 
    disabled: boolean, 
    isOrdering: boolean,
    themeColor?: number
  }) => {
    const shirtRef = useRef<HTMLDivElement>(null);
    const cannonRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleLaunch = () => {
      if (disabled || isOrdering) return;

      const tl = gsap.timeline({
        onComplete: () => {
          onClick();
        }
      });

      // Reset state for potential repeat (though usually it navigates or resets cart)
      tl.set(shirtRef.current, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
      tl.set(cannonRef.current, { opacity: 0, x: -20 });
      tl.set(textRef.current, { opacity: 1, y: 0 });

      // Animation Sequence
      tl.to(shirtRef.current, {
        duration: 0.15,
        y: -15,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut"
      })
      .to(cannonRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: "back.out(2)"
      }, "-=0.2")
      .to(shirtRef.current, {
        duration: 0.6,
        x: 600,
        y: -300,
        rotation: 720,
        scale: 0.2,
        opacity: 0,
        ease: "power4.in"
      }, "+=0.1")
      .to(textRef.current, {
        duration: 0.4,
        opacity: 0,
        y: 30,
        ease: "power2.in"
      }, "<")
      .add(() => {
        if (textRef.current) {
          textRef.current.innerText = "ORDERED!";
          textRef.current.style.color = "#4ade80";
        }
      })
      .fromTo(textRef.current, 
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }
      );
    };

    return (
      <button 
        ref={buttonRef}
        disabled={disabled || isOrdering}
        onClick={handleLaunch}
        className="launch-button"
        style={{ '--hue': themeColor } as any}
      >
        <div className="launch-btn-inner">
          <div ref={shirtRef} className="launch-btn-shirt">
            <svg className="t-shirt-svg" viewBox="0 0 64.8 60.9">
              <path className="t-shirt-shirt-path" stroke="#000" strokeWidth="1" d="M90.5 151.3a9.5 4.6 0 01-9 3 9.5 4.6 0 01-9-3l-2.3.4v58.2h22.7v-58.2z" transform="matrix(1.00036 0 0 .99247 -49.2 -148.7)" />
              <path className="t-shirt-shirt-path" stroke="#000" strokeWidth="1" d="M251.8 109.2a36 17.5 0 01-34 11.6 36 17.5 0 01-33.9-11.6l-31.5 4.8l-50 50l37 36.8l13-13v142.7h130.9V187.7l13.1 13.1l36.9-36.8l-50-50z" transform="matrix(.26468 0 0 .2626 -25.2 -27.2)" />
            </svg>
          </div>
          <div ref={cannonRef} className="t-shirt-cannon">
             <svg width="80" height="40" viewBox="0 0 100 40">
                <path className="cannon-plastic" stroke="#000" strokeWidth="2" d="M10,10 h70 v20 h-70 z" />
                <rect className="cannon-band" x="65" y="8" width="12" height="24" fill="#ffd500" stroke="#000" strokeWidth="1" />
                <rect className="cannon-shine" x="20" y="12" width="30" height="3" rx="1" fill="rgba(255,255,255,0.5)" />
             </svg>
          </div>
          <div className="launch-btn-text">
            <div className="dummy">{label}</div>
            <div ref={textRef} className="text uppercase font-black text-xs tracking-[0.2em]">{isOrdering ? 'PROCESSING...' : label}</div>
          </div>
          <div className="t-shirt-container" />
        </div>
      </button>
    );
  };

  const AnimatedLoginForm = ({ onLogin }: { onLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      playSound('click');
      try {
        // Handle "Username" by converting to a pseudo-email if necessary
        let finalEmail = email.trim();
        if (!finalEmail.includes('@')) {
          finalEmail = `${finalEmail.toLowerCase()}@app.internal`;
        }

        if (isRegistering) {
          await registerWithEmail(finalEmail, password);
          addNotification("Account created successfully!");
        } else {
          await loginWithEmail(finalEmail, password);
          addNotification("Welcome back!");
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        let msg = error.message || "Auth failed";
        if (msg.includes("invalid-credential")) msg = "Invalid username or password.";
        if (msg.includes("email-already-in-use")) msg = "Username taken.";
        addNotification(msg, "error");
      } finally {
        setIsLoading(false);
      }
    };

    const handleGoogleLogin = async () => {
      playSound('click');
      setIsLoading(true);
      try {
        await onLogin();
      } catch (err: any) {
        console.error("Google Login Error:", err);
        const isIframe = window.self !== window.top;
        if (isIframe && (err.code === 'auth/popup-blocked' || err.code === 'auth/internal-error')) {
          addNotification("Google Login blocked. Please open this app in a NEW TAB to login securely.", "error");
        } else if (err.code === 'auth/popup-closed-by-user') {
          addNotification("Login cancelled. Please don't close the popup window.", "info");
        } else {
          addNotification(err.message || "Google Login failed", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="codingstella-wrapper min-h-fit py-10">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="codingstella-login_box"
        >
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="codingstella-login-header"
          >
            <span>{isRegistering ? 'Registration' : 'Security Panel'}</span>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="codingstella-input_box"
            >
              <input 
                type="text" 
                id="user" 
                className="codingstella-input-field" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label htmlFor="user" className="codingstella-label uppercase text-[10px] tracking-widest font-black">Email / Username</label>
              <User className="codingstella-icon" size={18} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="codingstella-input_box"
            >
              <input 
                type="password" 
                id="pass" 
                className="codingstella-input-field" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <label htmlFor="pass" className="codingstella-label uppercase text-[10px] tracking-widest font-black">Password</label>
              <Lock className="codingstella-icon" size={18} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="codingstella-remember-forgot"
            >
              <div className="codingstella-remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <div className="codingstella-forgot">
                <a href="#" onClick={(e) => e.preventDefault()}>Forgot?</a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="codingstella-input_box"
            >
              <button type="submit" className="codingstella-input-submit glow-effect-container text-white py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2" disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    {isRegistering ? <UserPlus size={16} /> : <LogIn size={16} />}
                    <span>{isRegistering ? 'Register Now' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-6 pt-4 border-t border-white/5"
            >
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Or continue with</p>
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm disabled:opacity-50"
                disabled={isLoading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                Google Sign In
              </button>
              
              <div className="mt-6">
                <button 
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-blue-500 hover:text-blue-400 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                </button>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    );
  };

  const EmptyPlaceholder = ({ title, message, icon: Icon, onAction, actionLabel }: any) => {
    return (
      <div className="modern-login-wrapper min-h-[500px]">
        <div className="modern-login-box">
          <div className="modern-login-header">
            <span>{title.slice(0, 5)}</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(255,140,0,0.3)]">
               <Icon size={32} />
            </div>
            <h3 className="text-xl font-black text-white">{title}</h3>
            <p className="text-sm text-white/60 font-medium px-4 leading-relaxed">{message}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
              className="modern-input-submit"
            >
              {actionLabel}
            </motion.button>
          </div>
        </div>
      </div>
    );
  };


const SourceCodeExplorerModal = ({ onClose }: { onClose: () => void }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copyAllStatus, setCopyAllStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const [copyPortableHtmlStatus, setCopyPortableHtmlStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const [manualCopyTitle, setManualCopyTitle] = useState<string>('');
  const [modalFallbackText, setModalFallbackText] = useState<string>('');
  const [syncCopied, setSyncCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/source-code/list')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
          setSelectedFile(data.files[0]);
        }
      })
      .catch(err => console.error('Error fetching file list', err));
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    setLoading(true);
    setFileContent('');
    fetch(`/api/source-code/file?path=${encodeURIComponent(selectedFile)}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setFileContent(data.content);
        } else {
          setFileContent('Error loading file: ' + (data.error || 'Unknown error'));
        }
        setLoading(false);
      })
      .catch(err => {
        setFileContent('Failed to load file content.');
        setLoading(false);
      });
  }, [selectedFile]);

  const handleSyncCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(modalFallbackText);
        setSyncCopied(true);
        setTimeout(() => setSyncCopied(false), 2500);
        return;
      }
    } catch (e) {
      console.warn("navigator.clipboard sync copy failed, trying execCommand", e);
    }

    try {
      const el = document.createElement('textarea');
      el.value = modalFallbackText;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      el.style.top = '0';
      el.style.left = '0';
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      if (success) {
        setSyncCopied(true);
        setTimeout(() => setSyncCopied(false), 2500);
      }
    } catch (e) {
      console.error("execCommand fallback copy failed synchronously:", e);
    }
  };

  const attemptCopy = async (text: string, titleForFallback: string): Promise<boolean> => {
    // 1. First try modern clipboard API directly (works if focused or not nested deeply in sandboxes)
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn("navigator.clipboard failed, using legacy", e);
    }

    // 2. Try legacy select and copy
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      if (success) return true;
    } catch (e) {
      console.error("execCommand copy failed:", e);
    }

    // 3. Fallback to user-activated secure popup
    setManualCopyTitle(titleForFallback);
    setModalFallbackText(text);
    return false;
  };

  const handleCopy = async () => {
    const success = await attemptCopy(fileContent, `${selectedFile.split('/').pop()} ফাইল কোড (FILE CODE)`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAllCombined = async () => {
    try {
      setCopyAllStatus('loading');
      const res = await fetch('/api/source-code/all-combined');
      const data = await res.json();
      if (data.combined) {
        const success = await attemptCopy(data.combined, 'সব অবিকল সোর্স ফাইল কোড (ALL SOURCE FILES)');
        if (success) {
          setCopyAllStatus('copied');
          setTimeout(() => setCopyAllStatus('idle'), 3000);
        } else {
          setCopyAllStatus('idle');
        }
      } else {
        throw new Error(data.error || 'No content');
      }
    } catch (err) {
      console.error('All copy failed', err);
      // Let's fallback directly
      setCopyAllStatus('error');
      setTimeout(() => setCopyAllStatus('idle'), 3000);
    }
  };

  const handleCopyPortableHtml = async () => {
    try {
      setCopyPortableHtmlStatus('loading');
      const res = await fetch('/api/source-code/portable-html-text');
      const data = await res.json();
      if (data.html) {
        const success = await attemptCopy(data.html, 'CRM Portable Standalone HTML Source');
        if (success) {
          setCopyPortableHtmlStatus('copied');
          setTimeout(() => setCopyPortableHtmlStatus('idle'), 3000);
        } else {
          setCopyPortableHtmlStatus('idle');
        }
      } else {
        throw new Error(data.error || 'No content');
      }
    } catch (err) {
      console.error('Portable HTML copy failed', err);
      setCopyPortableHtmlStatus('error');
      setTimeout(() => setCopyPortableHtmlStatus('idle'), 3000);
    }
  };

  const filteredContent = useMemo(() => {
    if (!searchQuery) return fileContent;
    const lines = fileContent.split('\n');
    return lines
      .map((line, idx) => ({ line, num: idx + 1 }))
      .filter(item => item.line.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(item => `L${item.num}: ${item.line}`)
      .join('\n') || '// No lines match search query';
  }, [fileContent, searchQuery]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 shadow-2xl" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-[32px] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-150 dark:border-slate-800/80 flex flex-col xl:flex-row gap-4 justify-between xl:items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-black text-slate-150 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Code size={18} className="text-red-600 animate-pulse" /> Complete System Code Explorer
            </h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              Read, copy, search or download any part of the website source code
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Combined Code Button */}
            <button
              onClick={handleCopyAllCombined}
              disabled={copyAllStatus === 'loading'}
              className={`px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer ${
                copyAllStatus === 'copied'
                  ? 'bg-emerald-600 text-white animate-bounce'
                  : copyAllStatus === 'loading'
                  ? 'bg-amber-500 text-white animate-pulse cursor-wait'
                  : copyAllStatus === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {copyAllStatus === 'copied' ? (
                <>
                  <Check size={11} /> সব অবিকল সোর্স কোড কপি সম্পন্ন!
                </>
              ) : copyAllStatus === 'loading' ? (
                'কপি হচ্ছে...'
              ) : (
                <>
                  <Copy size={11} /> Raw কোড কপি করুন (COPY SOURCES)
                </>
              )}
            </button>

            {/* Copy Portable HTML Button */}
            <button
              onClick={handleCopyPortableHtml}
              disabled={copyPortableHtmlStatus === 'loading'}
              className={`px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer ${
                copyPortableHtmlStatus === 'copied'
                  ? 'bg-emerald-600 text-white animate-bounce'
                  : copyPortableHtmlStatus === 'loading'
                  ? 'bg-amber-500 text-white animate-pulse cursor-wait'
                  : copyPortableHtmlStatus === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {copyPortableHtmlStatus === 'copied' ? (
                <>
                  <Check size={11} /> HTML কোড কপি সম্পন্ন! (পদ্ধতি: Copy HTML)
                </>
              ) : copyPortableHtmlStatus === 'loading' ? (
                'রেন্ডারিং হচ্ছে...'
              ) : (
                <>
                  <Copy size={11} /> ১ ক্লিকে HTML কোড কপি (COPY PORTABLE HTML)
                </>
              )}
            </button>

            {/* Direct HTML File Download */}
            <a
              href="/api/source-code/download-portable-html"
              className="px-3 py-2 text-[9px] bg-[#bf0528] hover:bg-red-800 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Download size={11} /> HTML ফাইল ডাউনলোড (DOWNLOAD HTML)
            </a>

            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar file list */}
          <div className="w-full md:w-56 border-r border-slate-100 dark:border-slate-800/80 p-4 overflow-y-auto space-y-1 bg-slate-50/50 dark:bg-slate-950/25 shrink-0">
            <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block px-2 mb-2">Workspace Files</span>
            {files.map(file => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2 rounded-xl text-xs font-semibold tracking-wide transition-all truncate flex items-center gap-2 ${
                  selectedFile === file 
                    ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 shadow-sm font-black" 
                    : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedFile === file ? "bg-red-500 shadow-md" : "bg-slate-400 dark:bg-slate-600"}`}></div>
                {file.split('/').pop()}
                <span className="text-[8px] text-slate-400 font-normal ml-auto opacity-75">{file.includes('/') ? `/${file.split('/')[0]}` : ''}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-300">
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={14} className="text-slate-500 ml-2" />
                <input 
                  type="text"
                  placeholder="Search code line/keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600 font-semibold"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white text-xs px-2 font-black uppercase">Clear</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={loading}
                  className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="text-emerald-500 font-black animate-bounce" size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> Copy to Clipboard
                    </>
                  )}
                </button>
                <a
                  href="/api/source-code/download-zip"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-red-950/25 cursor-pointer"
                >
                  <Download size={11} /> Download ZIP
                </a>
                <a
                  href="/api/source-code/download-portable-html"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950/25 cursor-pointer"
                >
                  <Download size={11} /> Standalone HTML
                </a>
              </div>
            </div>

            {/* Code view pane */}
            <div className="flex-1 overflow-auto font-mono text-xs p-4 leading-relaxed bg-slate-950/95 select-text selection:bg-red-900/30 selection:text-white">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                  <div className="w-5 h-5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] uppercase font-black tracking-widest mt-2 animate-pulse">Fetching safe content...</span>
                </div>
              ) : (
                <pre className="whitespace-pre overflow-x-auto select-text scrollbar-thin">
                  <code>{filteredContent}</code>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800/80 text-center text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between px-6">
          <span>Path: <strong className="text-slate-700 dark:text-gray-300">{selectedFile || "None"}</strong></span>
          <span className="text-slate-400">Lines Count: {fileContent.split('\n').length} lines</span>
        </div>
      </div>

      {/* Manual Copy Fallback Dialog */}
      {modalFallbackText && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[110] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  নিরাপত্তা জনিত কারণে ম্যানুয়াল কপি প্রয়োজন (Manual Action Required)
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2">
                  {manualCopyTitle}
                </h4>
              </div>
              <button 
                onClick={() => { setModalFallbackText(''); setSyncCopied(false); }}
                className="p-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg text-xs font-bold text-slate-500 dark:text-gray-300"
              >
                বন্ধ করুন (CLOSE)
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-bold">
                💡 আইফ্রেম প্রোটেকশন বা ব্রাউজার সিকিউরিটির জন্য কপি করতে না পারলে - নিচে দেওয়া যেকোনো ১-ক্লিক অপশন ব্যবহার করুন:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <button
                  onClick={handleSyncCopy}
                  className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    syncCopied 
                      ? 'bg-emerald-600 text-white animate-bounce shadow-md' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  }`}
                >
                  {syncCopied ? (
                    <>
                      <Check size={14} className="font-extrabold animate-pulse" /> কপি সফল হয়েছে! (COPIED)
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> 📋 ১-ক্লিকে কপি করুন (COPY NOW)
                    </>
                  )}
                </button>
                <a
                  href="/api/source-code/download-portable-html"
                  className="px-4 py-3 bg-[#bf0528] hover:bg-red-850 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <Download size={13} /> 📥 HTML ফাইল ডাউনলোড (DOWNLOAD FILE)
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold">
              অথবা নিচের বাক্সে একটি ক্লিক করুন (সব কোড অটো-সিলেক্ট হবে), তারপর কিবোর্ড এর <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 dark:text-gray-200 border border-slate-200 dark:border-slate-800 rounded font-bold text-[10px]">Ctrl + A</kbd> ও <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 dark:text-gray-200 border border-slate-200 dark:border-slate-800 rounded font-bold text-[10px]">Ctrl + C</kbd> চেপে কপি করে নিন।
            </p>

            <textarea
              readOnly
              value={modalFallbackText}
              onFocus={e => e.target.select()}
              onClick={e => (e.target as HTMLTextAreaElement).select()}
              className="w-full flex-1 min-h-[200px] h-48 p-4 text-xs font-mono bg-slate-950 text-emerald-400 border border-slate-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none select-all selection:bg-rose-950/50"
              placeholder="কোড প্রস্তুত হচ্ছে..."
            />

            <div className="flex gap-3 justify-end items-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mr-auto">
                {modalFallbackText.length} characters | {(modalFallbackText.length / 1024).toFixed(1)} KB
              </span>
              <button 
                onClick={() => { setModalFallbackText(''); setSyncCopied(false); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                ঠিক আছে (DONE)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const MePage = ({ 
    isDarkMode, 
    setIsDarkMode, 
    customLogo, 
    setCustomLogo, 
    customIntroMusic,
    setCustomIntroMusic,
    customClickSound,
    setCustomClickSound,
    offersMusic,
    setOffersMusic,
    sliderImages,
    setSliderImages,
    onBackup, 
    onOpenCalculator,
    onLock,
    adminPassword,
    setAdminPassword,
    user,
    onRecordPayment,
    clients,
    withPassword
  }: { 
    isDarkMode: boolean, 
    setIsDarkMode: (v: boolean) => void, 
    customLogo: string | null, 
    setCustomLogo: (v: string | null) => void, 
    customIntroMusic: string | null,
    setCustomIntroMusic: (v: string | null) => void,
    customClickSound: string | null,
    setCustomClickSound: (v: string | null) => void,
    offersMusic: string | null,
    setOffersMusic: (v: string | null) => void,
    sliderImages: string[],
    setSliderImages: (v: string[]) => void,
    onBackup: () => void, 
    onOpenCalculator: () => void,
    onLock: () => void,
    adminPassword: string,
    setAdminPassword: (v: string) => void,
    user: FirebaseUser | null,
    onRecordPayment: (clientId: number, amount: number, type: 'Cash' | 'Bkash' | 'Bank' | 'Nagad', purpose: string) => void,
    clients: Client[],
    withPassword: (action: () => void, strict?: boolean) => void
  }) => {
    const [showGateway, setShowGateway] = useState(false);
    const [rules, setRules] = useState<string[]>(() => {
      const saved = localStorage.getItem('companyRules');
      return saved ? JSON.parse(saved) : [
        "Warranty is valid only with original invoice.",
        "No return after 7 days of installation.",
        "Service charge applies for out-of-warranty visits."
      ];
    });
    const [showEditRules, setShowEditRules] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showCodeExplorer, setShowCodeExplorer] = useState(false);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && user) {
        if (file.size > 10 * 1024 * 1024) {
          addNotification("File too large! Max 10MB.", "error");
          return;
        }

        setIsLogoUploading(true);
        addNotification("Preparing logo for upload...");
        try {
          // If it's a GIF, we skip canvas optimization to preserve animation
          const isGif = file.type === 'image/gif';
          
          if (!isGif) {
            // Optimization for non-GIFs
            const img = new Image();
            const url = URL.createObjectURL(file);
            const optimizedBlob = await new Promise<Blob | null>((resolve, reject) => {
              img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 800;
                if (width > height && width > MAX_SIZE) {
                  height *= MAX_SIZE / width;
                  width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                  width *= MAX_SIZE / height;
                  height = MAX_SIZE;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  // Crop to square for perfect circle ("goal")
                  const size = Math.min(img.width, img.height);
                  const offsetX = (img.width - size) / 2;
                  const offsetY = (img.height - size) / 2;
                  
                  canvas.width = 512;
                  canvas.height = 512;
                  
                  ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 512, 512);
                  canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.9);
                } else {
                  reject(new Error("Canvas context failed"));
                }
                URL.revokeObjectURL(url);
              };
              img.onerror = () => reject(new Error("Failed to load image"));
              img.src = url;
            });

            if (optimizedBlob) {
              addNotification("Uploading as optimized WebP...");
              const storageRef = ref(storage, `settings/logo_${Date.now()}.webp`);
              const uploadTask = await uploadBytes(storageRef, optimizedBlob);
              const downloadUrl = await getDownloadURL(uploadTask.ref);
              setCustomLogo(downloadUrl);
              localStorage.setItem('cctv_custom_logo', downloadUrl);
              addNotification("Logo updated successfully!", "success");
            } else {
              throw new Error("Optimization failed");
            }
          } else {
            // Direct upload for GIFs
            addNotification("Uploading GIF logo...");
            const storageRef = ref(storage, `settings/logo_${Date.now()}.gif`);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(uploadTask.ref);
            setCustomLogo(downloadUrl);
            localStorage.setItem('cctv_custom_logo', downloadUrl);
            addNotification("GIF Logo uploaded successfully!", "success");
          }
        } catch (error: any) {
          console.error("Logo upload error:", error);
          addNotification("Upload failed: " + (error.message || "Unknown error"), "error");
        } finally {
          setIsLogoUploading(false);
        }
      }
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'intro' | 'click') => {
      const file = e.target.files?.[0];
      if (file && user) {
        // Check file size (limit to 1MB for Firestore/LocalStorage)
        if (file.size > 1024 * 1024) {
          addNotification("Audio file too large! Max 1MB limit for smooth loading.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          
          // Test the audio playback immediately
          const audio = new Audio(base64);
          audio.volume = 1.0;
          audio.play().catch(err => {
            console.error("Audio playback test failed:", err);
            addNotification("Audio format issue. Please try a different mp3.");
          });

          if (type === 'intro') {
            setCustomIntroMusic(base64);
            localStorage.setItem('cctv_custom_intro_music', base64);
            addNotification("Intro music updated! Playing preview...");
          } else {
            setCustomClickSound(base64);
            localStorage.setItem('cctv_custom_click_sound', base64);
            addNotification("Click sound updated! Playing preview...");
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleOffersMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && user) {
        // Check file size (limit to 300MB as requested)
        if (file.size > 300 * 1024 * 1024) {
          addNotification("File too large! Max 300MB.");
          return;
        }
        
        // Password protection for upload
        withPassword(() => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // Warn if over 1MB for Firestore
            if (base64.length > 1000000) {
              addNotification("Warning: Large files may fail to sync to cloud. Recommended < 1MB.");
            }
            setOffersMusic(base64);
            localStorage.setItem('cctv_offers_music', base64);
            addNotification("Offers background music updated!");
          };
          reader.readAsDataURL(file);
        }, true); // strict = true for admin only
      }
    };

    const removeOffersMusic = () => {
      withPassword(() => {
        setOffersMusic(null);
        localStorage.removeItem('cctv_offers_music');
        addNotification("Offers background music removed.");
      }, true);
    };

    const clientData = useMemo(() => {
      if (!user) return null;
      return clients.find(c => 
        (user.email && c.email === user.email) || 
        c.phone === user.phoneNumber || 
        c.name === user.displayName
      );
    }, [user, clients]);

    const handleChangePassword = () => {
      if (oldPass !== adminPassword) {
        addNotification("Old password incorrect!");
        return;
      }
      if (newPass !== confirmPass) {
        addNotification("Passwords do not match!");
        return;
      }
      if (newPass.length < 4) {
        addNotification("Password too short!");
        return;
      }
      setAdminPassword(newPass);
      localStorage.setItem('adminPassword', newPass);
      addNotification("Password changed successfully!");
      setShowChangePassword(false);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    };

    useEffect(() => {
      localStorage.setItem('companyRules', JSON.stringify(rules));
    }, [rules]);

    const importAppData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const userId = user.uid;
          
          if (data.products) {
            const products = JSON.parse(data.products);
            for (const p of products) {
              await setDoc(doc(db, 'products', String(p.id)), p);
            }
          }
          if (data.clients) {
            const clients = JSON.parse(data.clients);
            for (const c of clients) {
              await setDoc(doc(db, 'clients', String(c.id)), c);
            }
          }
          if (data.expenses) {
            const expenses = JSON.parse(data.expenses);
            for (const ex of expenses) {
              await setDoc(doc(db, 'expenses', String(ex.id)), ex);
            }
          }
          if (data.customLogo) setCustomLogo(data.customLogo);
          if (data.darkMode !== undefined) setIsDarkMode(data.darkMode);
          
          alert("Data restored to cloud successfully!");
        } catch (err) {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };

    const syncLocalToCloud = async () => {
      if (!user) {
        addNotification("Please login first!");
        return;
      }
      addNotification("Syncing local data...");
      
      try {
        const batch = writeBatch(db);
        let writeCount = 0;

        const localProducts = localStorage.getItem('cctv_products');
        if (localProducts) {
          const items = JSON.parse(localProducts);
          for (const p of items) {
            batch.set(doc(db, 'products', String(p.id)), p);
            writeCount++;
          }
        }
        
        const localClients = localStorage.getItem('cctv_clients');
        if (localClients) {
          const items = JSON.parse(localClients);
          for (const c of items) {
            batch.set(doc(db, 'clients', String(c.id)), c);
            writeCount++;
          }
        }
        
        const localExpenses = localStorage.getItem('cctv_expenses');
        if (localExpenses) {
          const items = JSON.parse(localExpenses);
          for (const e of items) {
            batch.set(doc(db, 'expenses', e.id), e);
            writeCount++;
          }
        }
        
        if (writeCount > 0) {
          await batch.commit();
          addNotification("Sync complete!");
        } else {
          addNotification("No local data found to sync.");
        }
      } catch (err) {
        console.error("Sync error:", err);
        addNotification("Sync failed. Check console.");
      }
    };

    const shareApp = () => {
      const publicUrl = "https://ais-pre-niyxx6qax65fz4eyeiue32-100814937973.asia-southeast1.run.app";
      navigator.clipboard.writeText(publicUrl);
      addNotification("Public App link copied to clipboard!");
    };

    return (
      <div className="space-y-6 pb-24">
        {/* Profile Header */}
        {isAdmin && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16" />
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/40 overflow-hidden border-4 border-white dark:border-slate-800">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user?.displayName?.[0] || 'U'
                  )}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.displayName || 'User'}</h2>
                <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {isAdmin ? 'Administrator' : 'Client'}
                  </span>
                  {clientData && (
                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Active Connection
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isAdmin && clientData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Paid</p>
                <h4 className="text-xl font-black text-green-600">{formatCurrency(clientData.totalPaid)}</h4>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Due</p>
                <h4 className="text-xl font-black text-red-600">{formatCurrency(clientData.due)}</h4>
              </div>
            </div>
            
            <div className="flex gap-3">
              {clientData.due > 0 && (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGateway(true)}
                  className="flex-1 py-4 bg-gradient-to-r from-[#D12053] to-[#F7941D] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} />
                  Pay Due Bill
                </motion.button>
              )}
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab('support');
                  // We could auto-fill the ticket form here if we had a way to pass state
                }}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2"
              >
                <ArrowUpCircle size={18} />
                Upgrade Plan
              </motion.button>
            </div>
          </div>
        )}

        {/* Payment History */}
        {isAdmin && clientData && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold text-lg">Payment History</h3>
            </div>
            <div className="space-y-4">
              {clientData.paymentHistory && clientData.paymentHistory.length > 0 ? (
                clientData.paymentHistory.map((payment: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{payment.type}</p>
                      <h4 className="font-bold text-green-600">+{formatCurrency(payment.amount)}</h4>
                      <p className="text-[10px] text-slate-500">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg text-[8px] font-black uppercase">Success</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm italic">No payments recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Order History */}
        {isAdmin && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                <History size={20} />
              </div>
              <h3 className="font-bold text-lg">Order History</h3>
            </div>
            <div className="space-y-4">
              {clientData?.orders && clientData.orders.length > 0 ? (
                clientData.orders.map((order: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Order #{order.id}</p>
                      <h4 className="font-bold text-slate-900 dark:text-white">{formatCurrency(order.total)}</h4>
                      <p className="text-[10px] text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => generateReceiptPDF(order)}
                      className="p-3 bg-white dark:bg-slate-800 text-blue-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm italic">No orders found yet.</p>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {isAdmin && showGateway && clientData && (
            <PaymentGateway 
              amount={clientData.due} 
              onClose={() => setShowGateway(false)} 
              onComplete={(type) => {
                setShowGateway(false);
                onRecordPayment(clientData.id, clientData.due, type as any, 'Bill Payment');
                addNotification(`Payment of ${formatCurrency(clientData.due)} successful via ${type}!`);
              }} 
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-0 flex flex-col items-center text-center h-fit overflow-hidden border-none shadow-none bg-transparent">
            {!user && !staffUser ? (
              <div className="w-full">
                <AnimatedLoginForm onLogin={loginWithGoogle} />
              </div>
            ) : (
              <div className="p-6 w-full flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-slate-800 text-white flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white shadow-2xl overflow-hidden">
                    {user?.photoURL || staffUser ? (
                      <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffUser?.name || 'Staff'}`} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      (user?.displayName || staffUser?.name || 'U').charAt(0)
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                    <ShieldCheck size={14} />
                  </div>
                  {isAdmin && (
                    <label className={`absolute bottom-4 right-0 p-2 ${isLogoUploading ? 'bg-slate-400' : 'bg-blue-600'} text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors`}>
                      {isLogoUploading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                      <input disabled={isLogoUploading} type="file" className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e)} />
                    </label>
                  )}
                </div>
                <h3 className="text-xl font-bold mt-2">{user?.displayName || staffUser?.name || 'User Profile'}</h3>
                <p className="text-gray-500 text-xs mb-4">{user?.email || (staffUser ? 'Staff Member' : 'System User')}</p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {isAdmin ? 'Administrator' : (staffUser ? 'Staff Member' : 'Client')}
                  </span>
                  {clientProfile && (
                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Verified Client
                    </span>
                  )}
                </div>

                <div className="flex flex-col w-full gap-3">
                  {isAdmin && <button className="text-[10px] text-blue-600 hover:underline" onClick={() => setCustomLogo(null)}>Reset Logo</button>}
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10"
                  >
                    <LogOut size={16} /> Logout System
                  </button>
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-6">
                <button 
                  onClick={() => withPassword(shareApp)}
                  className="p-4 glass-card flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-blue-200 dark:border-blue-900/30 w-full"
                >
                  <Share2 className="text-blue-500" />
                  <span className="text-xs font-bold">লিংক শেয়ার</span>
                </button>
                <button 
                  onClick={() => withPassword(migrateDataToGlobal)}
                  className="p-4 glass-card flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors border-orange-200 dark:border-orange-900/30"
                >
                  <RefreshCcw className="text-orange-500" />
                  <span className="text-xs font-bold">Restore Data</span>
                </button>
                <button 
                  onClick={() => withPassword(syncLocalToCloud)}
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 hover:bg-purple-100 transition-colors"
                >
                  <CloudUpload size={20} />
                  <div className="text-left">
                    <p className="text-xs font-bold">Sync Cloud</p>
                    <p className="text-[10px] opacity-70">Force update</p>
                  </div>
                </button>
                <button 
                  onClick={onLock}
                  className="p-4 glass-card flex flex-col items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-red-200 dark:border-red-900/30"
                >
                  <Lock className="text-red-500" />
                  <span className="text-xs font-bold">Lock Admin</span>
                </button>
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="p-4 glass-card flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-blue-200 dark:border-blue-900/30"
                >
                  <Key className="text-blue-500" />
                  <span className="text-xs font-bold">Change Pass</span>
                </button>
              </div>
            )}
          </div>

            {isAdmin && showChangePassword && (
              <div className="mt-6 p-6 glass-card w-full text-left space-y-4 border-blue-200 dark:border-blue-900/30">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Key size={16} className="text-blue-500" /> Change Admin Password
                </h4>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Old Password"
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={oldPass}
                    onChange={e => setOldPass(e.target.value)}
                  />
                  <input 
                    type="password" 
                    placeholder="New Password"
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password"
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                  />
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleChangePassword}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
                    >
                      Update Password
                    </button>
                    <button 
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-xl font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {isAdmin && user && (
              <div className="mt-8 p-4 glass-card w-full text-left">
                <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">System Debug</h4>
                <p className="text-[10px] text-gray-500 break-all">UID: {user.uid}</p>
                <div className="flex gap-4 mt-1">
                  <p className="text-[10px] text-gray-500">Products: <span className="font-bold text-blue-600">{products.length}</span></p>
                  <p className="text-[10px] text-gray-500">Clients: <span className="font-bold text-blue-600">{clients.length}</span></p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="mt-3 text-[10px] text-red-500 font-bold underline flex items-center gap-1"
                >
                  <RefreshCcw size={10} /> Clear Local Cache & Reload
                </button>
              </div>
            )}

        {isAdmin && (
          <div className="space-y-6">
              {/* Customization */}
              <div className="glass-card p-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Customization</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        {customLogo ? (
                          <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">Custom Logo</p>
                        <p className="text-[10px] text-gray-500">Change brand identity</p>
                      </div>
                    </div>
                    <label className={`px-4 py-2 ${isLogoUploading ? 'bg-slate-400' : 'bg-blue-600'} text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2`}>
                      {isLogoUploading && <RefreshCw size={12} className="animate-spin" />}
                      {isLogoUploading ? 'Uploading...' : 'Upload'}
                      <input disabled={isLogoUploading} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>

                  {/* Banner images section stays */}
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Promo Slider Images</p>
                        <p className="text-[10px] text-gray-500">Add banner images ({sliderImages.length} saved)</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {sliderImages.length > 0 && (
                        <button 
                          onClick={() => {
                            setSliderImages([]);
                            localStorage.removeItem('cctv_slider_images');
                            addNotification("Promo sliders cleared!");
                          }}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <label className={`px-4 py-2 ${isLogoUploading ? 'bg-slate-400' : 'bg-purple-600'} text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors flex items-center gap-2`}>
                        {isLogoUploading && <RefreshCw size={12} className="animate-spin" />}
                        {isLogoUploading ? 'Uploading...' : 'Add Image'}
                        <input disabled={isLogoUploading} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (sliderImages.length >= 8) {
                              addNotification("Maximum 8 banner images allowed.");
                              return;
                            }

                            setIsLogoUploading(true);
                            addNotification("Uploading banner...");
                            try {
                              const storageRef = ref(storage, `settings/slider_${Date.now()}_${file.name}`);
                              const uploadTask = await uploadBytes(storageRef, file);
                              const downloadUrl = await getDownloadURL(uploadTask.ref);
                              const newImages = [...sliderImages, downloadUrl];
                              setSliderImages(newImages);
                              localStorage.setItem('cctv_slider_images', JSON.stringify(newImages));
                              addNotification("Banner image added successfully!");
                            } catch (error: any) {
                              console.error("Slider upload error:", error);
                              addNotification("Upload failed: " + error.message);
                            } finally {
                              setIsLogoUploading(false);
                            }
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular non-admin visible sections in the right column */}
          <div className="space-y-6">
            {/* Theme Preference / Dark Mode Toggle */}
            <div className="glass-card p-6 space-y-4">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Appearance Settings</h4>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-blue-950/40 text-orange-500 dark:text-blue-400 flex items-center justify-center transition-all duration-300">
                    {isDarkMode ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-yellow-500" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode Preference</p>
                    <p className="text-[10px] text-slate-500 font-medium">Switch between light and dark themes</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label="Toggle dark mode"
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                    isDarkMode ? "bg-blue-600" : "bg-slate-200"
                  )}
                  role="switch"
                  aria-checked={isDarkMode}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Theme quick selector grids */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsDarkMode(false)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all",
                    !isDarkMode 
                      ? "bg-white border-blue-500 text-blue-600 shadow-md shadow-blue-500/10" 
                      : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Sun size={14} /> Light Mode
                </button>
                <button
                  onClick={() => setIsDarkMode(true)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-700 text-blue-400 shadow-lg shadow-black/40" 
                      : "bg-slate-50/50 border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Moon size={14} /> Dark Mode
                </button>
              </div>
            </div>

            {/* Company Information */}
            <div className="glass-card p-6 space-y-4">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Company Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                      <Construction size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Address</p>
                      <p className="text-xs text-gray-500">Jatrabari Sohid Faruk road Dhaka 1204</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                      <MessageSquare size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">WhatsApp</p>
                      <a href="https://wa.me/8801817681233" className="text-xs text-blue-600 font-medium hover:underline">01817681233</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                      <Smartphone size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Call</p>
                      <a href="tel:01410381233" className="text-xs text-blue-600 font-medium hover:underline">01410381233</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Features */}
              <div className="glass-card p-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">App Features</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                    <Zap size={18} className="text-blue-600" />
                    <span className="text-xs font-bold">High Speed Bandwidth Test</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                    <Zap size={18} className="text-orange-600" />
                    <span className="text-xs font-bold">Turbo Mode Speed Test</span>
                  </div>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card overflow-hidden h-fit">
              <div className="p-4 border-b dark:border-slate-800 font-bold text-sm flex justify-between items-center">
                Company Rules
                {isAdmin && <button onClick={() => setShowEditRules(true)} className="text-blue-600"><Plus size={16} /></button>}
              </div>
              <div className="p-4 space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && showEditRules && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowEditRules(false)}>
                <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold mb-4">Edit Company Rules</h3>
                  <textarea 
                    className="w-full h-40 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-none text-sm"
                    value={rules.join('\n')}
                    onChange={(e) => setRules(e.target.value.split('\n'))}
                  />
                  <button 
                    onClick={() => setShowEditRules(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-4"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="space-y-6">
                <div className="glass-card p-4 space-y-4">
                  <h4 className="font-bold text-sm">System Tools</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={onOpenCalculator}
                      className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold"
                    >
                      <Calculator size={16} /> Calculator
                    </button>
                    <button 
                      onClick={onBackup}
                      className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold"
                    >
                      <RefreshCcw size={16} /> Backup
                    </button>
                    <button 
                      onClick={() => withPassword(() => setShowCodeExplorer(true))}
                      className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800/80 hover:dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl flex items-center gap-2 text-xs font-bold col-span-2 justify-center border border-blue-100/50 dark:border-slate-700/50 transition-colors shadow-sm"
                    >
                      <Code size={16} /> View & Export Source Code
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-3 gap-3 glass-card">
                  <button 
                    onClick={() => shareApp()}
                    className="flex flex-col items-center gap-1 p-2"
                  >
                    <Share2 size={18} className="text-blue-500" />
                    <span className="text-[8px] font-bold">Share Link</span>
                  </button>
                  <label className="flex flex-col items-center gap-1 p-2 cursor-pointer">
                    <RefreshCcw size={18} className="text-amber-500" />
                    <span className="text-[8px] font-bold">Restore</span>
                    <input type="file" className="hidden" accept=".json" onChange={(e) => withPassword(() => importAppData(e))} />
                  </label>
                  <button 
                    onClick={() => onBackup()}
                    className="flex flex-col items-center gap-1 p-2"
                  >
                    <Database size={18} className="text-slate-500" />
                    <span className="text-[8px] font-bold">Inventory</span>
                  </button>
                </div>
              </div>
            )}

            {showCodeExplorer && <SourceCodeExplorerModal onClose={() => setShowCodeExplorer(false)} />}
          </div>
        </div>
      );
    };

  const ExpensePage = () => {
    const [showAdd, setShowAdd] = useState(false);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="space-y-4 pb-20 md:pb-0">
        <div className="glass-card p-6 bg-gradient-to-br from-red-500 to-orange-600 text-white">
          <p className="text-xs font-bold uppercase opacity-80">Total Expenses</p>
          <h2 className="text-3xl font-bold mt-1">{formatCurrency(totalExpenses)}</h2>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="font-bold">Recent Expenses</h3>
          <button 
            onClick={() => withPassword(() => setShowAdd(true))}
            aria-label="Add new expense"
            className="p-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm italic col-span-full">No expenses recorded</p>
          ) : (
            expenses.map(exp => (
              <div key={exp.id} className="glass-card p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{exp.category}</p>
                    <p className="text-[10px] text-gray-500">{exp.date} • {exp.description}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-500">-{formatCurrency(exp.amount)}</span>
              </div>
            ))
          )}
        </div>

        <AnimatePresence>
          {showAdd && (
            <AddExpenseModal onClose={() => setShowAdd(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  };

    const AddClientModal = ({ onClose }: { onClose: () => void }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
    const [warrantyExpiry, setWarrantyExpiry] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !phone) return;
      handleAddClient({
        name,
        phone,
        email,
        address,
        installationDate,
        warrantyExpiry,
        notes,
        status: ClientStatus.ACTIVE
      });
      onClose();
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-[450px] glow-effect-container text-white rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-black mb-6">Add New Client</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter client name" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address (Optional)</label>
              <input 
                type="email" 
                placeholder="client@example.com" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 017XXXXXXXX" 
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Installation Date</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={installationDate}
                  onChange={e => setInstallationDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Warranty Expiry</label>
              <input 
                type="date" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                value={warrantyExpiry}
                onChange={e => setWarrantyExpiry(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Address</label>
              <textarea 
                placeholder="Enter client address" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20 min-h-[60px]"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Notes</label>
              <textarea 
                placeholder="Additional notes about client or installation" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20 min-h-[60px]"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl opacity-90 hover:opacity-100 mt-4"
            >
              Add Client
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const AddExpenseModal = ({ onClose }: { onClose: () => void }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>(expenseCategories[0] || 'Other');
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!amount || !description) return;
      
      let finalCategory = category;
      if (showNewCategoryInput && newCategory.trim()) {
        finalCategory = newCategory.trim();
        if (!expenseCategories.includes(finalCategory)) {
          setExpenseCategories(prev => [...prev, finalCategory]);
        }
      }

      handleAddExpense({
        amount: Number(amount),
        description,
        category: finalCategory,
        date: new Date().toLocaleDateString()
      });
      onClose();
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-black mb-6">Add Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Amount</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
              <input 
                type="text" 
                placeholder="e.g. Office Rent" 
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                <button 
                  type="button"
                  onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                  className="text-[10px] font-bold text-blue-600 uppercase tracking-widest"
                >
                  {showNewCategoryInput ? 'Select Existing' : '+ New Category'}
                </button>
              </div>
              
              {showNewCategoryInput ? (
                <input 
                  type="text" 
                  placeholder="Enter new category" 
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  required
                />
              ) : (
                <select 
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {Array.from(new Set(expenseCategories)).map((cat, idx) => (
                    <option key={`${cat}-${idx}`} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl opacity-90 hover:opacity-100 mt-4"
            >
              Save Expense
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // --- Main Render ---

  // Helper to ensure all product categories are in our management system
  const syncMissingCategories = () => {
    setProductCategories(prev => {
      const existingNames = new Set(prev.map(c => c.name.toLowerCase()));
      const missingNames = Array.from(new Set(products.map(p => p.category)))
        .filter(name => name && !existingNames.has(name.toLowerCase()));
      
      if (missingNames.length === 0) return prev;
      
      const newCats: CategoryData[] = missingNames.map(name => ({
        id: `sync_${Date.now()}_${name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 9)}`,
        name: name
      }));
      
      // We use a small timeout for the notification to avoid issue with state updates
      setTimeout(() => addNotification(`Synced ${newCats.length} missing categories found from products.`), 100);
      return [...prev, ...newCats];
    });
  };

  // Cleanup duplicate categories if any
  useEffect(() => {
    if (productCategories.length > 0) {
      const seenIds = new Set();
      const unique = productCategories.filter(cat => {
        if (seenIds.has(cat.id)) return false;
        seenIds.add(cat.id);
        return true;
      });
      
      if (unique.length !== productCategories.length) {
        setProductCategories(unique);
        localStorage.setItem('cctv_product_categories', JSON.stringify(unique));
      }
    }
  }, [productCategories]);

  useEffect(() => {
    if (isAdmin && products.length > 0) {
      syncMissingCategories();
    }
  }, [products.length, isAdmin]);

  return (
    <div className="w-full max-w-[100vw] mx-auto min-h-screen relative overflow-hidden flex flex-col bg-white dark:bg-slate-950 font-sans">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen 
            customLogo={customLogo} 
            onEnter={handleSplashEnter} 
            onPlay={handlePlayIntro} 
            hasMusic={true} 
            isLoading={isInitialLoad} 
          />
        )}
      </AnimatePresence>

      {!showSplash && (
        <div className="flex-1 flex flex-col min-h-screen">
          <TopHeader 
            user={user}
            isAdmin={!!isAdmin}
            cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
            onShowCart={() => setShowCart(true)}
            onLogout={handleLogout}
            onShowLogin={() => setShowPasswordModal(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            customLogo={customLogo}
          />

          <div className="flex-1 flex overflow-hidden">
            <main className={cn(
              "flex-1 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)] transition-all duration-300"
            )}>
              <div className={cn(
                "w-full h-full pb-28",
                activeTab === 'shop-view' || activeTab === 'dashboard' ? "max-w-none" : "max-w-7xl mx-auto p-4 md:p-8"
              )}>
              {activeTab === 'dashboard' && (isAdmin ? <Dashboard 
                products={products}
                clients={clients}
                publicOrders={publicOrders}
                expenses={expenses}
                sliderImages={sliderImages}
                offers={offers}
                formatCurrency={formatCurrency}
                addToCart={addToCart}
                setActiveTab={setActiveTab}
                setSelectedProduct={setSelectedProduct}
                setShowAddProduct={(v) => v ? withPassword(() => setShowAddProduct(v), true) : setShowAddProduct(v)}
                onEditProduct={(p) => withPassword(() => setShowEditProduct(p), true)}
                isAdmin={isAdmin}
                isDarkMode={isDarkMode}
                productCategories={productCategories}
                deleteAnyOrder={deleteAnyOrder}
              /> : <PublicStore products={products} sliderImages={sliderImages} offers={offers} formatCurrency={formatCurrency} addToCart={addToCart} setActiveTab={setActiveTab} setSelectedProduct={setSelectedProduct} productCategories={productCategories} />)}
              {activeTab === 'shop-view' && <PublicStore products={products} sliderImages={sliderImages} offers={offers} formatCurrency={formatCurrency} addToCart={addToCart} setActiveTab={setActiveTab} setSelectedProduct={setSelectedProduct} productCategories={productCategories} />}
              {activeTab === 'manage-services' && isAdmin && (
                <ManageServices withPassword={withPassword} />
              )}
              {activeTab === 'offers' && (
                <OffersPage 
                  isAdmin={isAdmin}
                  offers={offers}
                  user={user}
                  addNotification={addNotification}
                  withPassword={withPassword}
                />
              )}
              {activeTab === 'my-orders' && (
                <MyOrdersPage 
                  user={user} 
                  clients={clients} 
                  formatCurrency={formatCurrency} 
                  isAdmin={isAdmin} 
                  acceptPublicOrder={acceptPublicOrder} 
                  addNotification={addNotification}
                  deleteAnyOrder={deleteAnyOrder}
                />
              )}
              {activeTab === 'clients' && isAdmin && (
                <ClientList 
                  clients={clients}
                  formatCurrency={formatCurrency}
                  setShowClientProfile={setShowClientProfile}
                  withPassword={withPassword}
                  setShowAddClient={setShowAddClient}
                />
              )}
              {activeTab === 'categories' && isAdmin && (
                <CategoryManager 
                  productCategories={productCategories}
                  setProductCategories={setProductCategories}
                  products={products}
                  setProducts={setProducts}
                  addNotification={addNotification}
                />
              )}
              {activeTab === 'track-order' && (
                <TrackOrderPage formatCurrency={formatCurrency} clients={clients} />
              )}
              {activeTab === 'products' && (
                <ProductList 
                  products={products}
                  inventoryMode={inventoryMode}
                  setInventoryMode={(v) => v ? withPassword(() => setInventoryMode(v)) : setInventoryMode(v)}
                  setShowAddProduct={(v) => v ? withPassword(() => setShowAddProduct(v), true) : setShowAddProduct(v)}
                  setSelectedProduct={(p) => setSelectedProduct(p)}
                  handleDeleteProduct={(id) => withPassword(() => handleDeleteProduct(id))}
                  onEditProduct={(p) => withPassword(() => setShowEditProduct(p), true)}
                  addToCart={addToCart}
                  isDarkMode={isDarkMode}
                  formatCurrency={formatCurrency}
                  productCategories={productCategories}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === 'expenses' && isAdmin && (
                <ExpensePage />
              )}
              {activeTab === 'bandwidth' && (
                <BandwidthTestPage />
              )}
              {activeTab === 'staff-tracking' && (
                <StaffCheckIn user={user} staffUser={staffUser} />
              )}
              {activeTab === 'manage-staff' && isAdmin && (
                <ManageStaff withPassword={withPassword} addNotification={addNotification} />
              )}
              {activeTab === 'warranty' && isAdmin && <WarrantyPage clients={clients} />}
              {activeTab === 'support' && (
                <SupportPage />
              )}
              {activeTab === 'alerts' && (
                <EmptyPlaceholder 
                  title="System Alerts"
                  message="Active threat monitoring is currently scanning your network infrastructure. No critical incidents detected in the last 24 hours."
                  icon={Bell}
                  actionLabel="Run Security Scan"
                  onAction={() => addNotification("Initiating deep security scan... system is secure.")}
                />
              )}
              {activeTab === 'ai-assistant' && (
                <AIHelpDesk 
                  user={user} 
                  isAdmin={isAdmin} 
                  businessData={{ products, clients, expenses }} 
                  isDarkMode={isDarkMode} 
                />
              )}
              {activeTab === 'me' && (
                <MePage 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  customLogo={customLogo}
                  setCustomLogo={setCustomLogo}
                  customIntroMusic={customIntroMusic}
                  setCustomIntroMusic={setCustomIntroMusic}
                  customClickSound={customClickSound}
                  setCustomClickSound={setCustomClickSound}
                  offersMusic={offersMusic}
                  setOffersMusic={setOffersMusic}
                  sliderImages={sliderImages}
                  setSliderImages={setSliderImages}
                  onBackup={generateInventoryPDF}
                  onOpenCalculator={() => setShowCalculator(true)}
                  onLock={lockAdmin}
                  adminPassword={adminPassword}
                  setAdminPassword={setAdminPassword}
                  user={user}
                  onRecordPayment={handleAddPayment}
                  clients={clients}
                  withPassword={withPassword}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    )}

      {/* Cart Drawer is already added as a component above App */}
      <CartDrawer 
        show={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        user={user}
        clients={clients}
        updateQuantity={updateCartQuantity}
        removeItem={removeFromCart}
        formatCurrency={formatCurrency}
        onPlaceOrder={(details) => placePublicOrder(details)}
      />

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map(n => (
            <motion.div key={n.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} layout className="pointer-events-auto">
               <div className="bg-slate-900 shadow-2xl text-white px-5 py-3 rounded-2xl border border-white/10 flex flex-col gap-2 min-w-[280px]">
                  <div className="flex items-center gap-3">
                     <Bell size={16} className="text-blue-400 shrink-0" />
                     <span className="text-sm font-bold flex-1">{n.text}</span>
                     <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="ml-2 text-gray-500 hover:text-white"><X size={14} /></button>
                  </div>
                  {n.type === 'admin-order' && n.order && (
                    <div className="flex gap-2 mt-1 border-t border-white/5 pt-2">
                       <button 
                         onClick={() => {
                           acceptPublicOrder(n.order!);
                           setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                         }}
                         className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         Accept
                       </button>
                       <button 
                         onClick={async () => {
                           await updateDoc(doc(db, 'public_orders', n.order!.id), { status: 'rejected' });
                           addNotification("Order rejected.");
                           setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                         }}
                         className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         Reject
                       </button>
                    </div>
                  )}
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!showSplash && !isMobileNavHidden && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[98%] max-w-6xl z-[70] px-2">
           <div className="overflow-x-auto no-scrollbar pb-1">
             <GlowingNav 
               activeId={activeTab}
               className="min-w-max"
               items={[
                 { id: 'dashboard', icon: <Home size={18} />, label: 'Home' },
                 { id: 'shop-view', icon: <ShoppingBag size={18} />, label: 'Product Page' },
                 { id: 'my-orders', icon: <Package size={18} />, label: 'Orders' },
                 ...(isAdmin ? [
                   { id: 'clients', icon: <Users size={18} />, label: 'CRM' },
                   { id: 'categories', icon: <LayoutGrid size={18} />, label: 'Cats' },
                   { id: 'products', icon: <Box size={18} />, label: 'Admin' },
                   { id: 'expenses', icon: <Wallet size={18} />, label: 'Finance' },
                   { id: 'manage-staff', icon: <ShieldCheck size={18} />, label: 'Staff' },
                   { id: 'manage-services', icon: <Wrench size={18} />, label: 'Services' },
                 ] : []),
                 { id: 'bandwidth', icon: <Activity size={18} />, label: 'Network' },
                 { id: 'staff-tracking', icon: <Navigation size={18} />, label: 'Track' },
                 { id: isAdmin ? 'warranty' : 'support', icon: <Headphones size={18} />, label: 'Help' },
                 { id: 'me', icon: <User size={18} />, label: 'Account' },
                 { id: 'hide-nav', icon: <X size={18} />, label: 'Close' },
               ]}
               onSelect={(id) => {
                 if (id === 'hide-nav') setIsMobileNavHidden(true);
                 else setActiveTab(id as any);
               }}
             />
           </div>
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} formatCurrency={formatCurrency} addNotification={addNotification} isAdmin={isAdmin && activeTab === 'products'} onEdit={(p) => { setSelectedProduct(null); withPassword(() => setShowEditProduct(p), true); }} onDelete={(id) => withPassword(() => handleDeleteProduct(id))} />}
        {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onAdd={handleAddProduct} productCategories={productCategories} setProductCategories={setProductCategories} addNotification={addNotification} />}
        {showEditProduct && <EditProductModal product={showEditProduct} onClose={() => setShowEditProduct(null)} onSave={handleEditProduct} productCategories={productCategories} setProductCategories={setProductCategories} addNotification={addNotification} />}
        {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}
        {showClientProfile && <ClientProfile client={showClientProfile} onClose={() => setShowClientProfile(null)} onUpdateImage={handleUpdateClientImage} onSetWarranty={handleSetWarranty} onSetInstallationDate={handleSetInstallationDate} onUpdateNotes={handleUpdateNotes} onDeleteClient={(id) => withPassword(() => handleDeleteClient(id))} onUpdateOrderStatus={updateOrderStatus} onUpdateClientDetails={handleUpdateClientDetails} formatCurrency={formatCurrency} generateWhatsAppMessage={generateWhatsAppMessage} generateClientProfilePDF={generateClientProfilePDF} handleDeleteWork={handleDeleteWork} handleDeletePayment={handleDeletePayment} handleDeleteOrder={handleDeleteOrder} handleAddWork={handleAddWork} handleAddPayment={handleAddPayment} clients={clients} />}
        {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} />}
        {showCalculator && <CalculatorModal onClose={() => setShowCalculator(false)} />}
      </AnimatePresence>
    </div>
  );
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING: return 'bg-amber-100 text-amber-600';
    case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-600';
    case OrderStatus.SHIPPED: return 'bg-purple-100 text-purple-600';
    case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-600';
    case OrderStatus.CANCELLED: return 'bg-rose-100 text-rose-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const MyOrdersPage = ({ user, clients, formatCurrency, isAdmin, acceptPublicOrder, addNotification, deleteAnyOrder }: { user: any | null, clients: Client[], formatCurrency: (amount: number) => string, isAdmin: boolean, acceptPublicOrder: (order: PublicOrder) => Promise<void>, addNotification: (msg: string, type?: any) => void, deleteAnyOrder: (order: any) => Promise<void> }) => {
  const client = useMemo(() => clients.find(c => c.email === user?.email || c.phone === user?.phoneNumber), [clients, user]);
  const [allPublicOrders, setAllPublicOrders] = useState<any[]>([]);

  useEffect(() => {
    // If admin, show everything. If client, only their pending show via real-time (history is in client object)
    const q = isAdmin 
      ? query(collection(db, 'public_orders'), orderBy('date', 'desc'))
      : client 
        ? query(collection(db, 'public_orders'), where('customerPhone', '==', client.phone), where('status', '==', 'pending'))
        : null;

    if (q) {
      const unsub = onSnapshot(q, (snapshot) => {
        setAllPublicOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), source: 'public' })));
      });
      return () => unsub();
    }
  }, [client, isAdmin]);

  if (!isAdmin && !client) return <div className="p-4 text-center">No orders found. Please log in or contact support.</div>;
  
  const allOrders = useMemo(() => {
    if (isAdmin) {
      const crmOrders = clients.flatMap(c => (c.orders || []).map(o => ({ 
        ...o, 
        source: 'crm', 
        clientId: c.id, 
        customerName: c.name, 
        customerPhone: c.phone, 
        customerAddress: c.address 
      })));
      const merged = [...allPublicOrders, ...crmOrders];
      // Use map to keep latest version if there are duplicates (CRM usually has more up-to-date status)
      const uniqueMap = new Map();
      merged.forEach(o => {
        if (!uniqueMap.has(o.id) || o.source === 'crm') {
          uniqueMap.set(o.id, o);
        }
      });
      return Array.from(uniqueMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    const merged = [
      ...allPublicOrders, 
      ...(client?.orders || []).map(o => ({ ...o, source: 'crm' }))
    ];
    const uniqueMap = new Map();
    merged.forEach(o => {
      if (!uniqueMap.has(o.id) || o.source === 'crm') {
        uniqueMap.set(o.id, o);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allPublicOrders, clients, isAdmin, client]);
  
  const updateStatus = async (order: any, newStatus: string) => {
    try {
      if (order.source === 'public') {
        await updateDoc(doc(db, 'public_orders', order.id), { status: newStatus });
      } else if (order.source === 'crm' && order.clientId) {
        const targetClient = clients.find(c => c.id === order.clientId);
        if (targetClient) {
          const updatedOrders = (targetClient.orders || []).map((o: any) => 
            o.id === order.id ? { ...o, status: newStatus as any } : o
          );
          await updateDoc(doc(db, 'clients', String(targetClient.id)), { orders: updatedOrders });
        }
      }
      playSound('success');
      addNotification(`Order status updated to ${newStatus}`, 'success');
    } catch (e) {
      console.error(e);
      addNotification("Status update failed", "error");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-black mb-4">{isAdmin ? "Manage All Orders" : "My Orders"}</h2>
      {allOrders.length === 0 ? (
        <div className="text-gray-500 py-4 text-sm text-center">No orders yet.</div>
      ) : (
        allOrders.map((order, idx) => (
          <div key={`${order.id}-${order.source}-${idx}`} className="glass-card p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package size={16} className="text-blue-500" />
                  <span className="font-black text-sm tracking-tight">Order #{order.id}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.date}</div>
              </div>
              <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm", getStatusColor(order.status))}>
                {order.status}
              </span>
            </div>

            {isAdmin && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <User size={14} />
                  <span className="text-xs font-black uppercase tracking-widest">Customer Info</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Name</span>
                  <span className="text-xs font-bold text-right">{order.customerName}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Phone</span>
                  <span className="text-xs font-bold text-right">{order.customerPhone}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Address</span>
                  <span className="text-xs font-bold text-right flex-1 line-clamp-1">{order.customerAddress || 'N/A'}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <ShoppingCart size={12} /> Items
              </div>
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs group/item">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                       {item.quantity}x
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-400 group-hover/item:text-slate-700 transition-colors">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end pt-4 border-t dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
                <span className="text-lg font-black text-blue-600">{formatCurrency(order.total)}</span>
              </div>
              
              {isAdmin ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteAnyOrder(order)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 text-rose-600 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 border border-rose-100 dark:border-rose-900/20 shadow-sm"
                    title="Delete Permanent"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => acceptPublicOrder(order as any)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                      Accept
                    </button>
                  )}
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order, e.target.value)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase outline-none focus:ring-2 ring-blue-500 transition-all border-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              ) : (
                order.status === 'pending' && <span className="text-[10px] text-amber-500 font-bold italic animate-pulse">Awaiting Confirmation</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const AddWorkModal = ({ clientId, onClose, handleAddWork }: { clientId: number, onClose: () => void, handleAddWork: (clientId: number, description: string, amount: number) => void }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    handleAddWork(clientId, description, Number(amount));
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[400px] glow-effect-container text-white rounded-[32px] p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black mb-6">Add New Work</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
            <input 
              type="text" 
              placeholder="e.g. Camera Installation" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Amount</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-4 glow-effect-container text-white rounded-2xl font-bold text-sm shadow-xl opacity-90 hover:opacity-100 mt-4"
          >
            Save Work
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const AddPaymentModal = ({ clientId, onClose, handleAddPayment }: { clientId: number, onClose: () => void, handleAddPayment: (clientId: number, amount: number, type: 'Cash' | 'Bkash' | 'Bank', purpose: string) => void }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Cash' | 'Bkash' | 'Bank'>('Cash');
  const [purpose, setPurpose] = useState('General Payment');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    handleAddPayment(clientId, Number(amount), type, purpose);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[400px] glow-effect-container text-white rounded-[32px] p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black mb-6">Record Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Amount</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Purpose</label>
            <select 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            >
              <option value="General Payment">General Payment</option>
              <option value="Product Payment">Product Payment</option>
              <option value="Service/Work Payment">Service/Work Payment</option>
              <option value="Advance Payment">Advance Payment</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Payment Method</label>
            <select 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none"
              value={type}
              onChange={e => setType(e.target.value as any)}
            >
              <option value="Cash">Cash</option>
              <option value="Bkash">Bkash</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full py-4 glow-effect-container text-white rounded-2xl font-bold text-sm shadow-xl shadow-green-500/20 mt-4"
          >
            Record Payment
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditClientModal = ({ client, onClose, onUpdate }: { client: Client, onClose: () => void, onUpdate: (id: number, details: { name: string, phone: string, email?: string, address: string }) => void }) => {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email || '');
  const [address, setAddress] = useState(client.address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;
    onUpdate(client.id, { name, phone, email, address });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[400px] glow-effect-container text-white rounded-[32px] p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black mb-6">Edit Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Name</label>
            <input 
              type="text" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone</label>
            <input 
              type="text" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
            <input 
              type="email" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Address</label>
            <input 
              type="text" 
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 mt-4"
          >
            Update Details
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ClientProfile = ({ 
  client, 
  onClose,
  onUpdateImage,
  onSetWarranty,
  onSetInstallationDate,
  onUpdateNotes,
  onDeleteClient,
  onUpdateOrderStatus,
  onUpdateClientDetails,
  formatCurrency,
  generateWhatsAppMessage,
  generateClientProfilePDF,
  handleDeleteWork,
  handleDeletePayment,
  handleDeleteOrder,
  handleAddWork,
  handleAddPayment,
  clients
}: { 
  client: Client, 
  onClose: () => void,
  onUpdateImage: (id: number, img: string | null) => void,
  onSetWarranty: (id: number, date: string) => void,
  onSetInstallationDate: (id: number, date: string) => void,
  onUpdateNotes: (id: number, notes: string) => void,
  onDeleteClient: (id: number) => void,
  onUpdateOrderStatus: (clientId: number, orderId: string, status: OrderStatus) => void,
  onUpdateClientDetails: (id: number, details: { name: string, phone: string, address: string }) => void,
  formatCurrency: (v: number) => string,
  generateWhatsAppMessage: (c: Client, items: any[], total: number) => void,
  generateClientProfilePDF: (c: Client) => void,
  handleDeleteWork: (clientId: number, workId: string) => void,
  handleDeletePayment: (clientId: number, paymentId: string) => void,
  handleDeleteOrder: (clientId: number, orderId: string) => void,
  handleAddWork: (clientId: number, description: string, amount: number) => void,
  handleAddPayment: (clientId: number, amount: number, type: 'Cash' | 'Bkash' | 'Bank', purpose: string) => void,
  clients: Client[]
}) => {
  const [showAddWork, setShowAddWork] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentClient = clients.find(c => c.id === client.id) || client;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIMENSION = 512;
          
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            onUpdateImage(currentClient.id, canvas.toDataURL(file.type || 'image/jpeg', 0.7));
          } else {
            onUpdateImage(currentClient.id, reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-600';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-600';
      case OrderStatus.SHIPPED: return 'bg-purple-100 text-purple-600';
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-600';
      case OrderStatus.CANCELLED: return 'bg-rose-100 text-rose-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-gray-50 dark:bg-slate-950 z-50 overflow-y-auto"
    >
      <div className="p-4 flex items-center gap-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg flex-1">Client Profile</h2>
        <button 
          onClick={() => setShowEditDetails(true)}
          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
        >
          <Edit2 size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6 pb-24">
        <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-blue-600/10 -z-10" />
          
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-2xl border-4 border-white dark:border-slate-900 overflow-hidden">
              {currentClient.image ? (
                <img src={currentClient.image} alt={currentClient.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentClient.name[0]
              )}
            </div>
            
            <div className="absolute bottom-4 right-0 flex gap-1">
              <label className="w-8 h-8 bg-white dark:bg-slate-800 text-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100 dark:border-slate-700">
                <Plus size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {currentClient.image && (
                <button 
                  onClick={() => onUpdateImage(currentClient.id, null)}
                  className="w-8 h-8 bg-white dark:bg-slate-800 text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors border border-gray-100 dark:border-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold">{currentClient.name}</h3>
          <p className="text-gray-500 text-sm">{currentClient.phone}</p>
          <p className="text-gray-500 text-xs mt-1">{currentClient.address}</p>
          
          <div className="grid grid-cols-3 gap-4 w-full mt-6">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Due</p>
              <p className="text-sm font-bold text-red-500">{formatCurrency(currentClient.due)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Works</p>
              <p className="text-sm font-bold">{currentClient.works}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Paid</p>
              <p className="text-sm font-bold text-green-500">{formatCurrency(currentClient.totalPaid)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddWork(true)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-ripple"
          >
            <Plus size={16} /> Add Work
          </button>
          <button 
            onClick={() => setShowAddPayment(true)}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-ripple"
          >
            <Wallet size={16} /> Payment
          </button>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-gray-100 dark:border-slate-800">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" /> Installation Date
              </h4>
              <input 
                type="date" 
                className="text-xs bg-gray-50 dark:bg-slate-800 border-none rounded-lg p-1 outline-none font-bold"
                value={currentClient.installationDate || ''}
                onChange={(e) => onSetInstallationDate(currentClient.id, e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" /> Warranty Expiry
              </h4>
              <input 
                type="date" 
                className="text-xs bg-gray-50 dark:bg-slate-800 border-none rounded-lg p-1 outline-none font-bold"
                value={currentClient.warrantyExpiry || ''}
                onChange={(e) => onSetWarranty(currentClient.id, e.target.value)}
              />
            </div>

            {currentClient.warrantyExpiry && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-2 rounded-xl">
                <p className="text-[10px] text-gray-500">Status: <span className="font-bold text-blue-600">Active</span></p>
                <span className="text-[10px] text-gray-400 italic">Expires: {currentClient.warrantyExpiry}</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-gray-100 dark:border-slate-800">
          <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
            <FileText size={16} className="text-blue-600" /> Client Notes
          </h4>
          <textarea 
            className="w-full text-xs bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none min-h-[80px] font-medium"
            placeholder="Add notes about this client..."
            value={currentClient.notes || ''}
            onChange={(e) => onUpdateNotes(currentClient.id, e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => generateWhatsAppMessage(currentClient, [], 0)}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-ripple"
          >
            <MessageSquare size={16} /> WhatsApp
          </button>
          <button 
            onClick={() => generateClientProfilePDF(currentClient)}
            className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-ripple"
          >
            <Download size={16} /> PDF Profile
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Wrench size={18} className="text-blue-500" /> Work History
          </h4>
          {currentClient.workHistory.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No work history found</p>
          ) : (
            currentClient.workHistory.map(work => (
              <div key={work.id} className="glass-card p-3 group">
                <div className="flex justify-between">
                  <span className="text-xs font-bold">{work.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{work.date}</span>
                    <button 
                      onClick={() => handleDeleteWork(currentClient.id, work.id)}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs">Amount: {formatCurrency(work.amount)}</span>
                  <span className="text-xs text-green-600 font-bold">Paid: {formatCurrency(work.paid)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Wallet size={18} className="text-green-500" /> Payment History
          </h4>
          {currentClient.paymentHistory.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No payments found</p>
          ) : (
            currentClient.paymentHistory.map(payment => (
              <div key={payment.id} className="glass-card p-3 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-bold">{payment.type}</p>
                    <p className="text-[10px] text-gray-500">{payment.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-green-600">+{formatCurrency(payment.amount)}</span>
                  <button 
                    onClick={() => handleDeletePayment(currentClient.id, payment.id)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <ShoppingCart size={18} className="text-purple-500" /> Order History
          </h4>
          {currentClient.orders.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No orders found</p>
          ) : (
            currentClient.orders.map((order, idx) => (
              <div key={`${order.id}-${idx}`} className="glass-card p-3 group">
                <div className="flex justify-between border-b dark:border-slate-800 pb-2 mb-2">
                  <div>
                    <span className="text-xs font-bold">{order.id}</span>
                    {order.dueDate && (
                      <p className="text-[8px] text-red-500 font-bold">Due Date: {order.dueDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={order.status || OrderStatus.PENDING}
                      onChange={(e) => onUpdateOrderStatus(currentClient.id, order.id, e.target.value as OrderStatus)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-transparent border-none outline-none cursor-pointer",
                        getStatusColor(order.status || OrderStatus.PENDING)
                      )}
                    >
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">{order.date}</span>
                    <button 
                      onClick={() => generateReceiptPDF(order)}
                      className="p-1 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Download Invoice"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(currentClient.id, order.id)}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(OrderStatus).map((status) => {
                      const isCurrent = (order.status || OrderStatus.PENDING) === status;
                      return (
                        <button
                          key={status}
                          onClick={() => onUpdateOrderStatus(currentClient.id, order.id, status)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                            isCurrent 
                              ? `${getStatusColor(status)} border-transparent shadow-sm scale-105`
                              : "bg-white dark:bg-slate-800 text-gray-500 border-gray-100 dark:border-slate-700 hover:border-blue-200"
                          )}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1 mt-4 pt-3 border-t dark:border-slate-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px] font-medium">
                      <span className="text-gray-600 dark:text-gray-400">{item.name} x {item.quantity}</span>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-2 pt-2 border-t dark:border-slate-800">
                  <span className="text-xs font-bold text-blue-600">Total: {formatCurrency(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-8 border-t dark:border-slate-800">
          {showDeleteConfirm ? (
            <div className="glass-card p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
              <p className="text-xs font-bold text-red-600 mb-3 text-center">Are you sure you want to delete this client? All history will be lost.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => onDeleteClient(currentClient.id)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold text-xs"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30"
            >
              <Trash2 size={16} /> Delete Client
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddWork && (
          <AddWorkModal clientId={client.id} onClose={() => setShowAddWork(false)} handleAddWork={handleAddWork} />
        )}
        {showAddPayment && (
          <AddPaymentModal clientId={client.id} onClose={() => setShowAddPayment(false)} handleAddPayment={handleAddPayment} />
        )}
        {showEditDetails && (
          <EditClientModal client={currentClient} onClose={() => setShowEditDetails(false)} onUpdate={onUpdateClientDetails} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
