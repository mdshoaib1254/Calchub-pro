const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
const T=(s)=>s;
async function run(page,path,setup,click,outs){
  const errs=[];
  page.removeAllListeners('pageerror');page.removeAllListeners('console');
  page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/ERR_|Failed to load resource/.test(m.text()))errs.push('CONSOLE '+m.text())});
  await page.goto(root+path,{waitUntil:'domcontentloaded'});
  for(const [id,v] of Object.entries(setup)){ const el=await page.$('#'+id); if(!el){errs.push('MISSING '+id);continue;}
    const tag=await el.evaluate(e=>e.tagName); if(tag==='SELECT') await el.selectOption(v); else if((await el.getAttribute('type'))==='checkbox') await el.setChecked(!!v); else await el.fill(String(v)); }
  if(click) await page.evaluate(click);
  const o={};
  for(const id of outs){const el=await page.$('#'+id); o[id]=el?(await el.innerText()).replace(/\s+/g,' ').trim():'<missing>';}
  return {o,errs};
}
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 const cases=[
  ['EMI normal 10L 9.5% 5y','emi-calculator/index.html',{ 'emi-amount':1000000,'emi-rate':9.5,'emi-tenure':5},'calculateEMI()',['out-emi','out-principal','out-interest','out-total','out-months','err-amount','err-rate','err-tenure']],
  ['EMI empty','emi-calculator/index.html',{ 'emi-amount':'','emi-rate':'','emi-tenure':''},'calculateEMI()',['out-emi','err-amount','err-rate','err-tenure']],
  ['EMI negative/huge','emi-calculator/index.html',{ 'emi-amount':-5,'emi-rate':9.5,'emi-tenure':5},'calculateEMI()',['out-emi','err-amount']],
  ['EMI huge','emi-calculator/index.html',{ 'emi-amount':99999999999999,'emi-rate':9.5,'emi-tenure':5},'calculateEMI()',['out-emi','err-amount']],
  ['EMI rate 0','emi-calculator/index.html',{ 'emi-amount':120000,'emi-rate':0,'emi-tenure':1},'calculateEMI()',['out-emi','out-interest','err-rate']],
  ['EMI decimal tenure','emi-calculator/index.html',{ 'emi-amount':100000,'emi-rate':10,'emi-tenure':2.5},'calculateEMI()',['out-emi','out-months','err-tenure']],
  ['EMI months tenure','emi-calculator/index.html',{ 'emi-amount':100000,'emi-rate':10,'emi-tenure-type':'months','emi-tenure':24},'calculateEMI()',['out-emi','out-months','err-tenure']],
  ['HomeLoan default','home-loan-calculator/index.html',{ 'hl-property':6000000,'hl-downpayment':1200000,'hl-rate':8.75,'hl-tenure':20},'calcHomeLoan()',['out-hl-emi','out-hl-principal','out-hl-interest','out-hl-total','out-hl-ltv','out-hl-tax','err-hl-down','err-hl-amount']],
  ['HomeLoan down>property','home-loan-calculator/index.html',{ 'hl-property':1000000,'hl-downpayment':2000000,'hl-rate':8.75,'hl-tenure':20},'calcHomeLoan()',['out-hl-emi','err-hl-down','err-hl-amount']],
  ['Car default','car-loan-calculator/index.html',{ 'car-price':1200000,'car-down':240000,'car-rate':9,'car-tenure':5},'calcCarLoan()',['out-car-emi','out-car-principal','out-car-interest','out-car-total','out-car-overall','err-car-down']],
  ['Car down>price','car-loan-calculator/index.html',{ 'car-price':100000,'car-down':200000,'car-rate':9,'car-tenure':5},'calcCarLoan()',['out-car-emi','err-car-down','err-car-loan']],
  ['Personal default','personal-loan-calculator/index.html',{ 'pl-amount':300000,'pl-rate':12.5,'pl-tenure':3},'calcPersonalLoan()',['out-pl-emi','out-pl-interest','out-pl-total','err-pl-amount']],
  ['Personal empty','personal-loan-calculator/index.html',{ 'pl-amount':'','pl-rate':'','pl-tenure':''},'calcPersonalLoan()',['out-pl-emi','err-pl-amount','err-pl-rate','err-pl-tenure']],
 ];
 for(const c of cases){const r=await run(p,c[1],c[2],c[3],c[4]);console.log('\n##',c[0]);console.log(JSON.stringify(r.o));if(r.errs.length)console.log('ERRS',r.errs)}
 await b.close();
})();
