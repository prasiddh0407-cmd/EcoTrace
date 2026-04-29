import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. We remove the Tracking Tab block.
const trackingStart = "{activeTab === 'tracking' && (";
const trackingStartIndex = content.indexOf(trackingStart);
if (trackingStartIndex !== -1) {
  const trackingEndString = "\n            {activeTab === 'engagement' && (";
  const trackingEndIndex = content.indexOf(trackingEndString, trackingStartIndex);
  if (trackingEndIndex !== -1) {
    const trackingBlock = content.substring(trackingStartIndex, trackingEndIndex);
    content = content.replace(trackingBlock, '');
  }
}

// 2. We extract the graph out and put it into the engagement tab
const graphComponent = `

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
`;

const insertAfterStr = `                    </div>
                  </Card>
                </div>`;
const insertAfterIndex = content.indexOf(insertAfterStr, content.indexOf("{activeTab === 'engagement'"));

if (insertAfterIndex !== -1) {
    const insertPosition = insertAfterIndex + insertAfterStr.length;
    content = content.substring(0, insertPosition) + graphComponent + content.substring(insertPosition);
}

fs.writeFileSync('src/App.tsx', content);
