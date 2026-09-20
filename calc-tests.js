// Executes the ACTUAL formulas as implemented in each real calculator page
// (copied verbatim from the extracted logic), against the brief's stated
// expected values. Not a reimplementation — the same expressions used live.
let pass = 0, fail = 0;
function near(got, exp, tol, label) {
  const ok = Math.abs(got - exp) <= tol;
  console.log((ok ? 'PASS' : 'FAIL') + `  ${label}: got ${got.toFixed(2)}, expected ~${exp}`);
  ok ? pass++ : fail++;
}

// EMI (emi-calculator/index.html, car/home/personal-loan share this formula)
{
  const p = 1000000, annRate = 9.5, n = 5 * 12;
  const r = annRate / 12 / 100;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  near(emi, 21002, 1, 'EMI 10L @9.5% 5yr');
}

// BMI (bmi-calculator/index.html)
{
  const wKg = 70, hMeters = 170 / 100;
  const bmi = wKg / (hMeters * hMeters);
  near(bmi, 24.2, 0.05, 'BMI 70kg/170cm');
}

// GST exclusive (gst-calculator/index.html)
{
  const amount = 1000, rate = 18;
  const net = amount, tax = (amount * rate) / 100, total = net + tax;
  near(tax, 180, 0.01, 'GST exclusive tax');
  near(total, 1180, 0.01, 'GST exclusive total');
}
// GST inclusive
{
  const total = 1000, rate = 18;
  const net = (total * 100) / (100 + rate);
  const tax = total - net;
  near(net, 847.46, 0.01, 'GST inclusive base');
  near(tax, 152.54, 0.01, 'GST inclusive tax portion');
}

// Compound Interest (compound-interest-calculator/index.html)
{
  const p = 100000, r = 8 / 100, n = 4, t = 5;
  const maturity = p * Math.pow(1 + (r / n), n * t);
  near(maturity, 148594.74, 1, 'CI 1L @8% quarterly 5yr');
}

// Percentage change (percentage-calculator/index.html, mode 3)
{
  const x = 200, y = 250;
  const change = ((y - x) / x) * 100;
  near(change, 25, 0.01, 'Percentage increase 200->250');
}

// Average (average-calculator/index.html)
{
  const nums = [15, 22, 35, 40, 22, 18, 55, 92]; // the page's own default example
  const mean = nums.reduce((a,b)=>a+b,0) / nums.length;
  near(mean, 37.375, 0.001, 'Average of default sample set');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
