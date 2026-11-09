const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 // BASIC
 await p.goto(root+'basic-calculator/index.html');
 const seq=async(keys)=>{await p.evaluate("bClear()");for(const k of keys){ if(k==='=') await p.evaluate('bCalc()'); else await p.evaluate(`bApp(${JSON.stringify(k)})`);} return p.inputValue('#b-disp');};
 const tests=[['2+3×4','='],['10÷4','='],['0.1+0.2','='],['5÷0','='],['1+05','='],['08+1','='],['5−−3','='],['2×−3','='],['50%10','='],['200+10%','='],['(2+3)×4','='],['.5+.5','='],['9999999999×9999999999','='],['1÷3','='],['0.0000001×0.0000001','=']];
 console.log('BASIC');
 for(const [e] of tests){const keys=[...e];const r=await seq([...keys,'=']);console.log(JSON.stringify(e),'=>',r);}
 // BMI imperial
 await p.goto(root+'bmi-calculator/index.html');
 await p.evaluate("setBMIUnit('imperial')");
 await p.fill('#bmi-ht-ft','5');await p.fill('#bmi-ht-in','7');await p.fill('#bmi-wt-lbs','154');await p.evaluate('calcBMI()');
 console.log('BMI imperial 5ft7/154lb',await p.innerText('#out-bmi-val'),await p.innerText('#out-bmi-who'),'(expected ~24.1)');
 await p.evaluate("setBMIUnit('metric')");
 for(const [h,w] of [[100,18.5],[100,24.9],[100,25],[100,30],[100,29.9],[170,70],[50,10],[260,300],[0,70],[170,0],[170,-5]]){
   await p.fill('#bmi-ht-cm',String(h));await p.fill('#bmi-wt-kg',String(w));await p.evaluate('calcBMI()');
   const e1=await p.$eval('#err-bmi-ht-cm',e=>getComputedStyle(e).display!=='none'?e.innerText:'');const e2=await p.$eval('#err-bmi-wt-kg',e=>getComputedStyle(e).display!=='none'?e.innerText:'');
   console.log(`BMI h=${h} w=${w}`,await p.innerText('#out-bmi-val'),'|',await p.innerText('#out-bmi-who'),'|',await p.innerText('#out-bmi-indian'),e1||e2?'ERR:'+e1+e2:'');}
 console.log('pageerrors',errs);
 await b.close();
})();
