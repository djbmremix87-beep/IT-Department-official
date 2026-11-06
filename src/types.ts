export enum ClientStatus {
  ACTIVE = 'Active',
  DUE = 'Due',
  INACTIVE = 'Inactive'
}

export enum Category {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  NVR = 'nvr'
}

export enum ExpenseCategory {
  MAINTENANCE = 'maintenance',
  EQUIPMENT = 'equipment',
  SALARY = 'salary',
  OTHER = 'other'
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface CategoryData {
  id: string;
  name: string;
  image?: string;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  videoUrl?: string;
  badge?: 'new' | 'hot' | 'lowstock' | 'sale' | 'limited' | 'popular';
  description?: string;
  oldPrice?: number;
  specifications?: { key: string; value: string }[];
  seoKeywords?: string;
}

export interface WorkHistory {
  id: string;
  description: string;
  amount: number;
  paid: number;
  date: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  type: 'Cash' | 'Bkash' | 'Bank' | 'Nagad';
  date: string;
  purpose: string;
}

export interface CartItem {
  productId: number | string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  dueDate: string | null;
  items: CartItem[];
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  status: ClientStatus;
  due: number;
  works: number;
  totalPaid: number;
  workHistory: WorkHistory[];
  paymentHistory: PaymentHistory[];
  orders: Order[];
  warrantyExpiry?: string;
  installationDate?: string;
  notes?: string;
  image?: string | null;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface PublicOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// Support Ticket System
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'staff' | 'admin';
  message: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientId?: number | string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  subject: string;
  category: 'Network' | 'CCTV' | 'Billing' | 'Hardware' | 'General';
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

// Portfolio Management
export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: 'CCTV Installation' | 'Networking / ISP' | 'Access Control' | 'IT Infrastructure' | 'Maintenance';
  description: string;
  clientName?: string;
  location?: string;
  completionDate?: string;
  image: string;
  gallery?: string[];
  technologies?: string[];
  isPublished: boolean;
  createdAt: string;
}

// Notification System
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'ticket' | 'payment' | 'alert' | 'security';
  read: boolean;
  timestamp: string;
  linkTab?: string;
  metadata?: any;
}

// Audit Logging
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  category?: 'AUTH' | 'FINANCE' | 'INVENTORY' | 'STAFF' | 'SETTINGS' | 'SYSTEM';
  targetCollection?: string;
  targetId?: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
