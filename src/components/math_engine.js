/* =========================================================
   TagSci G11 Study WebApp - Offline Lightweight Math Engine
   Supports:
   - Inline Math: $...$
   - Block Math: $$...$$
   - LaTeX-like syntax: \frac{a}{b}, \sqrt{x}, \sqrt[n]{x},
     \int, \sum, \Delta, \theta, \pi, \alpha, \beta, \omega, \lambda, \mu,
     \cdot, \times, \pm, \approx, \neq, \le, \ge, \infty, \partial,
     superscripts x^{2}, subscripts v_{0}, \vec{v}, \hat{i}, etc.
   - 100% Zero-dependency & Offline
   ========================================================= */

const GREEK_SYMBOLS = {
  '\\alpha': '&alpha;',
  '\\beta': '&beta;',
  '\\gamma': '&gamma;',
  '\\delta': '&delta;',
  '\\Delta': '&Delta;',
  '\\epsilon': '&epsilon;',
  '\\varepsilon': '&#x03B5;',
  '\\theta': '&theta;',
  '\\Theta': '&Theta;',
  '\\lambda': '&lambda;',
  '\\Lambda': '&Lambda;',
  '\\mu': '&mu;',
  '\\pi': '&pi;',
  '\\Pi': '&Pi;',
  '\\rho': '&rho;',
  '\\sigma': '&sigma;',
  '\\Sigma': '&Sigma;',
  '\\tau': '&tau;',
  '\\phi': '&phi;',
  '\\Phi': '&Phi;',
  '\\omega': '&omega;',
  '\\Omega': '&Omega;'
};

const MATH_OPERATORS = {
  '\\Longleftrightarrow': '&hArr;',
  '\\longleftrightarrow': '&harr;',
  '\\Longrightarrow': '&rArr;',
  '\\longrightarrow': '&rarr;',
  '\\longleftarrow': '&larr;',
  '\\rightleftharpoons': '&#x21CC;',
  '\\leftrightharpoons': '&#x21CC;',
  '\\leftrightarrow': '&harr;',
  '\\Leftarrow': '&lArr;',
  '\\Rightarrow': '&rArr;',
  '\\leftarrow': '&larr;',
  '\\rightarrow': '&rarr;',
  '\\implies': '&rArr;',
  '\\iff': '&hArr;',
  '\\to': '&rarr;',
  '\\uparrow': '&uarr;',
  '\\downarrow': '&darr;',
  '\\qquad': '&emsp;&emsp;',
  '\\quad': '&emsp;',
  '\\thickapprox': '&asymp;',
  '\\approxeq': '&asymp;',
  '\\approx': '&asymp;',
  '\\equiv': '&equiv;',
  '\\propto': '&prop;',
  '\\times': '&times;',
  '\\cdot': '&middot;',
  '\\div': '&divide;',
  '\\pm': '&plusmn;',
  '\\mp': '&#x2213;',
  '\\leq': '&le;',
  '\\geq': '&ge;',
  '\\neq': '&ne;',
  '\\le': '&le;',
  '\\ge': '&ge;',
  '\\ne': '&ne;',
  '\\infty': '&infin;',
  '\\partial': '&part;',
  '\\nabla': '&nabla;',
  // Set Theory & Logic Operators
  '\\smallsetminus': '&#x2216;',
  '\\setminus': '&#x2216;',
  '\\complement': '&#x2201;',
  '\\bigcup': '<span class="text-lg leading-none font-bold">&bigcup;</span>',
  '\\bigcap': '<span class="text-lg leading-none font-bold">&bigcap;</span>',
  '\\cup': '&cup;',
  '\\cap': '&cap;',
  '\\subsetneqq': '&#x2ACB;',
  '\\supsetneqq': '&#x2ACC;',
  '\\subsetneq': '&#x228A;',
  '\\supsetneq': '&#x228B;',
  '\\nsubseteq': '&#x2288;',
  '\\nsupseteq': '&#x2289;',
  '\\nsubset': '&#x2284;',
  '\\nsupset': '&#x2285;',
  '\\subseteqq': '&#x2AC5;',
  '\\supseteqq': '&#x2AC6;',
  '\\subseteq': '&sube;',
  '\\supseteq': '&supe;',
  '\\sqsubseteq': '&#x2291;',
  '\\sqsupseteq': '&#x2292;',
  '\\sqsubset': '&#x228F;',
  '\\sqsupset': '&#x2290;',
  '\\subset': '&sub;',
  '\\supset': '&sup;',
  '\\varnothing': '&#x2205;',
  '\\emptyset': '&empty;',
  '\\notni': '&#x220C;',
  '\\notin': '&notin;',
  '\\owns': '&ni;',
  '\\ni': '&ni;',
  '\\in': '&isin;',
  '\\nexists': '&#x2204;',
  '\\forall': '&forall;',
  '\\exists': '&exist;',
  '\\wedge': '&and;',
  '\\land': '&and;',
  '\\vee': '&or;',
  '\\lor': '&or;',
  '\\lnot': '&not;',
  '\\neg': '&not;',
  '\\top': '&#x22A4;',
  '\\bot': '&#x22A5;',
  '\\mid': '&#x2223;',
  '\\aleph': '&alefsym;',
  '\\beth': '&#x2136;',
  '\\otimes': '&otimes;',
  '\\oplus': '&oplus;',
  '\\odot': '&#x2299;',
  '\\degree': '&deg;',
  '\\circ': '&deg;',
  '\\ldots': '&hellip;',
  '\\cdots': '&hellip;',
  '\\dots': '&hellip;',
  '\\iint': '<span class="text-lg leading-none italic font-serif font-bold">&int;&int;</span>',
  '\\int': '<span class="text-lg leading-none italic font-serif font-bold">&int;</span>',
  '\\prod': '<span class="text-lg leading-none font-bold">&prod;</span>',
  '\\sum': '<span class="text-lg leading-none font-bold">&sum;</span>',
  '\\sqrt': '&radic;',
  '\\,': '&thinsp;',
  '\\;': '&ensp;',
  '\\:': '&ensp;',
  '\\!': '',
  '\\ ': '&nbsp;',
  '~': '&nbsp;'
};

function extractBalancedBraces(text, startIdx) {
  if (startIdx >= text.length || text[startIdx] !== '{') return null;
  let depth = 0;
  const contentStart = startIdx + 1;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return { content: text.substring(contentStart, i), nextIdx: i + 1 };
    }
  }
  return null;
}

