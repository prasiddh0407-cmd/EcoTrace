import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add imports
content = content.replace(
  /AlertTriangle, Lightbulb, Link as LinkIcon, Smartphone, Trash2, Wallet, Activity/g,
  'AlertTriangle, Lightbulb, Link as LinkIcon, Smartphone, Trash2, Wallet, Activity, Gavel, MessageSquare, Send, Building, Phone, Mail, Instagram, Twitter, Linkedin'
);

// 2. Add navItem
content = content.replace(
  /\{ id: 'strategy', label: 'Implementation Strategy', icon: Target \},\s*\];/g,
  `{ id: 'strategy', label: 'Implementation Strategy', icon: Target },
    { id: 'auction', label: 'B2B Plastics Auction', icon: Gavel },
  ];`
);

// 3. Add auction tab content
const auctionTab = `

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
                  <div className="flex items-center gap-3 mb-2">
                    <Gavel className="text-[#10B981] w-8 h-8" />
                    <h2 className="text-4xl font-light tracking-tight">Plastic Auction</h2>
                  </div>
                  <p className="text-lg text-[#10B981] font-mono tracking-widest uppercase text-xs">
                    Bid for Sustainable Plastic Solutions
                  </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                  
                  {/* Left Column: Availability & Footer (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-8">
                    <section className="bg-[#161920] border border-[#2D323A] p-6 rounded-sm">
                      <h3 className="text-xs font-mono text-[#64748B] uppercase tracking-widest mb-6">Current Availability (Daily Yield)</h3>
                      <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
                        The plastic yield listed below is collected directly from local civic amenities and smart sorting hubs located across Mysore. Our smart bins guarantee minimal contamination.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { area: 'Kuvempunagar', yield: '0.75 tons/day', source: 'Residential Drop-offs' },
                          { area: 'JP Nagar', yield: '1.5 tons/day', source: 'Commercial Zones & Schools' },
                          { area: 'Vijayanagar', yield: '1.3 tons/day', source: 'High-density Smart Bins' },
                          { area: 'Gokulam', yield: '0.75 tons/day', source: 'Awareness Campaign Centers' }
                        ].map(loc => (
                          <div key={loc.area} className="bg-[#0A0B0E] border border-[#2D323A] p-4 rounded-sm flex flex-col gap-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-[#E2E8F0]">{loc.area}</h4>
                              <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-sm font-mono border border-[#10B981]/20">{loc.yield}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#64748B]">
                              <MapPin size={12}/>
                              <span>{loc.source}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-[#161920] border border-[#10B981]/30 p-6 rounded-sm relative overflow-hidden flex-1 flex flex-col min-h-[300px]">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <MessageSquare size={120} />
                      </div>
                      <h3 className="text-xs font-mono text-[#10B981] uppercase tracking-widest mb-4">Direct Negotiation</h3>
                      <p className="text-sm text-[#94A3B8] mb-4">
                        We believe in transparent pricing. Engage directly with our representatives to discuss volume discounts, long-term contracts, and counter-offers in real-time.
                      </p>

                      <div className="bg-[#0A0B0E] border border-[#2D323A] rounded-sm flex flex-col flex-1 h-full min-h-[220px]">
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#1A1E26] flex items-center justify-center shrink-0">
                              <Building size={14} className="text-[#64748B]" />
                            </div>
                            <div className="bg-[#1A1E26] text-sm text-[#E2E8F0] p-3 rounded-sm rounded-tl-none border border-[#2D323A]">
                              We are interested in a 6-month contract for JP Nagar's LDPE. Can we negotiate a bulk rate?
                            </div>
                          </div>
                          <div className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-sm bg-[#10B981]/10 flex items-center justify-center shrink-0 border border-[#10B981]/20">
                              <Recycle size={14} className="text-[#10B981]" />
                            </div>
                            <div className="bg-[#10B981]/10 text-sm text-[#E2E8F0] p-3 rounded-sm rounded-tr-none border border-[#10B981]/20">
                              Absolutely. For a 6-month commitment, we can secure the 1.5 tons/day at a 12% discount off spot price. Please submit an official bid using the form, and denote 'Long-Term' in the notes.
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-t border-[#2D323A] flex gap-2">
                          <input type="text" placeholder="Type your message..." className="flex-1 bg-[#1A1E26] border border-[#2D323A] rounded-sm px-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#10B981] transition-colors" />
                          <button className="bg-[#1A1E26] hover:bg-[#10B981]/20 text-[#10B981] border border-[#2D323A] hover:border-[#10B981]/50 p-2 text-sm rounded-sm transition-colors">
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Bidding Form (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <section className="bg-[#161920] border border-[#2D323A] p-6 rounded-sm flex-1 flex flex-col min-h-full">
                      <h3 className="text-xs font-mono text-[#64748B] uppercase tracking-widest mb-2">Submit Official Bid</h3>
                      <p className="text-[11px] text-[#94A3B8] mb-6">Highest bidder will secure the plastic batch. Note: Environmental verification required.</p>
                      
                      <form className="space-y-4 flex flex-col flex-1" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Company Name</label>
                          <div className="relative">
                             <Building className="absolute left-3 top-3.5 text-[#64748B] w-4 h-4" />
                             <input type="text" className="w-full bg-[#0A0B0E] border border-[#2D323A] text-sm text-[#E2E8F0] rounded-sm py-3 pl-10 pr-4 focus:outline-none focus:border-[#10B981] transition-colors" placeholder="Acme Eco Bricks Ltd." />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Bid Amount (per Ton)</label>
                          <div className="relative">
                             <span className="absolute left-4 top-3.5 text-[#64748B] text-sm font-mono">$</span>
                             <input type="number" className="w-full bg-[#0A0B0E] border border-[#2D323A] text-sm text-[#E2E8F0] rounded-sm py-3 pl-10 pr-4 focus:outline-none focus:border-[#10B981] transition-colors font-mono" placeholder="0.00" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Contact Email</label>
                          <div className="relative">
                             <Mail className="absolute left-3 top-3.5 text-[#64748B] w-4 h-4" />
                             <input type="email" className="w-full bg-[#0A0B0E] border border-[#2D323A] text-sm text-[#E2E8F0] rounded-sm py-3 pl-10 pr-4 focus:outline-none focus:border-[#10B981] transition-colors" placeholder="procurement@company.com" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-[#64748B]">Target Availability Zone</label>
                          <select className="w-full bg-[#0A0B0E] border border-[#2D323A] text-sm text-[#E2E8F0] rounded-sm py-3 px-4 focus:outline-none focus:border-[#10B981] transition-colors appearance-none">
                            <option value="">-- Select Zone --</option>
                            <option value="Kuvempunagar">Kuvempunagar (0.75 t/d)</option>
                            <option value="JP Nagar">JP Nagar (1.5 t/d)</option>
                            <option value="Vijayanagar">Vijayanagar (1.3 t/d)</option>
                            <option value="Gokulam">Gokulam (0.75 t/d)</option>
                            <option value="All">All Zones (Combine Yields)</option>
                          </select>
                        </div>
                        
                        <div className="pt-4 mt-auto">
                          <button className="w-full bg-[#10B981] hover:bg-[#059669] text-[#0A0B0E] font-medium py-3 rounded-sm transition-colors flex justify-center items-center gap-2">
                            <Gavel size={18} /> Place Bid
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                </div>

                {/* Footer Section */}
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

          </AnimatePresence>`;

content = content.replace('</AnimatePresence>', auctionTab);

fs.writeFileSync('src/App.tsx', content);

