const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(root+'basic-calculator/index.html');
 const seq=async(fn,disp,keys)=>{await p.evaluate("bClear()");for(const k of keys){await p.evaluate(`bApp(${JSON.stringify(k)})`);} await p.evaluate('bCalc()'); return p.inputValue('#b-disp');};
 console.log('BASIC page');
 for(const [e,x] of [['2+3×4','14'],['1+05','6'],['5÷0','Error'],['50%10','Error'],['200+10%','220'],['200×10%','20'],['5−−3','8'],['0.1+0.2','0.3'],['9×9','81'],['1÷3','0.333333333333'],['.5+.5','1']]){const r=await seq(0,0,[...e]);console.log(r===x?'PASS':'FAIL',e,'=>',r,r===x?'':'(exp '+x+')');}
 // keyboard
 await p.evaluate("bClear()");await p.keyboard.type('12*3');await p.keyboard.press('Enter');console.log('keyboard 12*3 =>',await p.inputValue('#b-disp'));
 await p.goto(root+'scientific-calculator/index.html');
 const sq=async(keys)=>{await p.evaluate("sDisp.value='0';isNewInput=true");for(const k of keys)await p.evaluate(`sApp(${JSON.stringify(k)})`);await p.evaluate('sCalc()');return p.inputValue('#s-disp');};
 console.log('SCI page (deg)');
 for(const [k,x] of [[['sin(','3','0',')'],'0.5'],[['sin(','3','0','+','(','1','5',')',')'],'0.707106781187'],[['tan(','9','0',')'],'Error'],[['5','!'],'120'],[['sqrt(','1','6',')'],'4'],[['sqrt(','−','1',')'],'Error'],[['log10(','1','0','0','0',')'],'3'],[['log(','e',')'],'1'],[['2','^','1','0'],'1024'],[['pi'],'3.14159265359'],[['sin(','1','8','0',')'],'0'],[['(','2','+','3',')','×','4'],'20'],[['1','÷','0'],'Error']]){const r=await sq(k);console.log(r===x?'PASS':'FAIL',k.join(''),'=>',r,r===x?'':'(exp '+x+')');}
 await p.evaluate("setAngleMode('rad')");
 for(const [k,x] of [[['sin(','p','i',')'],'Error?'],[['sin(','pi','÷','2',')'],'1'],[['cos(','pi',')'],'-1']]){const r=await sq(k);console.log('RAD',k.join(''),'=>',r);}
 await p.goto(root+'index.html');
 console.log('HOME mini calcs');
 await p.evaluate("bClear();'2+3×4'.split('').forEach(c=>bApp(c));bCalc()");console.log('basic 2+3×4 =>',await p.inputValue('#b-disp'),'|',await p.innerText('#b-res'));
 await p.evaluate("bClear();'5÷0'.split('').forEach(c=>bApp(c));bCalc()");console.log('basic 5÷0 =>',await p.innerText('#b-res'));
 await p.evaluate("sClear();sApp('sin(');sApp('3');sApp('0');sApp(')');sCalc()");console.log('sci sin(30) =>',await p.inputValue('#s-disp'),'|',await p.innerText('#s-res'));
 console.log('pageerrors',errs);await b.close();
})();
