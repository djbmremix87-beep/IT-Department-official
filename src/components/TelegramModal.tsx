import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, X, Shield, Bell, MapPin, ShoppingBag, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import { TelegramConfig, saveTelegramConfig, sendTelegramMessage } from '../lib/telegram';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSave: (newConfig: TelegramConfig) => Promise<void> | void;
  addNotification?: (msg: string, type?: any) => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  addNotification
}) => {
  const [enabled, setEnabled] = useState(config.enabled ?? true);
  const [notifyOrders, setNotifyOrders] = useState(config.notifyOrders ?? true);
  const [notifyAlerts, setNotifyAlerts] = useState(config.notifyAlerts ?? true);
  const [notifyStaffLocation, setNotifyStaffLocation] = useState(config.notifyStaffLocation ?? true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const testMsg = `🤖 <b>IT DEPARTMENT BOT VERIFIED!</b>
━━━━━━━━━━━━━━━━━━
✅ আপনার টেলিগ্রাম বট সফলভাবে কানেক্ট হয়েছে!
🛒 সকল প্রোডাক্টের নতুন অর্ডার এখন স্বয়ংক্রিয়ভাবে এখানে আসবে।
📍 স্টাফদের লাইভ লোকেশন ও গুগল ম্যাপস লিংক এখানে আসবে।
🕒 সময়: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}`;

    const res = await sendTelegramMessage(testMsg, 'HTML');

    setTesting(false);
    if (res.success) {
      setTestResult({ success: true, message: 'সফলভাবে মেসেজ পাঠানো হয়েছে! আপনার টেলিগ্রাম চেক করুন।' });
      if (addNotification) addNotification('Telegram test message sent successfully!', 'success');
    } else {
      setTestResult({
        success: false,
        message: `ব্যর্থ হয়েছে: ${res.error || 'বট কানেকশন যাচাই করুন।'}`
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const newConfig: TelegramConfig = {
      enabled,
      notifyOrders,
      notifyAlerts,
      notifyStaffLocation
    };

    saveTelegramConfig(newConfig);
    try {
      await onSave(newConfig);
      if (addNotification) addNotification('Telegram settings saved successfully!', 'success');
      onClose();
    } catch (e: any) {
      console.error('Error saving telegram config:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
              <Send size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Telegram Bot Integration</h3>
              <p className="text-xs text-sky-100 font-medium">অর্ডার নোটিফিকেশন ও স্টাফ লাইভ ট্র্যাকিং</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="text-sky-500" size={20} />
              <div>
                <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Enable Telegram Alerts</p>
                <p className="text-[11px] text-slate-500">টেলিগ্রাম বটে স্বয়ংক্রিয় নোটিফিকেশন পাঠানো চালু রাখুন</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Bot Token Input (Removed for security) */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
            <p className="font-bold">Security Notice:</p>
            <p>Telegram Bot Token and Chat ID are now managed securely via server environment variables. Please contact an administrator to update these credentials.</p>
          </div>


          {/* Individual Feature Notification Toggles */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Alert Preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyOrders}
                  onChange={(e) => setNotifyOrders(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <ShoppingBag size={14} className="text-orange-500" />
                  <span>নতুন অর্ডার</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyStaffLocation}
                  onChange={(e) => setNotifyStaffLocation(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <MapPin size={14} className="text-red-500" />
                  <span>স্টাফ লোকেশন</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyAlerts}
                  onChange={(e) => setNotifyAlerts(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Bell size={14} className="text-purple-500" />
                  <span>স্টক ও সিস্টেম</span>
                </div>
              </label>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{testResult.message}</span>
            </motion.div>
          )}

          {/* Step by step guide */}
          <div className="p-4 bg-sky-50/60 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/40 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
            <p className="font-bold text-sky-800 dark:text-sky-300">💡 ১ মিনিটে টেলিগ্রাম বট সেটআপ করার নিয়ম:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>টেলিগ্রামে গিয়ে <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">@BotFather</code> সার্চ দিয়ে <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">/newbot</code> লিখে একটি বট তৈরি করুন।</li>
              <li>বট তৈরি হলে প্রাপ্ত <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">HTTP API Token</code> টি উপরের ঘরে পেস্ট করুন।</li>
              <li>আপনার নতুন বটের চ্যাটে গিয়ে <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">/start</code> চাপুন।</li>
              <li><code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">@userinfobot</code> থেকে আপনার Chat ID সংগ্রহ করে নিচের ঘরে বসিয়ে <b>"Test Connection"</b> চাপুন।</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            <span>{testing ? 'পরীক্ষা করা হচ্ছে...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
