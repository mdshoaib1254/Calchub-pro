// Pull the REAL search engine out of index.html and run every query the brief lists.
const fs=require('fs');
process.chdir(__dirname);
const h=fs.readFileSync('index.html','utf8');
const src=h.slice(h.indexOf('let activeCat'), h.indexOf('function applyFilters'));
eval(src);

// Build the card corpus straight from the live markup.
const cards=[...h.matchAll(/<a href="([^"]+)" class="tc" data-keywords="([^"]*)" data-cat="(\w+)"[\s\S]*?<h3 class="tc-name">([^<]+)<\/h3>\s*<p class="tc-desc">([^<]+)</g)]
 .map(m=>({url:m[1],kw:m[2],cat:m[3],name:m[4],desc:m[5]}));
if(cards.length!==17){console.log('CORPUS ERROR',cards.length);process.exit(1);}

function search(q,cat='all'){
  const terms=normalizeQuery(q).split(' ').filter(Boolean);
  return cards.filter(c=>{
    if(cat!=='all'&&c.cat!==cat)return false;
    const hay=(c.name+' '+c.desc+' '+c.kw+' '+c.url.replace(/[-/]/g,' ')).toLowerCase();
    return terms.length===0||terms.every(t=>wordPrefix(hay,t));
  }).map(c=>c.name);
}
let pass=0,fail=0;
function expect(q,cat,must){
  const got=search(q,cat);
  const missing=must.filter(m=>!got.includes(m));
  const ok=missing.length===0&&got.length>0;
  console.log((ok?'PASS':'FAIL')+`  "${q}"${cat!=='all'?' ['+cat+']':''} → ${got.length} result(s)`+(missing.length?`  MISSING: ${missing}`:''));
  if(!ok)console.log('        got:',got);
  ok?pass++:fail++;
}
expect('emi','all',['EMI Calculator']);
expect('loan','all',['EMI Calculator','Home Loan Calculator','Car Loan Calculator','Personal Loan Calculator']);
expect('home loan','all',['Home Loan Calculator']);
expect('car','all',['Car Loan Calculator']);
expect('age','all',['Age Calculator']);
expect('birthday','all',['Birthday Calculator']);
expect('bmi','all',['BMI Calculator']);
expect('body mass','all',['BMI Calculator']);
expect('gst','all',['GST Calculator']);
expect('tax','all',['GST Calculator']);
expect('discount','all',['Discount Calculator']);
expect('percentage','all',['Percentage Calculator']);
expect('profit','all',['Profit and Loss Calculator']);
expect('loss','all',['Profit and Loss Calculator']);
expect('interest','all',['Simple Interest Calculator','Compound Interest Calculator','EMI Calculator']);
expect('compound','all',['Compound Interest Calculator']);
expect('simple interest','all',['Simple Interest Calculator']);
expect('average','all',['Average Calculator']);
expect('date','all',['Date Difference Calculator','Age Calculator','Birthday Calculator']);
expect('days','all',['Date Difference Calculator']);
expect('scientific','all',['Scientific Calculator']);
expect('math','all',['Basic Calculator','Scientific Calculator']);
// partials
expect('perc','all',['Percentage Calculator']);
expect('mortg','all',['Home Loan Calculator']);
// combined search + category
expect('loan','finance',['EMI Calculator','Home Loan Calculator','Car Loan Calculator','Personal Loan Calculator']);
const cross=search('loan','health');
console.log((cross.length===0?'PASS':'FAIL')+`  "loan" [health] → ${cross.length} result(s), expected 0 (no-results state)`);
cross.length===0?pass++:fail++;
const none=search('zzzzqqq','all');
console.log((none.length===0?'PASS':'FAIL')+`  "zzzzqqq" → ${none.length}, expected 0 (no-results state)`);
none.length===0?pass++:fail++;
const all=search('','all');
console.log((all.length===17?'PASS':'FAIL')+`  empty query → ${all.length}, expected 17`);
all.length===17?pass++:fail++;
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
