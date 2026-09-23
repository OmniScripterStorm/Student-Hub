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
  '\\cdot': '&middot;',
  '\\times': '&times;',
  '\\pm': '&plusmn;',
  '\\mp': '&#x2213;',
  '\\approx': '&asymp;',
  '\\neq': '&ne;',
  '\\le': '&le;',
  '\\ge': '&ge;',
  '\\infty': '&infin;',
  '\\partial': '&part;',
  '\\nabla': '&nabla;',
  '\\forall': '&forall;',
  '\\exists': '&exist;',
  '\\in': '&isin;',
  '\\notin': '&notin;',
  '\\rightarrow': '&rarr;',
  '\\leftarrow': '&larr;',
  '\\Rightarrow': '&rArr;',
  '\\Leftarrow': '&lArr;',
  '\\leftrightarrow': '&harr;',
  '\\int': '<span class="text-lg leading-none italic font-serif font-bold">&int;</span>',
  '\\iint': '<span class="text-lg leading-none italic font-serif font-bold">&int;&int;</span>',
  '\\sum': '<span class="text-lg leading-none font-bold">&sum;</span>',
  '\\prod': '<span class="text-lg leading-none font-bold">&prod;</span>',
  '\\sqrt': '&radic;'
};

export function parseMathSyntax(tex) {
  let s = tex.trim();

  // 1. Fractions: \frac{num}{den} -> stacked visual fraction
  s = s.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (match, num, den) => {
    return `<span class="inline-flex flex-col text-center align-middle mx-1 text-xs sm:text-sm font-mono-math">
      <span class="border-b border-current pb-0.5 px-1">${parseMathSyntax(num)}</span>
      <span class="pt-0.5 px-1">${parseMathSyntax(den)}</span>
    </span>`;
  });

  // 2. Square roots: \sqrt[n]{x} or \sqrt{x}
  s = s.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, (match, n, inner) => {
    return `<span class="inline-flex items-center align-middle font-mono-math">
      <sup class="text-[9px] -mr-1">${parseMathSyntax(n)}</sup>
      <span class="text-base leading-none">&radic;</span>
      <span class="border-t border-current px-0.5 ml-0.5">${parseMathSyntax(inner)}</span>
    </span>`;
  });

  s = s.replace(/\\sqrt\{([^{}]+)\}/g, (match, inner) => {
    return `<span class="inline-flex items-center align-middle font-mono-math">
      <span class="text-base leading-none">&radic;</span>
      <span class="border-t border-current px-0.5 ml-0.5">${parseMathSyntax(inner)}</span>
    </span>`;
  });

  // 3. Vectors: \vec{v} or \hat{i}
  s = s.replace(/\\vec\{([^{}]+)\}/g, (match, inner) => {
    return `<span class="inline-flex flex-col items-center justify-center font-mono-math"><span class="text-[10px] leading-none">&rarr;</span><span>${inner}</span></span>`;
  });

  s = s.replace(/\\hat\{([^{}]+)\}/g, (match, inner) => {
    return `<span class="inline-flex flex-col items-center justify-center font-mono-math"><span class="text-[10px] leading-none">^</span><span>${inner}</span></span>`;
  });

  // 4. Superscripts & Subscripts: x^{2} / x^2, v_{0} / v_0
  s = s.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
  s = s.replace(/\^([a-zA-Z0-9+\-&;]+)/g, '<sup>$1</sup>');
  s = s.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
  s = s.replace(/_([a-zA-Z0-9+\-&;]+)/g, '<sub>$1</sub>');

  // 5. Greek Letters & Math Symbols
  for (const [key, val] of Object.entries(GREEK_SYMBOLS)) {
    s = s.split(key).join(val);
  }

  for (const [key, val] of Object.entries(MATH_OPERATORS)) {
    s = s.split(key).join(val);
  }

  // 6. Text inside math: \text{...}
  s = s.replace(/\\text\{([^{}]+)\}/g, '<span class="font-sans font-normal">$1</span>');

  return s;
}

/**
 * Scans an HTML string or DOM container, rendering $...$ as inline math and $$...$$ as block math
 */
export function renderMathInHtml(htmlString) {
  if (!htmlString) return '';

  // Block math: $$ ... $$
  let res = htmlString.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
    const rendered = parseMathSyntax(tex);
    return `<div class="my-3 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono-math text-sm sm:text-base text-tagsci-900 dark:text-emerald-300 shadow-sm overflow-x-auto">${rendered}</div>`;
  });

  // Inline math: $ ... $
  res = res.replace(/\$([^\$\n]+?)\$/g, (match, tex) => {
    const rendered = parseMathSyntax(tex);
    return `<span class="inline-block font-mono-math text-tagsci-800 dark:text-emerald-300 px-1 py-0.5 rounded bg-slate-100/70 dark:bg-slate-800/60 text-xs sm:text-sm font-semibold">${rendered}</span>`;
  });

  return res;
}

/**
 * Helper to render math inside any DOM element
 */
export function renderMathInElement(domElement) {
  if (!domElement) return;
  domElement.innerHTML = renderMathInHtml(domElement.innerHTML);
}
