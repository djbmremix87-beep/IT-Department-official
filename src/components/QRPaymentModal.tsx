import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  Smartphone, 
  ShieldCheck, 
  CreditCard, 
  Building, 
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface QRPaymentModalProps {
  amount: number;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
  onConfirmPayment: (trxId: string, paymentMethod: string) => void;
  formatCurrency: (amount: number) => string;
}

interface PaymentOption {
  id: string;
  name: string;
  accountNumber: string;
  type: 'Personal' | 'Merchant';
  color: string;
  bgColor: string;
  borderColor: string;
  logo: string;
  instructions: string[];
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'bKash',
    name: 'bKash',
    accountNumber: '01711223344',
    type: 'Merchant',
    color: '#D12053',
    bgColor: 'bg-[#D12053]/10 text-[#D12053]',
    borderColor: 'border-[#D12053]/30',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bkash_logo.png/640px-Bkash_logo.png',
    instructions: [
      'Open your bKash App & tap on "Make Payment" or "Scan QR"',
      'Scan the QR code above or enter merchant number: 01711223344',
      'Enter Amount & Reference ID as shown',
      'Enter your bKash PIN to confirm payment',
      'Copy the Transaction ID (TrxID) & paste it below'
    ]
  },
  {
    id: 'Nagad',
    name: 'Nagad',
    accountNumber: '01822334455',
    type: 'Merchant',
    color: '#F7941D',
    bgColor: 'bg-[#F7941D]/10 text-[#F7941D]',
    borderColor: 'border-[#F7941D]/30',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Nagad_logo.png/640px-Nagad_logo.png',
    instructions: [
      'Open your Nagad App & select "Merchant Pay"',
      'Scan the QR Code or enter number: 01822334455',
      'Enter Amount & Reference ID',
      'Input PIN & complete payment',
      'Enter your Nagad TrxID below to confirm order'
    ]
  },
  {
    id: 'Rocket',
    name: 'Rocket',
    accountNumber: '01933445566-7',
    type: 'Personal',
    color: '#8C3494',
    bgColor: 'bg-[#8C3494]/10 text-[#8C3494]',
    borderColor: 'border-[#8C3494]/30',
    logo: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png',
    instructions: [
      'Dial *322# or open Dutch-Bangla Rocket App',
      'Select "Send Money" or "Pay Bill"',
      'Enter Rocket Account: 01933445566-7',
      'Enter Exact Amount & Reference',
      'Enter TrxID below once completed'
    ]
  },
  {
    id: 'Upay',
    name: 'Upay',
    accountNumber: '01744556677',
    type: 'Merchant',
    color: '#00529C',
    bgColor: 'bg-[#00529C]/10 text-[#00529C]',
    borderColor: 'border-[#00529C]/30',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Upay_logo.png/640px-Upay_logo.png',
    instructions: [
      'Open Upay App & tap "Scan QR"',
      'Scan QR code or pay to 01744556677',
      'Confirm amount and submit PIN',
      'Copy TrxID and submit below'
    ]
  },
  {
    id: 'Bank',
    name: 'Bank Transfer / Card',
    accountNumber: '1501203948201001 (City Bank PLC)',
    type: 'Merchant',
    color: '#2563EB',
    bgColor: 'bg-blue-500/10 text-blue-500',
    borderColor: 'border-blue-500/30',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=100',
    instructions: [
      'Use Citytouch / BEFTN / NPSB / Card App',
      'Transfer to AC: 1501203948201001 (A/C Name: IT Solutions Ltd)',
      'Bank: City Bank PLC (Branch: Gulshan)',
      'Enter Reference Number & save transaction receipt',
      'Paste Transaction Reference / TrxID below'
    ]
  }
];

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  amount,
  orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
  customerName,
  customerPhone,
  onClose,
  onConfirmPayment,
  formatCurrency
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('bKash');
  const [trxId, setTrxId] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const activeOption = PAYMENT_OPTIONS.find(o => o.id === selectedMethod) || PAYMENT_OPTIONS[0];

  // Construct QR Payload String for mobile banking scanners
  const qrValue = JSON.stringify({
    method: activeOption.name,
    merchantNumber: activeOption.accountNumber,
    amount: amount,
    currency: 'BDT',
    reference: orderId,
    customer: customerName || 'Valued Customer',
    phone: customerPhone || 'N/A',
    note: `Order ${orderId} Payment`
  });

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(activeOption.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(
      `${activeOption.name} Payment\nAccount: ${activeOption.accountNumber}\nAmount: ${formatCurrency(amount)}\nReference: ${orderId}`
    );
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      setErrorMsg('Please enter your Transaction ID (TrxID) after payment.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        onConfirmPayment(trxId.trim(), activeOption.name);
      }, 2200);
    }, 700);
  };

  const downloadQR = () => {
    const svgElement = document.getElementById('qr-payment-code-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = (window.URL || window.webkitURL).createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 400, 400);
        context.drawImage(image, 20, 20, 360, 360);
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `${activeOption.name}_QR_${orderId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 text-white rounded-[32px] overflow-hidden shadow-2xl my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                Scan & Pay via QR
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Instant Verification
                </span>
              </h3>
              <p className="text-xs text-slate-400">Scan QR code using your mobile banking app to pay</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-8 px-4 sm:p-8 flex flex-col items-center justify-center text-center space-y-6"
              >
                {/* Animated Checkmark Icon with Glowing Pulsing Rings */}
                <div className="relative flex items-center justify-center my-4">
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute w-28 h-28 rounded-full bg-emerald-500/20 border border-emerald-500/40"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute w-24 h-24 rounded-full bg-emerald-500/30"
                  />
                  
                  {/* Center Green Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <CheckCircle2 size={44} className="text-white stroke-[2.5]" />
                    </motion.div>
                  </motion.div>

                  {/* Floating Sparkles & Confetti Visual Effects */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: -20 }}
                    animate={{ opacity: 1, y: -28, x: -38 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="absolute text-yellow-400"
                  >
                    <Sparkles size={22} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: 20 }}
                    animate={{ opacity: 1, y: -22, x: 38 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="absolute text-emerald-400"
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -10, x: 20 }}
                    animate={{ opacity: 1, y: 28, x: 32 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute text-blue-400"
                  >
                    <CheckCircle2 size={16} />
                  </motion.div>
                </div>

                {/* Text Messages */}
                <div className="space-y-2">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black uppercase tracking-tight text-white"
                  >
                    Payment Verified!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck size={16} /> Transaction Received & Validated
                  </motion.p>
                </div>

                {/* Transaction Receipt Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="w-full bg-slate-950 p-5 rounded-2xl border border-slate-800/90 space-y-3 text-left shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Gateway</span>
                    <span className="font-black text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                      <img src={activeOption.logo} alt={activeOption.name} className="w-3.5 h-3.5 object-contain" />
                      {activeOption.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Amount Paid</span>
                    <span className="font-black text-emerald-400 font-mono text-base">{formatCurrency(amount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">TrxID</span>
                    <span className="font-mono font-black text-blue-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {trxId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Reference</span>
                    <span className="font-mono text-slate-300">{orderId}</span>
                  </div>
                </motion.div>

                {/* Animated Auto Progress Line */}
                <div className="w-full space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Redirecting & finishing order...</span>
                    <span className="text-emerald-400 font-mono">100%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.1, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form-view" className="space-y-6">
                {/* Amount and Ref Badge */}
                <div className="bg-gradient-to-r from-blue-950/60 to-slate-800/60 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Payable Amount</span>
                    <span className="text-2xl font-black text-emerald-400">{formatCurrency(amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Order Reference ID</span>
                    <span className="text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-blue-400 inline-block mt-0.5">
                      {orderId}
                    </span>
                  </div>
                </div>

                {/* Payment Method Tabs */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Select Payment Gateway</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedMethod(opt.id);
                          setErrorMsg('');
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          selectedMethod === opt.id
                            ? `${opt.bgColor} ${opt.borderColor} ring-2 ring-blue-500/50 scale-102 shadow-lg`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden">
                          <img src={opt.logo} alt={opt.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight truncate w-full">{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Code & Merchant Box */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                  {/* QR SVG */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="p-4 bg-white rounded-2xl shadow-xl relative group border-4 border-slate-800">
                      <QRCodeSVG
                        id="qr-payment-code-svg"
                        value={qrValue}
                        size={170}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: activeOption.logo,
                          x: undefined,
                          y: undefined,
                          height: 28,
                          width: 28,
                          excavate: true,
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={downloadQR}
                      className="text-[10px] font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1 mt-1 transition-colors"
                    >
                      <Download size={12} /> Save QR Image
                    </button>
                  </div>

                  {/* Merchant Info Details */}
                  <div className="flex-1 space-y-3 w-full text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                      <Smartphone size={12} className="text-blue-400" />
                      {activeOption.type} Account
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Merchant Account Number</span>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <span className="text-lg font-mono font-black text-white tracking-wider">{activeOption.accountNumber}</span>
                        <button
                          onClick={handleCopyAccount}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                          title="Copy Number"
                        >
                          {copiedAccount ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopyPayload}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        {copiedPayload ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        Copy Payment Info
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Info size={14} /> How to pay with {activeOption.name}
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 font-medium">
                    {activeOption.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Transaction ID Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Enter Transaction ID (TrxID) *</span>
                      <span className="text-slate-500 font-normal">Found in payment SMS / App confirmation</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => {
                          setTrxId(e.target.value.toUpperCase());
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="e.g. 9J48X7K2PL or 202607261234"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 text-xs font-mono font-bold text-white outline-none focus:border-blue-500 transition-all uppercase placeholder:normal-case"
                        required
                      />
                      {trxId && (
                        <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                      )}
                    </div>
                    {errorMsg && <p className="text-xs text-rose-400 mt-1 font-bold">{errorMsg}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !trxId.trim()}
                    className={`w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
                      trxId.trim()
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40 cursor-pointer active:scale-98'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Payment...</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Confirm Payment & Complete Order</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
