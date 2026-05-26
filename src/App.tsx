/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toDataURL } from 'qrcode';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  LayoutDashboard, MapPin, Layers, GraduationCap, Gift, ShieldAlert,
  BarChart3, Cpu, Recycle, Users, Target, CheckCircle2,
  AlertTriangle, Lightbulb, Link as LinkIcon, Smartphone, Trash2, Wallet, Activity, Gavel, MessageSquare, Send, Building, Phone, Mail, Instagram, Twitter, Linkedin
} from 'lucide-react';

// --- Theme & Components ---
const colors = {
  primary: '#10B981',
  secondary: '#1A1E26',
  accent: '#10B981',
  bg: '#0A0B0E',
  surface: '#161920',
  text: '#E2E8F0',
  textMuted: '#64748B'
};

const Card = ({ children, className = '', ...props }: any) => (
  <section className={`bg-[#161920] border border-[#2D323A] rounded-sm  overflow-hidden ${className}`} {...props}>
    {children}
  </section>
);

// --- Data for Charts ---
const recyclingData = [
  { month: 'Jan', rate: 25, pollution: 80 },
  { month: 'Feb', rate: 28, pollution: 76 },
  { month: 'Mar', rate: 35, pollution: 65 },
  { month: 'Apr', rate: 42, pollution: 58 },
  { month: 'May', rate: 50, pollution: 50 },
  { month: 'Jun', rate: 65, pollution: 35 },
];

