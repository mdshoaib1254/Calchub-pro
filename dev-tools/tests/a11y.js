const {chromium}=require('playwright');const fs=require('fs');
const root='file:///home/claude/proj/Calchub-pro-main/';
const dirs=fs.readdirSync('/home/claude/proj/Calchub-pro-main').filter(d=>d.endsWith('-calculator')).map(d=>d+'/index.html');
const pages=['index.html',...dirs,'about.html','contact.html','privacy-policy.html','terms.html','disclaimer.html','404.html'];
const audit=()=>{
 const out={contrast:[],nolabel:[],smalltap:[],focus:0,issues:[]};
 const lum=c=>{const a=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
 const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(x=>parseFloat(x));return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const bgOf=el=>{let layers=[];for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage!=='none'&&cs.backgroundImage.includes('gradient'))return {grad:true};const b=parse(cs.backgroundColor);if(b&&b.a>0){layers.push(b);if(b.a>=1)break;}}
  let base={r:255,g:255,b:255};for(let i=layers.length-1;i>=0;i--){const l=layers[i];base={r:l.r*l.a+base.r*(1-l.a),g:l.g*l.a+base.g*(1-l.a),b:l.b*l.a+base.b*(1-l.a)}}return base};
 const seen=new Set();
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const n=walker.currentNode;if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||parseFloat(cs.opacity)===0)continue;const r=el.getBoundingClientRect();if(r.width===0||r.height===0)continue;
  if(el.closest('script,style,noscript'))continue;
  const fg=parse(cs.color);const bg=bgOf(el);if(!fg||!bg||bg.grad)continue;
  let op=1;for(let e=el;e;e=e.parentElement)op*=parseFloat(getComputedStyle(e).opacity);
  const f={r:fg.r*fg.a*op+bg.r*(1-fg.a*op),g:fg.g*fg.a*op+bg.g*(1-fg.a*op),b:fg.b*fg.a*op+bg.b*(1-fg.a*op)};
  const L1=lum([f.r,f.g,f.b]),L2=lum([bg.r,bg.g,bg.b]);const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const size=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700;const large=size>=24||(size>=18.66&&bold);
  if(ratio<(large?3:4.5)) out.contrast.push(`${ratio.toFixed(2)} "${n.textContent.trim().slice(0,28)}" <${el.tagName.toLowerCase()}.${(el.className||'').toString().slice(0,18)}> ${size}px`);}
 document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[onclick]').forEach(el=>{
  const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const r=el.getBoundingClientRect();if(!r.width)return;
  const name=(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.textContent||el.getAttribute('title')||el.getAttribute('alt')||'').trim()||(el.id&&document.querySelector(`label[for="${el.id}"]`)?'y':'')||(el.closest('label')?'y':'')||el.getAttribute('placeholder');
  if(!name)out.nolabel.push(el.tagName.toLowerCase()+'#'+el.id+'.'+(el.className||'').toString().slice(0,20));
  if(['BUTTON','A','SELECT','INPUT'].includes(el.tagName)&&(r.width<24||r.height<24)&&!(el.tagName==='A'&&el.closest('p,li')&&r.height>=16)) out.smalltap.push(`${el.tagName.toLowerCase()}#${el.id||''} "${(el.textContent||'').trim().slice(0,14)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
  if(el.hasAttribute('onclick')&&!['BUTTON','A','INPUT','SELECT'].includes(el.tagName)&&!el.hasAttribute('tabindex')&&!el.getAttribute('role'))out.issues.push('non-keyboard clickable '+el.tagName+'.'+(el.className||'').toString().slice(0,20));
 });
 out.landmarks={main:!!document.querySelector('main,[role=main]'),nav:!!document.querySelector('nav'),footer:!!document.querySelector('footer'),skip:!!document.querySelector('a[href^="#"][class*=skip],.skip-link'),h1:document.querySelectorAll('h1').length};
 const vp=document.querySelector('meta[name=viewport]');out.zoomBlocked=!!(vp&&/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(vp.content));
 out.overflowX=document.documentElement.scrollWidth>window.innerWidth+1;
 // heading order
 const hs=[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);let skips=0;for(let i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1)skips++;out.headingSkips=skips;
 // faq buttons aria-expanded
 out.faqNoAria=[...document.querySelectorAll('.faq-q')].filter(b=>!b.hasAttribute('aria-expanded')).length;
 out.imgNoAlt=[...document.images].filter(i=>!i.hasAttribute('alt')).length;
 return out;};
(async()=>{
 const b=await chromium.launch();
 for(const [label,vw,vh] of [['desktop',1280,800],['mobile',375,740]]){
  const ctx=await b.newContext({viewport:{width:vw,height:vh}});const p=await ctx.newPage();
  console.log('\n######',label);let totC=0;
  for(const f of pages){await p.goto(root+f);await p.waitForTimeout(250);
   const o=await p.evaluate(audit);totC+=o.contrast.length;
   const flags=[];if(o.contrast.length)flags.push('contrast:'+o.contrast.length);if(o.nolabel.length)flags.push('nolabel:'+o.nolabel.length);if(o.smalltap.length)flags.push('smalltap:'+o.smalltap.length);if(o.overflowX)flags.push('H-SCROLL');if(o.zoomBlocked)flags.push('ZOOM-BLOCKED');if(o.faqNoAria)flags.push('faqNoAria:'+o.faqNoAria);if(o.imgNoAlt)flags.push('imgNoAlt');if(o.issues.length)flags.push('kbd:'+o.issues.length);if(!o.landmarks.main)flags.push('noMain');if(o.headingSkips)flags.push('headingSkips:'+o.headingSkips);
   console.log(f.padEnd(42),flags.join(' ')||'ok');
   if(label==='desktop'&&['index.html','emi-calculator/index.html','bmi-calculator/index.html'].includes(f)){console.log('   contrast samples:',o.contrast.slice(0,6));console.log('   nolabel:',o.nolabel.slice(0,5),'smalltap:',o.smalltap.slice(0,4),'issues',o.issues.slice(0,3));}
  }
  await ctx.close();}
 await b.close();})();
