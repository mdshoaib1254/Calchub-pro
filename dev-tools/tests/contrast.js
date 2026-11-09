const {chromium}=require('playwright');const fs=require('fs');
const root='file:///home/claude/proj/Calchub-pro-main/';
const pages=process.argv.slice(3);const vw=+process.argv[2];
const collect=()=>{const res=[];let idx=0;const seen=new Set();
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(w.nextNode()){const n=w.currentNode;if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);
  if(el.closest('script,style,noscript,.sr-only,[aria-hidden=true]'))continue;const cs=getComputedStyle(el);
  if(cs.visibility==='hidden'||cs.display==='none')continue;let op=1;for(let e=el;e;e=e.parentElement)op*=parseFloat(getComputedStyle(e).opacity);if(op===0)continue;
  const r=el.getBoundingClientRect();if(r.width<4||r.height<4)continue;const clip=getComputedStyle(el).clipPath;
  if(el.closest('[hidden]'))continue;
  el.setAttribute('data-cidx',idx);res.push({idx,color:cs.color,op,size:parseFloat(cs.fontSize),bold:parseInt(cs.fontWeight)>=700,text:n.textContent.trim().slice(0,30),tag:el.tagName.toLowerCase()+'.'+(el.className||'').toString().slice(0,20)});idx++;}
 return res;};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:vw,height:800}});const p=await ctx.newPage();
 for(const f of pages){await p.goto(root+f);await p.waitForTimeout(300);
  // make sure FAQ closed content etc. not an issue; hide cookie banner to avoid overlay
  await p.addStyleTag({content:'#cookie-banner{display:none!important}'});
  await p.evaluate(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,800));});
  const cands=await p.evaluate(collect);const out=[];
  for(const c of cands){ const loc=p.locator(`[data-cidx="${c.idx}"]`).first();
    try{ const vis=await loc.evaluate(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0});if(!vis)continue;
      await loc.scrollIntoViewIfNeeded({timeout:1000});
      const style=await p.addStyleTag({content:`[data-cidx="${c.idx}"],[data-cidx="${c.idx}"] *{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important}`});
      const png=await loc.screenshot({timeout:2000,animations:'disabled'});await style.evaluate(e=>e.remove());
      const fn=`/tmp/cx/${f.replace(/\W/g,'_')}_${vw}_${c.idx}.png`;fs.writeFileSync(fn,png);out.push({...c,file:fn});
    }catch(e){} }
  fs.writeFileSync(`/tmp/cx/${f.replace(/\W/g,'_')}_${vw}.json`,JSON.stringify(out));console.log(f,out.length);}
 await b.close();})();
