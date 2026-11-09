/**
 * CalcHub Pro – Safe expression evaluator
 * ---------------------------------------
 * A small, self-contained arithmetic parser used by the Basic and Scientific
 * calculators. It never calls eval() or Function(): input is split into tokens
 * and evaluated by a recursive-descent parser, so only the operations listed
 * below are possible.
 *
 * Supported
 *   numbers      12  3.5  .5  1e3  2.5e-4
 *   operators    +  -  *  /  ^  (also × ÷ − from the keypad)
 *   postfix      !  (factorial, whole numbers 0-170)    %  (percent)
 *   constants    pi  e
 *   functions    sin cos tan  asin acos atan  log10 log ln  sqrt  abs
 *   grouping     ( )
 *
 * Percent: "50%" = 0.5, "200×10%" = 20, and (phone-calculator style)
 * "200+10%" = 220, "200-10%" = 180.
 *
 * Every invalid or undefined operation throws an Error with a plain-English
 * message (division by zero, sqrt of a negative number, tan(90°), etc.).
 */
(function (root) {
  'use strict';

  var FUNCS = {
    sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1,
    log10: 1, log: 1, ln: 1, sqrt: 1, abs: 1
  };

  function tokenize(src) {
    var s = String(src)
      .replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-')
      .replace(/\s+/g, '');
    var tokens = [], i = 0, m;
    var numRe = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
    var idRe = /^[a-z][a-z0-9]*/;
    while (i < s.length) {
      var rest = s.slice(i), ch = s[i];
      if ((m = numRe.exec(rest))) {
        tokens.push({ t: 'num', v: parseFloat(m[0]) });
        i += m[0].length;
      } else if ((m = idRe.exec(rest))) {
        tokens.push({ t: 'id', v: m[0] });
        i += m[0].length;
      } else if ('+-*/^!%()'.indexOf(ch) !== -1) {
        tokens.push({ t: 'op', v: ch });
        i += 1;
      } else {
        throw new Error('Unexpected character "' + ch + '"');
      }
    }
    return tokens;
  }

  function factorial(n) {
    if (n < 0 || Math.floor(n) !== n) throw new Error('Factorial needs a whole number of 0 or more');
    if (n > 170) throw new Error('Result is too large');
    var r = 1;
    for (var k = 2; k <= n; k++) r *= k;
    return r;
  }

  function evaluate(src, opts) {
    var deg = !(opts && opts.angle === 'rad');
    var toRad = function (x) { return deg ? x * Math.PI / 180 : x; };
    var fromRad = function (x) { return deg ? x * 180 / Math.PI : x; };
    var tokens = tokenize(src), pos = 0;
    if (!tokens.length) throw new Error('Empty expression');

    function peek() { return tokens[pos]; }
    function isOp(v) { var t = tokens[pos]; return t && t.t === 'op' && t.v === v; }
    function expectOp(v) {
      if (!isOp(v)) throw new Error('Expected "' + v + '"');
      pos++;
    }

    // result objects: { v: number, pct: boolean (bare "n%" term) }
    function parseAdditive() {
      var left = parseTerm();
      while (isOp('+') || isOp('-')) {
        var op = tokens[pos++].v;
        var right = parseTerm();
        var rv = right.pct ? left.v * right.v : right.v; // 200+10% -> 200+20
        left = { v: op === '+' ? left.v + rv : left.v - rv, pct: false };
      }
      return left;
    }

    function parseTerm() {
      var left = parseUnary();
      while (isOp('*') || isOp('/')) {
        var op = tokens[pos++].v;
        var right = parseUnary();
        if (op === '*') {
          left = { v: left.v * right.v, pct: false };
        } else {
          if (right.v === 0) throw new Error('Cannot divide by zero');
          left = { v: left.v / right.v, pct: false };
        }
      }
      return left;
    }

    function parseUnary() {
      if (isOp('-')) { pos++; var a = parseUnary(); return { v: -a.v, pct: false }; }
      if (isOp('+')) { pos++; return parseUnary(); }
      return parsePower();
    }

    function parsePower() {
      var base = parsePostfix();
      if (isOp('^')) {
        pos++;
        var exp = parseUnary(); // right-associative, allows 2^-3
        var v = Math.pow(base.v, exp.v);
        if (isNaN(v)) throw new Error('Invalid power');
        return { v: v, pct: false };
      }
      return base;
    }

    function parsePostfix() {
      var node = parsePrimary();
      while (isOp('!') || isOp('%')) {
        var op = tokens[pos++].v;
        if (op === '!') node = { v: factorial(node.v), pct: false };
        else node = { v: node.v / 100, pct: true };
      }
      return node;
    }

    function parsePrimary() {
      var tk = peek();
      if (!tk) throw new Error('Incomplete expression');
      if (tk.t === 'num') { pos++; return { v: tk.v, pct: false }; }
      if (tk.t === 'op' && tk.v === '(') {
        pos++;
        var inner = parseAdditive();
        expectOp(')');
        return { v: inner.v, pct: false };
      }
      if (tk.t === 'id') {
        pos++;
        if (tk.v === 'pi') return { v: Math.PI, pct: false };
        if (tk.v === 'e') return { v: Math.E, pct: false };
        if (!Object.prototype.hasOwnProperty.call(FUNCS, tk.v)) {
          throw new Error('Unknown name "' + tk.v + '"');
        }
        expectOp('(');
        var arg = parseAdditive().v;
        expectOp(')');
        return { v: applyFunc(tk.v, arg), pct: false };
      }
      throw new Error('Unexpected "' + tk.v + '"');
    }

    function applyFunc(name, x) {
      switch (name) {
        case 'sin': return clean(Math.sin(toRad(x)));
        case 'cos': return clean(Math.cos(toRad(x)));
        case 'tan':
          var c = Math.cos(toRad(x));
          if (Math.abs(c) < 1e-12) throw new Error('tan is undefined at this angle');
          return clean(Math.sin(toRad(x)) / c);
        case 'asin':
          if (x < -1 || x > 1) throw new Error('asin needs a value between -1 and 1');
          return fromRad(Math.asin(x));
        case 'acos':
          if (x < -1 || x > 1) throw new Error('acos needs a value between -1 and 1');
          return fromRad(Math.acos(x));
        case 'atan': return fromRad(Math.atan(x));
        case 'log10':
          if (x <= 0) throw new Error('log needs a positive number');
          return Math.log10(x);
        case 'log':
        case 'ln':
          if (x <= 0) throw new Error('ln needs a positive number');
          return Math.log(x);
        case 'sqrt':
          if (x < 0) throw new Error('Square root of a negative number is not real');
          return Math.sqrt(x);
        case 'abs': return Math.abs(x);
      }
      throw new Error('Unknown function');
    }

    // remove floating-point dust such as sin(180°) = 1.2e-16
    function clean(x) { return Math.abs(x) < 1e-14 ? 0 : x; }

    var result = parseAdditive();
    if (pos < tokens.length) throw new Error('Unexpected "' + tokens[pos].v + '"');
    if (typeof result.v !== 'number' || !isFinite(result.v)) throw new Error('Result is not a finite number');
    return result.v;
  }

  /** Format a result for the display (up to 12 significant digits, no float dust). */
  function format(n) {
    return String(parseFloat(Number(n).toPrecision(12)));
  }

  var api = { evaluate: evaluate, format: format };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SafeMath = api;
})(typeof window !== 'undefined' ? window : this);
