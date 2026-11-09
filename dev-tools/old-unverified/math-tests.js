// Extract the real utilities + replicate the patched formulas, then assert.
const fs=require('fs');
process.chdir(__dirname);
const core=fs.readFileSync('calc-core.js','utf8');
// strip the DOM-dependent top section, keep pure helpers
eval(core.slice(core.indexOf('function formatINR')).replace(/document\./g,'({}).'));
eval(core.slice(core.indexOf('function isNum')));

let pass=0,fail=0;
const near=(a,b,tol,label)=>{const ok=Math.abs(a-b)<=tol;console.log((ok?'PASS':'FAIL')+`  ${label}: got ${typeof a==='number'?a.toFixed(4):a}, expected ≈${b}`);ok?pass++:fail++;};
const eq=(a,b,label)=>{const ok=a===b;console.log((ok?'PASS':'FAIL')+`  ${label}: got ${a}, expected ${b}`);ok?pass++:fail++;};

// EMI (patched)
const emi=(P,ann,yr)=>{const r=ann/12/100,n=Math.round(yr*12);return r===0?P/n:(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);};
near(emi(1000000,9.5,5),21002,3,'EMI 10L @9.5% 5yr');
near(emi(1000000,9,5),20758,3,'EMI 10L @9% 5yr (hero preview claim)');
eq(Number.isFinite(emi(500000,0,5)),true,'EMI at 0% is finite (div-by-zero guard)');
near(emi(500000,0,5),500000/60,0.01,'EMI at 0% = P/n');

// BMI
const bmi=(w,hcm)=>w/Math.pow(hcm/100,2);
near(bmi(70,170),24.2,0.05,'BMI 70kg/170cm');

// GST
const gstEx=(a,r)=>({gst:a*r/100,total:a*(1+r/100)});
const gstIn=(t,r)=>({base:t/(1+r/100),gst:t-t/(1+r/100)});
near(gstEx(1000,18).gst,180,0.01,'GST exclusive 1000@18% tax');
near(gstEx(1000,18).total,1180,0.01,'GST exclusive 1000@18% total');
near(gstIn(1000,18).gst,152.54,0.01,'GST inclusive 1000@18% tax portion');
near(gstIn(1000,18).base,847.46,0.01,'GST inclusive 1000@18% base');

// Compound interest
const ci=(P,r,n,t)=>P*Math.pow(1+r/100/n,n*t);
near(ci(100000,8,4,5),148595,3,'CI 1L @8% quarterly 5yr');

// Date helpers (the patched ones, from calc-core.js)
const d1=parseLocalDate('2000-02-29'), d2=parseLocalDate('2026-09-15');
eq(d1.getDate(),29,'parseLocalDate keeps 29 Feb 2000 local');
eq(d1.getDay(),2,'29 Feb 2000 was a Tuesday');
eq(parseLocalDate('2026-02-30'),null,'rejects impossible 30 Feb');
eq(parseLocalDate('not-a-date'),null,'rejects garbage input');
eq(daysBetween(parseLocalDate('2026-01-01'),parseLocalDate('2026-12-31')),364,'2026 non-leap span');
eq(daysBetween(parseLocalDate('2024-01-01'),parseLocalDate('2024-12-31')),365,'2024 leap span');
eq(daysBetween(parseLocalDate('2026-03-28'),parseLocalDate('2026-03-30')),2,'DST weekend = 2 days');

// Age decomposition (patched algorithm)
function age(dobS,todayS){const dob=parseLocalDate(dobS),today=parseLocalDate(todayS);
 let y=today.getFullYear()-dob.getFullYear(),m=today.getMonth()-dob.getMonth(),d=today.getDate()-dob.getDate();
 if(d<0){m--;const pm=new Date(today.getFullYear(),today.getMonth(),0);d+=pm.getDate();}
 if(m<0){y--;m+=12;}return[y,m,d];}
eq(age('2000-01-15','2026-01-14').join('/'),'25/11/30','age day before 26th birthday');
eq(age('2000-01-15','2026-01-15').join('/'),'26/0/0','age exactly on birthday');
eq(age('2000-02-29','2026-03-01').join('/'),'26/0/0','leap-day birthday, non-leap year (anniversary treated as Mar 1)');

// Formatting guards
eq(formatCurrency(Infinity),'—','Infinity never renders');
eq(formatCurrency(NaN),'—','NaN never renders');
eq(safeNum(undefined),'—','undefined never renders');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