export function parseMathSyntax(tex) {
  let s = (tex || '').trim();
  s = s.replace(/<br\s*\/?>/gi, ' ');

  // 1. Strip LaTeX sizing commands for brackets
  s = s.replace(/\\left\s*([(\[{|.]|\\\{)/g, (m, p) => p === '\\{' ? '{' : (p === '.' ? '' : p));
  s = s.replace(/\\right\s*([)\]}|.]|\\\})/g, (m, p) => p === '\\}' ? '}' : (p === '.' ? '' : p));
  s = s.replace(/\\(?:big|Big|bigg|Bigg)[lrm]?\s*([(\[{)|\]}])/g, '$1');

  // 2. Fractions: \frac, \dfrac, \tfrac with balanced braces
  let fracPos = 0;
  while (true) {
    const m = s.substr(fracPos).match(/\\(?:d|t)?frac/);
    if (!m) break;
    const idx = fracPos + m.index;
    let p = idx + m[0].length;
    while (p < s.length && /\s/.test(s[p])) p++;
    const numMatch = extractBalancedBraces(s, p);
    if (numMatch) {
      let q = numMatch.nextIdx;
      while (q < s.length && /\s/.test(s[q])) q++;
      const denMatch = extractBalancedBraces(s, q);
      if (denMatch) {
        const replacement = `<span class="inline-flex flex-col text-center align-middle mx-1 text-xs sm:text-sm font-mono-math"><span class="border-b border-current pb-0.5 px-1">${parseMathSyntax(numMatch.content)}</span><span class="pt-0.5 px-1">${parseMathSyntax(denMatch.content)}</span></span>`;
        s = s.substring(0, idx) + replacement + s.substring(denMatch.nextIdx);
        fracPos = idx + replacement.length;
        continue;
      }
    }
    fracPos = idx + m[0].length;
  }

  // 3. Square roots: \sqrt[n]{x} or \sqrt{x}
  s = s.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, (match, n, inner) => {
    return `<span class="inline-flex items-center align-middle font-mono-math"><sup class="text-[9px] -mr-1">${parseMathSyntax(n)}</sup><span class="text-base leading-none">&radic;</span><span class="border-t border-current px-0.5 ml-0.5">${parseMathSyntax(inner)}</span></span>`;
  });
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, (match, inner) => {
    return `<span class="inline-flex items-center align-middle font-mono-math"><span class="text-base leading-none">&radic;</span><span class="border-t border-current px-0.5 ml-0.5">${parseMathSyntax(inner)}</span></span>`;
  });

  // 4. Vectors and bars
  s = s.replace(/\\vec\{([^{}]+)\}/g, (match, inner) => `<span class="inline-flex flex-col items-center justify-center font-mono-math"><span class="text-[10px] leading-none">&rarr;</span><span>${inner}</span></span>`);
  s = s.replace(/\\hat\{([^{}]+)\}/g, (match, inner) => `<span class="inline-flex flex-col items-center justify-center font-mono-math"><span class="text-[10px] leading-none">^</span><span>${inner}</span></span>`);
  s = s.replace(/\\overline\{([^{}]+)\}/g, '<span class="overline">$1</span>');

  // 5. Text & fonts: \text, \mathrm, \operatorname, \mathbf, \mathit
  let textPos = 0;
  while (true) {
    const m = s.substr(textPos).match(/\\(?:text|mathrm|operatorname)\s*\{/);
    if (!m) break;
    const idx = textPos + m.index;
    const p = idx + m[0].length - 1;
    const bMatch = extractBalancedBraces(s, p);
    if (bMatch) {
      let innerParsed = bMatch.content;
      innerParsed = innerParsed.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
      innerParsed = innerParsed.replace(/_([0-9]+|[a-zA-Z])/g, '<sub>$1</sub>');
      innerParsed = innerParsed.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
      innerParsed = innerParsed.replace(/\^([0-9]+|[a-zA-Z])/g, '<sup>$1</sup>');
      const replacement = `<span class="font-sans font-normal">${innerParsed}</span>`;
      s = s.substring(0, idx) + replacement + s.substring(bMatch.nextIdx);
      textPos = idx + replacement.length;
      continue;
    }
    textPos = idx + m[0].length;
  }

  s = s.replace(/\\mathbf\{([^{}]+)\}/g, '<strong class="font-bold font-sans">$1</strong>');
  s = s.replace(/\\textbf\{([^{}]+)\}/g, '<strong class="font-bold font-sans">$1</strong>');
  s = s.replace(/\\mathit\{([^{}]+)\}/g, '<em class="italic">$1</em>');
  s = s.replace(/\\textit\{([^{}]+)\}/g, '<em class="italic">$1</em>');

  // Blackboard Bold for standard number sets (R, N, Z, Q, C, P, etc.)
  const BB_MAP = {
    'A': '&#x1D538;', 'B': '&#x1D539;', 'C': '&#x2102;', 'D': '&#x1D53B;', 'E': '&#x1D53C;',
    'F': '&#x1D53D;', 'G': '&#x1D53E;', 'H': '&#x210D;', 'I': '&#x1D540;', 'J': '&#x1D541;',
    'K': '&#x1D542;', 'L': '&#x1D543;', 'M': '&#x1D544;', 'N': '&#x2115;', 'O': '&#x1D546;',
    'P': '&#x2119;', 'Q': '&#x211A;', 'R': '&#x211D;', 'S': '&#x1D54A;', 'T': '&#x1D54B;',
    'U': '&#x1D54C;', 'V': '&#x1D54D;', 'W': '&#x1D54E;', 'X': '&#x1D54F;', 'Y': '&#x1D550;',
    'Z': '&#x2124;'
  };
  s = s.replace(/\\mathbb\{([A-Z])\}/g, (m, ch) => BB_MAP[ch] || `<strong class="font-serif">${ch}</strong>`);
  s = s.replace(/\\mathbb\{([^{}]+)\}/g, '<strong class="font-serif">$1</strong>');

  // Calligraphic (e.g. \mathcal{P} for Power Set)
  const CAL_MAP = {
    'P': '&#x2118;', 'B': '&#x212C;', 'E': '&#x2130;', 'F': '&#x2131;', 'H': '&#x210B;',
    'I': '&#x2110;', 'L': '&#x2112;', 'M': '&#x2133;', 'R': '&#x211B;'
  };
  s = s.replace(/\\mathcal\{([A-Za-z]+)\}/g, (m, txt) => {
    if (txt.length === 1 && CAL_MAP[txt]) return CAL_MAP[txt];
    return `<span class="italic font-serif">${txt}</span>`;
  });

  // 6. Superscripts & Subscripts: x^{2} / x^2, v_{0} / v_0
  s = s.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
  s = s.replace(/\^([0-9]+|[a-zA-Z])/g, '<sup>$1</sup>');
  s = s.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
  s = s.replace(/_([0-9]+|[a-zA-Z])/g, '<sub>$1</sub>');

  // Support LaTeX line breaks inside display math / matrices / aligned
  s = s.replace(/\\\\/g, '<br/>');

  // 7. Greek Letters & Math Symbols
  for (const [key, val] of Object.entries(GREEK_SYMBOLS)) s = s.split(key).join(val);
  for (const [key, val] of Object.entries(MATH_OPERATORS)) s = s.split(key).join(val);

  // Set literal braces \{ ... \}
  s = s.replace(/\\\{/g, '{');
  s = s.replace(/\\\}/g, '}');

  return s;
}

