const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();
 const mk=async(mode)=>{const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));let posted=null,calls=0;
  await p.route('https://formsubmit.co/**',r=>{calls++;posted={url:r.request().url(),body:r.request().postData(),method:r.request().method()};
   if(mode==='ok')r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({success:'true',message:'ok'})});
   else if(mode==='http500')r.fulfill({status:500,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"success":"false","message":"x"}'});
   else if(mode==='false200')r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"success":"false"}'});
   else if(mode==='html')r.fulfill({status:200,contentType:'text/html',headers:{'access-control-allow-origin':'*'},body:'<html>oops</html>'});
   else r.abort();});
  await p.goto('file:///home/claude/proj/Calchub-pro-main/contact.html');
  return {p,ctx,errs,get:()=>({posted,calls})};};
 const fill=async(p,o={})=>{await p.fill('#c-name','Asha Rao');await p.fill('#c-email','asha@example.com');await p.selectOption('#c-subject','bug');await p.fill('#c-msg',o.msg||'The EMI result looks off for 5 years.');if(o.trap)await p.fill('#c-website','http://spam');};
 const note=async(p)=>(await p.innerText('#contact-success')).replace(/\s+/g,' ');
 for(const mode of ['ok','http500','false200','html','abort']){
  const {p,ctx,errs,get}=await mk(mode);await fill(p);await p.waitForTimeout(4300);await p.click('#c-send');await p.waitForTimeout(800);
  const g=get();console.log(`[${mode}]`,'->',await note(p),'| form cleared:',(await p.inputValue('#c-name'))==='' ,'| btn re-enabled:',!(await p.$eval('#c-send',e=>e.disabled)),'| errs',errs.length);
  if(mode==='ok'){console.log('   POST',g.posted.method,g.posted.url);console.log('   body',g.posted.body);
   await fill(p);await p.click('#c-send');await p.waitForTimeout(300);console.log('   2nd send ->',await note(p),'| extra calls:',get().calls-1);}
  await ctx.close();}
 {const {p,ctx,get}=await mk('ok');await fill(p,{trap:true});await p.waitForTimeout(4300);await p.click('#c-send');await p.waitForTimeout(400);console.log('[honeypot] ->',await note(p),'| calls',get().calls);await ctx.close();}
 {const {p,ctx,get}=await mk('ok');await fill(p);await p.click('#c-send');await p.waitForTimeout(300);console.log('[too fast] ->',await note(p),'| calls',get().calls);await ctx.close();}
 {const {p,ctx,get}=await mk('ok');await p.click('#c-send');await p.waitForTimeout(300);console.log('[empty] calls',get().calls,'| err shown',await p.$eval('#err-name',e=>e.classList.contains('show')),'| success box shown',await p.$eval('#contact-success',e=>getComputedStyle(e).display));await ctx.close();}
 await b.close();})();
