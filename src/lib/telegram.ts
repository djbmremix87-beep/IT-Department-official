// Telegram Bot Integration Service

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyOrders: boolean;
  notifyAlerts: boolean;
  notifyStaffLocation: boolean;
}

const STORAGE_KEY = 'cctv_telegram_config';

export const getDefaultTelegramConfig = (): TelegramConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse telegram config from localStorage', e);
  }

  // Fallback to environment variables if present
  const envToken = (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '';
  const envChatId = (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID || '';

  return {
    botToken: envToken,
    chatId: envChatId,
    enabled: Boolean(envToken && envChatId),
    notifyOrders: true,
    notifyAlerts: true,
    notifyStaffLocation: true
  };
};

export const saveTelegramConfig = (config: TelegramConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save telegram config to localStorage', e);
  }
};

/**
 * Send a raw text message to Telegram Bot
 */
export const sendTelegramMessage = async (
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; error?: string }> => {
  const config = { ...getDefaultTelegramConfig(), ...(overrideConfig || {}) };

  if (!config.enabled || !config.botToken || !config.chatId) {
    return { success: false, error: 'Telegram Bot is not configured or disabled' };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId.trim(),
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.warn('Telegram API error:', data);
      return { success: false, error: data.description || 'Failed to send message' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Telegram dispatch network error:', err);
    return { success: false, error: err?.message || 'Network error connecting to Telegram' };
  }
};

/**
 * Send an interactive native Location map pin to Telegram
 */
export const sendTelegramLocation = async (
  lat: number,
  lng: number,
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; error?: string }> => {
  const config = { ...getDefaultTelegramConfig(), ...(overrideConfig || {}) };

  if (!config.enabled || !config.botToken || !config.chatId) {
    return { success: false, error: 'Telegram Bot is not configured or disabled' };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendLocation`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId.trim(),
        latitude: lat,
        longitude: lng
      })
    });

    const data = await res.json();
    return { success: data.ok, error: data.description };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

/**
 * Format and send an Order notification
 */
export const sendOrderNotification = async (order: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  total: number;
  isPaid?: boolean;
  paymentType?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  date?: string;
}, overrideConfig?: Partial<TelegramConfig>): Promise<boolean> => {
  const config = { ...getDefaultTelegramConfig(), ...(overrideConfig || {}) };
  if (!config.enabled || !config.notifyOrders) return false;

  const itemsList = order.items && order.items.length > 0
    ? order.items.map(i => `  • <b>${i.name}</b> × ${i.quantity} = ৳${(i.price * i.quantity).toLocaleString()}`).join('\n')
    : '  (No items listed)';

  const nowTime = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const paymentText = order.isPaid
    ? `✅ <b>Paid via ${order.paymentType || 'Digital Gateway'}</b>`
    : `⏳ <b>Cash on Delivery (Pending)</b>`;

  const message = `🚨 <b>NEW ORDER RECEIVED!</b>
━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${order.id}</code>
👤 <b>Customer:</b> ${order.customerName}
📞 <b>Phone:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>
📍 <b>Address:</b> ${order.customerAddress || 'Not provided'}
💳 <b>Payment:</b> ${paymentText}
💰 <b>Total Amount:</b> ৳${order.total.toLocaleString()}

📦 <b>Ordered Items:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
🕒 <b>Time:</b> ${nowTime}
🌐 <b>Status:</b> Pending Admin Confirmation`;

  const res = await sendTelegramMessage(message, 'HTML', config);
  return res.success;
};

export interface StaffLocationPayload {
  name?: string;
  staffName?: string;
  role?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  address?: string;
  updatedAt?: string;
  lastKnownLocation?: {
    lat: number;
    lng: number;
    address?: string;
    updatedAt: string;
  };
}

/**
 * Format and send Staff Location Update
 */
export const sendStaffLocationNotification = async (
  staff: StaffLocationPayload,
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; error?: string }> => {
  const config = { ...getDefaultTelegramConfig(), ...(overrideConfig || {}) };
  if (!config.enabled || !config.notifyStaffLocation) {
    return { success: false, error: 'Staff location notifications disabled or Telegram not configured' };
  }

  const staffName = staff.staffName || staff.name || 'Staff Member';
  const role = staff.role || 'Field Engineer';
  const phone = staff.phone;

  const lat = staff.lat !== undefined ? staff.lat : staff.lastKnownLocation?.lat;
  const lng = staff.lng !== undefined ? staff.lng : staff.lastKnownLocation?.lng;
  const address = staff.address || staff.lastKnownLocation?.address;
  const updatedAt = staff.updatedAt || staff.lastKnownLocation?.updatedAt;

  if (lat === undefined || lng === undefined) {
    return { success: false, error: 'Staff has no recorded GPS coordinates yet' };
  }

  const timeStr = updatedAt
    ? new Date(updatedAt).toLocaleString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'Just now';

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const message = `📍 <b>STAFF LIVE LOCATION UPDATE</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Staff:</b> ${staffName}
💼 <b>Role:</b> ${role}
📞 <b>Phone:</b> ${phone ? `<a href="tel:${phone}">${phone}</a>` : 'N/A'}
🕒 <b>Last Check-in:</b> ${timeStr}

📌 <b>Current Address:</b>
${address || 'Address updating from GPS...'}

🌐 <b>GPS Coordinates:</b>
<code>${lat.toFixed(5)}, ${lng.toFixed(5)}</code>

🗺 <b>Google Maps Live View:</b>
<a href="${mapsUrl}">👉 Click here to view on Google Maps</a>
━━━━━━━━━━━━━━━━━━`;

  const res = await sendTelegramMessage(message, 'HTML', config);

  // Also send native Telegram location pin if message succeeded
  if (res.success) {
    sendTelegramLocation(lat, lng, config).catch(() => {});
  }

  return res;
};

/**
 * Send System Alert / Notification
 */
export const sendSystemAlertNotification = async (
  title: string,
  details: string,
  overrideConfig?: Partial<TelegramConfig>
): Promise<boolean> => {
  const config = { ...getDefaultTelegramConfig(), ...(overrideConfig || {}) };
  if (!config.enabled || !config.notifyAlerts) return false;

  const timeStr = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const message = `🔔 <b>SYSTEM ALERT: ${title.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
ℹ️ ${details}
🕒 <b>Time:</b> ${timeStr}`;

  const res = await sendTelegramMessage(message, 'HTML', config);
  return res.success;
};
