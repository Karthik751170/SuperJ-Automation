'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Coins, CreditCard, ChevronRight, CheckCircle, RefreshCw, Landmark, History,
  ArrowLeft, Info, AlertTriangle
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  provider: string;
  created_at: string;
}

interface Transaction {
  transaction_id: string;
  tier_name: string;
  amount: number;
  price: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface TierConfig {
  name: string;
  tokens: number;
  price: number; // in INR
  badge?: string;
  description: string;
  glowColor: string;
}

const TIERS: TierConfig[] = [
  {
    name: "Starter Pack",
    tokens: 100,
    price: 10,
    description: "Get started with custom on-device camera directions.",
    glowColor: "group-hover:shadow-emerald-500/10 border-emerald-950/20 hover:border-emerald-500/40"
  },
  {
    name: "Creator Pack",
    tokens: 250,
    price: 20,
    badge: "Best Value",
    description: "Highly recommended for active video storyboard compiles.",
    glowColor: "group-hover:shadow-teal-500/15 border-teal-500/30 hover:border-teal-500 ring-1 ring-teal-500/10"
  },
  {
    name: "Studio Pack",
    tokens: 700,
    price: 50,
    description: "Designed for heavy production loops and rendering workloads.",
    glowColor: "group-hover:shadow-cyan-500/10 border-cyan-950/20 hover:border-cyan-500/40"
  }
];

export default function WalletPage() {
  const router = useRouter();

  // Session state
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Wallet states
  const [tokensBalance, setTokensBalance] = useState<number>(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Checkout states
  const [activeTier, setActiveTier] = useState<TierConfig | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'card' | 'gpay' | 'apple_pay'>('card');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [activeOrderData, setActiveOrderData] = useState<any>(null);

  // Status states
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authenticate session and load Razorpay checkout script on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedEmail = localStorage.getItem('auth_email');

    if (!savedToken) {
      router.push('/login');
      return;
    }

    setToken(savedToken);
    setEmail(savedEmail);
    loadDashboardData(savedToken, savedEmail);

    // Dynamically inject Razorpay SDK script
    if (!document.getElementById('razorpay-checkout-sdk')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadWalletData = async (sessionToken: string, fallbackEmail: string | null) => {
    setIsLoading(true);
    try {
      const profileRes = await fetch('http://127.0.0.1:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (profileRes.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_email');
        router.push('/login');
        return;
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData);
      }

      const walletRes = await fetch('http://127.0.0.1:8000/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setTokensBalance(wData.tokens ?? 0);
        setTransactions(wData.transactions || []);
      }
      setIsServerOffline(false);

    } catch (err: any) {
      console.warn("FastAPI offline. Fallback to local memory state.");
      setIsServerOffline(true);
      
      setProfile({
        id: "mock_mongo_id_123",
        email: fallbackEmail || 'user@example.com',
        provider: 'local',
        created_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Purchase Process
  const handleInitiatePurchase = async (tier: TierConfig) => {
    if (!token) return;
    setActiveTier(tier);
    setIsProcessingCheckout(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/wallet/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tier_name: tier.name,
          price: tier.price,
          token_amount: tier.tokens
        })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.detail || "Order creation failed");
      
      setActiveOrderData(orderData);

      if (orderData.is_emulator) {
        setShowCheckoutModal(true);
      } else {
        launchRealRazorpay(orderData, tier);
      }

    } catch (err: any) {
      showToast(err.message || "Payment gateway offline. Could not contact the checkout server.", "error", "Payment Gateway Error");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Real Razorpay SDK Trigger
  const launchRealRazorpay = (orderData: any, tier: TierConfig) => {
    const RazorpayClass = (window as any).Razorpay;
    if (!RazorpayClass) {
      showToast("Razorpay checkout SDK failed to load. Please check your internet connection.", "error", "SDK Error");
      return;
    }

    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "AURA Studio",
      description: `Add ${tier.tokens} tokens to balance`,
      order_id: orderData.order_id,
      handler: async function (response: any) {
        setIsProcessingCheckout(true);
        try {
          const verifyRes = await fetch('http://127.0.0.1:8000/api/wallet/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier_name: tier.name,
              price: tier.price,
              token_amount: tier.tokens
            })
          });

          const data = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(data.detail || "Verification failed");

          setTokensBalance(data.tokens);
          setTransactions(data.transactions);
          showToast(`Successfully purchased ${tier.tokens} tokens!`, "success", "Payment Success");
        } catch (e: any) {
          showToast(e.message || "Cryptographic validation of transaction signature failed.", "error", "Verification Error");
        } finally {
          setIsProcessingCheckout(false);
        }
      },
      prefill: {
        email: email || "customer@aura.com"
      },
      theme: {
        color: "#10b981"
      }
    };

    const rzp = new RazorpayClass(options);
    rzp.open();
  };