/**
 * Formats Markdown and HTML inline rich text (Bold, Italic, Underline, Strikethrough, Code)
 */
export function formatRichText(str) {
  if (!str) return '';
  let text = String(str);

  // 1. Stash code blocks & inline code so formatting isn't applied inside code
  const codeTokens = [];
  text = text.replace(/`([^`\n]+?)`/g, (match, code) => {
    const idx = codeTokens.length;
    codeTokens.push(code);
    return `\x00CODE_${idx}\x00`;
  });

  // 2. Underline: <u>text</u>, <ins>text</ins>, __text__
  text = text.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '<u class="underline underline-offset-2">$1</u>');
  text = text.replace(/<ins\b[^>]*>([\s\S]*?)<\/ins>/gi, '<u class="underline underline-offset-2">$1</u>');
  text = text.replace(/__(.+?)__/g, '<u class="underline underline-offset-2">$1</u>');

  // 3. Bold + Italic combinations: ***text***, **_text_**, _**text**_
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-extrabold text-slate-900 dark:text-white"><em class="italic">$1</em></strong>');
  text = text.replace(/\*\*_(.+?)_\*\*/g, '<strong class="font-extrabold text-slate-900 dark:text-white"><em class="italic">$1</em></strong>');
  text = text.replace(/_\*\*(.+?)\*\*_/g, '<strong class="font-extrabold text-slate-900 dark:text-white"><em class="italic">$1</em></strong>');

  // 4. Bold: **text**, <b>text</b>, <strong>text</strong>
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  text = text.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  text = text.replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');

  // 5. Italic: *text*, _text_ (surrounded by spaces/boundary), <i>text</i>, <em>text</em>
  text = text.replace(/(?<!\*)\*(?!\*)([^\*\n]+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
  text = text.replace(/(^|[\s(>])_([^_]+?)_([\s)<.,!?:;]|$)/g, '$1<em class="italic">$2</em>$3');
  text = text.replace(/<i\b[^>]*>([\s\S]*?)<\/i>/gi, '<em class="italic">$1</em>');
  text = text.replace(/<em\b[^>]*>([\s\S]*?)<\/em>/gi, '<em class="italic">$1</em>');

  // 6. Strikethrough: ~~text~~, <s>text</s>, <del>text</del>
  text = text.replace(/~~(.+?)~~/g, '<del class="line-through text-slate-400 dark:text-slate-500">$1</del>');
  text = text.replace(/<s\b[^>]*>([\s\S]*?)<\/s>/gi, '<del class="line-through text-slate-400 dark:text-slate-500">$1</del>');
  text = text.replace(/<del\b[^>]*>([\s\S]*?)<\/del>/gi, '<del class="line-through text-slate-400 dark:text-slate-500">$1</del>');

  // 7. Restore code tokens
  text = text.replace(/\x00CODE_(\d+)\x00/g, (match, idx) => {
    const c = codeTokens[Number(idx)] || '';
    return `<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-tagsci-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">${c}</code>`;
  });

  return text;
}

/**
 * Scans an HTML string or DOM container, rendering $...$ as inline math, $$...$$ as block math,
 * and parsing Markdown/HTML inline formatting (Bold, Italic, Underline, Strikethrough, Code).
 */
export function renderMathInHtml(htmlString) {
  if (!htmlString) return '';
  let text = String(htmlString);

  // Step 1: Protect math formulas into placeholders before rich text processing
  const mathBlocks = [];
  // Support both $$...$$ and \[...\]
  text = text.replace(/(?:\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\])/g, (match, tex1, tex2) => {
    const rawTex = (tex1 !== undefined ? tex1 : tex2) || '';
    const cleanTex = rawTex.replace(/<br\s*\/?>/gi, ' ').trim();
    const idx = mathBlocks.length;
    mathBlocks.push(cleanTex);
    return `\x00MATH_BLOCK_${idx}\x00`;
  });

  const mathInlines = [];
  // Support both $...$ and \(...\)
  text = text.replace(/(?:(?<!\\)\$([^\$\n]+?)(?<!\\)\$|\\\(([\s\S]*?)\\\))/g, (match, tex1, tex2) => {
    const rawTex = (tex1 !== undefined ? tex1 : tex2) || '';
    const cleanTex = rawTex.replace(/<br\s*\/?>/gi, ' ').trim();
    const idx = mathInlines.length;
    mathInlines.push(cleanTex);
    return `\x00MATH_INLINE_${idx}\x00`;
  });

  // Step 2: Parse rich text (Bold, Italic, Underline, Strikethrough, Code)
  text = formatRichText(text);

  // Step 3: Restore and render math formulas
  text = text.replace(/\x00MATH_BLOCK_(\d+)\x00/g, (match, idx) => {
    const tex = mathBlocks[Number(idx)];
    if (tex === undefined) return '';
    const rendered = parseMathSyntax(tex);
    return `<div class="my-3 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono-math text-sm sm:text-base text-tagsci-900 dark:text-emerald-300 shadow-sm overflow-x-auto">${rendered}</div>`;
  });

  text = text.replace(/\x00MATH_INLINE_(\d+)\x00/g, (match, idx) => {
    const tex = mathInlines[Number(idx)];
    if (tex === undefined) return '';
    const rendered = parseMathSyntax(tex);
    return `<span class="inline-block font-mono-math text-tagsci-800 dark:text-emerald-300 px-1 py-0.5 rounded bg-slate-100/70 dark:bg-slate-800/60 text-xs sm:text-sm font-semibold">${rendered}</span>`;
  });

  return text;
}

/**
 * Helper to render math inside any DOM element
 */
