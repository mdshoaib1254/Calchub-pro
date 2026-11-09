const SM=require('/home/claude/proj/Calchub-pro-main/safe-math.js');
let pass=0,fail=0;
function ok(expr,exp,opts){let got;try{got=SM.format(SM.evaluate(expr,opts))}catch(e){got='ERR:'+e.message}
 const good=String(exp)===got||(exp==='ERR'&&got.startsWith('ERR'));good?pass++:fail++;console.log((good?'PASS':'FAIL'),JSON.stringify(expr),'=>',got,good?'':'(expected '+exp+')');}
// precedence & basics
ok('2+3×4',14);ok('(2+3)×4',20);ok('10÷4',2.5);ok('0.1+0.2',0.3);ok('1+05',6);ok('.5+.5',1);ok('2×−3',-6);ok('5−−3',8);ok('-2^2',-4);ok('2^3^2',512);ok('2^-1',0.5);ok('2^0.5',1.41421356237);
ok('5÷0','ERR');ok('0÷0','ERR');ok('1÷3',0.333333333333);ok('((1))',1);ok('(1','ERR');ok('1)','ERR');ok('','ERR');ok('+','ERR');ok('2 3','ERR');ok('abc','ERR');ok('alert(1)','ERR');ok('constructor','ERR');ok('1;2','ERR');
// percent
ok('50%',0.5);ok('200×10%',20);ok('200+10%',220);ok('200−10%',180);ok('50%10','ERR');ok('100+10%+10%',121);
// factorial
ok('5!',120);ok('0!',1);ok('170!','7.25741561531e+306');ok('171!','ERR');ok('3.5!','ERR');ok('(−1)!','ERR');ok('(2+3)!',120);
// constants/functions deg
ok('sin(30)',0.5);ok('cos(60)',0.5);ok('tan(45)',1);ok('sin(180)',0);ok('cos(90)',0);ok('tan(90)','ERR');ok('tan(270)','ERR');ok('sin(30+(15))',0.707106781187);ok('sin(cos(0))',0.017452406437);ok('sin(−30)',-0.5);
ok('asin(0.5)',30);ok('acos(2)','ERR');ok('atan(1)',45);
// rad
ok('sin(pi/2)',1,{angle:'rad'});ok('cos(pi)',-1,{angle:'rad'});ok('tan(pi/4)',1,{angle:'rad'});ok('tan(pi/2)','ERR',{angle:'rad'});
// logs, sqrt
ok('log10(1000)',3);ok('log(e)',1);ok('ln(e^2)',2);ok('log10(0)','ERR');ok('ln(−1)','ERR');ok('sqrt(16)',4);ok('sqrt(−1)','ERR');ok('sqrt(2)',1.41421356237);
ok('pi',3.14159265359);ok('2×pi',6.28318530718);ok('1e3',1000);ok('2.5e-4',0.00025);ok('0.0000001×0.0000001','1e-14');ok('9999999999×9999999999','9.999999998e+19');
ok('1e308×10','ERR');ok('abs(−5)',5);ok('10^2',100);ok('2^1000','1.07150860719e+301');ok('(−8)^(1/3)','ERR');
console.log(`\n${pass} passed, ${fail} failed`);
