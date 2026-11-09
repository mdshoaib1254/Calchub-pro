const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
async function run(page,path,setup,click,outs){
  const errs=[];
  page.removeAllListeners('pageerror');page.removeAllListeners('console');
  page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await page.goto(root+path,{waitUntil:'domcontentloaded'});
  for(const [id,v] of Object.entries(setup)){ const el=await page.$('#'+id); if(!el){errs.push('MISSING '+id);continue;}
    const tag=await el.evaluate(e=>e.tagName); const ty=await el.getAttribute('type');
    if(tag==='SELECT') await el.selectOption(v); else if(ty==='checkbox') await el.setChecked(!!v); else await el.fill(String(v)); }
  if(click) await page.evaluate(click);
  const o={};
  for(const id of outs){const el=await page.$('#'+id); if(!el){o[id]='<missing>';continue;}
    const vis=await el.evaluate(e=>getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
    const t=(await el.innerText()).replace(/\s+/g,' ').trim(); o[id]=id.startsWith('err')?(vis?'[ERR SHOWN] '+t:'-'):t;}
  return {o,errs};
}
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 const C=[
 ['GST excl 1000@18','gst-calculator/index.html',{'gst-amount':1000,'gst-custom-rate':18},'calcGST()',['out-gst-total','out-gst-net','out-gst-tax','out-gst-cgst','out-gst-sgst','out-gst-igst','res-mode-label']],
 ['GST incl 1180@18','gst-calculator/index.html',{'gst-amount':1180,'gst-custom-rate':18},"setGSTMode('inclusive');calcGST()",['out-gst-total','out-gst-net','out-gst-tax','out-gst-cgst','out-gst-sgst','out-gst-igst']],
 ['GST rate 0','gst-calculator/index.html',{'gst-amount':1000,'gst-custom-rate':0},'calcGST()',['out-gst-total','out-gst-tax','err-gst-rate']],
 ['GST 5% odd paise','gst-calculator/index.html',{'gst-amount':1,'gst-custom-rate':5},'calcGST()',['out-gst-total','out-gst-tax','out-gst-cgst','out-gst-sgst']],
 ['SI 100000 7.5 3y','simple-interest-calculator/index.html',{'si-principal':100000,'si-rate':7.5,'si-time':3},'calcSimpleInterest()',['out-si-interest','out-si-total','out-si-time','out-si-roi']],
 ['SI 18 months','simple-interest-calculator/index.html',{'si-principal':100000,'si-rate':10,'si-time-type':'months','si-time':18},'onSITimeTypeChange();calcSimpleInterest()',['out-si-interest','out-si-total','out-si-time']],
 ['SI days?','simple-interest-calculator/index.html',{'si-principal':100000,'si-rate':10,'si-time':3},'calcSimpleInterest()',['err-si-p','err-si-r','err-si-t']],
 ['CI default','compound-interest-calculator/index.html',{'ci-principal':100000,'ci-rate':8,'ci-tenure':10,'ci-freq':'1'},'calcCompoundInterest()',['out-ci-total','out-ci-interest','out-ci-ear','out-ci-multiplier']],
 ['CI monthly','compound-interest-calculator/index.html',{'ci-principal':100000,'ci-rate':8,'ci-tenure':10,'ci-freq':'12'},'calcCompoundInterest()',['out-ci-total','out-ci-interest','out-ci-ear']],
 ['CI daily','compound-interest-calculator/index.html',{'ci-principal':100000,'ci-rate':8,'ci-tenure':10,'ci-freq':'365'},'calcCompoundInterest()',['out-ci-total','out-ci-ear']],
 ['PnL profit','profit-and-loss-calculator/index.html',{'pnl-cp':800,'pnl-sp':1200,'pnl-exp':50},'calcPLoss()',['out-pnl-amount','out-pnl-total-cost','out-pnl-pct','out-pnl-margin','out-pnl-markup']],
 ['PnL loss','profit-and-loss-calculator/index.html',{'pnl-cp':1000,'pnl-sp':800,'pnl-exp':0},'calcPLoss()',['out-pnl-amount','out-pnl-pct','out-pnl-margin','out-pnl-markup']],
 ['PnL cp=0','profit-and-loss-calculator/index.html',{'pnl-cp':0,'pnl-sp':800,'pnl-exp':0},'calcPLoss()',['out-pnl-amount','out-pnl-pct','err-pnl-cp']],
 ['Pct x%ofy','percentage-calculator/index.html',{'pct1-x':15,'pct1-y':850,'pct2-x':45,'pct2-y':200,'pct3-x':50,'pct3-y':75},null,['out-pct1','out-pct2','out-pct3']],
 ['Pct zero base','percentage-calculator/index.html',{'pct1-x':15,'pct1-y':850,'pct2-x':45,'pct2-y':0,'pct3-x':0,'pct3-y':75},null,['out-pct2','out-pct3']],
 ['Pct neg/decimal','percentage-calculator/index.html',{'pct1-x':-10,'pct1-y':0.5,'pct2-x':1,'pct2-y':3,'pct3-x':80,'pct3-y':60},null,['out-pct1','out-pct2','out-pct3']],
 ['Disc 2499 30+10','discount-calculator/index.html',{'disc-price':2499,'disc-pct':30,'disc-extra':10,'disc-tax':0},'calcDiscount()',['out-disc-final','out-disc-orig','out-disc-saved','out-disc-eff','out-disc-d1','out-disc-d2']],
 ['Disc 100% ','discount-calculator/index.html',{'disc-price':500,'disc-pct':100,'disc-extra':0,'disc-tax':18},'calcDiscount()',['out-disc-final','out-disc-saved','out-disc-eff']],
 ['Disc tax 18','discount-calculator/index.html',{'disc-price':1000,'disc-pct':20,'disc-extra':0,'disc-tax':18},'calcDiscount()',['out-disc-final','out-disc-saved','out-disc-eff']],
 ['Avg basic','average-calculator/index.html',{'avg-input':'15, 22, 35, 40, 22, 18, 55, 92'},'calcAverage()',['out-avg-mean','out-avg-median','out-avg-mode','out-avg-range','out-avg-sum','out-avg-count']],
 ['Avg multimode','average-calculator/index.html',{'avg-input':'1 1 2 2 3'},'calcAverage()',['out-avg-mean','out-avg-median','out-avg-mode']],
 ['Avg nomode','average-calculator/index.html',{'avg-input':'1,2,3,4'},'calcAverage()',['out-avg-median','out-avg-mode']],
 ['Avg invalid','average-calculator/index.html',{'avg-input':'1, abc, 3'},'calcAverage()',['out-avg-mean','err-avg-input']],
 ['Avg empty','average-calculator/index.html',{'avg-input':''},'calcAverage()',['out-avg-mean','err-avg-input']],
 ['Avg decimals/neg','average-calculator/index.html',{'avg-input':'-1.5, 2.25, 0.1'},'calcAverage()',['out-avg-mean','out-avg-median','out-avg-sum']],
 ['BMI 70/170','bmi-calculator/index.html',{'bmi-ht-cm':170,'bmi-wt-kg':70},'calcBMI()',['out-bmi-val','out-bmi-who','out-bmi-indian','out-bmi-target','out-bmi-msg']],
 ['BMI imperial','bmi-calculator/index.html',{'bmi-ht-ft':5,'bmi-ht-in':7,'bmi-wt-lbs':154},"setBMIUnit('imperial');calcBMI()",['out-bmi-val','out-bmi-who']],
 ['BMI 18.5 edge','bmi-calculator/index.html',{'bmi-ht-cm':100,'bmi-wt-kg':18.5},'calcBMI()',['out-bmi-val','out-bmi-who','out-bmi-indian']],
 ['BMI 25 / 23 edge','bmi-calculator/index.html',{'bmi-ht-cm':100,'bmi-wt-kg':25},'calcBMI()',['out-bmi-val','out-bmi-who','out-bmi-indian']],
 ['BMI invalid','bmi-calculator/index.html',{'bmi-ht-cm':0,'bmi-wt-kg':-5},'calcBMI()',['out-bmi-val','err-bmi-ht-cm','err-bmi-wt-kg']],
 ];
 for(const c of C){const r=await run(p,c[1],c[2],c[3],c[4]);console.log('\n##',c[0]);console.log(JSON.stringify(r.o));if(r.errs.length)console.log('ERRS',r.errs)}
 await b.close();
})();