  // Confirm Emulator Checkout
  const handleConfirmEmulatorCheckout = async () => {
    if (!activeTier || !activeOrderData || !token) return;
    setIsProcessingCheckout(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/wallet/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: activeOrderData.order_id,
          razorpay_payment_id: "pay_emu_mock",
          razorpay_signature: "sig_emu_mock",
          tier_name: activeTier.name,
          price: activeTier.price,
          token_amount: activeTier.tokens
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed");

      setTokensBalance(data.tokens);
      setTransactions(data.transactions);
      setCheckoutSuccess(true);
      showToast(`Successfully added ${activeTier.tokens} tokens to your balance!`, "success", "Payment Verified");

    } catch (err: any) {
      showToast(err.message || "Emulator verification failed.", "error", "Verification Error");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Verifying secure wallet credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden relative">
      
      {/* Background Emerald & Teal Neon Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="bg-slate-950/40 border-b border-slate-900/60 px-8 py-5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-550 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase font-mono">AURA WALLET</h1>
            <p className="text-[10px] text-slate-450 mt-0.5 tracking-wider uppercase font-mono">Token packages & ledger history</p>
          </div>
        </div>

        {/* Balance Badge */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl px-5 py-2 flex items-center gap-3 shadow-lg">
          <Coins className="w-5 h-5 text-emerald-450 animate-pulse" />
          <div className="text-left">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Balance</span>
            <span className="text-base font-black text-white font-mono block leading-none mt-0.5">{tokensBalance} 🪙</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1340px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* Left Column: Tiers & Ledger (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6">

          {/* API Server Offline Notice */}
          {isServerOffline && (
            <div className="bg-amber-950/20 border border-amber-900/30 text-amber-300 text-xs p-4.5 rounded-2xl flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Local API Server Offline</span>
                <p className="text-[11px] text-amber-400/80 mt-0.5 leading-relaxed">
                  FastAPI server is currently offline. Token purchase validations will fallback.
                </p>
              </div>
            </div>
          )}

          {/* Store Package List */}
          <div className="bg-slate-950/25 border border-slate-900/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-6">
            
            {/* Header back button */}
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                Back to Dashboard
              </Link>

              <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-lg px-3 py-1 text-[10px] font-bold text-emerald-300 font-mono tracking-wide uppercase">
                ⚡ Secure signature verification
              </div>
            </div>

            <div>
              <h3 className="text-md font-extrabold text-slate-200 tracking-tight flex items-center gap-2">
                <Coins className="w-4.5 h-4.5 text-emerald-450 animate-pulse" />
                Store Packages (₹10 = 100 Tokens)
              </h3>
              <p className="text-xs text-slate-450 mt-1 leading-relaxed">Choose a store package. Tokens are immediately credited upon signature verification.</p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TIERS.map((tier) => (
                <div 
                  key={tier.name}
                  className={`group bg-slate-950/50 border rounded-2xl p-5 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${tier.glowColor}`}
                >
                  {tier.badge && (
                    <span className="absolute -top-2.5 left-5 bg-emerald-650 text-white font-mono text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-650/20">
                      {tier.badge}
                    </span>
                  )}
                  
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase font-mono tracking-wider">{tier.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-white font-mono tracking-tight">{tier.tokens}</span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Tokens</span>
                    </div>
                    <p className="text-[11px] text-slate-455 leading-relaxed min-h-[48px]">{tier.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-900">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Price</span>
                      <span className="text-md font-bold text-emerald-400 font-mono">
                        ₹{tier.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuyTokens(tier)}
                      disabled={isServerOffline || isProcessingCheckout}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        tier.badge 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-650/15' 
                          : 'bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200'
                      } disabled:opacity-40`}
                    >
                      {isProcessingCheckout && activeTier?.name === tier.name ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Billing...
                        </>
                      ) : (
                        <>
                          Purchase
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger logs */}
          <div className="bg-slate-950/25 border border-slate-900/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-4 mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                <History className="w-4 h-4 text-slate-500" />
                TRANSACTION HISTORY LEDGER
              </h3>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                MongoDB Sync
              </span>
            </div>

            <div className="flex-1 overflow-x-auto min-h-[220px]">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 italic text-[11px]">
                  <Landmark className="w-8 h-8 text-slate-850" />
                  <span>No purchase transaction history detected in database.</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-[10px] text-slate-550 uppercase font-mono font-bold tracking-wider">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Transaction ID</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3">Tier</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-right">Price</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.transaction_id} className="border-b border-slate-900/40 hover:bg-slate-900/10 transition-all font-mono text-[11px] text-slate-300">
                        <td className="py-2.5 px-3 text-slate-455 font-sans">
                          {new Date(tx.created_at).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 text-slate-455">#{tx.transaction_id.substring(4, 12)}</td>
                        <td className="py-2.5 px-3 uppercase text-[9px] text-slate-500">{tx.payment_method.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 text-slate-200">{tx.tier_name.split(' ')[0]}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-450 font-bold">+{tx.amount}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-200">₹{tx.price}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </section>

        {/* Right Column: Billing Info (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-slate-950/25 border border-slate-900/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-900">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide">Wallet Balance</h4>
                <p className="text-[9px] text-slate-550 uppercase">Verified Balance</p>
              </div>
            </div>
            <div className="text-center py-6 bg-slate-950/40 border border-slate-900 rounded-xl shadow-inner space-y-1">
              <span className="text-4xl font-black text-white font-mono">{tokensBalance} 🪙</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Active Tokens</span>
            </div>
          </div>

          <div className="bg-slate-950/25 border border-slate-900/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Info className="w-4 h-4 text-emerald-400" />
              Billing Details
            </span>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Transactions are verified cryptographically against Razorpay endpoints. Contact support if transaction credits fail to load within 5 minutes.
            </p>
          </div>

        </section>

      </main>

      {/* CHECKOUT MODAL: Sandbox Emulator popup */}
      {showCheckoutModal && activeTier && activeOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          
          <div className="w-full max-w-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 relative">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[8px] font-bold text-amber-300 tracking-wider uppercase font-mono mb-2 shadow-inner">
                ⚠️ Razorpay Keys Offline: Sandbox Emulator Mode
              </div>
              <h3 className="text-sm font-bold text-slate-200">Simulate Razorpay checkout</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Purchasing {activeTier.name} — Adds {activeTier.tokens} Tokens</p>
            </div>

            {checkoutSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-200">Mock Payment Processed Successfully!</h4>
                <p className="text-[10px] text-slate-400 max-w-[280px]">
                  Verified on backend node. {activeTier.tokens} credits have been deposited to your account ledger.
                </p>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition mt-4 shadow"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Method Toggles */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['card', 'gpay', 'apple_pay'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setCheckoutMethod(method)}
                        className={`py-2.5 rounded-lg text-[9px] font-bold border transition text-center capitalize ${
                          checkoutMethod === method 
                            ? 'bg-emerald-650/15 border-emerald-500 text-emerald-450' 
                            : 'bg-slate-950/40 border-slate-850 text-slate-450 hover:border-slate-800'
                        }`}
                      >
                        {method === 'gpay' ? 'Google Pay' : method === 'apple_pay' ? 'Apple Pay' : 'Card'}
                      </button>
                    ))}
                  </div>
                </div>

                {checkoutMethod === 'card' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 mb-1 uppercase font-mono">Card Holder Name</label>
                      <input 
                        type="text" 
                        defaultValue="Karthik U"
                        placeholder="John Doe"
                        className="w-full bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 mb-1 uppercase font-mono">Card Information</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <CreditCard className="w-3.5 h-3.5" />
                        </span>
                        <input 
                          type="text" 
                          defaultValue="4111 2222 3333 4444"
                          placeholder="Card Number"
                          className="w-full bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center py-6 text-slate-400 text-xs">
                    Verify account linkage and authenticate popup to continue GPay/Apple Pay.
                  </div>
                )}

                {/* Confirm Deck */}
                <div className="pt-2.5 border-t border-slate-850 flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Total Price</span>
                    <span className="font-bold text-emerald-455 font-mono">₹{activeTier.price}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-450 hover:text-slate-350 text-[10px] font-bold transition"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleConfirmEmulatorCheckout}
                      disabled={isProcessingCheckout}
                      className="px-4 py-2 rounded-lg bg-emerald-650 hover:bg-emerald-500 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-lg shadow-emerald-600/10"
                    >
                      {isProcessingCheckout ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Payment'
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Floating Toast Notification Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-fade-in ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/50'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-slate-950/50'
            }`}
          >
            <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
              toast.type === 'error' ? 'text-rose-400' :
              toast.type === 'success' ? 'text-emerald-400' :
              toast.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
            }`} />
            <div className="flex-1 text-xs">
              {toast.title && <div className="font-bold font-mono uppercase tracking-wider mb-0.5">{toast.title}</div>}
              <div className="leading-relaxed opacity-95">{toast.message}</div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white transition p-1 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