export function renderMathInElement(domElement) {
  if (!domElement) return;
  domElement.innerHTML = renderMathInHtml(domElement.innerHTML);
}

/* =========================================================
   Mathematical Expression Compiler for Cartesian Functions
   ========================================================= */
export function compileMathExpression(exprStr) {
  if (!exprStr || typeof exprStr !== 'string' || !exprStr.trim()) {
    return () => NaN;
  }
  let clean = exprStr.trim()
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\|([^\|]+)\|/g, 'Math.abs($1)')
    .replace(/\babs\s*\(/g, 'Math.abs(')
    .replace(/\bsqrt\s*\(/g, 'Math.sqrt(')
    .replace(/\bcbrt\s*\(/g, 'Math.cbrt(')
    .replace(/\bsin\s*\(/g, 'Math.sin(')
    .replace(/\bcos\s*\(/g, 'Math.cos(')
    .replace(/\btan\s*\(/g, 'Math.tan(')
    .replace(/\bsec\s*\(([^)]+)\)/g, '(1/Math.cos($1))')
    .replace(/\bcsc\s*\(([^)]+)\)/g, '(1/Math.sin($1))')
    .replace(/\bcot\s*\(([^)]+)\)/g, '(1/Math.tan($1))')
    .replace(/\bln\s*\(/g, 'Math.log(')
    .replace(/\blog\s*\(/g, 'Math.log10(')
    .replace(/\bexp\s*\(/g, 'Math.exp(')
    .replace(/\bfloor\s*\(/g, 'Math.floor(')
    .replace(/\bceil\s*\(/g, 'Math.ceil(')
    .replace(/\bround\s*\(/g, 'Math.round(')
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\be\b(?![a-zA-Z0-9_])/g, 'Math.E')
    .replace(/(\d+)\s*([a-zA-Z(])/g, '$1*$2')
    .replace(/(\))\s*(\()/g, '$1*$2')
    .replace(/(\))\s*([a-zA-Z0-9])/g, '$1*$2')
    .replace(/([a-zA-Z0-9_]+)\s*\^\s*([a-zA-Z0-9_]+|\([^)]+\))/g, 'Math.pow($1, $2)')
    .replace(/\^\s*([0-9.]+)/g, '**$1');

  try {
    const fn = new Function('x', 'Math', `with(Math){ try { return (${clean}); } catch(e){ return NaN; } }`);
    return (x) => fn(x, Math);
  } catch (e) {
    return () => NaN;
  }
}

/* =========================================================
   SVG Cartesian Plane & Piecewise Function Generator
   ========================================================= */
export function renderCartesianPlaneSvg(block) {
  if (!block) return '';
  const xMin = Number(block.xMin) || -10;
  const xMax = Number(block.xMax) || 10;
  const yMin = Number(block.yMin) || -10;
  const yMax = Number(block.yMax) || 10;
  const gridStep = Number(block.gridStep) || 1;
  const width = 540;
  const height = 380;
  const pad = 40;

  const toSvgX = (x) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const toSvgY = (y) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

  // Background & Grid lines
  let gridPaths = '';
  let axisTicks = '';

  // Vertical grid & X ticks
  const xRange = xMax - xMin;
  const stepX = gridStep <= 0 ? 1 : gridStep;
  const firstX = Math.ceil(xMin / stepX) * stepX;
  for (let x = firstX; x <= xMax; x += stepX) {
    const sx = toSvgX(x);
    if (sx >= pad && sx <= width - pad) {
      gridPaths += `<line x1="${sx}" y1="${pad}" x2="${sx}" y2="${height - pad}" stroke="currentColor" class="text-slate-200 dark:text-slate-800/80" stroke-width="0.8" />`;
      if (x !== 0) {
        axisTicks += `<line x1="${sx}" y1="${toSvgY(0) - 3}" x2="${sx}" y2="${toSvgY(0) + 3}" stroke="currentColor" class="text-slate-400 dark:text-slate-600" stroke-width="1.2" />`;
        axisTicks += `<text x="${sx}" y="${Math.min(height - pad + 15, Math.max(pad + 12, toSvgY(0) + 14))}" text-anchor="middle" font-size="9" font-family="monospace" class="fill-slate-400 dark:fill-slate-500 font-bold">${x}</text>`;
      }
    }
  }

  // Horizontal grid & Y ticks
  const yRange = yMax - yMin;
  const stepY = gridStep <= 0 ? 1 : gridStep;
  const firstY = Math.ceil(yMin / stepY) * stepY;
  for (let y = firstY; y <= yMax; y += stepY) {
    const sy = toSvgY(y);
    if (sy >= pad && sy <= height - pad) {
      gridPaths += `<line x1="${pad}" y1="${sy}" x2="${width - pad}" y2="${sy}" stroke="currentColor" class="text-slate-200 dark:text-slate-800/80" stroke-width="0.8" />`;
      if (y !== 0) {
        axisTicks += `<line x1="${toSvgX(0) - 3}" y1="${sy}" x2="${toSvgX(0) + 3}" y2="${sy}" stroke="currentColor" class="text-slate-400 dark:text-slate-600" stroke-width="1.2" />`;
        axisTicks += `<text x="${Math.max(pad - 6, Math.min(width - pad - 12, toSvgX(0) - 8))}" y="${sy + 3}" text-anchor="end" font-size="9" font-family="monospace" class="fill-slate-400 dark:fill-slate-500 font-bold">${y}</text>`;
      }
    }
  }

  // Origin (0,0) Axes
  const axisX_Y = toSvgY(0);
  const axisY_X = toSvgX(0);

  let axesSvg = '';
  // X-Axis
  if (axisX_Y >= pad && axisX_Y <= height - pad) {
    axesSvg += `
      <line x1="${pad - 10}" y1="${axisX_Y}" x2="${width - pad + 15}" y2="${axisX_Y}" stroke="currentColor" class="text-slate-700 dark:text-slate-300" stroke-width="1.8" />
      <polygon points="${width - pad + 18},${axisX_Y} ${width - pad + 10},${axisX_Y - 4} ${width - pad + 10},${axisX_Y + 4}" class="fill-slate-700 dark:fill-slate-300" />
      <text x="${width - pad + 24}" y="${axisX_Y + 3.5}" font-size="11" font-weight="bold" class="fill-slate-800 dark:fill-slate-200 font-mono">x</text>
    `;
  }
  // Y-Axis
  if (axisY_X >= pad && axisY_X <= width - pad) {
    axesSvg += `
      <line x1="${axisY_X}" y1="${height - pad + 10}" x2="${axisY_X}" y2="${pad - 15}" stroke="currentColor" class="text-slate-700 dark:text-slate-300" stroke-width="1.8" />
      <polygon points="${axisY_X},${pad - 18} ${axisY_X - 4},${pad - 10} ${axisY_X + 4},${pad - 10}" class="fill-slate-700 dark:fill-slate-300" />
      <text x="${axisY_X - 2}" y="${pad - 22}" font-size="11" font-weight="bold" text-anchor="middle" class="fill-slate-800 dark:fill-slate-200 font-mono">y</text>
    `;
  }

  // Origin label
  if (axisX_Y >= pad && axisX_Y <= height - pad && axisY_X >= pad && axisY_X <= width - pad) {
    axesSvg += `<text x="${axisY_X - 6}" y="${axisX_Y + 12}" font-size="9" font-weight="bold" class="fill-slate-400 font-mono">0</text>`;
  }

  // Render Function Pieces
  const pieces = block.pieces || [];
  let curvesSvg = '';
  let endpointsSvg = '';
  let piecewiseFormulaItems = [];

  const defaultColors = ['#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4'];

  pieces.forEach((piece, pIdx) => {
    const expr = piece.expr || 'x';
    const fn = compileMathExpression(expr);
    const pColor = piece.color || defaultColors[pIdx % defaultColors.length];
    const pStyle = piece.style || 'solid';
    const dashArray = pStyle === 'dashed' ? '6,4' : pStyle === 'dotted' ? '2,3' : 'none';

    const pMin = (piece.domainMin !== undefined && piece.domainMin !== null && piece.domainMin !== '' && !isNaN(piece.domainMin)) 
      ? Number(piece.domainMin) 
      : xMin;
    const pMax = (piece.domainMax !== undefined && piece.domainMax !== null && piece.domainMax !== '' && !isNaN(piece.domainMax)) 
      ? Number(piece.domainMax) 
      : xMax;

    const startInc = piece.minInclusive !== false;
    const endInc = piece.maxInclusive !== false;

    // Build math condition text for legend
    let conditionText = '';
    if (pMin > xMin && pMax < xMax) {
      conditionText = `${pMin} ${startInc ? '\\le' : '<'} x ${endInc ? '\\le' : '<'} ${pMax}`;
    } else if (pMin > xMin) {
      conditionText = `x ${startInc ? '\\ge' : '>'} ${pMin}`;
    } else if (pMax < xMax) {
      conditionText = `x ${endInc ? '\\le' : '<'} ${pMax}`;
    } else {
      conditionText = '\\text{for all } x';
    }
    piecewiseFormulaItems.push({ expr, conditionText, color: pColor });

    // Sample Curve Points
    const clampStart = Math.max(xMin, pMin);
    const clampEnd = Math.min(xMax, pMax);
    if (clampStart < clampEnd) {
      const samples = 240;
      const dx = (clampEnd - clampStart) / samples;
      let pathD = '';
      let isDrawing = false;
      let prevY = null;

      for (let i = 0; i <= samples; i++) {
        const cx = clampStart + i * dx;
        const cy = fn(cx);

        if (isNaN(cy) || !isFinite(cy) || cy < (yMin - yRange * 2) || cy > (yMax + yRange * 2)) {
          isDrawing = false;
          prevY = null;
          continue;
        }

        // Check for asymptote jump
        if (prevY !== null && Math.abs(cy - prevY) > yRange * 0.75) {
          isDrawing = false;
        }

        const sx = toSvgX(cx);
        const sy = toSvgY(cy);

        if (!isDrawing) {
          pathD += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
          isDrawing = true;
        } else {
          pathD += `L ${sx.toFixed(1)} ${sy.toFixed(1)} `;
        }
        prevY = cy;
      }

      if (pathD) {
        curvesSvg += `<path d="${pathD.trim()}" fill="none" stroke="${pColor}" stroke-width="2.5" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    }

    // Endpoints (Open ○ / Closed ● Circles)
    // 1. Start boundary
    if (pMin >= xMin && pMin <= xMax && piece.domainMin !== undefined && piece.domainMin !== null && piece.domainMin !== '') {
      const yStart = fn(pMin);
      if (!isNaN(yStart) && isFinite(yStart) && yStart >= (yMin - 0.5) && yStart <= (yMax + 0.5)) {
        const cx = toSvgX(pMin);
        const cy = toSvgY(yStart);
        if (startInc) {
          endpointsSvg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${pColor}" stroke="#ffffff" stroke-width="1.8" />`;
        } else {
          endpointsSvg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="#ffffff" stroke="${pColor}" stroke-width="2.2" />`;
        }
      }
    }

    // 2. End boundary
    if (pMax >= xMin && pMax <= xMax && piece.domainMax !== undefined && piece.domainMax !== null && piece.domainMax !== '') {
      const yEnd = fn(pMax);
      if (!isNaN(yEnd) && isFinite(yEnd) && yEnd >= (yMin - 0.5) && yEnd <= (yMax + 0.5)) {
        const cx = toSvgX(pMax);
        const cy = toSvgY(yEnd);
        if (endInc) {
          endpointsSvg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${pColor}" stroke="#ffffff" stroke-width="1.8" />`;
        } else {
          endpointsSvg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="#ffffff" stroke="${pColor}" stroke-width="2.2" />`;
        }
      }
    }
  });

  // Piecewise Mathematical Definition Panel
  let definitionBox = '';
  if (piecewiseFormulaItems.length > 0) {
    definitionBox = `
      <div class="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <div class="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-tagsci-600"></span>
          Piecewise Definition:
        </div>
        <div class="space-y-1 font-mono-math">
          ${piecewiseFormulaItems.map(item => `
            <div class="flex items-center justify-between text-xs sm:text-sm py-0.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
              <span class="font-bold" style="color: ${item.color}">${parseMathSyntax(item.expr)}</span>
              <span class="text-slate-500 text-[11px]">${parseMathSyntax('\\text{if } ' + item.conditionText)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="my-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      ${block.title ? `<h4 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-tagsci-600"></span>${renderMathInHtml(block.title)}</h4>` : ''}
      ${block.caption ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">${renderMathInHtml(block.caption)}</p>` : ''}
      
      <div class="w-full flex justify-center items-center bg-slate-50/70 dark:bg-slate-900/50 rounded-xl p-2 border border-slate-100 dark:border-slate-800/80 overflow-x-auto">
        <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-lg h-auto select-none" xmlns="http://www.w3.org/2000/svg">
          <!-- Clip Region -->
          <defs>
            <clipPath id="plot-clip-${Math.random().toString(36).substring(2, 8)}">
              <rect x="${pad}" y="${pad}" width="${width - 2 * pad}" height="${height - 2 * pad}" />
            </clipPath>
          </defs>

          <!-- Grid Background -->
          <rect x="${pad}" y="${pad}" width="${width - 2 * pad}" height="${height - 2 * pad}" fill="transparent" />
          <g>${gridPaths}</g>
          <g>${axesSvg}</g>
          <g>${axisTicks}</g>
          <g>${curvesSvg}</g>
          <g>${endpointsSvg}</g>
        </svg>
      </div>

      ${definitionBox}
    </div>
  `;
}

/* =========================================================
   TikZ-FBD Legacy SVG Fallback Renderer
   ========================================================= */
function renderTikzFbdSvgLegacy(input, isDark = false) {
  let code = '';
  let title = '';
  let caption = '';

  if (typeof input === 'object' && input !== null) {
    code = input.code || input.tikz || '';
    title = input.title || '';
    caption = input.caption || '';
  } else {
    code = String(input || '');
  }

  if (!code.trim()) return '';

  const isDarkMode = isDark || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const width = 500;
  const height = 380;
  const cx = width / 2;
  const cy = height / 2;

  // Clean and extract TikZ statements
  let raw = code
    .replace(/\\begin\{tikzpicture\}(\[[^\]]*\])?/g, '')
    .replace(/\\end\{tikzpicture\}/g, '');

  const statements = raw.split(';').map(s => s.trim()).filter(Boolean);
  const nodes = {};
  const draws = [];

  function parseCoords(str) {
    const s = str.trim().replace(/^\(|\)$/g, '');
    if (s.includes(':')) {
      const parts = s.split(':');
      const angle = (parseFloat(parts[0]) || 0) * (Math.PI / 180);
      const r = parseFloat(parts[1]) || 0;
      return [r * Math.cos(angle), r * Math.sin(angle)];
    } else if (s.includes(',')) {
      const parts = s.split(',');
      return [parseFloat(parts[0]) || 0, parseFloat(parts[1]) || 0];
    }
    return [0, 0];
  }

  // Color palette lookup
  const COLOR_MAP = {
    red: '#f43f5e',
    rose: '#f43f5e',
    blue: '#3b82f6',
    sky: '#0284c7',
    emerald: '#10b981',
    green: '#10b981',
    purple: '#8b5cf6',
    amber: '#f59e0b',
    orange: '#f97316',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    gray: isDarkMode ? '#94a3b8' : '#64748b',
    slate: isDarkMode ? '#94a3b8' : '#64748b'
  };

  statements.forEach(stmt => {
    if (stmt.startsWith('\\node') || stmt.startsWith('\\coordinate')) {
      const optMatch = stmt.match(/\\node\s*(\[[^\]]*\])?/);
      const options = (optMatch && optMatch[1]) ? optMatch[1].slice(1, -1) : '';
      const nameMatch = stmt.match(/\(([\w\d_-]+)\)/);
      const name = nameMatch ? nameMatch[1] : `node_${Object.keys(nodes).length}`;
      const atMatch = stmt.match(/at\s*\(([^)]+)\)/);
      const [x, y] = atMatch ? parseCoords(atMatch[1]) : [0, 0];
      const labelMatch = stmt.match(/\{([\s\S]*)\}/);
      const label = labelMatch ? labelMatch[1].trim() : '';

      let shape = 'point';
      let rotate = 0;
      let widthVal = 1.6;
      let heightVal = 1.2;

      options.split(',').map(o => o.trim()).forEach(opt => {
        if (/box|rectangle/i.test(opt)) shape = 'box';
        else if (/circle/i.test(opt)) shape = 'circle';
        else if (/plane|slope|incline/i.test(opt)) shape = 'plane';
        else if (/pulley/i.test(opt)) shape = 'pulley';
        else if (opt.startsWith('rotate=')) rotate = parseFloat(opt.split('=')[1]) || 0;
        else if (opt.startsWith('width=')) widthVal = parseFloat(opt.split('=')[1]) || 1.6;
        else if (opt.startsWith('height=')) heightVal = parseFloat(opt.split('=')[1]) || 1.2;
      });

      nodes[name] = { name, x, y, shape, rotate, width: widthVal, height: heightVal, label, options };
    } else if (stmt.startsWith('\\draw') || stmt.startsWith('\\fill')) {
      const isArrow = stmt.includes('->') || stmt.includes('-latex') || stmt.includes('force');
      const isDashed = stmt.includes('dashed');
      const isFill = stmt.startsWith('\\fill');

      let color = isDarkMode ? '#38bdf8' : '#0284c7';
      for (const [cName, cHex] of Object.entries(COLOR_MAP)) {
        const re = new RegExp(`\\b${cName}\\b`, 'i');
        if (re.test(stmt)) {
          color = cHex;
          break;
        }
      }

      const nodeMatch = stmt.match(/node\s*(\[[^\]]*\])?\s*\{([\s\S]*?)\}/);
      const label = nodeMatch ? nodeMatch[2].trim() : '';
      let posDir = 'above';
      if (nodeMatch && nodeMatch[1]) {
        const nOpts = nodeMatch[1].slice(1, -1);
        const dirs = ['above right', 'above left', 'below right', 'below left', 'above', 'below', 'left', 'right'];
        for (const d of dirs) {
          if (nOpts.includes(d)) {
            posDir = d;
            break;
          }
        }
      }

      const cleanStmt = stmt.replace(/node\s*(\[[^\]]*\])?\s*\{[\s\S]*?\}/g, '');
      const pts = cleanStmt.match(/(\+\+\([^\)]+\)|\([^\)]+\)|--\s*cycle)/g) || [];
      const coords = [];
      let curX = 0, curY = 0;

      pts.forEach(p => {
        const tr = p.trim();
        if (tr === '-- cycle' || tr === 'cycle') {
          if (coords.length > 0) coords.push([...coords[0]]);
          return;
        }
        if (tr.startsWith('++')) {
          const [dx, dy] = parseCoords(tr.substring(2));
          curX += dx;
          curY += dy;
          coords.push([curX, curY]);
        } else {
          const rawCoord = tr.replace(/^\(|\)$/g, '');
          if (nodes[rawCoord]) {
            curX = nodes[rawCoord].x;
            curY = nodes[rawCoord].y;
          } else {
            const [nx, ny] = parseCoords(rawCoord);
            curX = nx;
            curY = ny;
          }
          coords.push([curX, curY]);
        }
      });

      draws.push({ coords, isArrow, isDashed, isFill, color, label, posDir, raw: stmt });
    }
  });

  // Calculate dynamic bounding box
  const allX = [];
  const allY = [];
  Object.values(nodes).forEach(n => {
    allX.push(n.x - n.width / 2, n.x + n.width / 2);
    allY.push(n.y - n.height / 2, n.y + n.height / 2);
  });
  draws.forEach(d => {
    d.coords.forEach(([x, y]) => {
      allX.push(x);
      allY.push(y);
    });
  });

  if (allX.length === 0) { allX.push(-2, 2); }
  if (allY.length === 0) { allY.push(-2, 2); }

  const minX = Math.min(...allX) - 1.2;
  const maxX = Math.max(...allX) + 1.2;
  const minY = Math.min(...allY) - 1.2;
  const maxY = Math.max(...allY) + 1.2;

  const cxVal = (minX + maxX) / 2;
  const cyVal = (minY + maxY) / 2;
  const spanX = Math.max(maxX - minX, 2.5);
  const spanY = Math.max(maxY - minY, 2.5);

  const scaleX = (width - 100) / spanX;
  const scaleY = (height - 90) / spanY;
  const scale = Math.min(scaleX, scaleY, 65.0);

  const toSx = (x) => cx + (x - cxVal) * scale;
  const toSy = (y) => cy - (y - cyVal) * scale;

  const bgBox = isDarkMode ? '#0f172a' : '#f8fafc';
  const fgBox = isDarkMode ? '#38bdf8' : '#0284c7';
  const textClr = isDarkMode ? '#f1f5f9' : '#0f172a';
  const gridLineClr = isDarkMode ? '#1e293b' : '#f1f5f9';

  let svgElements = [];

  // Soft Coordinate / Ground Grid Reference
  svgElements.push(`
    <line x1="20" y1="${height - 25}" x2="${width - 20}" y2="${height - 25}" stroke="${gridLineClr}" stroke-width="1.5" stroke-dasharray="4,4" />
  `);

  // 1. Render Nodes/Objects
  Object.values(nodes).forEach(n => {
    const sx = toSx(n.x);
    const sy = toSy(n.y);
    const w = n.width * scale;
    const h = n.height * scale;
    const rot = n.rotate;
    const rotAttr = rot ? `transform="rotate(${-rot} ${sx} ${sy})"` : '';

    if (n.shape === 'box') {
      svgElements.push(`
        <rect x="${sx - w / 2}" y="${sy - h / 2}" width="${w}" height="${h}" rx="6" fill="${bgBox}" stroke="${fgBox}" stroke-width="2.2" ${rotAttr} />
      `);
    } else if (n.shape === 'circle' || n.shape === 'pulley') {
      const r = w / 2;
      svgElements.push(`
        <circle cx="${sx}" cy="${sy}" r="${r}" fill="${bgBox}" stroke="${fgBox}" stroke-width="2.2" />
        ${n.shape === 'pulley' ? `<circle cx="${sx}" cy="${sy}" r="4" fill="${fgBox}" />` : ''}
      `);
    } else if (n.shape === 'plane') {
      const hw = w * 1.5;
      svgElements.push(`
        <polygon points="${sx - hw},${sy + h/2} ${sx + hw},${sy + h/2} ${sx + hw},${sy - h/2}" fill="${bgBox}" stroke="${fgBox}" stroke-width="2" />
      `);
    } else if (n.shape === 'point') {
      svgElements.push(`
        <circle cx="${sx}" cy="${sy}" r="4.5" fill="${fgBox}" />
      `);
    }

    if (n.label) {
      const parsedLabel = renderMathInHtml(n.label);
      svgElements.push(`
        <foreignObject x="${sx - 90}" y="${sy - 16}" width="180" height="32" class="overflow-visible pointer-events-none">
          <div xmlns="http://www.w3.org/1999/xhtml" class="w-full h-full flex items-center justify-center text-xs font-bold font-mono-math" style="color: ${textClr}; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
            ${parsedLabel}
          </div>
        </foreignObject>
      `);
    }
  });

  // 2. Render Draws / Force Vectors
  draws.forEach(d => {
    if (d.coords.length < 2) return;
    const dashAttr = d.isDashed ? 'stroke-dasharray="5,4"' : '';
    const pointsStr = d.coords.map(([x, y]) => `${toSx(x).toFixed(1)},${toSy(y).toFixed(1)}`).join(' ');

    if (d.isFill) {
      svgElements.push(`
        <polygon points="${pointsStr}" fill="${d.color}" fill-opacity="0.15" stroke="${d.color}" stroke-width="1.8" />
      `);
    } else {
      svgElements.push(`
        <polyline points="${pointsStr}" fill="none" stroke="${d.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${dashAttr} />
      `);
    }

    // Arrowhead
    if (d.isArrow && d.coords.length >= 2) {
      const [x1, y1] = d.coords[d.coords.length - 2];
      const [x2, y2] = d.coords[d.coords.length - 1];
      const sx1 = toSx(x1), sy1 = toSy(y1);
      const sx2 = toSx(x2), sy2 = toSy(y2);
      const angle = Math.atan2(sy2 - sy1, sx2 - sx1);
      const arrowLen = 11;
      const ax1 = sx2 - arrowLen * Math.cos(angle - Math.PI / 6);
      const ay1 = sy2 - arrowLen * Math.sin(angle - Math.PI / 6);
      const ax2 = sx2 - arrowLen * Math.cos(angle + Math.PI / 6);
      const ay2 = sy2 - arrowLen * Math.sin(angle + Math.PI / 6);

      svgElements.push(`
        <polygon points="${sx2.toFixed(1)},${sy2.toFixed(1)} ${ax1.toFixed(1)},${ay1.toFixed(1)} ${ax2.toFixed(1)},${ay2.toFixed(1)}" fill="${d.color}" />
      `);

      // Label with math rendering
      if (d.label) {
        let lx = sx2;
        let ly = sy2;
        const off = 22;

        if (d.posDir.includes('above')) ly -= off;
        if (d.posDir.includes('below')) ly += off;
        if (d.posDir.includes('left')) lx -= off;
        if (d.posDir.includes('right')) lx += off;

        const parsedLabel = renderMathInHtml(d.label);
        svgElements.push(`
          <foreignObject x="${(lx - 75).toFixed(1)}" y="${(ly - 14).toFixed(1)}" width="150" height="28" class="overflow-visible pointer-events-none">
            <div xmlns="http://www.w3.org/1999/xhtml" class="w-full h-full flex items-center justify-center text-xs font-bold font-mono-math" style="color: ${d.color};">
              ${parsedLabel}
            </div>
          </foreignObject>
        `);
      }
    }
  });

  return `
    <div class="my-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      ${title ? `<h4 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-tagsci-600"></span>${renderMathInHtml(title)}</h4>` : ''}
      ${caption ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">${renderMathInHtml(caption)}</p>` : ''}
      
      <div class="w-full flex justify-center items-center bg-slate-50/70 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 overflow-x-auto">
        <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-lg h-auto select-none" xmlns="http://www.w3.org/2000/svg">
          ${svgElements.join('\n')}
        </svg>
      </div>
    </div>
  `;
}

/* =========================================================
   JSXGraph Interactive Physics & Math Board Renderer
   - Local offline vendor: vendor/jsxgraph/jsxgraphcore.js
   - Interactive vectors, geometries, coordinate boards & forces
   ========================================================= */
export function renderJsxgraphBlock(input, isDark = false) {
  let code = '';
  let title = '';
  let caption = '';
  let bBox = [-5, 5, 5, -5];
  let showAxes = false;
  let showGrid = false;
  let id = '';

  if (typeof input === 'object' && input !== null) {
    code = input.code || input.jsxgraph || input.jxg || input.tikz || '';
    title = input.title || '';
    caption = input.caption || '';
    if (Array.isArray(input.boundingBox) && input.boundingBox.length === 4) {
      bBox = input.boundingBox;
    } else if (Array.isArray(input.bBox) && input.bBox.length === 4) {
      bBox = input.bBox;
    }
    if (input.axis !== undefined) showAxes = !!input.axis;
    if (input.axes !== undefined) showAxes = !!input.axes;
    if (input.grid !== undefined) showGrid = !!input.grid;
    id = input.id || '';
  } else {
    code = String(input || '');
  }

  if (!code.trim()) return '';

  // Backward-compatibility: if input is legacy TikZ code, route to TikZ SVG renderer
  if (code.includes('\\begin{tikzpicture}') || code.includes('\\node[')) {
    return renderTikzFbdSvgLegacy({ code, title, caption }, isDark);
  }

  const boardId = id ? `jxg-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}` : `jxg-${Math.random().toString(36).slice(2, 10)}`;
  const encodedCode = encodeURIComponent(code);
  const encodedBbox = encodeURIComponent(JSON.stringify(bBox));

  return `
    <div class="my-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      ${title ? `<h4 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>${renderMathInHtml(title)}</h4>` : ''}
      ${caption ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">${renderMathInHtml(caption)}</p>` : ''}
      
      <div class="w-full flex justify-center items-center bg-slate-50/70 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 overflow-x-auto">
        <div id="${boardId}" class="jxgbox w-full max-w-xl aspect-[4/3] rounded-xl overflow-hidden select-none border border-slate-200/50 dark:border-slate-800/50 shadow-inner"
          data-jxg-code="${encodedCode}"
          data-jxg-bbox="${encodedBbox}"
          data-jxg-axes="${showAxes}"
          data-jxg-grid="${showGrid}">
        </div>
      </div>
    </div>
  `;
}

export function initializeJsxgraphBoards(container = document) {
  if (typeof window === 'undefined') return;
  if (!window.JXG) {
    setTimeout(() => initializeJsxgraphBoards(container), 80);
    return;
  }

  const root = (container && container.querySelectorAll) ? container : document;
  const boardEls = root.querySelectorAll('[data-jxg-code]');
  if (!boardEls || boardEls.length === 0) return;

  const isDarkMode = (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const colors = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    axis: isDarkMode ? '#64748b' : '#94a3b8',
    grid: isDarkMode ? '#1e293b' : '#e2e8f0',
    primary: isDarkMode ? '#34d399' : '#059669',
    secondary: isDarkMode ? '#38bdf8' : '#0284c7',
    accent: isDarkMode ? '#f472b6' : '#db2777',
    warning: isDarkMode ? '#fbbf24' : '#d97706',
    danger: isDarkMode ? '#f87171' : '#dc2626',
    text: isDarkMode ? '#f1f5f9' : '#0f172a'
  };

  boardEls.forEach(el => {
    if (el._jxgBoard) {
      try {
        if (el.clientWidth > 0 && el.clientHeight > 0) {
          el._jxgBoard.resizeContainer(el.clientWidth, el.clientHeight);
        }
      } catch (e) {}
      return;
    }

    try {
      const rawCode = el.getAttribute('data-jxg-code');
      const code = rawCode ? decodeURIComponent(rawCode) : '';
      if (!code.trim()) return;

      let bBox = [-5, 5, 5, -5];
      const rawBbox = el.getAttribute('data-jxg-bbox');
      if (rawBbox) {
        try {
          bBox = JSON.parse(decodeURIComponent(rawBbox));
        } catch (e) {
          bBox = [-5, 5, 5, -5];
        }
      }

      const showAxes = el.getAttribute('data-jxg-axes') === 'true';
      const showGrid = el.getAttribute('data-jxg-grid') === 'true';

      if (window.JXG.boards && window.JXG.boards[el.id]) {
        try {
          window.JXG.JSXGraph.freeBoard(el.id);
        } catch (e) {}
      }

      el.innerHTML = '';

      const board = window.JXG.JSXGraph.initBoard(el.id, {
        boundingbox: bBox,
        axis: showAxes,
        grid: showGrid,
        showNavigation: false,
        showCopyright: false,
        keepaspectratio: false,
        renderer: 'svg'
      });

      const runner = new Function('board', 'JXG', 'colors', 'isDark', code);
      runner(board, window.JXG, colors, isDarkMode);

      el._jxgBoard = board;
    } catch (err) {
      console.error('JSXGraph init failed on', el.id, err);
      el.innerHTML = `<div class="p-3 text-xs text-rose-500 font-mono">Diagram render error: ${err.message}</div>`;
    }
  });
}

export const renderTikzFbdSvg = renderJsxgraphBlock;

if (typeof window !== 'undefined') {
  window.renderJsxgraphBlock = renderJsxgraphBlock;
  window.initializeJsxgraphBoards = initializeJsxgraphBoards;
  window.renderTikzFbdSvg = renderJsxgraphBlock;
}
