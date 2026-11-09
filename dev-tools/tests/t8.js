const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const vis=async(id)=>p.$eval('#'+id,e=>e.innerText.trim());
 await p.goto(root+'gst-calculator/index.html');
 await p.fill('#gst-amount','1000');
 for(const r of ['0%','5%','18%','40%']){await p.click(`button.gst-slab-btn:text-is("${r}")`);console.log('GST slab',r,'rate field',await p.inputValue('#gst-custom-rate'),'total',await vis('out-gst-total'),'tax',await vis('out-gst-tax'));}
 await p.click('text=Inclusive').catch(()=>{});
 console.log('text mentions 12%/28% as slab buttons?',await p.$$eval('button.gst-slab-btn',e=>e.map(x=>x.innerText)));
 await p.goto(root+'emi-calculator/index.html');await p.fill('#emi-amount','');await p.evaluate('calculateEMI()');await p.waitForTimeout(100);
 console.log('EMI empty -> stale',await p.$eval('.res-card',e=>e.classList.contains('is-stale')));
 await p.fill('#emi-amount','1000000');await p.evaluate('calculateEMI()');await p.waitForTimeout(100);
 console.log('EMI valid -> stale (expect false)',await p.$eval('.res-card',e=>e.classList.contains('is-stale')),await vis('out-emi'));
 console.log('errors',errs);await b.close();
})();
