// Telegram Bot Integration Service (Server-Proxied Only)

export interface TelegramConfig {
  enabled: boolean;
  notifyOrders: boolean;
  notifyAlerts: boolean;
  notifyStaffLocation: boolean;
  botToken?: string;
  chatId?: string;
}

const STORAGE_KEY = 'cctv_telegram_config';

export const getDefaultTelegramConfig = (): TelegramConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: parsed.enabled ?? true,
        notifyOrders: parsed.notifyOrders ?? true,
        notifyAlerts: parsed.notifyAlerts ?? true,
        notifyStaffLocation: parsed.notifyStaffLocation ?? true,
        botToken: parsed.botToken || '',
        chatId: parsed.chatId || ''
      };
    }
  } catch (e) {
    console.warn('Failed to parse telegram config from localStorage', e);
  }

  return {
    enabled: true,
    notifyOrders: true,
    notifyAlerts: true,
    notifyStaffLocation: true,
    botToken: '',
    chatId: ''
  };
};

export const saveTelegramConfig = (config: TelegramConfig): void => {
  try {
    const safeConfig = {
      enabled: config.enabled,
      notifyOrders: config.notifyOrders,
      notifyAlerts: config.notifyAlerts,
      notifyStaffLocation: config.notifyStaffLocation,
      botToken: config.botToken || '',
      chatId: config.chatId || ''
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeConfig));
  } catch (e) {
    console.warn('Failed to save telegram config to localStorage', e);
  }
};

/**
 * Dispatch notification through secure server proxy endpoint
 */
export const dispatchServerNotification = async (payload: {
  action: 'order' | 'staff_location' | 'alert' | 'message';
  message?: string;
  lat?: number;
  lng?: number;
  metadata?: any;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.error || data.description || 'Failed to dispatch notification' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Telegram dispatch error:', err);
    return { success: false, error: err?.message || 'Network error connecting to notification server' };
  }
};

export const sendTelegramMessage = async (
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  config?: TelegramConfig
): Promise<{ success: boolean; error?: string }> => {
  return dispatchServerNotification({
    action: 'message',
    message,
    metadata: config
  });
};

export const sendTelegramLocation = async (
  lat: number,
  lng: number,
  config?: TelegramConfig
): Promise<{ success: boolean; error?: string }> => {
  return dispatchServerNotification({
    action: 'staff_location',
    lat,
    lng,
    metadata: config
  });
};

export const sendOrderNotification = async (
  order: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    total: number;
    isPaid?: boolean;
    paymentType?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    date?: string;
  },
  config?: TelegramConfig
): Promise<boolean> => {
  const activeConfig = config || getDefaultTelegramConfig();
  if (!activeConfig.enabled || !activeConfig.notifyOrders) return false;

  const res = await dispatchServerNotification({
    action: 'order',
    metadata: order
  });
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

export const sendStaffLocationNotification = async (
  staff: StaffLocationPayload,
  config?: TelegramConfig
): Promise<{ success: boolean; error?: string }> => {
  const activeConfig = config || getDefaultTelegramConfig();
  if (!activeConfig.enabled || !activeConfig.notifyStaffLocation) {
    return { success: false, error: 'Staff location notifications disabled' };
  }

  const lat = staff.lat !== undefined ? staff.lat : staff.lastKnownLocation?.lat;
  const lng = staff.lng !== undefined ? staff.lng : staff.lastKnownLocation?.lng;

  if (lat === undefined || lng === undefined) {
    return { success: false, error: 'Staff has no recorded GPS coordinates yet' };
  }

  return dispatchServerNotification({
    action: 'staff_location',
    lat,
    lng,
    metadata: staff
  });
};

export const sendSystemAlertNotification = async (
  title: string,
  details: string,
  config?: TelegramConfig
): Promise<boolean> => {
  const activeConfig = config || getDefaultTelegramConfig();
  if (!activeConfig.enabled || !activeConfig.notifyAlerts) return false;

  const res = await dispatchServerNotification({
    action: 'alert',
    message: `${title.toUpperCase()}: ${details}`
  });
  return res.success;
};
