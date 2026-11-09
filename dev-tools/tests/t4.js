const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(root+'trigonometry-calculator/index.html');
 const vis=async(id)=>p.$eval('#'+id,e=>getComputedStyle(e).display!=='none'?e.innerText.trim():'');
 const T=async(fn,unit,ang)=>{await p.evaluate(`setTrigFunc('${fn}');setTrigUnit('${unit}')`);await p.fill('#trig-angle',String(ang));await p.evaluate('calcTrig()');
   const r=[await p.innerText('#trig-res-label'),await p.innerText('#trig-res-value'),await p.innerText('#trig-out-exact'),await p.innerText('#trig-out-decimal'),await vis('err-trig-angle')];console.log(`${fn}(${ang}${unit})`,JSON.stringify(r));};
 console.log('MAIN');
 for(const [f,u,a] of [['sin','deg',30],['cos','deg',60],['tan','deg',45],['sin','deg',90],['cos','deg',90],['tan','deg',90],['tan','deg',270],['cot','deg',0],['cot','deg',90],['sec','deg',90],['cosec','deg',0],['cosec','deg',30],['sin','deg',-30],['sin','deg',390],['sin','deg',180],['sin','rad',1.5707963267948966],['cos','rad',3.141592653589793],['tan','rad',0.7853981633974483],['sin','deg',''],['sin','deg',1e9],['tan','deg',89.9999]]) await T(f,u,a);
 console.log('INVERSE');
 for(const [f,u,v] of [['asin','deg',0.5],['acos','deg',0.5],['atan','deg',1],['asin','deg',1.5],['acos','deg',-1],['atan','rad',1],['asin','rad',1]]){
   await p.evaluate(`setInverseFunc('${f}');setInverseUnit('${u}')`);await p.fill('#inv-value',String(v));await p.evaluate('calcInverse()');
   console.log(f,u,v,JSON.stringify([await p.innerText('#inv-res-label'),await p.innerText('#inv-res-value'),await vis('inv-error'),await vis('err-inv-value')]));}
 console.log('RIGHT TRIANGLE');
 for(const [o,a,u] of [[3,4,'deg'],[3,4,'rad'],[0,4,'deg'],[3,0,'deg'],['','','deg'],[1e6,1e-6,'deg']]){
   await p.evaluate(`setRTUnit('${u}')`);await p.fill('#rt-opp',String(o));await p.fill('#rt-adj',String(a));await p.evaluate('calcRT()');
   const ids=['rt-out-hyp','rt-out-angle','rt-out-sin','rt-out-cos','rt-out-tan','rt-out-cot','rt-out-sec','rt-out-cosec'];const out={};for(const i of ids)out[i]=await p.innerText('#'+i);
   console.log('RT',o,a,u,JSON.stringify(out),await vis('rt-error'),await vis('err-rt-opp'),await vis('err-rt-adj'));}
 console.log('SINE RULE');
 for(const [a,A,bb,B] of [[10,40,'',''],[10,40,8,''],['',40,8,30.4],[10,40,'',30],[10,0,'',30],[10,180,'',30]]){
   await p.evaluate('resetSineRule()');for(const [id,v] of [['sr-a',a],['sr-A',A],['sr-b',bb],['sr-B',B]]) await p.fill('#'+id,String(v));await p.evaluate('calcSineRule()');
   console.log('SR',a,A,bb,B,JSON.stringify([await p.innerText('#sr-res-label'),await p.innerText('#sr-res-value'),await vis('sr-error'),await vis('err-sr')]));}
 console.log('COSINE SAS 7,9,55 (expect a≈7.48?)');
 await p.evaluate('calcCosineSAS()');console.log(await p.innerText('#cr1-out-a').catch(()=>'?'), JSON.stringify(await p.$$eval('[id^="cr1-out"]',e=>e.map(x=>x.id+':'+x.innerText.trim()))));
 await p.evaluate('calcCosineSSS&&calcCosineSSS()').catch(()=>{});console.log(JSON.stringify(await p.$$eval('[id^="cr2-out"]',e=>e.map(x=>x.id+':'+x.innerText.trim()))));
 console.log('pageerrors',errs);
 await b.close();
})();
