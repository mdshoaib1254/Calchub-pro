const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
const fs=require('fs');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 const errs={};let cur='';p.on('pageerror',e=>(errs[cur]=errs[cur]||[]).push(e.message));
 const vis=async(id)=>p.$eval('#'+id,e=>getComputedStyle(e).display!=='none'?e.innerText.trim():'-').catch(()=>'<missing>');
 const set=async(m)=>{for(const [k,v] of Object.entries(m))await p.fill('#'+k,String(v));};
 // all pages load w/o JS errors + banner
 const pages=['index.html',...fs.readdirSync('/home/claude/proj/Calchub-pro-main').filter(d=>d.endsWith('-calculator')).map(d=>d+'/index.html'),'about.html','contact.html','privacy-policy.html','terms.html','disclaimer.html'];
 let bannerOk=0;
 for(const f of pages){cur=f;await p.goto(root+f);await p.waitForTimeout(1100);if(await p.$('#cookie-banner.show'))bannerOk++;}
 console.log('pages loaded',pages.length,'| banner shown on',bannerOk,'| pages with JS errors:',JSON.stringify(errs));
 // consent click
 cur='consent';await p.goto(root+'basic-calculator/index.html');await p.waitForTimeout(1100);await p.evaluate("setCookie('accept')");await p.waitForTimeout(500);
 console.log('consent stored',await p.evaluate("localStorage.getItem('ck_consent')"));await p.reload();await p.waitForTimeout(1100);console.log('banner after reload (expect false):',!!(await p.$('#cookie-banner.show')));
 // date diff
 await p.goto(root+'date-difference-calculator/index.html');
 for(const [s,e,inc] of [['2026-01-31','2026-03-01',false],['2026-01-01','2026-12-31',false],['2026-01-01','2026-12-31',true],['2024-02-28','2024-03-01',false],['2026-10-31','2026-10-31',true],['2026-03-01','2026-02-01',false],['2026-01-01','',false]]){
  await p.fill('#dd-start',s);await p.fill('#dd-end',e);await p.setChecked('#dd-inclusive',inc);await p.evaluate('calcDateDiff()');
  console.log('DD',s,e,inc?'incl':'excl','|',await vis('out-dd-days'),'|',await vis('out-dd-breakdown'),'| wk',await vis('out-dd-workdays'),'| err',await vis('err-dd-end'),'| stale',await p.$eval('.res-card',e=>e.classList.contains('is-stale')));}
 // PnL
 await p.goto(root+'profit-and-loss-calculator/index.html');
 for(const [cp,sp,ex] of [[800,1200,50],[1000,800,0],[0,800,0],['',800,0],[500,0,0]]){await set({'pnl-cp':cp,'pnl-sp':sp,'pnl-exp':ex});await p.evaluate('calcPLoss()');console.log('PNL',cp,sp,ex,'|',await vis('out-pnl-amount'),await vis('out-pnl-pct'),await vis('out-pnl-margin'),await vis('out-pnl-markup'),'| err',await vis('err-pnl-cp'),await vis('err-pnl-sp'));}
 // Average
 await p.goto(root+'average-calculator/index.html');
 for(const t of ['15, 22, 35, 40, 22, 18, 55, 92','1 1 2 2 3','1, abc, 3','','-1.5, 2.25, 0.1','1e3 2e3','Infinity 5']){await p.fill('#avg-input',t);await p.evaluate('calcAverage()');console.log('AVG',JSON.stringify(t),'|',await vis('out-avg-mean'),await vis('out-avg-median'),await vis('out-avg-mode'),'| err',await vis('err-avg-input'));}
 // Discount
 await p.goto(root+'discount-calculator/index.html');
 for(const [pr,d1,d2,t] of [[2499,30,10,0],[1000,20,0,18],[500,100,0,18]]){await set({'disc-price':pr,'disc-pct':d1,'disc-extra':d2,'disc-tax':t});await p.evaluate('calcDiscount()');console.log('DISC',pr,d1,d2,t,'| final',await vis('out-disc-final'),'saved',await vis('out-disc-saved'),'tax',await vis('out-disc-taxamt'),'eff',await vis('out-disc-eff'));}
 // GST
 await p.goto(root+'gst-calculator/index.html');
 await set({'gst-amount':1000,'gst-custom-rate':18});await p.evaluate('calcGST()');console.log('GST excl 1000@18',await vis('out-gst-total'),await vis('out-gst-tax'),await vis('out-gst-cgst'),await vis('out-gst-sgst'),await vis('out-gst-igst'));
 await p.evaluate("selectGSTSlab(40)");console.log('GST slab 40 custom rate field =',await p.inputValue('#gst-custom-rate'),'total',await vis('out-gst-total'));
 await p.evaluate("setGSTMode('inclusive');selectGSTSlab(18)");await p.fill('#gst-amount','1180');await p.evaluate('calcGST()');console.log('GST incl 1180@18',await vis('out-gst-net'),await vis('out-gst-tax'));
 // stale guard on EMI
 await p.goto(root+'emi-calculator/index.html');await p.fill('#emi-amount','');await p.evaluate('calculateEMI()');await p.waitForTimeout(100);console.log('EMI empty -> stale class',await p.$eval('.res-card',e=>e.classList.contains('is-stale')));
 await p.fill('#emi-amount','1000000');await p.evaluate('calculateEMI()');await p.waitForTimeout(100);console.log('EMI valid -> stale class (expect false)',await p.$eval('.res-card',e=>e.classList.contains('is-stale')),await vis('out-emi'));
 console.log('errors',JSON.stringify(errs));await b.close();
})();
