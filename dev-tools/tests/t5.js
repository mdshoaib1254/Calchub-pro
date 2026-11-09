const {chromium}=require('playwright');
const root='file:///home/claude/proj/Calchub-pro-main/';
(async()=>{
 const b=await chromium.launch();
 // test in two timezones to catch timezone bugs
 for(const tz of ['Asia/Kolkata','America/Los_Angeles','Pacific/Auckland']){
 const ctx=await b.newContext({timezoneId:tz});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const vis=async(id)=>p.$eval('#'+id,e=>getComputedStyle(e).display!=='none'?e.innerText.trim():'').catch(()=>'<missing>');
 console.log('\n===== TZ',tz);
 await p.goto(root+'age-calculator/index.html');
 for(const [d,t] of [['2000-01-15','2026-10-31'],['2000-02-29','2026-02-28'],['2000-02-29','2026-03-01'],['2000-02-29','2024-02-29'],['2024-01-31','2024-02-29'],['2000-12-31','2001-01-01'],['2026-10-31','2026-10-31'],['2030-01-01','2026-10-31'],['1900-01-01','2026-10-31'],['','2026-10-31']]){
   await p.fill('#age-dob',d);await p.fill('#age-target',t);await p.evaluate('calcAge()');
   console.log('AGE',d,'->',t,'|',await vis('out-age-main'),'|',await vis('out-age-days'),'|',await vis('out-age-next-bday'),'| err:',await vis('err-age-dob'),await vis('err-age-target'));}
 await p.goto(root+'date-difference-calculator/index.html');
 for(const [s,e,inc] of [['2026-01-01','2026-12-31',false],['2026-01-01','2026-12-31',true],['2024-02-28','2024-03-01',false],['2026-03-01','2026-02-01',false],['2026-10-31','2026-10-31',false],['2026-10-31','2026-10-31',true],['2026-10-26','2026-11-01',false],['2000-01-01','2026-10-31',false],['2026-01-31','2026-03-01',false]]){
   await p.fill('#dd-start',s);await p.fill('#dd-end',e);await p.setChecked('#dd-inclusive',inc);await p.evaluate('calcDateDiff()');
   console.log('DD',s,e,inc?'incl':'excl','|',await vis('out-dd-days'),'|',await vis('out-dd-breakdown'),'|',await vis('out-dd-weeks'),'| wk',await vis('out-dd-workdays'),'| we',await vis('out-dd-weekends'),'| err',await vis('err-dd-start'),await vis('err-dd-end'));}
 await p.goto(root+'birthday-calculator/index.html');
 for(const d of ['1998-08-24','2000-02-29','2000-10-31','2000-11-01','2030-05-05','']){
   await p.fill('#bday-dob',d);await p.evaluate('calcBday()');
   console.log('BDAY',d,'|',await vis('out-bday-countdown'),'|',await vis('out-bday-weekday'),'|',await vis('out-bday-zodiac'),'|',await vis('out-bday-next-date'),'|',await vis('out-bday-half'),'| err',await vis('err-bday-dob'));}
 console.log('pageerrors',errs);await ctx.close();}
 await b.close();
})();