const binData = [
  { zone: 'North', bins: 120, avgFill: 85 },
  { zone: 'South', bins: 95, avgFill: 40 },
  { zone: 'East', bins: 150, avgFill: 65 },
  { zone: 'West', bins: 80, avgFill: 90 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Executive Summary', icon: LayoutDashboard },
    { id: 'infrastructure', label: 'Smart Infrastructure', icon: Cpu },
    { id: 'engagement', label: 'Community Engagement', icon: Users },
    { id: 'strategy', label: 'Implementation Strategy', icon: Target },
    { id: 'auction', label: 'B2B Plastics Auction', icon: Gavel },
  ];

  const accessKey = '900900';
  const reservePrice = 280;

  const [adminKey, setAdminKey] = useState('');
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [externalJoinToken, setExternalJoinToken] = useState('');
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; email: string; zone: string; bid: number }>>([]);
  const [bidHistory, setBidHistory] = useState<Array<{ company: string; amount: number; time: number }>>([]);
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [companyEmailInput, setCompanyEmailInput] = useState('');
  const [companyZoneInput, setCompanyZoneInput] = useState('');
  const [auctionMessage, setAuctionMessage] = useState('Enter the admin access key to start a secure auction.');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [winner, setWinner] = useState<{ company: string; amount: number; margin: number } | null>(null);

  const highestBid = participants.reduce((max, participant) => Math.max(max, participant.bid), 0);
  const currentWinner = participants.find((participant) => participant.bid === highestBid && highestBid > 0) ?? null;

  const updateAuctionMessage = (message: string) => {
    setAuctionMessage(message);
  };

  const authorizeAdmin = () => {
    if (adminKey.trim() === accessKey) {
      setIsAdminAuthorized(true);
      updateAuctionMessage('Admin access granted. Start the auction to generate the QR code and invite companies.');
    } else {
      updateAuctionMessage('Invalid access key. Use 900900 to manage this auction.');
    }
  };

  const concludeAuction = () => {
    if (!auctionStarted || auctionEnded) return;
    setAuctionEnded(true);
    setAuctionStarted(false);
    setAuctionMessage('Auction has ended. The highest bidder wins unless there were no qualified bids.');

    if (currentWinner) {
      const margin = Math.max(0, currentWinner.bid - reservePrice);
      setWinner({ company: currentWinner.name, amount: currentWinner.bid, margin });
      updateAuctionMessage(`${currentWinner.name} won the auction with $${currentWinner.bid.toFixed(2)} / ton.`);
    } else {
      setWinner(null);
      updateAuctionMessage('No eligible bids were received. Auction concluded without a winner.');
    }
  };

  useEffect(() => {
    if (!auctionStarted || auctionEnded) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivity) / 1000);

      if (currentWinner && currentWinner.bid >= reservePrice * 2) {
        updateAuctionMessage('100% profit reached. Closing the auction to secure the plastics sale.');
        concludeAuction();
      } else if (participants.length === 1 && elapsed >= 12) {
        updateAuctionMessage('Single bid held for 12 seconds with no competing offer. Closing the auction.');
        concludeAuction();
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [auctionStarted, auctionEnded, lastActivity, currentWinner, participants.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    setExternalJoinToken(token);
    setActiveTab('auction');
    updateAuctionMessage('Join token detected. Use the auction form to register and place your bid.');
  }, []);

  const startAuction = async () => {
    if (!isAdminAuthorized) {
      updateAuctionMessage('You must authorize as admin before starting the auction.');
      return;
    }

    const token = `auction-${Date.now()}`;
    setJoinCode(token);
    setAuctionStarted(true);
    setAuctionEnded(false);
    setBidHistory([]);
    setParticipants([]);
    setWinner(null);

    const payload = typeof window !== 'undefined'
      ? `${window.location.origin}/auction/join?token=${token}`
      : `auction://join?token=${token}`;

    try {
      const qr = await toDataURL(payload, {
        margin: 1,
        width: 260,
        color: { dark: '#10B981', light: '#f8fafc' },
      });
      setQrCodeDataUrl(qr);
      setLastActivity(Date.now());
      updateAuctionMessage('Auction started. QR join code is live; sale closes at 100% profit or after one bid remains unchallenged for 12 seconds.');
    } catch (error) {
      setQrCodeDataUrl('');
      updateAuctionMessage('Failed to generate QR code. Try again or refresh the page.');
    }
  };

  const handleJoinCompany = () => {
    if (!auctionStarted && !externalJoinToken) {
      updateAuctionMessage('Start the auction first. The QR code must be active before companies can join.');
      return;
    }
    if (!companyNameInput || !companyEmailInput || !companyZoneInput) {
      updateAuctionMessage('Please fill company name, email, and target zone to join the auction.');
      return;
    }

    setParticipants((prev) => {
      const existing = prev.find((company) => company.email === companyEmailInput.trim().toLowerCase());
      if (existing) {
        updateAuctionMessage(`${companyNameInput} is already joined. You can place a bid now.`);
        return prev;
      }

      return [
        ...prev,
        {
          id: `${companyNameInput.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          name: companyNameInput.trim(),
          email: companyEmailInput.trim().toLowerCase(),
          zone: companyZoneInput,
          bid: 0,
        },
      ];
    });

    setLastActivity(Date.now());
    updateAuctionMessage(`${companyNameInput} has joined the auction. Ready to place the first bid.`);
  };

  const handleSubmitBid = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auctionStarted && !externalJoinToken) {
      updateAuctionMessage('Auction is not live locally. Scan the QR again from the admin device or start the auction.');
      return;
    }

    const amount = Number(bidAmountInput);
    if (!companyNameInput || !companyEmailInput || !companyZoneInput) {
      updateAuctionMessage('Please enter company details and select a target zone before bidding.');
      return;
    }
    if (!amount || amount <= highestBid) {
      updateAuctionMessage(`Bids must be higher than the current top bid of $${highestBid.toFixed(2)}.`);
      return;
    }

    const normalizedEmail = companyEmailInput.trim().toLowerCase();
    setParticipants((prev) => {
      const existing = prev.find((company) => company.email === normalizedEmail);
      if (existing) {
        return prev.map((company) =>
          company.email === normalizedEmail ? { ...company, bid: amount } : company
        );
      }
      return [
        ...prev,
        {
          id: `${companyNameInput.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          name: companyNameInput.trim(),
          email: normalizedEmail,
          zone: companyZoneInput,
          bid: amount,
        },
      ];
    });

    setBidHistory((prev) => [
      ...prev,
      { company: companyNameInput.trim(), amount, time: Date.now() },
    ]);

    setBidAmountInput('');
    setLastActivity(Date.now());
    updateAuctionMessage(`${companyNameInput.trim()} placed a leading bid of $${amount.toFixed(2)} / ton.`);
  };

  return (
    <div className="flex h-screen bg-[#0A0B0E] font-sans text-[#E2E8F0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#161920] text-white flex flex-col  z-20 hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#161920]0 rounded-sm">
              <Recycle size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-normal tracking-tight text-white">EcoTrack</h1>
          </div>
          <p className="text-[#64748B] text-sm font-medium">Plastic Waste Management System</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#1A1E26] text-white shadow-inner font-semibold' 
                    : 'text-[#64748B] hover:bg-[#1A1E26] hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#10B981]' : 'text-[#10B981]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-6 bg-[#0A0B0E]">
          <p className="text-xs text-[#10B981] leading-relaxed">
            Prototype Proposal <br/>v1.0
          </p>
        </div>
      </aside>

      {/* Mobile Nav TopBar */}
      <div className="md:hidden fixed top-0 w-full bg-[#161920] flex text-white p-4 items-center z-30">
        <Recycle size={24} className="text-[#10B981] mr-2" />
        <h1 className="text-xl font-normal flex-1">EcoTrack</h1>
        <select 
          className="bg-[#161920] text-white border border-[#2D323A] rounded p-2 text-sm"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          {navItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative scroll-smooth flex flex-col h-full bg-[#0A0B0E]">
        <div className="max-w-6xl mx-auto w-full p-6 md:p-10 pb-24">
          
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <header className="mb-10">
                  <h2 className="text-4xl font-light tracking-tight mb-4">Prototype Objective</h2>
                  <p className="text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                    Develop a comprehensive, data-driven prototype that effectively tackles the challenges of plastic waste management through smart infrastructure, community incentives, and blockchain transparency.
                  </p>
                </header>

                <div>
                  <h3 className="text-2xl font-normal mb-6 flex items-center gap-2 text-[#E2E8F0]">
                    <Target className="text-[#10B981]" /> Expected Outcomes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                       { title: "Improved Recycling Rates", desc: "Targeting a 40% increase in pure plastic recovery through gamification at source.", icon: Recycle, color: "text-[#E2E8F0]", bg: "bg-[#161920]" },
                       { title: "Reduced Plastic Pollution", desc: "Intercepting 10k tons of leakage into urban waterways and drainage systems annually.", icon: ShieldAlert, color: "text-[#10B981]", bg: "bg-[#161920]" },
                       { title: "Cleaner Urban Environments", desc: "Eliminating overflowing bins through predictive routing and smart sensor grids.", icon: Trash2, color: "text-[#E2E8F0]", bg: "bg-[#161920]" },
                       { title: "Public Participation", desc: "Engaging 1M+ households using financial and social incentives.", icon: Users, color: "text-[#E2E8F0]", bg: "bg-[#161920]" }
                     ].map((item, i) => (
                       <Card key={i} className="p-6 transition-all hover: hover:-translate-y-1">
                         <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-4 ${item.bg}`}>
                           <item.icon className={item.color} size={24} />
                         </div>
                         <h4 className="font-normal text-[#E2E8F0] mb-2">{item.title}</h4>
                         <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
                       </Card>
                     ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-normal mb-6 mt-12 flex items-center gap-2 text-[#E2E8F0]">
                    <Users className="text-[#10B981]" /> Primary Stakeholders
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="flex flex-col h-full border-l-4 border-l-[#10B981]">
                      <div className="p-6 flex-1">
                        <h4 className="text-lg font-normal text-[#E2E8F0] mb-2">Urban Residents</h4>
                        <p className="text-[#94A3B8] text-sm mb-4">Everyday households making disposal decisions.</p>
                        <ul className="space-y-2 text-sm text-[#94A3B8]">
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /> Empowered via the EcoTrack app for easy drop-off locations.</li>
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" /> Directly incentivized via tokens for proper segregation.</li>
                        </ul>
                      </div>
                    </Card>
                    <Card className="flex flex-col h-full border-l-4 border-transparent border-[#2D323A]">
                      <div className="p-6 flex-1">
                        <h4 className="text-lg font-normal text-[#E2E8F0] mb-2">Municipal Bodies</h4>
                        <p className="text-[#94A3B8] text-sm mb-4">City planners and waste management operators.</p>
                        <ul className="space-y-2 text-sm text-[#94A3B8]">
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#E2E8F0] mt-0.5 shrink-0" /> Receives a live dashboard with predictive analytics for fleet paths.</li>
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#E2E8F0] mt-0.5 shrink-0" /> Cuts operational fuel costs up to 30% through optimized routing.</li>
                        </ul>
                      </div>
                    </Card>
                    <Card className="flex flex-col h-full border-l-4 border-transparent border-[#2D323A]">
                      <div className="p-6 flex-1">
                        <h4 className="text-lg font-normal text-[#E2E8F0] mb-2">Informal Waste Workers</h4>
                        <p className="text-[#94A3B8] text-sm mb-4">Waste pickers who historically form the backbone of recycling.</p>
                        <ul className="space-y-2 text-sm text-[#94A3B8]">
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#E2E8F0] mt-0.5 shrink-0" /> Formally integrated via registered digital identities.</li>
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#E2E8F0] mt-0.5 shrink-0" /> Guaranteed fair pricing at smart Collection Centers.</li>
                          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#E2E8F0] mt-0.5 shrink-0" /> Earn safety equipment tokens alongside cash rewards.</li>
                        </ul>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'infrastructure' && (
              <motion.div
                key="infrastructure"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <header className="mb-10">
                  <h2 className="text-4xl font-light tracking-tight mb-4">Smart Infrastructure</h2>
                  <p className="text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                    The physical backbone of EcoTrack. Combining IoT-enabled hardware with strategically mapped physical collection hubs to modernize the urban waste lifecycle.
                  </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[#1A1E26] text-[#E2E8F0] rounded-sm"><Cpu size={28} /></div>
                      <h3 className="text-xs font-mono text-[#10B981] tracking-[0.3em] uppercase mb-4">Smart Bins Integration</h3>
                    </div>
                    <p className="text-[#94A3B8] mb-6 leading-relaxed">
                      Traditional bins are upgraded into IoT endpoints, equipped with ultrasonic fill-level sensors and LoRaWAN communication, operating on solar-powered batteries.
                    </p>
                    <div className="bg-[#0A0B0E] p-6 rounded-sm border border-[#2D323A] mb-6 space-y-4">
                      <div className="flex justify-between items-center text-sm font-semibold text-[#94A3B8]">
                        <span>Central Plaza Bin #04</span>
                        <span className="text-[#E2E8F0] flex items-center"><AlertTriangle size={14} className="mr-1"/> 85% Full</span>
                      </div>
                      <div className="w-full bg-[#2D323A] rounded-full h-3">
                        <div className="bg-[#161920]0 h-3 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <div className="text-xs text-[#64748B]"><b className="text-[#E2E8F0]">Last pick-up:</b> 2 days ago</div>
                        <div className="text-xs text-[#64748B]"><b className="text-[#E2E8F0]">ETA:</b> 3rd on Queue</div>
                      </div>
                    </div>
                    <h4 className="font-normal text-[#E2E8F0] mb-3">Efficiency Optimization</h4>
                    <ul className="space-y-3 text-sm text-[#94A3B8]">
                      <li className="flex items-start gap-2">
                        <span className="bg-[#1A1E26] text-[#10B981] p-1 rounded"><CheckCircle2 size={16} /></span>
                        <span><b>Dynamic Routing:</b> Collection algorithms ingest real-time fill data to plot TSP (Traveling Salesperson) paths. Trucks bypass empty bins.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#1A1E26] text-[#10B981] p-1 rounded"><CheckCircle2 size={16} /></span>
                        <span><b>Weight & Quality Sensors:</b> AI cameras in pilot bins detect contamination (e.g., organic waste in the plastic bin) to prioritize sorting.</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[#1A1E26] text-[#E2E8F0] rounded-sm"><MapPin size={28} /></div>
                      <h3 className="text-xs font-mono text-[#10B981] tracking-[0.3em] uppercase mb-4">Collection Centers</h3>
                    </div>
                    <p className="text-[#94A3B8] mb-6 leading-relaxed">
                      A dispersed network of ultra-accessible drop-off sites combining Reverse Vending Machines (RVMs) for single bottles, and Bulk Weighing Kiosks for sorted household bags.
                    </p>
                    <div className="relative h-48 bg-[#0A0B0E] rounded-sm border border-[#2D323A] mb-6 overflow-hidden flex items-center justify-center">
                      {/* Abstract Map visual */}
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <MapPin size={48} className="text-[#10B981] drop-shadow-lg" />
                        <span className="mt-2 bg-[#161920] px-3 py-1 rounded-full text-xs font-normal text-[#10B981] shadow border border-[#10B981]/30">Optimized GIS Placement</span>
                      </div>
                      
                      {/* Map Nodes */}
                      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#161920]0 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                      <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-[#161920]0 rounded-full animate-pulse delay-75 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-[#161920]0 rounded-full animate-pulse delay-150 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    </div>
                    <h4 className="font-normal text-[#E2E8F0] mb-3">Site Selection & Design</h4>
                    <ul className="space-y-3 text-sm text-[#94A3B8]">
                      <li className="flex items-start gap-2">
                        <span className="bg-[#1A1E26] text-[#10B981] p-1 rounded"><MapPin size={16} /></span>
                        <span><b>GIS Mapping:</b> Placed at high-footfall intersections (malls, transit hubs, schools) within a maximum 10-minute walk radius in dense zones.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#1A1E26] text-[#10B981] p-1 rounded"><Users size={16} /></span>
                        <span><b>User-Friendly Setup:</b> Well-lit, 24/7 access, shaded areas, automated digital onboarding, and ADA compliant designs to ensure safety and hygiene.</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </motion.div>
            )}

            
            {activeTab === 'engagement' && (
              <motion.div
                key="engagement"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <header className="mb-10">
                  <h2 className="text-4xl font-light tracking-tight mb-4">Community Engagement</h2>
                  <p className="text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                    Technology fails without human adoption. We deploy dual strategies: early-age education through Schools, and gamified financial incentives for Households.
                  </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <Card className="p-0 flex flex-col items-start border-[#10B981]/30 shadow-emerald-500/5">
                    <div className="p-8 w-full bg-gradient-to-br from-emerald-50 to-white">
                      <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="text-[#10B981]" size={32} />
                        <h3 className="text-xs font-mono text-[#10B981] tracking-[0.3em] uppercase mb-4">User Awareness Module</h3>
                      </div>
                      <p className="text-[#94A3B8] mb-6">
                        Targeting schools and communities to alter behavioral paradigms surrounding single-use plastics and lifecycle management.
                      </p>
                      
                      <div className="space-y-6">
                        <div className="bg-[#161920] p-4 rounded-sm border border-[#10B981]/30 ">
                          <h4 className="font-normal text-[#E2E8F0] mb-2 flex items-center gap-2"><Smartphone size={16} className="text-[#10B981]"/> Mobile AR Recycling Games</h4>
                          <p className="text-sm text-[#94A3B8]">Students use an AR app to point at physical waste and learn its categorization, scoring points for their school's leaderboard.</p>
                        </div>
                        <div className="bg-[#161920] p-4 rounded-sm border border-[#10B981]/30 ">
                          <h4 className="font-normal text-[#E2E8F0] mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-[#10B981]"/> Community "Trash-to-Treasures" Workshops</h4>
                          <p className="text-sm text-[#94A3B8]">Monthly hands-on events showing upcycling mechanics. High-impact messaging strategy focusing on localized, visible pollution effects rather than abstract global data.</p>
                        </div>
                        <div className="bg-[#161920] p-4 rounded-sm border border-[#10B981]/30 ">
                          <h4 className="font-normal text-[#E2E8F0] mb-2 flex items-center gap-2"><Users size={16} className="text-[#10B981]"/> School-wide Leagues</h4>
                          <p className="text-sm text-[#94A3B8]">Inter-school competitions on plastic volume successfully diverted from landfills, with the winning school receiving sustainability grants.</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-0 overflow-hidden flex flex-col">
                    <div className="p-8 bg-[#1A1E26] text-white flex-1 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#161920]0/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <Gift className="text-[#10B981]" size={32} />
                        <h3 className="text-2xl font-normal">Incentive Programs</h3>
                      </div>
                      <p className="text-[#94A3B8] mb-8 relative z-10 leading-relaxed text-sm">
                        A detailed reward architecture designed to ensure households physically segregate their plastic waste before disposal.
                      </p>

                      <div className="relative z-10 bg-[#0A0B0E] rounded-sm p-6 border border-[#2D323A] ">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <p className="text-sm text-[#64748B] font-medium tracking-wide uppercase">My Balance</p>
                            <h4 className="text-3xl font-light text-white flex items-center gap-2">
                              4,250 <span className="text-[#10B981] text-lg">EcoCoins</span>
                            </h4>
                          </div>
                          <div className="p-3 bg-[#161920]0/20 text-[#10B981] rounded-full">
                            <Wallet size={24} />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs text-[#64748B] uppercase tracking-widest font-semibold mb-2 mt-4">Redemption Partners</p>
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-sm hover:bg-slate-700 transition cursor-pointer">
                            <span className="text-sm font-medium">🚇 City Transit Pass</span>
                            <span className="text-xs bg-[#161920]0/20 text-[#10B981] px-2 py-1 rounded font-mono">-1,000 EC</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-sm hover:bg-slate-700 transition cursor-pointer">
                            <span className="text-sm font-medium">🛒 $10 Grocery Voucher</span>
                            <span className="text-xs bg-[#161920]0/20 text-[#10B981] px-2 py-1 rounded font-mono">-5,000 EC</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-sm hover:bg-slate-700 transition cursor-pointer">
                            <span className="text-sm font-medium">💡 Utility Bill Offset</span>
                            <span className="text-xs bg-[#161920]0/20 text-[#10B981] px-2 py-1 rounded font-mono">-2,500 EC</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-8 text-xs text-[#64748B] italic relative z-10">
                        * Tokens are securely minted to exactly map the kg amount of plastic validated by collection center RVMs and scales. Quality bonuses applied for clean, pre-washed PET.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Data Monitoring Card */}
                <Card className="p-6 col-span-1 lg:col-span-2 mt-8 mb-8 mx-auto w-full">
                  <h3 className="text-xl font-normal mb-4 flex items-center gap-2 max-w-full"><BarChart3 className="text-[#E2E8F0]"/> Data Monitoring</h3>
                  <p className="text-[#94A3B8] text-sm mb-6 w-full">
                    Continuous refinement is powered by deep analytics tracking recycling rates versus pollution indicators over time, influenced by active community engagement.
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={recyclingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1A1E26' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Line type="monotone" name="Recycling %" dataKey="rate" stroke="#059669" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                        <Line type="monotone" name="Pollution Index" dataKey="pollution" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

              </motion.div>
            )}

            {activeTab === 'strategy' && (
              <motion.div
                key="strategy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <header className="mb-10">
                  <h2 className="text-4xl font-light tracking-tight mb-4">Implementation & Evaluation</h2>
                  <p className="text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                    Deploying complex cyber-physical systems requires preempting roadblocks. Here are our identified challenges, mitigation solutions, and strict success parameters.
                  </p>
                </header>

                <Card className="overflow-hidden mb-8">
                  <div className="bg-[#1A1E26] text-white p-6 border-b border-[#2D323A]">
                    <h3 className="text-xl font-normal flex items-center gap-2"><ShieldAlert className="text-amber-400"/> Challenges & Solutions</h3>
                  </div>
                  <div className="divide-y divide-[#2D323A]">
                    {[
                      { issue: "High Upfront Infrastructure Cost", sol: "Implement Public-Private Partnerships (PPP) utilizing corporate ESG budgets for pilot zone funding." },
                      { issue: "Vandalism of Smart Bins", sol: "Engineer bins with impact-resistant casings; install in high-visibility areas with community 'guardianship' incentives." },
                      { issue: "Informal Worker Displacement", sol: "Onboard them as 'Eco-Agents' with exclusive access to high-yield bins and premium app rates to formally protect livelihoods." },
                      { issue: "Digital Divide / Smartphone Access", sol: "Provide USSD/SMS based QR-generation tools, or physical NFC 'Eco-Cards' independent of smartphone ownership." },
                    ].map((row, i) => (
                      <div key={i} className="p-6 md:flex gap-6 hover:bg-[#0A0B0E] transition-colors">
                        <div className="md:w-1/3 mb-2 md:mb-0">
                          <h4 className="font-normal text-[#E2E8F0] text-sm flex items-start gap-2">
                            <span className="text-red-500 shrink-0 mt-0.5">•</span>
                            {row.issue}
                          </h4>
                        </div>
                        <div className="md:w-2/3">
                          <p className="text-[#94A3B8] text-sm flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5"/>
                            {row.sol}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div>
                  <h3 className="text-2xl font-normal mb-6 flex items-center gap-2 text-[#E2E8F0]">
                    <Activity className="text-[#10B981]" /> Success Metrics & Feedback Loop
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-t-4 border-t-[#10B981]">
                      <h4 className="font-normal text-[#E2E8F0] mb-4 text-center">Volume Metrics</h4>
                      <ul className="space-y-3 text-sm text-[#94A3B8] text-center">
                        <li><b>Tonnage Diverted:</b> Metric tons of plastic skipping landfill per month.</li>
                        <li><b>Purity Rate:</b> Percentage of collected plastic successfully recycled vs rejected.</li>
                      </ul>
                    </Card>
                    <Card className="p-6 border-t-4 border-transparent border-[#2D323A]">
                      <h4 className="font-normal text-[#E2E8F0] mb-4 text-center">Adoption Metrics</h4>
                      <ul className="space-y-3 text-sm text-[#94A3B8] text-center">
                        <li><b>MAU (Monthly Active Users):</b> Total users redeeming EcoCoins.</li>
                        <li><b>School Campaigns:</b> Number of registered institutions engaging in AR challenges.</li>
                      </ul>
                    </Card>
                    <Card className="p-6 border-t-4 border-transparent border-[#2D323A]">
                      <h4 className="font-normal text-[#E2E8F0] mb-4 text-center">Operational Metrics</h4>
                      <ul className="space-y-3 text-sm text-[#94A3B8] text-center">
                        <li><b>Cost Per Tonne:</b> Financial health of the collection logistics.</li>
                        <li><b>Truck Uptime:</b> Efficiency gained through dynamic TSP routing.</li>
                      </ul>
                    </Card>
                  </div>
                  
                  <div className="mt-8 bg-[#161920] p-6 rounded-sm border border-[#10B981]/30 flex items-start gap-4">
                    <Layers className="text-[#10B981] shrink-0 mt-1" />
                    <div>
                      <h4 className="font-normal text-[#E2E8F0] mb-2">Continuous Improvement Feedback Loop</h4>
                      <p className="text-[#94A3B8] text-sm leading-relaxed">
                        The prototype operates an agile feedback mechanism. Biannual Town Halls act as qualitative feedback sessions with formal and informal stakeholders. Quantitatively, the underlying AI model recalibrates the incentive values dynamically—if PET supplies are high but rare HDPE plastics drop, the system automatically surges the ECO-Token value for HDPE to drive immediate user behavior adjustments, tracked via the real-time analytics dashboard.
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          

            {activeTab === 'auction' && (
              <motion.div
                key="auction"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 flex flex-col min-h-[calc(100vh-100px)]"
              >
                <header className="mb-4 border-b border-[#2D323A] pb-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Gavel className="text-[#10B981] w-8 h-8" />
                        <h2 className="text-4xl font-light tracking-tight">B2B Plastics Auction</h2>
                      </div>
                      <p className="text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                        Secure admin access, generate a QR join code, and manage live bidding with automatic auction close behavior.
                      </p>
                    </div>
                    <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4 text-sm text-[#94A3B8]">
                      <div className="mb-2 uppercase tracking-[0.3em] text-[#64748B]">Auction Close Rule</div>
                      <div className="text-[#E2E8F0]">Automatically closes on 100% profit</div>
                      <div className="text-[#10B981] mt-2">Or after one unchallenged bid remains for 12 seconds</div>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-8 flex-1">
                  <div className="space-y-6">
                    <Card className="p-6 border border-[#2D323A]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Admin Control</p>
                          <h3 className="text-2xl font-normal text-[#E2E8F0]">Secure Auction Access</h3>
                          <p className="text-sm text-[#94A3B8] mt-3">Enter the admin access key to generate the auction QR code and manage participation.</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full sm:w-[320px]">
                          <div className="relative">
                            <input
                              value={adminKey}
                              onChange={(event) => setAdminKey(event.target.value)}
                              placeholder="Access key"
                              className="w-full bg-[#0A0B0E] border border-[#2D323A] rounded-sm py-3 px-4 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#10B981]"
                              type="password"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={authorizeAdmin}
                            className="w-full bg-[#10B981] text-[#0A0B0E] py-3 rounded-sm font-medium hover:bg-[#059669] transition-colors"
                          >
                            Unlock Admin
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Auction Status</p>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${auctionEnded ? 'bg-red-500/10 text-red-400' : auctionStarted ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}`}>
                              {auctionEnded ? 'Ended' : auctionStarted ? 'Live' : 'Pending'}
                            </span>
                            <span className="text-sm text-[#94A3B8]">{auctionMessage}</span>
                          </div>

                          <div className="mt-4 text-sm text-[#94A3B8] space-y-2">
                            <p><span className="font-semibold text-[#E2E8F0]">Top bid:</span> ${highestBid.toFixed(2)}</p>
                            <p><span className="font-semibold text-[#E2E8F0]">Current leader:</span> {currentWinner ? currentWinner.name : 'No bids yet'}</p>
                          </div>
                        </div>

                        <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4 space-y-3">
                          <button
                            type="button"
                            onClick={startAuction}
                            className="w-full bg-[#10B981] text-[#0A0B0E] py-3 rounded-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-40"
                            disabled={!isAdminAuthorized}
                          >
                            {auctionStarted && !auctionEnded ? 'Restart Auction' : 'Start Auction'}
                          </button>
                          <p className="text-[11px] text-[#64748B]">Admin key required. Once the auction is live, companies can join via QR code or the join link below.</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border border-[#2D323A]">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">QR Join Code</p>
                          <h3 className="text-2xl font-normal text-[#E2E8F0]">Company Onboarding</h3>
                          <p className="text-sm text-[#94A3B8] mt-3">Generate a QR code at auction start so companies can join automatically and submit bids.</p>
                        </div>
                        <div className="text-right text-xs text-[#64748B]">Join token: <span className="text-[#E2E8F0] font-semibold">{joinCode || 'pending'}</span></div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 items-center">
                        <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4 min-h-[260px] flex items-center justify-center">
                          {qrCodeDataUrl ? (
                            <img src={qrCodeDataUrl} alt="Auction QR Code" className="w-56 h-56 m-auto" />
                          ) : (
                            <div className="text-center text-sm text-[#64748B]">
                              QR code will appear here once the admin starts the auction.
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Join Link</p>
                            <p className="text-sm text-[#E2E8F0] break-words">{qrCodeDataUrl ? `${window.location.origin}/auction/join?token=${joinCode}` : 'Awaiting QR generation...'}</p>
                          </div>
                          {externalJoinToken && (
                            <div className="rounded-sm border border-[#10B981]/20 bg-[#0A0B0E] p-4 text-sm text-[#94A3B8]">
                              <p className="text-[#E2E8F0] font-medium mb-1">Join token detected</p>
                              <p>This device opened the auction with token <span className="font-semibold text-[#10B981]">{externalJoinToken}</span>. Complete the form below to participate.</p>
                            </div>
                          )}
                          <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Instructions</p>
                            <ul className="space-y-2 text-sm text-[#94A3B8]">
                              <li>1. Admin unlocks with key 900900.</li>
                              <li>2. Start auction and share the QR code.</li>
                              <li>3. Companies join, then place bids above the current high bid.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border border-[#2D323A]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Participant Grid</p>
                          <h3 className="text-2xl font-normal text-[#E2E8F0]">Auction Participants</h3>
                        </div>
                        <span className="inline-flex rounded-full bg-[#10B981]/10 px-3 py-1 text-xs text-[#10B981]">{participants.length} joined</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {participants.length > 0 ? participants.map((company) => (
                          <div key={company.id} className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-base text-[#E2E8F0] font-medium">{company.name}</h4>
                              <span className="text-xs uppercase tracking-[0.3em] text-[#64748B]">{company.zone}</span>
                            </div>
                            <p className="text-sm text-[#94A3B8] mb-3">{company.email}</p>
                            <div className="rounded-sm bg-[#161920] border border-[#2D323A] p-3 text-sm text-[#E2E8F0]">
                              Current bid: <span className="font-semibold text-[#10B981]">${company.bid.toFixed(2)}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-sm border border-dashed border-[#2D323A] bg-[#0A0B0E] p-6 text-center text-sm text-[#64748B]">
                            No companies have joined yet. Once the auction is live, companies can scan the QR code to appear here.
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6 border border-[#2D323A]">
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Place Your Bid</p>
                        <h3 className="text-2xl font-normal text-[#E2E8F0]">Bid Submission</h3>
                        <p className="text-sm text-[#94A3B8] mt-3">New bids must be higher than the current highest bid to qualify.</p>
                      </div>

                      <form className="space-y-4" onSubmit={handleSubmitBid}>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Company Name</label>
                          <input
                            value={companyNameInput}
                            onChange={(event) => setCompanyNameInput(event.target.value)}
                            className="w-full bg-[#0A0B0E] border border-[#2D323A] rounded-sm py-3 px-4 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#10B981]"
                            placeholder="Acme Eco Bricks" type="text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Contact Email</label>
                          <input
                            value={companyEmailInput}
                            onChange={(event) => setCompanyEmailInput(event.target.value)}
                            className="w-full bg-[#0A0B0E] border border-[#2D323A] rounded-sm py-3 px-4 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#10B981]"
                            placeholder="procurement@company.com" type="email"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Target Zone</label>
                          <select
                            value={companyZoneInput}
                            onChange={(event) => setCompanyZoneInput(event.target.value)}
                            className="w-full bg-[#0A0B0E] border border-[#2D323A] rounded-sm py-3 px-4 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#10B981]"
                          >
                            <option value="">Select a zone</option>
                            <option value="Kuvempunagar">Kuvempunagar</option>
                            <option value="JP Nagar">JP Nagar</option>
                            <option value="Vijayanagar">Vijayanagar</option>
                            <option value="Gokulam">Gokulam</option>
                            <option value="All">All Zones</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Bid Amount</label>
                          <div className="relative">
                            <span className="absolute left-4 top-3.5 text-[#64748B] text-sm">$</span>
                            <input
                              value={bidAmountInput}
                              onChange={(event) => setBidAmountInput(event.target.value)}
                              className="w-full bg-[#0A0B0E] border border-[#2D323A] rounded-sm py-3 pl-10 pr-4 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#10B981]"
                              placeholder="0.00"
                              type="number"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={handleJoinCompany}
                            className="w-full bg-[#1A1E26] border border-[#2D323A] text-[#E2E8F0] py-3 rounded-sm hover:border-[#10B981] transition-colors"
                          >
                            Join Auction
                          </button>
                          <button
                            type="submit"
                            className="w-full bg-[#10B981] text-[#0A0B0E] py-3 rounded-sm font-medium hover:bg-[#059669] transition-colors"
                          >
                            Place Bid
                          </button>
                        </div>
                      </form>
                    </Card>

                    <Card className="p-6 border border-[#2D323A]">
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">Admin Monitoring</p>
                        <h3 className="text-2xl font-normal text-[#E2E8F0]">Bid Activity & Winners</h3>
                        <p className="text-sm text-[#94A3B8] mt-3">Track which companies placed bids, how much they offered, and the current profit margins for winners.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4">
                          <h4 className="text-sm text-[#E2E8F0] font-medium mb-3">Bid History</h4>
                          {bidHistory.length > 0 ? (
                            <div className="space-y-3">
                              {bidHistory.slice(-5).reverse().map((bid, index) => (
                                <div key={`${bid.company}-${index}`} className="flex items-center justify-between gap-4 text-sm text-[#94A3B8]">
                                  <span className="font-medium text-[#E2E8F0]">{bid.company}</span>
                                  <span>${bid.amount.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-[#64748B]">No bids yet. The first qualified company will appear here once they submit a bid.</p>
                          )}
                        </div>

                        <div className="rounded-sm border border-[#2D323A] bg-[#0A0B0E] p-4">
                          <h4 className="text-sm text-[#E2E8F0] font-medium mb-3">Winning Position</h4>
                          {winner ? (
                            <div className="space-y-3 text-sm text-[#94A3B8]">
                              <p><span className="text-[#E2E8F0] font-semibold">Winner:</span> {winner.company}</p>
                              <p><span className="text-[#E2E8F0] font-semibold">Final bid:</span> ${winner.amount.toFixed(2)}</p>
                              <p><span className="text-[#E2E8F0] font-semibold">Profit margin:</span> ${winner.margin.toFixed(2)} ({winner.amount > 0 ? ((winner.margin / winner.amount) * 100).toFixed(1) : '0'}%)</p>
                            </div>
                          ) : (
                            <p className="text-sm text-[#64748B]">No winner yet. The auction will finalize after a single unchallenged bid stands for 12 seconds, or when 100% profit is reached.</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <footer className="mt-8 border-t border-[#2D323A] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 pb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#E2E8F0] font-medium">
                      <Recycle size={20} className="text-[#10B981]"/> EcoTrack Industries
                    </div>
                    <p className="text-xs text-[#64748B]">Empowering sustainable supply chains via verified plastic recovery.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                     <p className="text-[10px] uppercase font-mono text-[#64748B] text-center md:text-right">Contact Inquiries</p>
                     <div className="flex gap-4 items-center justify-center md:justify-end text-[#94A3B8]">
                        <a href="#" className="hover:text-[#10B981] transition-colors flex items-center gap-1 text-xs"><Phone size={14} /> +91 800 123 4567</a>
                        <a href="#" className="hover:text-[#10B981] transition-colors flex items-center gap-1 text-xs"><Mail size={14} /> b2b@ecotrack.in</a>
                     </div>
                  </div>

                  <div className="flex gap-4 mt-2 md:mt-0">
                    <a href="#" className="w-8 h-8 rounded-sm bg-[#161920] border border-[#2D323A] text-[#64748B] flex items-center justify-center hover:text-[#10B981] hover:border-[#10B981]/50 transition-colors">
                      <Twitter size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-sm bg-[#161920] border border-[#2D323A] text-[#64748B] flex items-center justify-center hover:text-[#10B981] hover:border-[#10B981]/50 transition-colors">
                      <Instagram size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-sm bg-[#161920] border border-[#2D323A] text-[#64748B] flex items-center justify-center hover:text-[#10B981] hover:border-[#10B981]/50 transition-colors">
                      <Linkedin size={14} />
                    </a>
                  </div>
                </footer>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
