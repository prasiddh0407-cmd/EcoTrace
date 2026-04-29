import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Theme Configuration & Card
content = content.replace(
  /const colors = \{[\s\S]*?\};/,
  `const colors = {
  primary: '#10B981',
  secondary: '#1A1E26',
  accent: '#10B981',
  bg: '#0A0B0E',
  surface: '#161920',
  text: '#E2E8F0',
  textMuted: '#64748B'
};`
);

content = content.replace(
  /const Card = \(\{ children, className = '' \}\) => \(\s*<div className=\{`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden \$\{className\}`\}>\s*\{children\}\s*<\/div>\s*\);/g,
  `const Card = ({ children, className = '' }) => (
  <section className={\`bg-[#161920] border border-[#2D323A] rounded-sm \\var(--tw-shadow) overflow-hidden \${className}\`}>
    {children}
  </section>
);`
);

// 2. Global background and text
content = content.replace(/bg-slate-50\/50/g, 'bg-[#0A0B0E]');
content = content.replace(/bg-slate-50/g, 'bg-[#0A0B0E]');
content = content.replace(/bg-slate-100/g, 'bg-[#0A0B0E]');
content = content.replace(/bg-slate-200/g, 'bg-[#2D323A]');
content = content.replace(/bg-slate-800/g, 'bg-[#0A0B0E]');
content = content.replace(/bg-slate-900/g, 'bg-[#1A1E26]');
content = content.replace(/bg-white/g, 'bg-[#161920]');
content = content.replace(/bg-emerald-50/g, 'bg-[#161920]');
content = content.replace(/bg-emerald-100/g, 'bg-[#1A1E26]');
content = content.replace(/bg-emerald-700/g, 'bg-[#1A1E26]');
content = content.replace(/bg-emerald-800\/50/g, 'bg-[#1A1E26]');
content = content.replace(/bg-emerald-800/g, 'bg-[#161920]');
content = content.replace(/bg-emerald-900/g, 'bg-[#161920]');
content = content.replace(/bg-emerald-950/g, 'bg-[#0A0B0E]');
content = content.replace(/bg-emerald-500\/10/g, 'bg-[#10B981]/10');
content = content.replace(/bg-emerald-500\/20/g, 'bg-[#10B981]/10');
content = content.replace(/bg-blue-100/g, 'bg-[#1A1E26]');
content = content.replace(/bg-blue-50/g, 'bg-[#161920]');
content = content.replace(/bg-purple-100/g, 'bg-[#1A1E26]');
content = content.replace(/bg-purple-50/g, 'bg-[#161920]');
content = content.replace(/bg-amber-100/g, 'bg-[#1A1E26]');
content = content.replace(/bg-amber-50/g, 'bg-[#161920]');

// Borders
content = content.replace(/border-slate-100/g, 'border-[#2D323A]');
content = content.replace(/border-slate-200/g, 'border-[#2D323A]');
content = content.replace(/border-slate-700/g, 'border-[#2D323A]');
content = content.replace(/border-slate-800/g, 'border-[#2D323A]');
content = content.replace(/border-emerald-100/g, 'border-[#10B981]/30');
content = content.replace(/border-t-emerald-500/g, 'border-t-[#10B981]');
content = content.replace(/border-l-emerald-500/g, 'border-l-[#10B981]');
content = content.replace(/border-t-blue-500|border-t-amber-500|border-l-blue-500|border-l-amber-500/g, 'border-transparent border-[#2D323A]');

// Text Colors
content = content.replace(/text-slate-900/g, 'text-[#E2E8F0]');
content = content.replace(/text-slate-800/g, 'text-[#E2E8F0]');
content = content.replace(/text-slate-700/g, 'text-[#94A3B8]');
content = content.replace(/text-slate-600/g, 'text-[#94A3B8]');
content = content.replace(/text-slate-500/g, 'text-[#64748B]');
content = content.replace(/text-slate-400/g, 'text-[#64748B]');
content = content.replace(/text-slate-300/g, 'text-[#94A3B8]');
content = content.replace(/text-emerald-900/g, 'text-[#E2E8F0]');
content = content.replace(/text-emerald-800\/80/g, 'text-[#94A3B8]');
content = content.replace(/text-emerald-800/g, 'text-[#E2E8F0]');
content = content.replace(/text-emerald-700/g, 'text-[#10B981]');
content = content.replace(/text-emerald-600/g, 'text-[#10B981]');
content = content.replace(/text-emerald-500/g, 'text-[#10B981]');
content = content.replace(/text-emerald-400/g, 'text-[#10B981]');
content = content.replace(/text-emerald-300/g, 'text-[#10B981]');
content = content.replace(/text-emerald-200/g, 'text-[#64748B]');
content = content.replace(/text-emerald-100/g, 'text-[#64748B]');
content = content.replace(/text-blue-500|text-blue-600|text-purple-500|text-purple-600|text-amber-500|text-amber-600/g, 'text-[#E2E8F0]');

// Typography
content = content.replace(/font-extrabold/g, 'font-light');
content = content.replace(/font-bold/g, 'font-normal');

// Shapes
content = content.replace(/rounded-2xl/g, 'rounded-sm');
content = content.replace(/rounded-xl/g, 'rounded-sm');
content = content.replace(/rounded-lg/g, 'rounded-sm');

// Shadows
content = content.replace(/shadow-xl/g, '');
content = content.replace(/shadow-sm/g, '');
content = content.replace(/shadow-md/g, '');

// Specific Headers
content = content.replace(
  /<h2 className="text-4xl font-light text-\[#E2E8F0\] tracking-tight mb-4">/g, 
  '<h2 className="text-4xl font-light tracking-tight mb-4">'
);
content = content.replace(
  /<h3 className="text-2xl font-normal text-\[#E2E8F0\]">/g,
  '<h3 className="text-xs font-mono text-[#10B981] tracking-[0.3em] uppercase mb-4">'
);

// Sidebar specifics
content = content.replace(/border-none/g, 'border border-[#2D323A]');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
