// Script to Video: page code (kept in its own file so strict site security settings don't block it)
{
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const out3 = t => 1 - Math.pow(1 - t, 3);
const outBack = t => { const c = 1.70158, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtT = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const even = x => Math.max(2, Math.round(x / 2) * 2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FPS = 30, TR = 0.35, MAXW = 26, KEY = 'script-to-video:v1';
const ENDP = /[.!?…]["'”’)\]]*$/, SOFTP = /[,;:—–]["'”’)]*$/;

const THEMES = {
  night:  { name: 'Night',  bg: '#0d0d10', b1: '#2c2b3d', b2: '#12304a', b3: '#3a1d2c', ink: '#ffffff', accent: '#ffd60a', accentInk: '#111111', hl: '#ffd60a', bar: '#ffd60a', light: false },
  paper:  { name: 'Paper',  bg: '#f3f2ee', b1: '#ffffff', b2: '#e3e0d8', b3: '#ecebe6', ink: '#151515', accent: '#e3342f', accentInk: '#ffffff', hl: '#e3342f', bar: '#e3342f', light: true },
  ocean:  { name: 'Ocean',  bg: '#05324f', b1: '#0d6f99', b2: '#04223a', b3: '#0b5a7c', ink: '#ffffff', accent: '#5ef2c8', accentInk: '#032438', hl: '#5ef2c8', bar: '#5ef2c8', light: false },
  sunset: { name: 'Sunset', bg: '#ef5b2b', b1: '#ffa01c', b2: '#d12f6b', b3: '#ff7a3a', ink: '#ffffff', accent: '#2a0f45', accentInk: '#ffffff', hl: '#2a0f45', bar: '#ffffff', light: false },
  forest: { name: 'Forest', bg: '#0f2d21', b1: '#1f5c43', b2: '#091d15', b3: '#2c6b3e', ink: '#f5f1df', accent: '#c8f03c', accentInk: '#0f2d21', hl: '#c8f03c', bar: '#c8f03c', light: false },
  red:    { name: 'Red',    bg: '#c41d2a', b1: '#ee4b3d', b2: '#8c0e1b', b3: '#e1303a', ink: '#ffffff', accent: '#111111', accentInk: '#ffffff', hl: '#111111', bar: '#ffffff', light: false }
};
const FONTS = {
  montserrat: { label: 'Montserrat', fam: "'Montserrat'", css: '900 {px}px Montserrat, "Arial Black", system-ui, sans-serif', k: 1 },
  anton:      { label: 'Anton', fam: "'Anton'", css: '400 {px}px Anton, Impact, "Arial Narrow", sans-serif', k: 1.14 },
  archivo:    { label: 'Archivo', fam: "'Archivo'", css: '800 {px}px Archivo, system-ui, sans-serif', k: 1 },
  playfair:   { label: 'Playfair', fam: "'Playfair Display'", css: '800 {px}px "Playfair Display", Georgia, serif', k: 1 },
  courier:    { label: 'Courier', fam: "'Courier Prime'", css: '700 {px}px "Courier Prime", "Courier New", monospace', k: 0.94 }
};
const LOOKS = {
  captions:   { label: 'Captions', font: 'montserrat', upper: true, hint: 'Big words that pop in as they are spoken.' },
  story:      { label: 'Story', font: 'archivo', upper: false, hint: 'The whole line on screen, lighting up as it is read.' },
  subtitles:  { label: 'Subtitles', font: 'archivo', upper: false, hint: 'Film-style subtitles along the bottom. Best with photos.' },
  typewriter: { label: 'Typewriter', font: 'courier', upper: false, hint: 'Each line types itself out, letter by letter.' }
};
// cap: [words per caption, characters per caption, size]  sub: [characters per line, size, bottom line position]
const FORMATS = {
  '9:16': { hint: 'Tall. TikTok, Reels, Shorts, WhatsApp status.', w: 1080, h: 1920, cap: [3, 14, 108], sub: [22, 54, 0.76], lowerY: 0.66, thumb: [64, 114] },
  '4:5':  { hint: 'Portrait. Instagram and Facebook feeds.', w: 1080, h: 1350, cap: [3, 16, 100], sub: [26, 50, 0.84], lowerY: 0.7, thumb: [76, 95] },
  '1:1':  { hint: 'Square. Works in every feed.', w: 1080, h: 1080, cap: [3, 16, 96], sub: [28, 48, 0.86], lowerY: 0.72, thumb: [84, 84] },
  '16:9': { hint: 'Wide. YouTube and TV screens.', w: 1920, h: 1080, cap: [4, 24, 92], sub: [46, 44, 0.86], lowerY: 0.74, thumb: [120, 68] },
  '16:9': { hint: 'Wide. YouTube and presentations.', w: 1920, h: 1080, cap: [4, 24, 100], sub: [42, 50, 0.88], lowerY: 0.74, thumb: [120, 68] }
};
const OPTS = {
  look: Object.keys(LOOKS).map(v => [v, LOOKS[v].label]),
  format: Object.keys(FORMATS).map(v => [v, v]),
  font: Object.keys(FONTS).map(v => [v, FONTS[v].label]),
  hl: [['box', 'Box'], ['colour', 'Colour'], ['off', 'Off']],
  pos: [['middle', 'Middle'], ['lower', 'Lower']],
  trans: [['fade', 'Fade'], ['slide', 'Slide'], ['zoom', 'Zoom'], ['dip', 'Dip to black'], ['wipe', 'Wipe'], ['cut', 'Cut']],
  quality: [['720', '720p'], ['1080', '1080p']],
  aiVoice: [['af_heart', 'Heart · US woman'], ['af_bella', 'Bella · US woman'], ['am_michael', 'Michael · US man'], ['am_fenrir', 'Fenrir · US man'], ['bf_emma', 'Emma · UK woman'], ['bm_george', 'George · UK man']]
};
const SAMPLE = [
  '# 3 habits that changed my mornings', '',
  'Most people reach for their phone before their feet touch the floor.', '',
  'Habit one: drink a full glass of water before anything else.', '',
  'Habit two: write down the one task that would make today a win.', '',
  'Habit three: ten minutes of movement. A short walk counts.', '',
  'Small habits, done daily, beat big plans done once.', '',
  'Follow for more simple routines.'
].join('\n');
const DEF = { script: SAMPLE, look: 'captions', format: '9:16', theme: 'night', font: 'montserrat', upper: true, pos: 'middle', hl: 'box', wpm: 160, handle: '', progress: true, quality: 1080, musicVol: 0.3, aiVoice: 'af_heart', aiSpeed: 1, capY: null, duck: true, voiceVol: 1, trans: 'fade' };

function load(given) {
  let s = {};
  if (given && typeof given === 'object') s = given;
  else try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
  const o = Object.assign({}, DEF, s);
  if (!LOOKS[o.look]) o.look = DEF.look;
  if (!FORMATS[o.format]) o.format = DEF.format;
  if (!THEMES[o.theme]) o.theme = DEF.theme;
  if (!FONTS[o.font]) o.font = DEF.font;
  if (o.pos !== 'lower') o.pos = 'middle';
  if (!['box', 'colour', 'off'].includes(o.hl)) o.hl = 'box';
  o.wpm = Number.isFinite(+o.wpm) ? clamp(Math.round(+o.wpm), 110, 210) : 160;
  o.quality = +o.quality === 720 ? 720 : 1080;
  o.musicVol = Number.isFinite(+o.musicVol) ? clamp(+o.musicVol, 0, 1) : 0.3;
  if (typeof o.script !== 'string') o.script = SAMPLE;
  if (typeof o.handle !== 'string') o.handle = '';
  o.upper = !!o.upper; o.progress = !!o.progress;
  if (!OPTS.aiVoice.some(v => v[0] === o.aiVoice)) o.aiVoice = DEF.aiVoice;
  o.aiSpeed = Number.isFinite(+o.aiSpeed) ? clamp(Math.round(+o.aiSpeed * 20) / 20, 0.8, 1.2) : 1;
  o.capY = o.capY != null && Number.isFinite(+o.capY) ? clamp(+o.capY, 0.12, 0.88) : null;
  o.duck = o.duck !== false;
  if (!OPTS.trans.some(t => t[0] === o.trans)) o.trans = 'fade';
  o.voiceVol = Number.isFinite(+o.voiceVol) ? clamp(+o.voiceVol, 0, 2) : 1;
  return o;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

let S = load();
let media = [], durOv = [], sync = null, voice = null, music = null, ovl = [], selText = null, trans = [];
const VERSION = '2.7';
const MAXCLIP = 600; // longest a single clip can make its scene, in seconds
const transOf = i => (i > 0 && (trans[i] || S.trans)) || 'cut';
const transDur = tr => tr === 'cut' ? 0 : tr === 'fade' ? TR : 0.5;
// how long a clip's trimmed part lasts on screen, at its speed
const clipLen = m => Math.max(0.1, (m.out - m.in) / (m.speed || 1));
const LOOKF = ['fitMode', 'zoom', 'px', 'py', 'rot', 'filter'], CLIPF = ['in', 'out', 'speed', 'vol', 'fit', 'endMode', 'useSound'];
const pickF = (m, list) => { const o = {}; for (const k of list) if (m[k] !== undefined) o[k] = m[k]; return o; };
// the browser's own looping only works when the whole clip is used
function applyLoop(m) { if (m && m.el) m.el.loop = m.endMode !== 'hold' && m.in < 0.05 && m.out > m.dur - 0.05; }
let TL = { scenes: [], total: 0 };
const LC = new Map();
let IN_CLAUDE = false;
let busy = false, playing = false, playT = 0.9, clock = null, nodes = [], actx = null, DL = null, lastOut = null, curScene = -1, JOB = null, pendingImg = -1, SY = null;

/* ---------- script → scenes ---------- */
const DIRECTION = /^(?:(?:scene|shot)\s*\d+\b.*|(?:visuals?|b-?roll|sfx|music|on-?screen(?: text)?|cut to|fade (?:in|out)(?: to)?|transition|camera)\s*:.*)$/i;
const SPEAKER = /^(?:narrator|voice ?over|v\.?o\.?|host|speaker(?:\s*\d+)?|hook|intro(?:duction)?|opening|body|outro|closing|conclusion|cta|call to action)\s*(?:\([^)]*\))?\s*[:\-–—]\s*/i;
const STAMP = /^[([]?\d{1,2}:\d{2}(?:\s*[-–—]\s*\d{1,2}:\d{2})?[)\]]?\s*[:\-–—]?\s*/;
const TITLE = /^(?:title|heading)\s*:\s*(.+)$/i;
const words = t => t.split(/\s+/).filter(Boolean);
const sentences = t => (t.match(/[^.!?…]+(?:[.!?…]+["'”’)]*|$)/g) || [t]).map(s => s.trim()).filter(Boolean);
function cleanLine(l) {
  l = l.replace(/\*\*|__|`/g, '').replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, '').trim().replace(STAMP, '');
  if (!l) return '';
  if (DIRECTION.test(l) || /^\(.*\)$/.test(l)) return null;
  return l.replace(SPEAKER, '');
}
const CLIPMARK = '\u2063clip\u2063';
function parse(text) {
  const src = String(text || '').replace(/\r\n?/g, '\n').replace(/^[ \t]*\[\s*clip\s*\][ \t]*$/gim, CLIPMARK).replace(/\[[^\]\n]*\]/g, ' ');
  let blocks = src.split(/\n[ \t]*\n/);
  const full = blocks.filter(b => b.trim());
  if (full.length === 1) {
    const ls = full[0].split('\n').map(s => s.trim()).filter(Boolean);
    if (ls.length > 1 && ls.filter(l => ENDP.test(l) || /:$/.test(l) || /^#/.test(l)).length >= ls.length * 0.6) blocks = ls;
  }
  const out = [];
  const push = t => {
    t = t.replace(/\s+/g, ' ').trim();
    if (!t) return;
    if (words(t).length <= MAXW) { out.push({ kind: 'text', text: t }); return; }
    let cur = '';
    for (const s of sentences(t)) {
      const c = cur ? cur + ' ' + s : s;
      if (cur && words(c).length > MAXW) { out.push({ kind: 'text', text: cur }); cur = s; } else cur = c;
    }
    if (cur) out.push({ kind: 'text', text: cur });
  };
  for (const b of blocks) {
    let buf = [];
    for (const raw of b.split('\n')) {
      if (raw === CLIPMARK) { push(buf.join(' ')); buf = []; out.push({ kind: 'clip', text: '' }); continue; }
      const h = raw.match(/^\s*#{1,6}\s*(.*)$/) || raw.replace(/\*\*|__/g, '').trim().match(TITLE);
      if (h) {
        push(buf.join(' ')); buf = [];
        const tt = h[1].replace(/\*\*|__/g, '').trim();
        if (tt) out.push({ kind: 'title', text: tt });
        continue;
      }
      const l = cleanLine(raw);
      if (l === null) { push(buf.join(' ')); buf = []; continue; }
      if (l) buf.push(l);
    }
    push(buf.join(' '));
  }
  return out.slice(0, 300).map((s, i) => Object.assign(s, { i, words: words(s.text) }));
}
function autoDur(sc) {
  if (sc.kind === 'clip') return 2;
  if (sc.kind === 'title') return clamp(1.6 + sc.words.length * 0.3, 2.2, 4.5);
  let d = sc.words.length * 60 / S.wpm;
  for (const w of sc.words) d += ENDP.test(w) ? 0.35 : SOFTP.test(w) ? 0.16 : 0;
  return Math.max(1.4, d + 0.4);
}
function wordTimes(sc) {
  const D = sc.talk || sc.dur;
  const lead = sc.kind === 'title' ? 0 : Math.min(0.15, D * 0.05);
  const tail = sc.kind === 'title' ? 0 : Math.min(0.5, D * 0.15);
  const span = Math.max(0.1, D - lead - tail);
  const wts = sc.words.map(w => 1 + Math.min(w.length, 12) * 0.09 + (ENDP.test(w) ? 0.9 : SOFTP.test(w) ? 0.45 : 0));
  const tot = wts.reduce((a, b) => a + b, 0) || 1;
  let acc = lead;
  sc.wt = wts.map(x => { const d = span * x / tot, r = { t0: acc, t1: acc + d }; acc += d; return r; });
}
const WEAK = new Set('a an the to of in on at for and or but nor my your our their his her its with from by as is are was be i we you he she they that this so if not no'.split(' '));
const bare = w => w.toLowerCase().replace(/[^a-z']/g, '');
function chunk(ws, maxWords, maxChars, soft) {
  const out = []; let a = 0, len = 0;
  for (let k = 0; k < ws.length; k++) {
    const w = ws[k], add = (k > a ? 1 : 0) + w.length;
    if (k > a && (k - a >= maxWords || len + add > maxChars)) {
      const cut = k - 1 > a && WEAK.has(bare(ws[k - 1])) ? k - 1 : k;
      out.push({ a, b: cut }); a = cut; len = ws.slice(a, k + 1).join(' ').length;
    } else len += add;
    if (ENDP.test(w) || (soft && SOFTP.test(w))) { out.push({ a, b: k + 1 }); a = k + 1; len = 0; }
  }
  if (a < ws.length) out.push({ a, b: ws.length });
  return out;
}
function chunksFor(sc) {
  const f = FORMATS[S.format];
  const timed = list => list.map((c, j) => Object.assign(c, { t0: j === 0 ? 0 : sc.wt[c.a].t0 }));
  sc.caps = timed(chunk(sc.words, f.cap[0], f.cap[1], true));
  sc.subs = timed(chunk(sc.words, 99, f.sub[0] * 2, false));
}
function build() {
  const raw = parse(S.script), n = raw.length;
  if (sync && (!voice || sync.length !== n)) sync = null;
  const clipAt = i => media[i] && media[i].kind === 'video' ? media[i] : null;
  const sharedAt = i => !!media[i] && (media[i] === media[i - 1] || media[i] === media[i + 1]);
  let durs, talk;
  if (sync) {
    // each scene's own stretch of the voice; a scene with no words has none
    talk = sync.map((r, i) => raw[i].kind === 'clip' ? 0 : !(r.len > 0.05) ? autoDur(raw[i]) : i === n - 1 ? Math.max(r.len + 0.4, 0.8) : r.len);
    durs = talk.map((d, i) => {
      if (raw[i].kind !== 'clip') return d;
      const m = clipAt(i);
      return durOv[i] != null ? durOv[i] : m && m.fit !== 'cut' ? 0 : autoDur(raw[i]);
    });
  } else {
    durs = raw.map((s, i) => {
      if (durOv[i] != null) return durOv[i];
      const m = clipAt(i);
      if (m && !voice && !sharedAt(i) && m.fit !== 'cut') return clamp(clipLen(m), 0.3, MAXCLIP);
      return autoDur(s);
    });
    if (voice && n) {
      let fixed = 0, flex = 0;
      durs.forEach((d, i) => { if (durOv[i] != null) fixed += d; else flex += d; });
      const k = flex > 0 ? Math.max(0.15, (voice.dur + 0.4 - fixed) / flex) : 1;
      durs = durs.map((d, i) => durOv[i] != null ? d : d * k);
    }
    talk = durs.slice();
  }
  // A whole clip is never cut short: the last scene showing it stretches to fit the rest of the clip.
  // (Not with a voiceover that hasn't been synced, because then nothing says where its lines can pause.)
  if (!voice || sync) for (let i = 0; i < n;) {
    const m = clipAt(i); let j = i;
    while (m && j + 1 < n && media[j + 1] === m) j++;
    if (m && m.fit !== 'cut' && durOv[j] == null) {
      let sum = 0; for (let k = i; k <= j; k++) sum += durs[k];
      const need = Math.min(clipLen(m), MAXCLIP) - sum;
      if (need > 0.02) durs[j] += need;
    }
    i = j + 1;
  }
  const starts = []; let acc = 0;
  for (const d of durs) { starts.push(acc); acc += d; }
  // where each scene's narration plays, now that scenes can move and stretch
  let vo = null;
  if (sync) {
    vo = [];
    sync.forEach((r, i) => {
      if (!(r.len > 0) || raw[i].kind === 'clip') return;
      const q = { at: starts[i], from: r.from, len: r.len }, l = vo[vo.length - 1];
      if (l && Math.abs(l.at + l.len - q.at) < 1e-6 && Math.abs(l.from + l.len - q.from) < 1e-6) l.len += q.len;
      else vo.push(q);
    });
  }
  const scenes = raw.map((s, i) => Object.assign(s, { start: starts[i], dur: durs[i], talk: Math.min(talk[i], durs[i]), media: media[i] || null, img: !!media[i], ovl: ovl[i] || [] }));
  scenes.forEach((sc, i) => {
    const p = scenes[i - 1];
    sc.clipOffset = p && sc.media && sc.media.kind === 'video' && p.media === sc.media ? p.clipOffset + p.dur : 0;
    wordTimes(sc); chunksFor(sc);
  });
  TL = { scenes, total: n ? scenes[n - 1].start + scenes[n - 1].dur : 0, vo };
}

/* ---------- drawing ---------- */
const RGB = {};
function rgba(hex, a) {
  let c = RGB[hex];
  if (!c) { const n = parseInt(hex.slice(1), 16); c = RGB[hex] = [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
}
const font = (f, px) => f.css.replace('{px}', String(Math.max(1, Math.round(px))));
const disp = w => S.upper ? w.toUpperCase() : w;
const capWord = w => disp(w.replace(/[,.;:]+(["'”’)]*)$/, '$1'));
function rrect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function sceneAt(t) {
  const s = TL.scenes; let lo = 0, hi = s.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m].start <= t) lo = m; else hi = m - 1; }
  return lo;
}
function idxAt(list, lt) { let j = 0; while (j + 1 < list.length && list[j + 1].t0 <= lt) j++; return j; }
function speaking(sc, lt) { for (let k = 0; k < sc.wt.length; k++) if (lt >= sc.wt[k].t0 && lt < sc.wt[k].t1) return k; return -1; }
function lastSpoken(sc, lt, ch) { let k = ch.a; for (let j = ch.a; j < ch.b; j++) if (sc.wt[j].t0 <= lt) k = j; return k; }
function wrap(items, maxW, sp) {
  const lines = []; let cur = [], w = 0;
  for (const it of items) {
    const add = cur.length ? sp + it.w : it.w;
    if (cur.length && w + add > maxW) { lines.push({ items: cur, w }); cur = [it]; w = it.w; } else { cur.push(it); w += add; }
  }
  if (cur.length) lines.push({ items: cur, w });
  return lines;
}
function wrapBalanced(items, maxW, sp) {
  const base = wrap(items, maxW, sp);
  if (base.length < 2) return base;
  let lo = maxW * 0.35, hi = maxW;
  for (let n = 0; n < 12; n++) { const mid = (lo + hi) / 2; if (wrap(items, mid, sp).length > base.length) lo = mid; else hi = mid; }
  return wrap(items, hi, sp);
}
function fitBlock(ctx, f, list, maxW, maxH, start, lhK, maxLines, bal) {
  let fs = start, res = null;
  for (let n = 0; n < 16; n++) {
    ctx.font = font(f, fs);
    const sp = ctx.measureText(' ').width;
    const items = list.map(o => Object.assign({}, o, { w: ctx.measureText(o.s).width, c: Array.from(o.s) }));
    const lines = bal ? wrapBalanced(items, maxW, sp) : wrap(items, maxW, sp);
    const widest = Math.max.apply(null, lines.map(l => l.w).concat([1]));
    const m = ctx.measureText('H');
    res = { fs, lines, sp, lh: fs * lhK, cap: m.actualBoundingBoxAscent || fs * 0.7, widest };
    if ((lines.length * fs * lhK <= maxH && widest <= maxW && (!maxLines || lines.length <= maxLines)) || fs < 6) return res;
    fs *= 0.9;
  }
  return res;
}
function gradientBg(ctx, W, H, t, seed, th) {
  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
  const R = Math.hypot(W, H) * 0.55;
  const pts = [[0.18, 0.16, th.b1], [0.86, 0.78, th.b2], [0.2, 0.92, th.b3]];
  for (let k = 0; k < 3; k++) {
    const p = pts[k], ph = seed * 1.3 + k * 2.1;
    const x = W * (p[0] + 0.14 * Math.sin(t * 0.21 + ph)), y = H * (p[1] + 0.1 * Math.cos(t * 0.17 + ph * 1.7));
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, rgba(p[2], 0.9)); g.addColorStop(1, rgba(p[2], 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (!th.light) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
}
const FILTERS = [['none', 'None'], ['vivid', 'Vivid'], ['warm', 'Warm'], ['cool', 'Cool'], ['bw', 'B&W'], ['vintage', 'Vintage'], ['drama', 'Drama']];
// Colour looks made with blend modes, which every browser draws the same way
function applyFilter(ctx, W, H, f) {
  if (!f || f === 'none') return;
  ctx.save();
  const fill = (op, style, a) => { ctx.globalCompositeOperation = op; ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = style; ctx.fillRect(0, 0, W, H); };
  const self = (op, a) => { ctx.globalCompositeOperation = op; ctx.globalAlpha = a; try { ctx.drawImage(ctx.canvas, 0, 0, W, H); } catch (e) {} };
  if (f === 'vivid') { self('overlay', 0.4); fill('saturation', 'hsl(0,100%,50%)', 0.16); }
  else if (f === 'warm') fill('soft-light', 'rgb(255,145,40)', 0.55);
  else if (f === 'cool') fill('soft-light', 'rgb(40,140,255)', 0.55);
  else if (f === 'bw') { fill('saturation', '#808080'); self('overlay', 0.25); }
  else if (f === 'vintage') { fill('saturation', '#808080', 0.45); fill('lighten', 'rgb(46,36,28)'); fill('soft-light', 'rgb(255,200,120)', 0.45); }
  else if (f === 'drama') {
    self('overlay', 0.45); fill('saturation', '#808080', 0.3);
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    fill('source-over', g);
  }
  ctx.restore();
}
let BLUR = null;
// a soft, darkened copy behind a picture that is fitted rather than filled
function blurBack(ctx, W, H, src, sw, sh, rot) {
  const b = BLUR || (BLUR = document.createElement('canvas')), bw = 32, bh = Math.max(8, Math.round(32 * H / W));
  if (b.width !== bw || b.height !== bh) { b.width = bw; b.height = bh; }
  const c = b.getContext('2d'), side = rot % 180 !== 0, iw = side ? sh : sw, ih = side ? sw : sh, s = Math.max(bw / iw, bh / ih);
  c.save(); c.translate(bw / 2, bh / 2); if (rot) c.rotate(rot * Math.PI / 180);
  try { c.drawImage(src, -sw * s / 2, -sh * s / 2, sw * s, sh * s); } catch (e) {}
  c.restore();
  ctx.save(); ctx.imageSmoothingEnabled = true; try { ctx.imageSmoothingQuality = 'high'; } catch (e) {}
  ctx.drawImage(b, 0, 0, W, H); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// A photo or clip frame, placed the way its scene asks: fill or fit, zoom, nudge, rotation, then its filter
function drawMedia(ctx, W, H, m, src, sw, sh, kb) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (!src || !sw || !sh) return;
  const rot = (((m.rot || 0) % 360) + 360) % 360, side = rot % 180 !== 0, iw = side ? sh : sw, ih = side ? sw : sh, fit = m.fitMode === 'fit';
  if (fit) blurBack(ctx, W, H, src, sw, sh, rot);
  let s = (fit ? Math.min(W / iw, H / ih) : Math.max(W / iw, H / ih)) * (m.zoom || 1), cx = W / 2, cy = H / 2;
  if (kb) s *= 1.04 + 0.1 * kb.p;
  const dw = iw * s, dh = ih * s;
  if (kb) {
    const ax = [0.35, 0.65, 0.5, 0.5][kb.d], bx = [0.65, 0.35, 0.5, 0.5][kb.d], ay = [0.5, 0.5, 0.35, 0.65][kb.d], by = [0.5, 0.5, 0.65, 0.35][kb.d];
    if (dw > W) cx += (0.5 - (ax + (bx - ax) * kb.p)) * (dw - W);
    if (dh > H) cy += (0.5 - (ay + (by - ay) * kb.p)) * (dh - H);
  }
  cx += (m.px || 0) * Math.abs(dw - W) / 2; cy += (m.py || 0) * Math.abs(dh - H) / 2;
  cx = clamp(cx, Math.min(W - dw / 2, dw / 2), Math.max(W - dw / 2, dw / 2));
  cy = clamp(cy, Math.min(H - dh / 2, dh / 2), Math.max(H - dh / 2, dh / 2));
  ctx.save(); ctx.translate(cx, cy); if (rot) ctx.rotate(rot * Math.PI / 180);
  try { ctx.drawImage(src, -sw * s / 2, -sh * s / 2, sw * s, sh * s); } catch (e) {}
  ctx.restore();
  applyFilter(ctx, W, H, m.filter);
}
function scrim(ctx, W, H, th, dark, light) {
  if (S.look === 'subtitles') {
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g;
  } else ctx.fillStyle = th.light ? 'rgba(244,243,239,' + light + ')' : 'rgba(0,0,0,' + dark + ')';
  ctx.fillRect(0, 0, W, H);
}
// Where a clip is at a moment that is x seconds into its scene (or run of scenes)
function clipTime(m, x, hold) {
  const span = Math.max(0.05, m.out - m.in), s = x * (m.speed || 1);
  if (hold || m.endMode === 'hold') return m.in + Math.min(Math.max(0, s), Math.max(0, span - 0.05));
  return m.in + (((s % span) + span) % span);
}
// one scene's whole background: photo, clip or gradient, with its framing, filter and scrim
function sceneBg(ctx, W, H, sc, lt, t, th, mode) {
  const m = sc.media;
  if (!m) return gradientBg(ctx, W, H, t, sc.i, th);
  if (m.kind === 'video') {
    let src = null, sw = 0, sh = 0;
    if (mode === 'export' && m.exportFrame) { src = m.exportFrame; sw = src.width; sh = src.height; }
    else if (mode !== 'thumb' && m.el && m.el.readyState >= 2 && m.el.videoWidth) { src = m.el; sw = m.el.videoWidth; sh = m.el.videoHeight; }
    else if (m.poster) { src = m.poster; sw = src.width; sh = src.height; }
    drawMedia(ctx, W, H, m, src, sw, sh, null);
    scrim(ctx, W, H, th, 0.3, 0.6);
  } else {
    drawMedia(ctx, W, H, m, m.img, m.img.width, m.img.height, { p: clamp(lt / Math.max(sc.dur, 0.1), 0, 1), d: sc.i % 4 });
    scrim(ctx, W, H, th, 0.46, 0.74);
  }
}
const LAYERS = [];
function layer(k, W, H) {
  let L = LAYERS[k];
  if (!L) { const el = document.createElement('canvas'); L = LAYERS[k] = { el, c: el.getContext('2d', { alpha: false }) }; }
  if (L.el.width !== W || L.el.height !== H) { L.el.width = W; L.el.height = H; }
  L.c.setTransform(1, 0, 0, 1, 0, 0); L.c.globalAlpha = 1; L.c.globalCompositeOperation = 'source-over';
  return L;
}
// how one scene gives way to the next (e runs 0 → 1, eased)
function transition(ctx, W, H, tr, k, A, B) {
  const e = out3(k);
  if (tr === 'slide') { ctx.drawImage(A, -e * W, 0); ctx.drawImage(B, (1 - e) * W, 0); }
  else if (tr === 'zoom') { ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; const z = 1.2 - 0.2 * e; ctx.drawImage(B, (W - W * z) / 2, (H - H * z) / 2, W * z, H * z); ctx.globalAlpha = 1; }
  else if (tr === 'dip') { ctx.drawImage(k < 0.5 ? A : B, 0, 0); ctx.fillStyle = 'rgba(0,0,0,' + (k < 0.5 ? k * 2 : 2 - k * 2).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
  else if (tr === 'wipe') { ctx.drawImage(A, 0, 0); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, e * W, H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore(); }
  else { ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0); ctx.globalAlpha = 1; }
}
let GRAIN = null;
const grainPat = new WeakMap();
function grain(ctx, W, H, t, th) {
  if (!GRAIN) {
    GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 128;
    const g = GRAIN.getContext('2d'), d = g.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
  }
  let pat = grainPat.get(ctx);
  if (!pat) { pat = ctx.createPattern(GRAIN, 'repeat'); grainPat.set(ctx, pat); }
  ctx.save();
  ctx.globalAlpha = th.light ? 0.04 : 0.06; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function drawTitle(ctx, W, H, U, sc, lt, A, th) {
  const f = FONTS[S.font], key = 'T|' + sc.i + '|' + W + '|' + H;
  let F = LC.get(key);
  if (!F) {
    const n = sc.words.length, ml = n <= 3 ? 2 : n <= 8 ? 3 : 4;
    F = fitBlock(ctx, f, sc.words.map((w, k) => ({ k, s: disp(w) })), W * 0.84, H * 0.44, (W < H ? 128 : 120) * U * f.k, 1.06, ml, true); LC.set(key, F);
  }
  const onPhoto = !!sc.img && (S.look === 'subtitles' || !th.light);
  if (sc.i === 0) lt += 0.8;
  const e = out3(clamp(lt / 0.6, 0, 1)), s = 1.08 - 0.08 * e;
  ctx.save();
  ctx.globalAlpha = A * e; ctx.translate(W / 2, H / 2); ctx.scale(s, s);
  ctx.font = font(f, F.fs); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  if (!onPhoto && !th.light) { ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = F.fs * 0.2; ctx.shadowOffsetY = F.fs * 0.04; }
  let y = -((F.lines.length - 1) * F.lh) / 2 - F.fs * 0.12;
  for (const line of F.lines) {
    let x = -line.w / 2;
    const base = y + F.cap / 2;
    for (const it of line.items) {
      if (onPhoto) { ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = F.fs * 0.12; ctx.strokeText(it.s, x, base); }
      ctx.fillStyle = onPhoto ? '#ffffff' : th.ink; ctx.fillText(it.s, x, base);
      x += it.w + F.sp;
    }
    y += F.lh;
  }
  ctx.shadowColor = 'rgba(0,0,0,0)';
  const bw = Math.min(F.widest * 0.42, 260 * U) * out3(clamp((lt - 0.2) / 0.6, 0, 1));
  if (bw > 1) { ctx.fillStyle = th.accent === '#111111' && onPhoto ? '#ffffff' : th.accent; rrect(ctx, -bw / 2, y - F.lh + F.cap / 2 + F.fs * 0.34, bw, 14 * U, 7 * U); ctx.fill(); }
  ctx.restore();
}
function drawCaptions(ctx, W, H, U, sc, lt, A, th) {
  const f = FONTS[S.font], fm = FORMATS[S.format];
  const ci = idxAt(sc.caps, lt), ch = sc.caps[ci], key = 'c|' + sc.i + '|' + ci + '|' + W + '|' + H;
  let F = LC.get(key);
  if (!F) {
    const list = [];
    for (let k = ch.a; k < ch.b; k++) list.push({ k, s: capWord(sc.words[k]) });
    F = fitBlock(ctx, f, list, W * 0.86, H * 0.4, fm.cap[2] * U * f.k, 1.12, 2, true); LC.set(key, F);
  }
  const since = sc.i === 0 && ci === 0 ? 1 : lt - ch.t0, pop = 0.84 + 0.16 * outBack(clamp(since / 0.18, 0, 1));
  const active = S.hl === 'off' ? -1 : lastSpoken(sc, lt, ch);
  const stroke = !!sc.img && !th.light, hl = stroke ? '#ffd60a' : th.hl;
  ctx.save();
  ctx.globalAlpha = A * clamp(since / 0.05 + 0.25, 0, 1);
  const cy = S.capY != null ? H * S.capY : S.pos === 'lower' ? H * fm.lowerY : H * 0.5;
  if (HITREC) { const bw = Math.max(...F.lines.map(l => l.w)) / 2 + F.fs * 0.4, bh = F.lines.length * F.lh / 2 + F.fs * 0.4; HITREC.push({ kind: 'cap', x0: W / 2 - bw, x1: W / 2 + bw, y0: cy - bh, y1: cy + bh }); }
  ctx.translate(W / 2, cy); ctx.scale(pop, pop);
  ctx.font = font(f, F.fs); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  let y = -((F.lines.length - 1) * F.lh) / 2;
  for (const line of F.lines) {
    let x = -line.w / 2;
    const base = y + F.cap / 2;
    for (const it of line.items) {
      const on = it.k === active;
      if (on && S.hl === 'box') {
        const px = F.fs * 0.16, py = F.fs * 0.2;
        ctx.fillStyle = th.accent; rrect(ctx, x - px, y - F.cap / 2 - py, it.w + px * 2, F.cap + py * 2 + (S.upper ? 0 : F.fs * 0.1), F.fs * 0.16); ctx.fill();
        ctx.fillStyle = th.accentInk; ctx.fillText(it.s, x, base);
      } else {
        if (stroke) { ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = F.fs * 0.15; ctx.strokeText(it.s, x, base); }
        else if (!th.light) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = F.fs * 0.18; ctx.shadowOffsetY = F.fs * 0.05; }
        ctx.fillStyle = on && S.hl === 'colour' ? hl : th.ink; ctx.fillText(it.s, x, base);
        ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      }
      x += it.w + F.sp;
    }
    y += F.lh;
  }
  ctx.restore();
}
function drawStory(ctx, W, H, U, sc, lt, A, th) {
  const f = FONTS[S.font], key = 's|' + sc.i + '|' + W + '|' + H;
  let F = LC.get(key);
  if (!F) { F = fitBlock(ctx, f, sc.words.map((w, k) => ({ k, s: disp(w) })), W * 0.84, H * (W < H ? 0.56 : 0.66), (W < H ? 96 : 84) * U * f.k, 1.22); LC.set(key, F); }
  const e = sc.i === 0 ? 1 : out3(clamp(lt / 0.5, 0, 1)), dark = !!sc.img && !th.light, hl = dark ? '#ffd60a' : th.hl;
  ctx.save();
  ctx.translate(0, (1 - e) * 30 * U);
  ctx.font = font(f, F.fs); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (dark) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = F.fs * 0.25; }
  const x0 = (W - F.widest) / 2;
  let y = H / 2 - ((F.lines.length - 1) * F.lh) / 2;
  for (const line of F.lines) {
    let x = x0;
    const base = y + F.cap / 2;
    for (const it of line.items) {
      const w = sc.wt[it.k], st = lt >= w.t1 ? 2 : lt >= w.t0 ? 1 : 0;
      ctx.globalAlpha = A * e * (st === 0 ? 0.28 : 1);
      if (st === 1 && S.hl === 'box') {
        const px = F.fs * 0.12, py = F.fs * 0.16;
        ctx.fillStyle = th.accent; rrect(ctx, x - px, y - F.cap / 2 - py, it.w + px * 2, F.cap + py * 2 + F.fs * 0.1, F.fs * 0.14); ctx.fill();
        ctx.fillStyle = th.accentInk;
      } else ctx.fillStyle = st === 1 && S.hl === 'colour' ? hl : th.ink;
      ctx.fillText(it.s, x, base);
      x += it.w + F.sp;
    }
    y += F.lh;
  }
  ctx.restore();
}
function drawSubs(ctx, W, H, U, sc, lt, A, th) {
  const f = FONTS[S.font], fm = FORMATS[S.format];
  const ci = idxAt(sc.subs, lt), ch = sc.subs[ci], key = 'u|' + sc.i + '|' + ci + '|' + W + '|' + H;
  let F = LC.get(key);
  if (!F) {
    const list = [];
    for (let k = ch.a; k < ch.b; k++) list.push({ k, s: disp(sc.words[k]) });
    F = fitBlock(ctx, f, list, W * 0.84, H * 0.3, fm.sub[1] * U * f.k, 1.34, 3, true); LC.set(key, F);
  }
  const since = lt - ch.t0, active = S.hl === 'off' ? -1 : speaking(sc, lt);
  ctx.save();
  ctx.globalAlpha = A * clamp(since / 0.12 + 0.2, 0, 1);
  ctx.font = font(f, F.fs); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  let y = H * fm.sub[2] - (F.lines.length - 1) * F.lh;
  for (const line of F.lines) {
    const px = F.fs * 0.42, py = F.fs * 0.3;
    ctx.fillStyle = 'rgba(0,0,0,0.66)';
    rrect(ctx, W / 2 - line.w / 2 - px, y - F.cap / 2 - py, line.w + px * 2, F.cap + py * 2 + (S.upper ? 0 : F.fs * 0.12), F.fs * 0.2); ctx.fill();
    let x = W / 2 - line.w / 2;
    const base = y + F.cap / 2;
    for (const it of line.items) { ctx.fillStyle = it.k === active ? '#ffd60a' : '#ffffff'; ctx.fillText(it.s, x, base); x += it.w + F.sp; }
    y += F.lh;
  }
  ctx.restore();
}
function drawType(ctx, W, H, U, sc, lt, A, th) {
  const f = FONTS[S.font], key = 't|' + sc.i + '|' + W + '|' + H;
  let F = LC.get(key);
  if (!F) { F = fitBlock(ctx, f, sc.words.map((w, k) => ({ k, s: disp(w) })), W * 0.84, H * (W < H ? 0.56 : 0.64), (W < H ? 86 : 76) * U * f.k, 1.3); LC.set(key, F); }
  const dark = !!sc.img && !th.light;
  ctx.save();
  ctx.globalAlpha = A; ctx.font = font(f, F.fs); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (dark) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = F.fs * 0.25; }
  const x0 = (W - F.widest) / 2;
  let y = H / 2 - ((F.lines.length - 1) * F.lh) / 2, cx = x0, cb = y + F.cap / 2, typing = false, stop = false;
  for (const line of F.lines) {
    let x = x0;
    const base = y + F.cap / 2;
    for (const it of line.items) {
      const w = sc.wt[it.k], end = w.t0 + (w.t1 - w.t0) * 0.8;
      const n = Math.round(it.c.length * clamp((lt - w.t0) / Math.max(0.05, end - w.t0), 0, 1));
      if (n <= 0) { stop = true; break; }
      const part = n >= it.c.length ? it.s : it.c.slice(0, n).join('');
      ctx.fillStyle = th.ink; ctx.fillText(part, x, base);
      cx = x + (n >= it.c.length ? it.w : ctx.measureText(part).width); cb = base; typing = n < it.c.length;
      x += it.w + F.sp;
      if (typing) { stop = true; break; }
    }
    if (stop) break;
    y += F.lh;
  }
  ctx.shadowColor = 'rgba(0,0,0,0)';
  if (typing || Math.floor(lt * 2.2) % 2 === 0) { ctx.fillStyle = dark ? '#ffd60a' : th.hl; ctx.fillRect(cx + F.fs * 0.06, cb - F.cap * 1.08, Math.max(2, F.fs * 0.09), F.cap * 1.28); }
  ctx.restore();
}
function drawText(ctx, W, H, U, sc, lt, A, th) {
  if (!sc.words.length) return;
  if (sc.kind === 'title') return drawTitle(ctx, W, H, U, sc, lt, A, th);
  if (S.look === 'story') return drawStory(ctx, W, H, U, sc, lt, A, th);
  if (S.look === 'subtitles') return drawSubs(ctx, W, H, U, sc, lt, A, th);
  if (S.look === 'typewriter') return drawType(ctx, W, H, U, sc, lt, A, th);
  return drawCaptions(ctx, W, H, U, sc, lt, A, th);
}
function overlays(ctx, W, H, U, t, th) {
  if (S.progress && TL.total > 0) {
    const h = Math.max(2, Math.round(10 * U));
    ctx.fillStyle = th.light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)'; ctx.fillRect(0, 0, W, h);
    ctx.fillStyle = th.bar; ctx.fillRect(0, 0, W * clamp(t / TL.total, 0, 1), h);
  }
  const hd = S.handle.trim();
  if (hd) {
    ctx.font = '600 ' + Math.max(1, Math.round(34 * U)) + 'px Archivo, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = th.light ? 'rgba(0,0,0,0.62)' : 'rgba(255,255,255,0.8)';
    ctx.fillText(hd, W / 2, (W < H ? 118 : 78) * U);
    ctx.textAlign = 'left';
  }
  grain(ctx, W, H, t, th);
}
/* ---------- text items on the video ---------- */
let HITREC = null, HITS = [], selCap = false;
const TCOLORS = ['#ffffff', '#ffd400', '#ff3b30', '#34c759', '#0a84ff', '#ff6bd6', '#111111'];
const isDarkCol = c => { const n = parseInt(String(c).slice(1), 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) < 110; };
function textLines(ctx, text, maxW) {
  const out = [];
  for (const para of String(text || '').split('\n')) {
    const ws = para.split(/\s+/).filter(Boolean);
    if (!ws.length) { out.push({ s: '', w: 0 }); continue; }
    let cur = '';
    for (const w of ws) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && ctx.measureText(t).width > maxW) { out.push({ s: cur, w: ctx.measureText(cur).width }); cur = w; } else cur = t;
    }
    out.push({ s: cur, w: ctx.measureText(cur).width });
  }
  return out.length ? out : [{ s: '', w: 0 }];
}
const itemEnd = (sc, it) => it.dur == null ? sc.dur : Math.min(sc.dur, it.at + it.dur);
function drawItem(ctx, W, H, it, p, q, hit) {
  let a = 1, s = 1, dy = 0;
  if (it.anim === 'pop') { a = clamp(p / 0.12, 0, 1) * clamp(q / 0.2, 0, 1); s = 0.72 + 0.28 * outBack(clamp(p / 0.32, 0, 1)); }
  else if (it.anim === 'fade') a = clamp(p / 0.35, 0, 1) * clamp(q / 0.35, 0, 1);
  else if (it.anim === 'rise') { a = clamp(p / 0.3, 0, 1) * clamp(q / 0.25, 0, 1); dy = (1 - out3(clamp(p / 0.45, 0, 1))) * H * 0.035; }
  const f = FONTS[it.font] || FONTS[S.font], fs = Math.max(8, it.size * H * (f.k || 1)), lh = fs * 1.2;
  ctx.save();
  ctx.font = font(f, fs);
  const lines = textLines(ctx, it.text || ' ', W * 0.88), bw = Math.max(1, ...lines.map(l => l.w)), bh = lines.length * lh;
  // keep the whole block on screen, however far it was dragged
  const mx = W * 0.03, my = H * 0.02, pad = fs * 0.35;
  const cx = bw + 2 * pad < W - 2 * mx ? clamp(it.x * W, mx + bw / 2 + pad, W - mx - bw / 2 - pad) : W / 2;
  const cy = (bh + 2 * pad < H - 2 * my ? clamp(it.y * H, my + bh / 2 + pad, H - my - bh / 2 - pad) : H / 2) + dy;
  if (hit) hit.push(Object.assign({ x0: cx - bw / 2 - pad, x1: cx + bw / 2 + pad, y0: cy - bh / 2 - pad, y1: cy + bh / 2 + pad }, hit.ref));
  if (a > 0.001) {
    ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const dark = isDarkCol(it.color);
    lines.forEach((l, k) => {
      const y = -bh / 2 + lh * (k + 0.5);
      if (!l.s) return;
      if (it.bg === 'box') { const px = fs * 0.3, py = fs * 0.12; ctx.fillStyle = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.62)'; rrect(ctx, -l.w / 2 - px, y - lh / 2 - py / 2, l.w + px * 2, lh + py, fs * 0.22); ctx.fill(); }
      if (it.bg === 'outline') { ctx.strokeStyle = dark ? '#ffffff' : '#000000'; ctx.lineWidth = fs * 0.16; ctx.strokeText(l.s, 0, y + fs * 0.04); }
      if (it.bg === 'shadow') { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = fs * 0.28; ctx.shadowOffsetY = fs * 0.06; }
      ctx.fillStyle = it.color || '#ffffff'; ctx.fillText(l.s, 0, y + fs * 0.04);
      ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    });
  }
  ctx.restore();
}
function drawItems(ctx, W, H, sc, lt, mode) {
  const list = sc.ovl;
  if (!list || !list.length) return;
  list.forEach((it, k) => {
    const end = itemEnd(sc, it);
    if (lt < it.at || lt >= end) return;
    const hit = HITREC ? Object.assign(HITREC, { ref: { kind: 'text', i: sc.i, k } }) : null;
    drawItem(ctx, W, H, it, lt - it.at, end - lt, hit);
    if (mode === 'preview' && selText && selText.i === sc.i && selText.k === k && HITREC && HITREC.length) {
      const b = HITREC[HITREC.length - 1];
      ctx.save(); ctx.strokeStyle = '#ff5446'; ctx.lineWidth = Math.max(2, W / 360); ctx.setLineDash([W / 60, W / 90]);
      ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.restore();
    }
  });
}

// When a whole clip makes a scene outlast its words, the words fade away and the clip plays on
const textFade = (sc, lt) => sc.talk < sc.dur - 0.05 ? 1 - clamp((lt - sc.talk - 0.8) / 0.5, 0, 1) : 1;
function drawFrame(ctx, W, H, t, o) {
  o = o || {};
  const U = Math.min(W, H) / 1080, th = THEMES[S.theme], scs = TL.scenes;
  ctx.save();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (!scs.length) {
    gradientBg(ctx, W, H, t, 0, th);
    ctx.fillStyle = th.ink; ctx.globalAlpha = 0.75; ctx.textAlign = 'center';
    ctx.font = '700 ' + Math.max(1, Math.round(54 * U)) + 'px Archivo, system-ui, sans-serif';
    ctx.fillText('Your script appears here', W / 2, H / 2);
    ctx.restore(); return;
  }
  t = clamp(t, 0, Math.max(0, TL.total - 1e-4));
  const i = sceneAt(t), sc = scs[i], lt = t - sc.start;
  const mode = o.mode || (o.thumb ? 'thumb' : 'preview');
  const tr = transOf(i), TD = transDur(tr);
  const prev = i > 0 && lt < TD ? scs[i - 1] : null;
  const sameClip = prev && sc.media && sc.media.kind === 'video' && prev.media === sc.media;
  if (prev && !sameClip) {
    const A = layer(0, W, H), B = layer(1, W, H);
    sceneBg(A.c, W, H, prev, prev.dur + lt, t, th, mode); sceneBg(B.c, W, H, sc, lt, t, th, mode);
    transition(ctx, W, H, tr, clamp(lt / TD, 0, 1), A.el, B.el);
  } else sceneBg(ctx, W, H, sc, lt, t, th, mode);
  if (prev) {
    const fade = prev.kind === 'title' || sc.kind === 'title' || S.look === 'story' || S.look === 'typewriter';
    const a = (1 - clamp(lt / 0.2, 0, 1)) * textFade(prev, prev.dur);
    if (fade && a > 0) drawText(ctx, W, H, U, prev, prev.dur - 1e-3, a, th);
  }
  HITREC = mode === 'preview' ? [] : null;
  const ta = textFade(sc, lt);
  if (ta > 0) drawText(ctx, W, H, U, sc, lt, ta, th);
  drawItems(ctx, W, H, sc, lt, mode);
  if (mode === 'preview' && selCap) {
    const b = HITREC.find(h => h.kind === 'cap');
    if (b) { ctx.save(); ctx.strokeStyle = '#ff5446'; ctx.lineWidth = Math.max(2, W / 360); ctx.setLineDash([W / 60, W / 90]); ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.restore(); }
  }
  if (mode === 'preview') HITS = HITREC;
  HITREC = null;
  if (!o.thumb) overlays(ctx, W, H, U, t, th);
  ctx.restore();
}

/* ---------- preview ---------- */
const cv = $('#cv'), pctx = cv.getContext('2d');
function dims(q) { const f = FORMATS[S.format], k = q === 720 ? 2 / 3 : 1; return { w: even(f.w * k), h: even(f.h * k) }; }
function sizePreview() {
  const fm = FORMATS[S.format], scr = $('#screen');
  scr.style.setProperty('--ar', String(fm.w / fm.h)); scr.style.setProperty('--arc', fm.w + ' / ' + fm.h);
  const cssW = scr.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 3);
  const k = Math.min(0.6, Math.max(0.25, cssW * dpr / fm.w));
  const w = even(fm.w * k), h = even(fm.h * k);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; LC.clear(); }
}
/* clips: one hidden, muted <video> per clip plays in step with the preview */
const clipHost = document.createElement('div');
clipHost.setAttribute('aria-hidden', 'true');
clipHost.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;overflow:hidden;z-index:-1';
document.body.appendChild(clipHost);
const allClips = () => Array.from(new Set(media.filter(m => m && m.kind === 'video')));
function visibleClips(t) {
  const scs = TL.scenes, out = [];
  if (!scs.length) return out;
  t = clamp(t, 0, Math.max(0, TL.total - 1e-4));
  const i = sceneAt(t), sc = scs[i], lt = t - sc.start, p = i > 0 && lt < transDur(transOf(i)) ? scs[i - 1] : null;
  // a clip that played right to its end holds its last frame through the crossfade instead of starting over
  if (p && p.media && p.media.kind === 'video' && p.media !== sc.media) out.push({ m: p.media, x: p.dur + lt + p.clipOffset, hold: Math.abs(p.clipOffset + p.dur - clipLen(p.media)) < 0.05 });
  if (sc.media && sc.media.kind === 'video') out.push({ m: sc.media, x: lt + sc.clipOffset });
  out.forEach(v => {
    const hold = v.hold || v.m.endMode === 'hold';
    v.ct = clipTime(v.m, v.x, hold);
    v.ended = hold && v.x * (v.m.speed || 1) >= v.m.out - v.m.in - 0.05;
  });
  return out;
}
function syncClips(t, run) {
  const want = new Map(visibleClips(t).map(v => [v.m, v]));
  for (const m of allClips()) {
    const el = m.el, w = want.get(m);
    if (!w) { if (!el.paused) el.pause(); continue; }
    if (run && !w.ended) {
      // small drift: nudge the speed so the clip catches up smoothly; big drift: jump
      let d = w.ct - el.currentTime;
      if (el.loop && m.dur > 0) d = ((d % m.dur) + 1.5 * m.dur) % m.dur - m.dur / 2;
      if (Math.abs(d) > 0.3 || el.currentTime > m.out + 0.05) { try { el.currentTime = w.ct; } catch (e) {} d = 0; }
      if (Math.abs(d) > 0.08) m.rate = d > 0 ? 1.12 : 0.9; else if (Math.abs(d) < 0.02) m.rate = 1;
      const r = (m.rate || 1) * (m.speed || 1); if (Math.abs(el.playbackRate - r) > 1e-3) el.playbackRate = r;
      if (el.paused) el.play().catch(() => {});
    } else {
      if (!el.paused) el.pause();
      if (m.rate && m.rate !== 1) { m.rate = 1; el.playbackRate = m.speed || 1; }
      if (Math.abs(el.currentTime - w.ct) > 0.05) { try { el.currentTime = w.ct; } catch (e) {} }
    }
  }
}
function pauseClips() { for (const m of allClips()) if (!m.el.paused) m.el.pause(); }
// iPhones (and Low Power Mode) only let a clip start on its own once it has played after a tap
function unlockClips() {
  for (const m of allClips()) {
    if (m.unlocked) continue;
    let p; try { p = m.el.play(); } catch (e) { continue; }
    if (p && p.then) p.then(() => { m.unlocked = true; if (!playing) m.el.pause(); if (!playing && !busy) syncClips(playT, false); }, () => {});
  }
}
document.addEventListener('click', unlockClips, true);
function show(t) {
  playT = clamp(t, 0, TL.total);
  if (!playing && !busy) syncClips(playT, false);
  drawFrame(pctx, cv.width, cv.height, playT);
  $('#clock').textContent = fmtT(playT) + ' / ' + fmtT(TL.total);
  $('#seek').value = TL.total ? Math.round(playT / TL.total * 1000) : 0;
  const i = TL.scenes.length ? sceneAt(playT) : -1;
  tlFollow(playT);
  if (!playing) opsState();
  if (i !== curScene) {
    $$('#scenes .scene.on').forEach(el => el.classList.remove('on'));
    const li = $('#scenes [data-i="' + i + '"]');
    if (li) li.classList.add('on');
    curScene = i;
  }
}
function getCtx() {
  try {
    if (!actx || actx.state === 'closed') {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    }
    // iPhones use "interrupted" as well as "suspended" for stopped audio
    if (actx.state !== 'running') { const p = actx.resume(); if (p && p.catch) p.catch(() => {}); }
    return actx;
  } catch (e) { return null; }
}
// After the phone locks, you switch apps, or a call or another app takes the sound, an iPhone can leave
// the page's audio stopped for good. From a tap, a stopped one is replaced with a fresh one that plays.
// Sound already made (voice, music, clip sound) is kept: it works with the new one as it is.
let ctxHidden = false, ctxStuck = false;
function liveCtx() {
  let ctx = getCtx();
  const tap = !navigator.userActivation || navigator.userActivation.isActive;
  if (ctx && tap && (ctxHidden || ctxStuck || ctx.state !== 'running')) {
    try { const p = ctx.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    actx = null; ctx = getCtx();
  }
  if (tap) { ctxHidden = false; ctxStuck = false; }
  return ctx;
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  ctxHidden = true;
  if (playing) stopPlay();
  if (typeof stopSample === 'function') stopSample();
});
window.addEventListener('pagehide', () => { ctxHidden = true; });
function scheduleAudio(ctx, out, offset, total, when) {
  when = when == null ? ctx.currentTime + 0.06 : when;
  const list = [], end = total - offset;
  if (end <= 0) return { nodes: list, when };
  if (voice) {
    const plan = TL.vo || [{ at: 0, from: 0, len: voice.dur }], cut = plan.length > 1;
    for (const q of plan) {
      const skip = Math.max(0, offset - q.at), from = q.from + skip, len = Math.min(q.len - skip, voice.dur - from);
      if (len <= 0.005) continue;
      const at = when + Math.max(0, q.at - offset), s = ctx.createBufferSource(); s.buffer = voice.buffer;
      const g = ctx.createGain(), vv = S.voiceVol;
      if (cut) { // tiny fades so the joins never click
        const f = Math.min(0.006, len / 3);
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vv, at + f);
        g.gain.setValueAtTime(vv, at + len - f); g.gain.linearRampToValueAtTime(0, at + len);
      } else g.gain.value = vv;
      s.connect(g); g.connect(out);
      s.start(at, from, len); list.push(s);
    }
  }
  if (music) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), v = Math.max(0.0001, S.musicVol), fl = Math.min(1.5, total * 0.2);
    s.buffer = music.buffer; s.loop = true;
    for (const [t, val, ramp] of musicLevels(offset, end, v, fl)) {
      if (ramp) g.gain.linearRampToValueAtTime(val, when + t); else g.gain.setValueAtTime(val, when + t);
    }
    s.connect(g); g.connect(out);
    s.start(when, offset % music.buffer.duration); s.stop(when + end + 0.05); list.push(s);
  }
  scheduleClipSound(ctx, out, offset, when, list);
  return { nodes: list, when };
}
// When the voice speaks (timeline seconds), found from the sound itself
function speechTimes() {
  if (!voice || !S.duck) return [];
  if (!voice.act) {
    const d = voice.buffer.getChannelData(0), sr = voice.buffer.sampleRate, win = Math.round(sr * 0.02), rms = [];
    let peak = 0;
    for (let a = 0; a < d.length; a += win) { let e = 0; const b = Math.min(d.length, a + win); for (let k = a; k < b; k++) e += d[k] * d[k]; const r = Math.sqrt(e / Math.max(1, b - a)); rms.push(r); if (r > peak) peak = r; }
    const th = Math.max(0.006, peak * 0.1), act = [];
    rms.forEach((r, k) => {
      if (r < th) return;
      const t = k * 0.02, l = act[act.length - 1];
      if (l && t - l[1] < 0.35) l[1] = t + 0.02; else act.push([t, t + 0.02]);
    });
    voice.act = act.filter(x => x[1] - x[0] >= 0.1);
  }
  const plan = TL.vo || [{ at: 0, from: 0, len: voice.dur }], out = [];
  for (const q of plan) for (const [a, b] of voice.act) {
    const x = Math.max(a, q.from), y = Math.min(b, q.from + q.len);
    if (y > x) out.push([q.at + x - q.from, q.at + y - q.from]);
  }
  out.sort((p, q) => p[0] - q[0]);
  const merged = [];
  for (const r of out) { const l = merged[merged.length - 1]; if (l && r[0] - l[1] < 0.85) l[1] = Math.max(l[1], r[1]); else merged.push(r.slice()); }
  return merged;
}
// music volume over time, relative to `offset`: fade in, dip under the voice, fade out at the end
function musicLevels(offset, end, v, fl) {
  const total = offset + end, sp = speechTimes();
  const duck = t => {
    let g = 1;
    for (const [a, b] of sp) {
      if (t < a - 0.25 || t > b + 0.6) continue;
      const k = t < a ? (a - t) / 0.25 : t > b ? (t - b) / 0.6 : 0;
      g = Math.min(g, 0.28 + 0.72 * clamp(k, 0, 1));
    }
    return g;
  };
  const L = t => Math.max(0.0001, v * duck(t) * Math.min(1, t / 0.3) * clamp((total - t) / fl, 0, 1));
  const pts = new Set([offset, Math.max(offset, total - fl), total]);
  if (offset < 0.3) pts.add(0.3);
  for (const [a, b] of sp) [a - 0.25, a, b, b + 0.6].forEach(x => { if (x > offset && x < total) pts.add(x); });
  return [...pts].filter(x => x >= offset && x <= total).sort((p, q) => p - q).map((t, k) => [t - offset, L(t), k > 0]);
}
function clipRuns() {
  const runs = [], scs = TL.scenes;
  scs.forEach((sc, i) => {
    const m = sc.media;
    if (!m || m.kind !== 'video') return;
    const last = runs[runs.length - 1];
    if (last && last.m === m && last.end === i - 1) { last.end = i; last.t1 = sc.start + sc.dur; }
    else runs.push({ m, end: i, t0: sc.start, t1: sc.start + sc.dur });
  });
  return runs;
}
const hasClipSound = () => clipRuns().some(r => r.m.useSound && r.m.audio);
function scheduleClipSound(ctx, out, offset, when, list) {
  for (const r of clipRuns()) {
    const m = r.m, a = m.audio;
    if (!m.useSound || !a || r.t1 <= offset) continue;
    const from = Math.max(r.t0, offset), x = from - r.t0, sp = m.speed || 1;
    const lo = Math.min(m.in, a.duration), hi = Math.min(m.out, a.duration);
    if (hi - lo < 0.05) continue;
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = a; s.playbackRate.value = sp; g.gain.value = m.vol == null ? 1 : m.vol;
    let at, end = when + (r.t1 - offset);
    if (m.endMode !== 'hold') { s.loop = true; s.loopStart = lo; s.loopEnd = hi; at = lo + ((x * sp) % (hi - lo)); }
    else { at = lo + x * sp; if (at >= hi - 0.01) continue; end = Math.min(end, when + (from - offset) + (hi - at) / sp); }
    s.connect(g); g.connect(out); s.start(when + (from - offset), at); s.stop(end); list.push(s);
  }
}
function stopAudio() { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = []; }
function nowT() {
  if (!clock) return playT;
  if (clock.a) {
    if (clock.a.state !== 'running') {
      // the phone is holding the sound back: keep the picture going, drop sound that would now come late,
      // and get a fresh start on the next tap
      if (performance.now() - clock.p0 > 1200) { clock = { t0: performance.now(), off: clock.off }; ctxStuck = true; stopAudio(); soundHint(true); }
      return clock.off;
    }
    return clock.off + Math.max(0, clock.a.currentTime - clock.t0);
  }
  return clock.off + (performance.now() - clock.t0) / 1000;
}
function setIcon() {
  $('#playIco').setAttribute('d', playing ? 'M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z' : 'M7 4.5v15l12.5-7.5z');
  $('#play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
}
function soundHint(on) {
  const l = $('#mlabel');
  if (l) l.textContent = on ? 'No sound? Tap pause, then play' : 'Preview';
}
function play() {
  if (busy || !TL.total) return;
  if (playT >= TL.total - 0.05) playT = 0;
  soundHint(false);
  const ctx = voice || music || hasClipSound() ? liveCtx() : null;
  stopAudio();
  syncClips(playT, true);
  if (ctx) { const g = scheduleAudio(ctx, ctx.destination, playT, TL.total); nodes = g.nodes; clock = { a: ctx, t0: g.when, off: playT, p0: performance.now() }; }
  else clock = { t0: performance.now(), off: playT };
  playing = true; setIcon(); requestAnimationFrame(loop);
}
function loop() {
  if (!playing) return;
  const t = nowT();
  if (t >= TL.total) { stopPlay(); show(TL.total); return; }
  syncClips(t, true); show(t); requestAnimationFrame(loop);
}
function stopPlay() { if (playing) playT = nowT(); playing = false; clock = null; stopAudio(); pauseClips(); setIcon(); }

/* ---------- panels ---------- */
function renderChips() {
  $$('[data-key]').forEach(g => {
    const key = g.dataset.key;
    if (key === 'theme') {
      g.innerHTML = Object.keys(THEMES).map(v => { const t = THEMES[v]; return '<button type="button" class="sw" role="radio" aria-checked="' + (S.theme === v) + '" aria-label="' + t.name + '" title="' + t.name + '" data-v="' + v + '" style="--g:linear-gradient(135deg,' + t.b1 + ',' + t.bg + ' 55%,' + t.b2 + ');--a:' + t.accent + '"><i></i></button>'; }).join('');
      return;
    }
    g.innerHTML = OPTS[key].map(o => '<button type="button" role="radio" aria-checked="' + (String(S[key]) === o[0] && !(key === 'pos' && S.capY != null)) + '" data-v="' + o[0] + '"' + (key === 'font' ? ' style="font-family:' + FONTS[o[0]].fam + '"' : '') + '>' + o[1] + '</button>').join('');
  });
  $('#lookHint').textContent = LOOKS[S.look].hint;
  $('#fmtHint').textContent = FORMATS[S.format].hint;
  $('#posField').hidden = S.look !== 'captions';
  $('#hlField').hidden = S.look === 'typewriter';
  $('#tUpper').checked = S.upper; $('#tProg').checked = S.progress;
  if (busy) $$('.exportbar .seg button').forEach(b => { b.disabled = true; });
}
function renderScenes() {
  const ol = $('#scenes'), n = TL.scenes.length, th = FORMATS[S.format].thumb;
  $('#sceneMeta').textContent = n ? n + (n === 1 ? ' scene · ' : ' scenes · ') + fmtT(TL.total) : '';
  $('#bPhotosX').hidden = !media.some(Boolean);
  $('#bAuto').hidden = !durOv.some(v => v != null) && !sync;
  $('#play').disabled = busy || !n; $('#go').disabled = busy || aiBusy || !n;
  $('#sampleNote').hidden = S.script !== SAMPLE; $('#bSample').hidden = S.script === SAMPLE; $('#bClear').hidden = !S.script;
  $('#mfmt').textContent = S.format + ' · ' + fmtT(TL.total);
  curScene = -1;
  if (!ol) return;
  if (!n) { ol.innerHTML = '<li class="empty">No scenes yet. Type your script above and they appear here.</li>'; return; }
  ol.style.setProperty('--tw', th[0] + 'px'); ol.style.setProperty('--th', th[1] + 'px');
  ol.innerHTML = TL.scenes.map((s, i) => '<li class="scene" data-i="' + i + '">' +
    '<button type="button" class="thumb" data-act="seek" aria-label="Preview scene ' + (i + 1) + '"><canvas width="' + th[0] * 2 + '" height="' + th[1] * 2 + '"></canvas></button>' +
    '<div><p class="stext"><span class="kind">' + (s.kind === 'title' ? 'Title' : i + 1) + '</span>' + (s.kind === 'clip' ? '<em>No words, just the clip</em>' : esc(s.text)) + '</p><div class="smeta">' +
    '<span class="dur">' + s.dur.toFixed(1) + 's</span>' +
    (sync && s.kind !== 'clip' ? '<span class="tag">Synced to voice</span>' : '<button type="button" class="btn sq" data-act="minus" aria-label="Shorten scene ' + (i + 1) + '">−</button><button type="button" class="btn sq" data-act="plus" aria-label="Lengthen scene ' + (i + 1) + '">+</button>') +
    '<button type="button" class="btn" data-act="photo">' + (media[i] ? 'Change' : 'Photo or clip') + '</button>' +
    (media[i] ? '<button type="button" class="btn sq" data-act="unphoto" aria-label="Remove ' + (media[i].kind === 'video' ? 'clip' : 'photo') + ' from scene ' + (i + 1) + '">×</button>' : '') +
    '</div>' + clipRow(media[i]) + '</div></li>').join('');
  scheduleThumbs();
}
function clipRow(m) {
  if (!m || m.kind !== 'video') return '';
  const locked = !!voice && !sync, whole = m.fit !== 'cut' && !locked;
  return '<div class="smeta"><span class="tag">Clip ' + m.dur.toFixed(1) + 's</span>' +
    '<button type="button" class="btn" data-act="fit" aria-pressed="' + whole + '"' + (locked ? ' disabled title="Use Tap to sync on your voiceover so whole clips can play"' : ' title="Whole clip: the scene stretches so the clip is never cut. Cut to fit: the clip follows the scene length"') + '>' + (locked ? 'Cut to voiceover' : whole ? 'Whole clip' : 'Cut to fit') + '</button>' +
    '<button type="button" class="btn" data-act="endmode" title="What happens when the clip is shorter than the scene">' + (m.endMode === 'hold' ? 'Holds last frame' : 'Loops') + '</button>' +
    '<button type="button" class="btn" data-act="sound" aria-pressed="' + (!!m.useSound) + '"' + (m.noAudio ? ' disabled' : '') + '>' + (m.noAudio ? 'No clip sound' : m.useSound ? 'Clip sound: on' : 'Clip sound: off') + '</button></div>';
}
let thumbTimer = 0;
function scheduleThumbs() { clearTimeout(thumbTimer); thumbTimer = setTimeout(drawThumbs, 120); }
function drawThumbs() {
  $$('#scenes canvas').forEach(c => {
    const sc = TL.scenes[+c.closest('li').dataset.i];
    if (sc) drawFrame(c.getContext('2d'), c.width, c.height, sc.start + (sc.talk || sc.dur) * 0.72, { thumb: true });
  });
}
function renderAudio() {
  const v = !!voice;
  $('#voiceNote').innerHTML = v
    ? '<b>' + esc(voice.name) + '</b> · ' + fmtT(voice.dur) + '. ' + (voice.rec ? (voice.key !== scriptKey() ? 'You changed the script after recording. Record again from the scene you changed.' : 'Each scene starts where you tapped Next. To fix a scene, select it on the timeline and record again.') : voice.made ? 'Each scene starts exactly where its line begins.' : sync ? 'Scenes change where you tapped.' : 'Scenes stretch to fit it. For exact timing, tap to sync.')
    : lost.voice ? '<b>' + esc(lost.voice.name || 'Your voiceover') + '</b> is saved but couldn’t open just now. Close this page and open it again to bring it back. Making or adding a new voice replaces it.'
    : 'Record yourself reading the script, scene by scene, or add a recording you made (a voice memo works). A video file works too; its sound is used.';
  $('#bVoice').textContent = v ? 'Use a file' : 'Add a recording';
  $('#bRec').textContent = v && voice.rec ? 'Record again' : 'Record my voice';
  $('#vvRow').hidden = !v; $('#vvol').value = Math.round(S.voiceVol * 100); $('#vvVal').textContent = Math.round(S.voiceVol * 100) + '%';
  $('#duckRow').hidden = !(v && music); $('#tDuck').checked = S.duck;
  $('#bSync').hidden = !v || !!voice.made || !!voice.rec; $('#bSync').textContent = sync ? 'Sync again' : 'Tap to sync';
  $('#aiSpeed').value = S.aiSpeed; $('#aiSpeedVal').textContent = S.aiSpeed.toFixed(2).replace(/0$/, '') + '×';
  $('#bSaveVoice').hidden = !(v && voice.made && DL);
  $('#bPlayVoice').hidden = !(v && voice.made);
  if (!aiBusy) aiNoteSet(aiDefaultNote());
  $('#bVoiceX').hidden = !v;
  $('#musicNote').innerHTML = music ? '<b>' + esc(music.name) + '</b> · ' + fmtT(music.dur) + '. Loops if it is shorter than the video and fades out at the end.' : 'Optional background track. It loops and fades out at the end.';
  $('#bMusic').textContent = music ? 'Replace' : 'Add music';
  $('#bMusicX').hidden = !music; $('#volRow').hidden = !music; $('#vol').value = Math.round(S.musicVol * 100); $('#volVal').textContent = Math.round(S.musicVol * 100) + '%';
  $('#pace').disabled = v; $('#pace').value = S.wpm; $('#paceVal').textContent = S.wpm + ' words a minute';
  $('#paceNote').textContent = v ? 'Timing follows your voiceover.' : 'Used when there is no voiceover. Most people speak at 140 to 170.';
}
function refresh() {
  stopPlay(); LC.clear(); build(); gcMedia(); renderScenes(); renderAudio(); renderTimeline();
  show(Math.min(playT, TL.total)); save(); queueSave();
}
function changed() { renderChips(); sizePreview(); refresh(); }

/* ---------- media ---------- */
const PHOTO_NOTE = 'Photos and clips fill the scenes in order and repeat if you add fewer than the number of scenes. Clips play in full: the scene stretches to fit and the voiceover waits. To use just part of a clip, tap its scene on the timeline and choose Cut to fit.';
function renderPhotoNote() { $('#photoNote').textContent = PHOTO_NOTE; }
const isVideoFile = f => /^video\//.test(f.type) || /\.(mp4|m4v|mov|webm|mkv|3gp)$/i.test(f.name || '');
function waitEvent(el, ev, ms) {
  return new Promise((res, rej) => {
    const on = () => { clearTimeout(tm); el.removeEventListener(ev, on); res(); };
    const tm = setTimeout(() => { el.removeEventListener(ev, on); rej(new Error(ev + ' timeout')); }, ms);
    el.addEventListener(ev, on);
  });
}
function whenReady(el, ms) {
  if (el.readyState >= 2) return Promise.resolve();
  return new Promise(res => {
    const done = () => { clearTimeout(tm); el.removeEventListener('loadeddata', done); el.removeEventListener('canplay', done); res(); };
    const tm = setTimeout(done, ms);
    el.addEventListener('loadeddata', done); el.addEventListener('canplay', done);
  });
}
async function seekTo(el, t) {
  if (Math.abs(el.currentTime - t) < 0.01 && el.readyState >= 2) return;
  const p = waitEvent(el, 'seeked', 8000); el.currentTime = t; await p.catch(() => {});
}
async function loadClip(file) {
  const url = URL.createObjectURL(file), el = document.createElement('video');
  el.muted = true; el.defaultMuted = true; el.playsInline = true; el.preload = 'auto';
  el.setAttribute('muted', ''); el.setAttribute('playsinline', '');
  clipHost.appendChild(el);
  try {
    const meta = waitEvent(el, 'loadedmetadata', 20000);
    el.src = url;
    await meta;
    if (!(el.duration > 0) || !isFinite(el.duration)) throw new Error('This clip has no length');
    if (el.readyState < 2) { // iPhones only load a clip's pictures once it has started playing
      const ready = whenReady(el, 8000);
      try { await el.play(); el.pause(); } catch (e) {}
      await ready;
    }
    await seekTo(el, Math.min(0.6, el.duration / 2));
    const k = Math.min(1, 480 / Math.max(el.videoWidth || 1, el.videoHeight || 1)), poster = document.createElement('canvas');
    poster.width = Math.max(2, Math.round((el.videoWidth || 2) * k)); poster.height = Math.max(2, Math.round((el.videoHeight || 2) * k));
    try { poster.getContext('2d').drawImage(el, 0, 0, poster.width, poster.height); } catch (e) {}
    await seekTo(el, 0);
    el.loop = true;
    el.addEventListener('seeked', () => { if (!playing && !busy) drawFrame(pctx, cv.width, cv.height, playT); });
    return { kind: 'video', file, url, el, dur: el.duration, in: 0, out: el.duration, speed: 1, vol: 1, poster, useSound: false, endMode: 'loop', name: file.name || 'clip', audio: null, noAudio: false };
  } catch (e) { el.remove(); URL.revokeObjectURL(url); throw e; }
}
async function loadMedia(file) { return isVideoFile(file) ? loadClip(file) : { kind: 'image', img: await loadImage(file), name: file.name || 'photo', file }; }
// Clips stay alive while undo or redo could bring them back; clips only in history let go of
// their video decoder until they're needed again.
const LIVE = new Set();
function disposeMedia(m) {
  if (m.kind !== 'video') return;
  try { m.el.pause(); m.el.removeAttribute('src'); m.el.load(); } catch (e) {}
  m.el.remove(); URL.revokeObjectURL(m.url); m.audio = null;
}
function sleepMedia(m) {
  if (m.kind !== 'video' || m.asleep) return;
  try { m.el.pause(); m.el.removeAttribute('src'); m.el.load(); } catch (e) {}
  m.asleep = true;
}
function wakeMedia(m) {
  if (m.kind !== 'video' || !m.asleep) return;
  m.asleep = false; m.unlocked = false; m.el.src = m.url;
  try { m.el.load(); } catch (e) {}
  applyLoop(m);
}
function gcMedia() {
  const cur = new Set(media.filter(Boolean)), keep = new Set(cur);
  for (const st of UNDO.concat(REDO)) for (const m of st.media) if (m) keep.add(m);
  cur.forEach(m => LIVE.add(m));
  for (const m of Array.from(LIVE)) {
    if (cur.has(m)) wakeMedia(m);
    else if (keep.has(m)) sleepMedia(m);
    else { disposeMedia(m); LIVE.delete(m); }
  }
}
function dropUnused() { gcMedia(); }
async function ensureClipAudio(m) {
  if (m.audio || m.noAudio) return;
  try { m.audio = await decodeFile(m.file); } catch (e) { m.noAudio = true; }
}
async function loadImage(file) {
  let im;
  try { im = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (e) {
    im = await new Promise((res, rej) => { const u = URL.createObjectURL(file), el = new Image(); el.onload = () => res(el); el.onerror = () => rej(new Error('image')); el.src = u; });
  }
  const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, s = Math.min(1, 1600 / Math.max(w, h));
  if (s >= 1 && im.width) return im;
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  if (im.close) im.close();
  return c;
}
function newBuffer(ch, n, sr) {
  try { return new AudioBuffer({ numberOfChannels: ch, length: Math.max(1, n), sampleRate: sr }); } catch (e) {}
  const ctx = getCtx();
  if (!ctx) throw new Error('no audio support');
  return ctx.createBuffer(ch, Math.max(1, n), sr);
}
// 16-bit WAV, as this tool saves voiceovers: read directly
function wavBuffer(ab) {
  const v = new DataView(ab);
  if (v.byteLength < 44 || v.getUint32(0) !== 0x52494646 || v.getUint32(8) !== 0x57415645) return null;
  let o = 12, fmt = null, data = null;
  while (o + 8 <= v.byteLength) {
    const id = v.getUint32(o), len = v.getUint32(o + 4, true);
    if (id === 0x666d7420 && len >= 16) fmt = { pcm: v.getUint16(o + 8, true), ch: v.getUint16(o + 10, true), sr: v.getUint32(o + 12, true), bits: v.getUint16(o + 22, true) };
    else if (id === 0x64617461) { data = { at: o + 8, len: Math.min(len, v.byteLength - o - 8) }; break; }
    o += 8 + len + (len & 1);
  }
  if (!fmt || !data || fmt.pcm !== 1 || fmt.bits !== 16 || fmt.ch < 1 || fmt.ch > 2 || fmt.sr < 8000) return null;
  const ch = fmt.ch, n = Math.floor(data.len / (2 * ch)), buf = newBuffer(ch, n, fmt.sr);
  const pcm = data.at % 2 === 0 ? new Int16Array(ab, data.at, n * ch) : null;
  for (let c = 0; c < ch; c++) {
    const out = buf.getChannelData(c);
    if (pcm) for (let k = 0; k < n; k++) out[k] = pcm[k * ch + c] / 32768;
    else for (let k = 0; k < n; k++) out[k] = v.getInt16(data.at + (k * ch + c) * 2, true) / 32768;
  }
  return buf;
}
async function decodeFile(file) {
  const data = await file.arrayBuffer();
  try { const w = wavBuffer(data); if (w) return w; } catch (e) { /* not one of ours: let the browser read it */ }
  const ctx = getCtx();
  if (!ctx) throw new Error('no audio support');
  return await new Promise((res, rej) => {
    try { const p = ctx.decodeAudioData(data, res, rej); if (p && typeof p.then === 'function') p.then(res, rej); } catch (e) { rej(e); }
  });
}
async function mixAudio(total) {
  if (!voice && !music && !hasClipSound()) return null;
  const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!O) return null;
  const sr = 48000, oc = new O(2, Math.max(1, Math.ceil(total * sr)), sr);
  scheduleAudio(oc, oc.destination, 0, total, 0);
  return await oc.startRendering();
}

/* ---------- AI voiceover (Kokoro, runs on this device) ---------- */
const VOICE_NAMES = {};
OPTS.aiVoice.forEach(o => { VOICE_NAMES[o[0]] = o[1].split(' · ')[0]; });
const VSR = 24000;
let VW = null, vwReady = null, vwRes = null, vwRej = null, vwOnProgress = null, vwSeq = 0, aiBusy = false, aiStop = false, aiSample = null, vwThreads = 0, warmAsked = false;
const vwPending = new Map();
// If the engine can't start on several cores on this phone, it starts again on one.
let vwMax = 0, vwStart = null, vwTrying = 0;
function engineOneCore(why) {
  console.warn('[script-to-video] voice engine: several cores didn’t start (' + why + '), using one');
  vwMax = 1; vwTrying = 0;
  try { VW.terminate(); } catch (x) {}
  VW = null;
  voiceWorker().postMessage(Object.assign({}, vwStart, { maxThreads: 1 }));
}
function voiceWorker() {
  if (VW) return VW;
  // a module worker, so the engine can start helper threads on several processor cores
  VW = new Worker('lib/voice/worker.js?v=' + VERSION, { type: 'module' });
  VW.onmessage = e => {
    const m = e.data;
    if (m.type === 'progress') { if (vwOnProgress) vwOnProgress(m.loaded, m.total); }
    else if (m.type === 'status') { vwTrying = m.threads || 1; if (aiBusy) aiNoteSet('Starting the voice engine…'); if (vwRej) engineStarting(); }
    else if (m.type === 'ready') { vwThreads = m.threads || 1; if (vwRes) vwRes(); }
    else if (m.type === 'audio') { const p = vwPending.get(m.id); vwPending.delete(m.id); if (p) p.res(m.audio); }
    else if (m.type === 'error') {
      if (m.start && m.threads > 1 && !vwMax && vwStart) return engineOneCore(m.message);
      if (m.id != null && vwPending.has(m.id)) { const p = vwPending.get(m.id); vwPending.delete(m.id); p.rej(new Error(m.message)); }
      else if (vwRej) vwRej(new Error(m.message));
      else console.warn('[script-to-video] voice engine warm-up:', m.message);
    }
  };
  VW.onerror = e => {
    if (!vwThreads && !vwMax && vwStart && window.crossOriginIsolated) { if (e && e.preventDefault) e.preventDefault(); return engineOneCore((e && e.message) || 'stopped'); }
    const err = new Error((e && e.message) || 'The voice engine stopped.');
    if (vwRej) vwRej(err);
    vwPending.forEach(p => p.rej(err)); vwPending.clear();
    try { VW.terminate(); } catch (x) {}
    VW = null; vwReady = null;
  };
  return VW;
}
let vwTimer = 0;
function engineReady(onProgress) {
  vwOnProgress = onProgress;
  if (!vwReady) {
    vwReady = new Promise((res, rej) => {
      vwRes = () => { clearTimeout(vwTimer); res(); };
      vwRej = e => { clearTimeout(vwTimer); rej(e); };
      vwStart = { type: 'init', maxThreads: vwMax || undefined };
      voiceWorker().postMessage(vwStart);
    }).catch(e => { vwReady = null; if (VW) { try { VW.terminate(); } catch (x) {} VW = null; } throw e; });
  }
  return vwReady;
}
// Once the engine has been downloaded, start it in the background when the Sound tab opens,
// so Make voiceover can begin straight away. Nothing is downloaded here.
function engineWarm() {
  if (warmAsked || vwReady || aiBusy) return;
  if (navigator.deviceMemory && navigator.deviceMemory < 3) return; // low-memory phones start it only when asked
  warmAsked = true;
  vwStart = { type: 'warm', maxThreads: vwMax || undefined };
  try { voiceWorker().postMessage(vwStart); } catch (e) {}
}
function engineStarting() {
  clearTimeout(vwTimer);
  // a start on several cores that hangs gets one more try on one core
  const many = vwTrying > 1 && !vwMax;
  vwTimer = setTimeout(() => { if (!vwRej) return; if (many && vwStart) engineOneCore('took too long'); else vwRej(new Error('start timeout')); }, many ? 60000 : 120000);
}
function aiFail(e) {
  const m = String((e && e.message) || e || '');
  console.warn('[script-to-video] voice engine:', m);
  if (/Content Security Policy|unsafe-eval|wasm-unsafe-eval/i.test(m)) { serverNotice('the AI voice engine'); return 'This website’s security settings are blocking the voice engine. Restart the site (deploy Blog again in VPS Control Center), then try again.'; }
  if (/download|fetch|network|connection/i.test(m)) return 'The voice engine didn’t finish downloading. Check your connection and try again; the parts already downloaded are kept.';
  return 'The voice engine couldn’t run in this browser. Try Chrome or Safari, or add a recording of your own voice below.';
}
function speakAI(text, voiceId, speed) {
  return new Promise((res, rej) => {
    const id = ++vwSeq;
    const t = setTimeout(() => { if (vwPending.has(id)) { vwPending.delete(id); rej(new Error('voice timeout')); } }, 180000);
    vwPending.set(id, { res: a => { clearTimeout(t); res(a); }, rej: e => { clearTimeout(t); rej(e); } });
    voiceWorker().postMessage({ type: 'speak', id, text, voice: voiceId, speed });
  });
}
// Voice already made for a line this session: same words, voice and speed are reused, not made again.
const said = new Map(); let saidLen = 0;
const SAID_MAX = VSR * 300; // keep up to five minutes of made voice
function saidGet(k) { const a = said.get(k); if (a) { said.delete(k); said.set(k, a); } return a || null; }
function saidPut(k, a) {
  if (said.has(k)) return;
  said.set(k, a); saidLen += a.length;
  while (saidLen > SAID_MAX && said.size > 1) { const [k0, a0] = said.entries().next().value; said.delete(k0); saidLen -= a0.length; }
}
const saidKey = (text, v, sp) => v + '|' + sp + '|' + text;
async function speakLine(text, v, sp) {
  const k = saidKey(text, v, sp), hit = saidGet(k);
  if (hit) return hit;
  const a = await speakAI(text, v, sp);
  saidPut(k, a);
  return a;
}
const scriptKey = () => TL.scenes.map(s => s.text).join('\n');
let slowVoiceHint = false;
function aiNoteSet(t) { $('#aiNote').textContent = t; }
function aiBarSet(p) { $('#aiBar').hidden = p == null; if (p != null) $('#aiBarI').style.width = (clamp(p, 0, 1) * 100).toFixed(1) + '%'; }
function aiDefaultNote() {
  if (voice && voice.made && voice.key !== scriptKey()) return 'You changed the script after making this voice. Make the voiceover again so they match.';
  if (voice && voice.rec) return 'Using your own recorded voice. Make an AI voiceover to replace it.';
  if (voice && voice.made) return 'Voiceover ready in ' + voice.voiceName + '. Tap Play from start to hear the whole script with your video.';
  return 'Free voices made on this phone from your script. The first time, it downloads the voice engine (about 110 MB) once. After that it starts in seconds.' +
    (slowVoiceHint ? ' Voices are being made on one processor core. Restart the site (in VPS Control Center, deploy Blog again) to use several and make them faster.' : '');
}
function setAiBusy(b, label) {
  aiBusy = b;
  $('#bMake').textContent = b && label === 'make' ? 'Making voice…' : 'Make voiceover';
  $('#bMake').disabled = b;
  $('#bStop').hidden = !(b && label === 'make');
  $('#bHear').disabled = b; $('#script').readOnly = b || busy;
  $('#go').disabled = b || busy || !TL.total;
  if (!b) aiBarSet(null);
}
async function ensureEngine() {
  aiNoteSet('Getting the voice engine ready…'); aiBarSet(0);
  await engineReady((loaded, total) => {
    aiBarSet(loaded / total);
    aiNoteSet('Downloading the voice engine: ' + Math.round(loaded / 1e6) + ' of ' + Math.round(total / 1e6) + ' MB. This happens only once.');
  });
}
const silence = s => new Float32Array(Math.round(VSR * s));
function joinF32(list) {
  const out = new Float32Array(list.reduce((a, x) => a + x.length, 0));
  let o = 0; for (const x of list) { out.set(x, o); o += x.length; }
  return out;
}
function stopSample() { if (aiSample) { try { aiSample.stop(); } catch (e) {} aiSample = null; } }
async function hearVoice() {
  if (aiBusy || busy) return;
  const ctx = liveCtx();
  stopPlay(); stopSample(); setAiBusy(true, 'hear');
  try {
    await ensureEngine();
    aiNoteSet('Making a short sample…'); aiBarSet(null);
    const first = (TL.scenes.length && sentences(TL.scenes.find(s => s.kind === 'text') ? TL.scenes.find(s => s.kind === 'text').text : TL.scenes[0].text)[0]) || 'Hello! This is how I sound.';
    const a = await speakLine(first.slice(0, 220), S.aiVoice, S.aiSpeed);
    if (ctx && a.length) {
      const buf = ctx.createBuffer(1, a.length, VSR); buf.copyToChannel(a, 0);
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start(); aiSample = src;
    }
    aiNoteSet(aiDefaultNote());
  } catch (e) {
    aiNoteSet(aiFail(e));
  } finally { setAiBusy(false); }
}
function playFromStart() {
  if (busy || !TL.total) return;
  stopSample(); stopPlay(); show(0);
  try { $('.monitor').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  play();
}
// even out a voice and bring it to a strong, steady level
async function polish(all, sr) {
  try {
    const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new O(1, all.length, sr), src = oc.createBufferSource(), cmp = oc.createDynamicsCompressor(), mk = oc.createGain();
    const b0 = oc.createBuffer(1, all.length, sr); b0.copyToChannel(all, 0); src.buffer = b0;
    cmp.threshold.value = -28; cmp.knee.value = 10; cmp.ratio.value = 4; cmp.attack.value = 0.004; cmp.release.value = 0.2; mk.gain.value = 2.2;
    src.connect(cmp); cmp.connect(mk); mk.connect(oc.destination); src.start(0);
    all = new Float32Array((await oc.startRendering()).getChannelData(0));
  } catch (e) { /* keep the voice as it is */ }
  let peak = 0;
  for (let i = 0; i < all.length; i++) { const v = Math.abs(all[i]); if (v > peak) peak = v; }
  if (peak > 0) { const g = Math.min(3, 0.89 / peak); for (let i = 0; i < all.length; i++) all[i] *= g; }
  return all;
}
const fmtLeft = s => s < 60 ? Math.ceil(s / 5) * 5 + ' seconds' : Math.round(s / 60) === 1 ? 'a minute' : Math.round(s / 60) + ' minutes';
async function makeVoice() {
  if (aiBusy) return;
  if (busy || !TL.scenes.length) return;
  const ctx = getCtx();
  if (!ctx) { aiNoteSet('This browser can’t play audio, so it can’t make a voiceover.'); return; }
  stopPlay(); stopSample(); aiStop = false; setAiBusy(true, 'make');
  const scenes = TL.scenes.map(s => ({ kind: s.kind, text: s.text })), key = scriptKey(), vId = S.aiVoice, speed = S.aiSpeed;
  let msg = null;
  try {
    await ensureEngine();
    const pieces = [], n = scenes.length;
    // progress counts characters still to be voiced, so lines reused from before don't skew it
    const todo = [].concat(...scenes.map(s => sentences(s.text))).filter(t => !said.has(saidKey(t, vId, speed)));
    const total = todo.reduce((a, t) => a + t.length, 0) || 1;
    let done = 0, spent = 0;
    for (let i = 0; i < n; i++) {
      const parts = [];
      for (const s of sentences(scenes[i].text)) {
        if (aiStop) throw new Error('stopped');
        const fresh = !said.has(saidKey(s, vId, speed));
        if (fresh) {
          const left = done >= 40 && spent > 0 ? (total - done) * spent / done / 1000 : 0;
          aiNoteSet('Making the voice: scene ' + (i + 1) + ' of ' + n + (left > 8 ? ' · about ' + fmtLeft(left) + ' left' : '') + '…');
          aiBarSet(done / total);
        }
        const t0 = performance.now();
        const a = await speakLine(s, vId, speed);
        if (fresh) { done += s.length; spent += performance.now() - t0; }
        parts.push(a, silence(0.22));
      }
      if (parts.length) parts[parts.length - 1] = silence(scenes[i].kind === 'title' ? 0.7 : 0.45);
      else if (scenes[i].kind !== 'clip') parts.push(silence(1));
      pieces.push(joinF32(parts));
    }
    const starts = []; let acc = 0;
    pieces.forEach(p => { starts.push(acc / VSR); acc += p.length; });
    const all = await polish(joinF32(pieces.concat([silence(0.3)])), VSR);
    const buf = ctx.createBuffer(1, all.length, VSR); buf.copyToChannel(all, 0);
    remember();
    voice = { buffer: buf, dur: buf.duration, name: VOICE_NAMES[vId] + ' (AI voice)', made: true, key, voiceName: VOICE_NAMES[vId] };
    sync = starts.map((s, i) => ({ from: s, len: (i + 1 < starts.length ? starts[i + 1] : buf.duration) - s })); durOv = [];
    refresh();
    msg = 'Voiceover ready in ' + VOICE_NAMES[vId] + '. Playing it with your video from the start.';
    playFromStart();
  } catch (e) {
    msg = aiStop ? 'Stopped. Nothing was changed.' : aiFail(e);
  } finally { aiStop = false; setAiBusy(false); renderAudio(); if (msg) aiNoteSet(msg); }
}
async function saveVoice() {
  if (!voice || !voice.made || !DL || busy || aiBusy) return;
  const b = $('#bSaveVoice'); b.disabled = true; aiNoteSet('Preparing the voice file…');
  try {
    const M = await engine();
    if (!(await M.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000 }))) await wasmAac();
    const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new O(2, Math.ceil(voice.dur * 48000), 48000), s = oc.createBufferSource();
    s.buffer = voice.buffer; s.connect(oc.destination); s.start(0);
    const mixed = await oc.startRendering();
    const out = new M.Output({ format: new M.Mp4OutputFormat({ fastStart: 'in-memory' }), target: new M.BufferTarget() });
    const as = new M.AudioBufferSource({ codec: 'aac', quality: new M.Quality({ bitrate: 128000 }) });
    out.addAudioTrack(as); await out.start(); await as.add(mixed); as.close(); await out.finalize();
    const name = 'voiceover-' + voice.voiceName.toLowerCase() + '-' + fileName('mp4');
    const r = await DL.save({ filename: name, data: new Blob([out.target.buffer], { type: 'video/mp4' }) });
    aiNoteSet(r && r.status === 'delivered' ? 'Sent.' : 'Saved as an audio file (.mp4). Video editors like CapCut can import it.');
  } catch (e) {
    const c = e && e.code;
    aiNoteSet(c === 'declined' ? 'Not saved.' : c ? 'Couldn’t save the voice file here.' : 'Couldn’t make the voice file (' + ((e && e.message) || e) + ').');
  } finally { b.disabled = false; }
}

/* ---------- record your own voice ---------- */
// A teleprompter: read each scene and tap Next. One continuous recording; each tap marks where a scene
// begins, nudged to the nearest pause so no word is cut.
let REC = null;
const recDlg = () => $('#recDlg');
const textScenes = () => TL.scenes.map((sc, i) => sc.kind === 'clip' || !sc.words.length ? -1 : i).filter(i => i >= 0);
function recSay(t) { $('#recHint').textContent = t; }
function openRec() {
  if (busy || aiBusy || REC) return;
  const list = textScenes();
  if (!list.length) { $('#voiceNote').textContent = 'Type a script first, so there are words to read.'; return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('#voiceNote').textContent = window.isSecureContext === false ? 'Recording needs the page to open with https.' : 'This browser can’t record from the microphone. Try Safari or Chrome.'; return; }
  stopPlay();
  const keep = !!(voice && sync && (voice.made || voice.rec) && voice.key === scriptKey());
  const fromSel = keep ? list.find(i => i >= sel) : undefined;
  REC = { state: 'ready', list, pos: 0, pos0: 0, partial: false };
  $('#recFrom').innerHTML = keep && fromSel != null && fromSel !== list[0]
    ? '<button type="button" class="btn" data-from="0" aria-pressed="true">From the start</button><button type="button" class="btn" data-from="' + list.indexOf(fromSel) + '" aria-pressed="false">Only from scene ' + (fromSel + 1) + '</button>'
    : '';
  recSay('Press Start and read each scene out loud. Tap Next scene as you start the next one. Somewhere quiet works best.');
  recShow(); recDlg().hidden = false; $('#recBtn').focus();
}
function recShow() {
  const i = REC.list[REC.pos], sc = TL.scenes[i], nx = REC.list[REC.pos + 1];
  $('#recNum').textContent = 'Scene ' + (i + 1) + ' of ' + TL.scenes.length;
  $('#recText').textContent = sc ? sc.text : '';
  $('#recNext').textContent = nx != null ? 'Next: ' + TL.scenes[nx].text : 'This is the last scene.';
  const last = REC.pos >= REC.list.length - 1;
  $('#recBtn').textContent = REC.state === 'ready' ? 'Start' : last ? 'Finish' : 'Next scene';
  $('#recStop').hidden = REC.state !== 'recording' || last;
  $('#recFrom').hidden = REC.state !== 'ready';
}
async function recBegin() {
  const ctx = liveCtx();
  if (!ctx) throw new Error('This browser can’t record sound.');
  try { if (navigator.audioSession) navigator.audioSession.type = 'play-and-record'; } catch (e) {}
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
  if (!REC) { stream.getTracks().forEach(t => t.stop()); return; }
  const src = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(4096, 1, 1), mute = ctx.createGain();
  mute.gain.value = 0;
  Object.assign(REC, { stream, src, proc, mute, chunks: [], n: 0, sr: ctx.sampleRate, marks: [0], level: 0, state: 'recording', t0: performance.now() });
  proc.onaudioprocess = e => {
    if (!REC || REC.state !== 'recording') return;
    const d = e.inputBuffer.getChannelData(0);
    REC.chunks.push(new Float32Array(d)); REC.n += d.length;
    let pk = 0; for (let k = 0; k < d.length; k += 8) { const x = Math.abs(d[k]); if (x > pk) pk = x; }
    REC.level = Math.max(pk, REC.level * 0.85);
  };
  src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
  const tick = () => {
    if (!REC || REC.state !== 'recording') return;
    $('#recLevel').style.width = Math.round(clamp(Math.sqrt(REC.level) * 110, 2, 100)) + '%';
    $('#recClock').textContent = fmtT((performance.now() - REC.t0) / 1000);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function recRelease() {
  if (!REC) return;
  try { REC.proc && (REC.proc.onaudioprocess = null); } catch (e) {}
  try { REC.src && REC.src.disconnect(); REC.proc && REC.proc.disconnect(); REC.mute && REC.mute.disconnect(); } catch (e) {}
  try { REC.stream && REC.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
}
function closeRec() { recRelease(); REC = null; recDlg().hidden = true; $('#recBtn').disabled = false; $('#recLevel').style.width = '0%'; $('#recClock').textContent = ''; }
async function recTap() {
  if (!REC || REC.state === 'processing') return;
  if (REC.state === 'ready') {
    $('#recBtn').disabled = true; recSay('Waiting for the microphone…');
    try { await recBegin(); }
    catch (e) {
      const n = e && e.name;
      recSay(n === 'NotAllowedError' || n === 'SecurityError' ? 'The microphone is blocked. Allow it for this site in your browser settings, then try again.' : n === 'NotFoundError' ? 'No microphone was found.' : 'The microphone couldn’t start (' + ((e && e.message) || e) + ').');
      recRelease(); if (REC) REC.state = 'ready'; $('#recBtn').disabled = false; return;
    }
    $('#recBtn').disabled = false;
    recSay('Recording. Read the scene, then tap Next scene.');
    recShow(); return;
  }
  if (REC.pos < REC.list.length - 1) { REC.marks.push(REC.n); REC.pos++; recShow(); return; }
  recFinish();
}
async function recFinish() {
  if (!REC || REC.state !== 'recording') return;
  REC.state = 'processing'; recRelease();
  $('#recBtn').disabled = true; $('#recStop').hidden = true; recSay('Getting your voice ready…');
  try {
    const { sr, n } = REC, pcm = new Float32Array(n);
    let o = 0; for (const c of REC.chunks) { pcm.set(c, o); o += c.length; }
    REC.chunks = null;
    if (n < sr * 0.4) throw new Error('That recording was too short.');
    // loudness every 20 ms, to find where speaking starts, stops and pauses
    const win = Math.round(sr * 0.02), rms = [];
    let peak = 0;
    for (let a = 0; a < n; a += win) { let e = 0; const b = Math.min(n, a + win); for (let k = a; k < b; k++) e += pcm[k] * pcm[k]; const r = Math.sqrt(e / Math.max(1, b - a)); rms.push(r); if (r > peak) peak = r; }
    if (peak < 0.003) throw new Error('No voice was heard. Check the microphone and try again.');
    const th = Math.max(0.004, peak * 0.08), total = n / sr;
    let on = rms.findIndex(r => r > th), off = rms.length - 1 - rms.slice().reverse().findIndex(r => r > th);
    const start = Math.max(0, on * 0.02 - 0.2), stop = Math.min(total, (off + 1) * 0.02 + 0.35);
    const quiet = t => {
      let best = t, low = Infinity;
      for (let x = Math.max(start, t - 0.35); x <= Math.min(stop, t + 0.35); x += 0.02) { const r = rms[Math.floor(x / 0.02)] || 0, w = r + Math.abs(x - t) * th * 0.05; if (w < low) { low = w; best = x; } }
      return best;
    };
    const used = REC.marks.length, bounds = [start];
    for (let j = 1; j < used; j++) bounds.push(Math.max(bounds[j - 1] + 0.2, quiet(REC.marks[j] / sr)));
    bounds.push(Math.max(bounds[bounds.length - 1] + 0.2, stop));
    const cut = await polish(pcm.slice(Math.floor(start * sr), Math.min(n, Math.ceil(stop * sr))), sr);
    // keep the scenes that weren't re-recorded, if this was only from part way through
    const partial = REC.partial && voice && sync && sync.length === TL.scenes.length;
    let base = new Float32Array(0), off0 = 0;
    if (partial) {
      const O = window.OfflineAudioContext || window.webkitOfflineAudioContext, len = Math.ceil(voice.buffer.duration * sr);
      const oc = new O(1, Math.max(1, len), sr), sN = oc.createBufferSource(); sN.buffer = voice.buffer; sN.connect(oc.destination); sN.start(0);
      base = new Float32Array((await oc.startRendering()).getChannelData(0)); off0 = base.length / sr;
    }
    const all = new Float32Array(base.length + cut.length); all.set(base, 0); all.set(cut, base.length);
    const ranges = TL.scenes.map((sc, i) => partial ? { from: sync[i].from, len: sync[i].len } : { from: 0, len: 0 });
    for (let j = 0; j < used; j++) ranges[REC.list[REC.pos0 + j]] = { from: off0 + bounds[j] - start, len: bounds[j + 1] - bounds[j] };
    const ctx = getCtx(), buf = ctx.createBuffer(1, all.length, sr); buf.copyToChannel(all, 0);
    remember();
    voice = { buffer: buf, dur: buf.duration, name: partial && voice.made ? 'AI voice with your voice' : 'Your voice', rec: true, key: scriptKey() };
    sync = ranges; durOv = [];
    closeRec(); refresh();
    $('#voiceNote').innerHTML = '<b>Your voice is ready</b> · ' + used + (used === 1 ? ' scene' : ' scenes') + ' recorded. Playing it with your video from the start.';
    playFromStart();
  } catch (e) {
    console.warn(e);
    recSay((e && e.message) || 'Something went wrong. Try again.');
    if (REC) { REC.state = 'ready'; REC.pos = REC.pos0 || 0; }
    $('#recBtn').disabled = false; if (REC) recShow();
  }
}

/* ---------- tap to sync ---------- */
function openSync() {
  if (!voice || !TL.scenes.length || busy) return;
  stopPlay();
  SY = { marks: [0], k: 0, src: null, t0: 0, raf: 0 };
  $('#syncBtn').textContent = 'Start'; $('#syncClock').textContent = '0:00 / ' + fmtT(voice.dur);
  cue(); $('#syncDlg').hidden = false; $('#syncBtn').focus();
}
function cue() {
  const n = TL.scenes.length, k = SY.k;
  $('#cueNum').textContent = 'Scene ' + (k + 1) + ' of ' + n;
  $('#cueText').textContent = TL.scenes[k].text;
  $('#cueNext').textContent = k + 1 < n ? 'Next: ' + TL.scenes[k + 1].text : 'Last scene. Tap Finish when your voice stops, or let it play to the end.';
}
function syncTap() {
  if (!SY) return;
  const ctx = getCtx();
  if (!ctx) return;
  const n = TL.scenes.length;
  if (!SY.src) {
    const s = ctx.createBufferSource(); s.buffer = voice.buffer; s.connect(ctx.destination);
    SY.t0 = ctx.currentTime + 0.05; s.start(SY.t0); SY.src = s;
    s.onended = () => { if (SY && SY.src === s) finishSync(); };
    $('#syncBtn').textContent = n > 1 ? 'Next scene' : 'Finish';
    const tick = () => { if (!SY) return; $('#syncClock').textContent = fmtT(Math.max(0, ctx.currentTime - SY.t0)) + ' / ' + fmtT(voice.dur); SY.raf = requestAnimationFrame(tick); };
    tick();
    return;
  }
  if (SY.k < n - 1) {
    SY.k++; SY.marks.push(Math.max(0, ctx.currentTime - SY.t0)); cue();
    if (SY.k === n - 1) $('#syncBtn').textContent = 'Finish';
  } else finishSync();
}
function finishSync() {
  if (!SY) return;
  const m = SY.marks.slice(), n = TL.scenes.length;
  for (let j = 1; j < m.length; j++) m[j] = Math.max(m[j], m[j - 1] + 0.3);
  if (m.length < n) {
    const from = m.length - 1, t1 = Math.max(voice.dur, m[from] + 0.3 * (n - from));
    const w = TL.scenes.slice(from).map(autoDur), tot = w.reduce((a, b) => a + b, 0) || 1;
    let acc = m[from];
    for (let j = from; j < n - 1; j++) { acc += (t1 - m[from]) * w[j - from] / tot; m.push(acc); }
  }
  const st = m.slice(0, n); st[0] = 0;
  remember();
  sync = st.map((s, i) => ({ from: s, len: Math.max(0, (i + 1 < n ? st[i + 1] : voice.dur) - s) })); durOv = [];
  closeSync(); refresh();
}
function closeSync() {
  if (!SY) return;
  cancelAnimationFrame(SY.raf);
  if (SY.src) { SY.src.onended = null; try { SY.src.stop(); } catch (e) {} }
  SY = null; $('#syncDlg').hidden = true; $('#bSync').focus();
}

/* ---------- export ---------- */
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => res(); s.onerror = () => { s.remove(); rej(new Error('Couldn’t load ' + src)); };
    document.head.appendChild(s);
  });
}
let engineP = null;
function engine() {
  return engineP || (engineP = (window.STVMB ? Promise.resolve() : loadScript('lib/engine.js?v=' + VERSION)).then(() => {
    if (!window.STVMB) throw new Error('The video encoder didn’t load');
    return window.STVMB;
  }).catch(e => { engineP = null; throw e; }));
}
async function wasmAac() {
  if (!window.STVAac) await loadScript('lib/aac.js?v=' + VERSION);
  window.STVAac.register();
}
const vbr = (W, H) => Math.round(clamp(W * H * FPS * 0.075, 2.5e6, 6e6));
const MC = new MessageChannel(), QUEUE = [];
MC.port1.onmessage = () => { const r = QUEUE.shift(); if (r) r(); };
const tick = () => new Promise(r => { QUEUE.push(r); MC.port2.postMessage(0); });
const frame = () => new Promise(r => requestAnimationFrame(() => r()));
async function fontsReady() {
  if (!document.fonts || !document.fonts.load) return;
  const specs = ['900 40px Montserrat', '400 40px Anton', '800 40px Archivo', '600 40px Archivo', '800 40px "Playfair Display"', '700 40px "Courier Prime"'];
  await Promise.race([Promise.all(specs.map(f => document.fonts.load(f, 'AaBb12ẸỌṢ').catch(() => null))), sleep(5000)]);
}
function setBusy(b) {
  busy = b;
  $('#panel').classList.toggle('busy', b); $('#script').readOnly = b;
  $('#tally').classList.toggle('on', b); $('#mlabel').textContent = b ? 'Rendering' : 'Preview';
  $('#go').disabled = $('#play').disabled = b || !TL.total; $('#seek').disabled = b;
  $$('.exportbar .seg button').forEach(x => { x.disabled = b; });
}
function jobUI(title, p, hint, ended) {
  $('#job').hidden = false; $('#job').classList.toggle('ended', !!ended);
  $('#jobText').textContent = title; $('#jobBar').style.width = Math.round(p * 100) + '%';
  $('#jobHint').textContent = hint || ''; $('#jobCancel').textContent = ended ? 'Close' : 'Cancel';
}
function prog(p, t0, verb) {
  const el = (performance.now() - t0) / 1000, eta = p > 0.04 ? el * (1 - p) / p : 0;
  $('#jobText').textContent = verb + ' ' + Math.round(p * 100) + '%' + (eta > 1.5 ? ' · about ' + fmtT(eta) + ' left' : '');
  $('#jobBar').style.width = (p * 100).toFixed(1) + '%';
}
async function exportFast(W, H, audio, job) {
  jobUI('Loading the video encoder…', 0, '');
  const M = await engine();
  const codec = await M.getFirstEncodableVideoCodec(['avc'], { width: W, height: H });
  if (!codec) throw new Error('No H.264 encoder here');
  if (audio && !(await M.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: audio.sampleRate }))) {
    jobUI('Loading the audio encoder…', 0, '');
    await wasmAac();
  }
  if (job.cancel) throw new Error('cancelled');
  const q = b => { try { return new M.Quality({ bitrate: b }); } catch (e) { return M.QUALITY_HIGH; } };
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { alpha: false });
  const out = new M.Output({ format: new M.Mp4OutputFormat({ fastStart: 'in-memory' }), target: new M.BufferTarget() });
  job.out = out;
  const vs = new M.CanvasSource(c, { codec: 'avc', quality: q(vbr(W, H)), keyFrameInterval: 2 });
  out.addVideoTrack(vs, { frameRate: FPS });
  let as = null;
  if (audio) { as = new M.AudioBufferSource({ codec: 'aac', quality: q(160000) }); out.addAudioTrack(as); }
  await out.start();
  if (as) { jobUI('Encoding the sound…', 0, ''); await as.add(audio); as.close(); }
  const n = Math.max(1, Math.round(TL.total * FPS));
  const feeds = await openClipFeeds(M, W, H, n, job);
  const t0 = performance.now();
  try {
    for (let i = 0; i < n; i++) {
      if (job.cancel) { await out.cancel().catch(() => {}); throw new Error('cancelled'); }
      for (const v of visibleClips(i / FPS)) {
        const f = feeds.get(v.m), r = await f.it.next();
        if (r.value) v.m.exportFrame = r.value.canvas;
      }
      drawFrame(g, W, H, i / FPS, { mode: 'export' });
      await vs.add(i / FPS, 1 / FPS);
      if (i % 5 === 0) {
        prog(i / n, t0, 'Rendering');
        pctx.drawImage(c, 0, 0, cv.width, cv.height);
        await (i % 15 === 0 && !document.hidden ? frame() : tick());
      }
    }
  } finally { await closeClipFeeds(feeds); }
  vs.close();
  jobUI('Finishing the file…', 1, '');
  await out.finalize();
  const buf = out.target.buffer;
  c.width = c.height = 1;
  return { blob: new Blob([buf], { type: 'video/mp4' }), ext: 'mp4', W, H, live: false };
}
// Clip frames for the MP4 export, decoded exactly at the times each frame needs
async function openClipFeeds(M, W, H, n, job) {
  const feeds = new Map(), used = Array.from(new Set(TL.scenes.map(sc => sc.media).filter(m => m && m.kind === 'video')));
  if (!used.length) return feeds;
  jobUI('Reading your clips…', 0, '');
  const seqs = new Map(used.map(m => [m, []]));
  for (let i = 0; i < n; i++) for (const v of visibleClips(i / FPS)) seqs.get(v.m).push(v.ct);
  try {
    for (const m of used) {
      if (job.cancel) throw new Error('cancelled');
      const input = new M.Input({ source: new M.BlobSource(m.file), formats: M.ALL_FORMATS });
      feeds.set(m, { input, it: null });
      const track = await input.getPrimaryVideoTrack();
      if (!track || !(await track.canDecode())) throw new Error('This browser can’t read the clip ' + m.name + ' for a fast export');
      const first = await track.getFirstTimestamp();
      const dw = await track.getDisplayWidth(), dh = await track.getDisplayHeight(), k = Math.min(1, 1920 / Math.max(dw, dh, 1));
      const sink = new M.CanvasSink(track, { width: Math.max(2, Math.round(dw * k)), height: Math.max(2, Math.round(dh * k)), fit: 'fill', poolSize: 2 });
      feeds.get(m).it = sink.canvasesAtTimestamps(seqs.get(m).map(x => x + first));
    }
  } catch (e) { await closeClipFeeds(feeds); throw e; }
  return feeds;
}
async function closeClipFeeds(feeds) {
  for (const [m, f] of feeds) {
    m.exportFrame = null;
    try { if (f.it) await f.it.return(); } catch (e) {}
    try { if (f.input && f.input.dispose) f.input.dispose(); } catch (e) {}
  }
  feeds.clear();
}
function pickMime(withAudio) {
  const list = withAudio
    ? ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    : ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  if (withAudio) list.splice(2, 0, 'video/mp4;codecs=avc1,opus');
  for (const m of list) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) {} }
  return '';
}
async function exportLive(W, H, audio, live, job) {
  cv.width = W; cv.height = H;
  syncClips(0, false);
  await sleep(allClips().length ? 400 : 0);
  drawFrame(pctx, W, H, 0);
  const stream = cv.captureStream(FPS);
  let dest = null, src = null, failed = null;
  if (audio && live) { try { dest = live.createMediaStreamDestination(); dest.stream.getAudioTracks().forEach(t => stream.addTrack(t)); } catch (e) { dest = null; } }
  const mime = pickMime(!!dest), opts = { videoBitsPerSecond: vbr(W, H), audioBitsPerSecond: 160000 };
  if (mime) opts.mimeType = mime;
  let rec;
  try { rec = new MediaRecorder(stream, opts); } catch (e) { rec = new MediaRecorder(stream); }
  const parts = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
  rec.onerror = e => { failed = (e && e.error) || new Error('Recording failed'); };
  const stopped = new Promise(r => { rec.onstop = r; });
  jobUI('Recording…', 0, 'This browser records the video as it plays, so it takes as long as the video. Keep this screen on until it finishes.');
  rec.start(1000);
  const p0 = performance.now();
  let clk, moved = false;
  if (dest) {
    src = live.createBufferSource(); src.buffer = audio; src.connect(dest);
    const when = live.currentTime + 0.1; src.start(when);
    clk = () => Math.max(0, live.currentTime - when);
  } else { const s0 = performance.now() + 100; clk = () => Math.max(0, (performance.now() - s0) / 1000); }
  try {
    await new Promise((resolve, reject) => {
      const step = () => {
        if (job.cancel) return reject(new Error('cancelled'));
        if (failed) return reject(failed);
        if (document.hidden) return reject(new Error('The recording stopped because the page went into the background. Keep this screen open until it finishes.'));
        if (dest && !moved && live.state !== 'running' && performance.now() - p0 > 800) { moved = true; const base = clk(), s1 = performance.now(); clk = () => base + (performance.now() - s1) / 1000; }
        const t = clk();
        if (t >= TL.total) { drawFrame(pctx, W, H, TL.total); return resolve(); }
        syncClips(t, true);
        drawFrame(pctx, W, H, t); prog(t / TL.total, p0, 'Recording');
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    await sleep(300);
  } finally {
    try { if (rec.state !== 'inactive') rec.stop(); } catch (e) {}
    try { if (src) src.stop(); } catch (e) {}
    pauseClips();
  }
  await Promise.race([stopped, sleep(4000)]);
  stream.getTracks().forEach(t => t.stop());
  if (!parts.length) throw new Error('The recording came out empty.');
  const type = (rec.mimeType || mime || 'video/webm').split(';')[0];
  return { blob: new Blob(parts, { type }), ext: /mp4/.test(type) ? 'mp4' : 'webm', W, H, live: true };
}
function fileName(ext) {
  const ent = IX && IX.list.find(x => x.id === curId), first = (ent && ent.named && ent.name) || (TL.scenes.find(sc => sc.text) || {}).text || 'video';
  const slug = first.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '') || 'video';
  return slug + '.' + ext;
}
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function outFile() { return lastOut ? new File([lastOut.blob], lastOut.name, { type: lastOut.blob.type || 'video/mp4' }) : null; }
function canShareOut() { try { const f = outFile(); return !!(f && navigator.share && navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; } }
function saveUI(msg) {
  const share = canShareOut();
  $('#share').hidden = !share;
  $('#save').hidden = !DL;
  $('#save').textContent = share ? 'Download' : 'Save video';
  $('#save').className = share ? 'btn' : 'primary';
  $('#saveNote').textContent = msg || (share ? (IOS ? 'Tap Save or share, then Save Video to put it in Photos, or pick WhatsApp, TikTok or another app.' : 'Save or share opens your share menu: pick WhatsApp, TikTok or another app. Download puts it in your Downloads folder.') : 'The video goes to your Downloads folder.');
}
function done(res) {
  if (lastOut) URL.revokeObjectURL(lastOut.url);
  const url = URL.createObjectURL(res.blob);
  lastOut = Object.assign({}, res, { url, name: fileName(res.ext) });
  $('#job').hidden = true;
  const v = $('#outVid'); v.src = url; v.style.aspectRatio = res.W + ' / ' + res.H;
  $('#outInfo').textContent = res.ext.toUpperCase() + ' · ' + res.W + '×' + res.H + ' · ' + fmtT(TL.total) + ' · ' + (res.blob.size / 1048576).toFixed(1) + ' MB' + (res.ext === 'webm' ? '. This browser only records WebM; for an MP4, export from Chrome or Safari.' : '');
  $('#result').hidden = false; saveUI();
  try { $('#result').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
}
async function startExport() {
  if (busy || !TL.total) return;
  stopPlay();
  unlockClips();
  const live = voice || music || hasClipSound() ? getCtx() : null;
  const job = JOB = { cancel: false, out: null }, q = dims(S.quality), W = q.w, H = q.h;
  setBusy(true);
  $('#result').hidden = true;
  jobUI('Getting ready…', 0, '');
  let wake = null;
  try { if (navigator.wakeLock) wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; }
  try {
    await fontsReady(); LC.clear();
    const audio = await mixAudio(TL.total);
    let res = null, firstErr = null;
    if (window.__stvForce !== 'live' && typeof VideoEncoder !== 'undefined') {
      try { res = await exportFast(W, H, audio, job); }
      catch (e) {
        if (job.out) job.out.cancel().catch(() => {});
        if (job.cancel) throw e;
        firstErr = e; console.warn('[script-to-video] fast export failed, recording instead', e);
      }
    }
    if (!res) {
      if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) throw firstErr || new Error('This browser can’t make video files. Try Chrome or Safari.');
      res = await exportLive(W, H, audio, live, job);
    }
    done(res);
  } catch (e) {
    if (job.cancel) jobUI('Export cancelled', 0, '', true);
    else { console.error(e); jobUI('The export didn’t finish', 0, (e && e.message) || String(e), true); }
  } finally {
    try { if (wake) wake.release(); } catch (e) {}
    JOB = null; setBusy(false); LC.clear(); sizePreview(); show(playT);
  }
}

/* ---------- your project, kept on this phone ---------- */
// Everything is saved in this browser's own storage (IndexedDB) so closing the page loses nothing.
// Nothing is ever sent to the website.
const DBN = 'stv-project';
let dbP = null, saveTimer = 0, restoring = false, storedIds = null;
// Things saved in this project that couldn't be opened this time (low memory, a busy phone). They stay saved,
// untouched, and are tried again the next time the project opens, instead of being dropped on the next save.
let lost = { voice: null, sync: null, music: null, objs: [] };
const fileIds = new WeakMap();
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
function fileId(f) { let id = fileIds.get(f); if (!id) { id = newId(); fileIds.set(f, id); } return id; }
function db() {
  if (dbP) return dbP;
  dbP = new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no storage'));
    const r = indexedDB.open(DBN, 1);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('files')) d.createObjectStore('files'); if (!d.objectStoreNames.contains('state')) d.createObjectStore('state'); };
    r.onsuccess = () => { const d = r.result; d.onversionchange = () => { d.close(); dbP = null; }; res(d); };
    r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('storage blocked'));
  });
  dbP.catch(() => { dbP = null; });
  return dbP;
}
function idb(store, mode, fn) {
  return db().then(d => new Promise((res, rej) => {
    const tx = d.transaction(store, mode), st = tx.objectStore(store);
    let out; const r = fn(st); if (r) r.onsuccess = () => { out = r.result; };
    tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
  }));
}
function wavBlob(buf) {
  const ch = buf.getChannelData(0), n = ch.length, sr = buf.sampleRate, v = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o, t) => { for (let k = 0; k < t.length; k++) v.setUint8(o + k, t.charCodeAt(k)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let k = 0; k < n; k++) v.setInt16(44 + k * 2, clamp(ch[k], -1, 1) * 0x7fff, true);
  return new Blob([v], { type: 'audio/wav' });
}
function queueSave() {
  if (restoring) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveProject().catch(e => {
      console.warn('[script-to-video] could not save the project', e);
      if (!queueSave.told) { queueSave.told = true; $('#photoNote').textContent = 'This browser has no room to keep your project, so it won’t be here after you close the page. Your export still works.'; }
    });
  }, 800);
}
async function saveProject() {
  const files = new Map(), objs = [], idx = new Map();
  const keep = m => {
    if (!m || !m.file) return -1;
    if (idx.has(m)) return idx.get(m);
    const fid = fileId(m.file);
    files.set(fid, m.file);
    const o = { fid, kind: m.kind, name: m.name };
    if (m.kind === 'video') Object.assign(o, { in: m.in, out: m.out, speed: m.speed, vol: m.vol, fit: m.fit || 'whole', endMode: m.endMode, useSound: !!m.useSound });
    Object.assign(o, pickF(m, LOOKF));
    objs.push(o); idx.set(m, objs.length - 1); return objs.length - 1;
  };
  const scenes = media.map(keep);
  let v = null, mu = null;
  if (voice) {
    if (!voice.file) voice.file = wavBlob(voice.buffer);
    v = { fid: fileId(voice.file), name: voice.name, made: !!voice.made, rec: !!voice.rec, key: voice.key || null, voiceName: voice.voiceName || null };
    files.set(v.fid, voice.file);
  }
  if (music && music.file) { mu = { fid: fileId(music.file), name: music.name }; files.set(mu.fid, music.file); }
  if (!storedIds) storedIds = new Set((await idb('files', 'readonly', st => st.getAllKeys())) || []);
  for (const [fid, f] of files) if (!storedIds.has(fid)) { await idb('files', 'readwrite', st => st.put(f, fid)); storedIds.add(fid); }
  const ids = new Set(files.keys());
  let syncOut = sync;
  if (voice) lost.voice = null; else if (lost.voice) { v = lost.voice; syncOut = lost.sync; ids.add(v.fid); }
  if (music) lost.music = null; else if (lost.music) { mu = lost.music; ids.add(mu.fid); }
  lost.objs.forEach(x => ids.add(x.o.fid));
  const look = Object.assign({}, S); delete look.quality;
  await idb('state', 'readwrite', st => st.put({ v: 2, script: S.script, look, objs, scenes, durOv: durOv.slice(0, scenes.length), sync: syncOut, voice: v, music: mu, lost: lost.objs.length ? lost.objs : null, sel, playT, ovl, trans, saved: Date.now() }, 'p:' + curId));
  const ix = await getIndex(), e = ix.list.find(x => x.id === curId);
  if (e) Object.assign(e, { name: e.named ? e.name : autoName(), updated: Date.now(), dur: TL.total, scenes: TL.scenes.length, thumb: projThumb(), files: Array.from(ids) });
  await putIndex(ix);
  // a file stays while any project still uses it
  const used = new Set(); ix.list.forEach(x => (x.files || []).forEach(f => used.add(f)));
  const extra = Array.from(storedIds).filter(id => !used.has(id));
  if (extra.length) { await idb('files', 'readwrite', st => { extra.forEach(id => st.delete(id)); }); extra.forEach(id => storedIds.delete(id)); }
  if (!$('#projDlg').hidden) renderProjects();
  setProjName();
  if (!saveProject.asked && navigator.storage && navigator.storage.persist) { saveProject.asked = true; navigator.storage.persist().catch(() => {}); }
}
// ---- the list of projects
let curId = null, IX = null;
async function getIndex() {
  if (IX) return IX;
  let ix = null;
  try { ix = await idb('state', 'readonly', st => st.get('index')); } catch (e) { ix = null; }
  if (!ix || !Array.isArray(ix.list)) {
    // first time with several projects: the single saved project (if any) becomes the first one
    const id = newId(), now = Date.now();
    ix = { v: 2, current: id, list: [{ id, name: '', named: false, created: now, updated: now, dur: 0, scenes: 0, thumb: '', files: [] }] };
    try {
      const old = await idb('state', 'readonly', st => st.get('project'));
      if (old) {
        await idb('state', 'readwrite', st => st.put(old, 'p:' + id));
        await idb('state', 'readwrite', st => st.delete('project'));
        ix.list[0].files = (old.objs || []).map(o => o.fid).concat(old.voice ? [old.voice.fid] : [], old.music ? [old.music.fid] : []);
        ix.list[0].updated = old.saved || now;
      }
    } catch (e) {}
    await putIndex(ix);
  }
  IX = ix;
  return ix;
}
async function putIndex(ix) { IX = ix; ix.current = curId || ix.current; try { await idb('state', 'readwrite', st => st.put(ix, 'index')); } catch (e) {} }
function autoName() {
  const first = TL.scenes.find(sc => sc.text);
  const t = first ? first.text.replace(/\s+/g, ' ').trim() : '';
  return t ? (t.length > 42 ? t.slice(0, 40).replace(/\s+\S*$/, '') + '…' : t) : (media.some(Boolean) ? 'Video with clips' : 'Untitled video');
}
function projThumb() {
  try {
    const f = FORMATS[S.format], k = 96 / Math.max(f.w, f.h), c = document.createElement('canvas');
    c.width = Math.round(f.w * k * 2); c.height = Math.round(f.h * k * 2);
    if (TL.scenes.length) { const sc = TL.scenes[0]; drawFrame(c.getContext('2d'), c.width, c.height, sc.start + Math.min(sc.talk || sc.dur, sc.dur) * 0.6, { thumb: true }); }
    else { const g = c.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height); }
    return c.toDataURL('image/jpeg', 0.7);
  } catch (e) { return ''; }
}
function setProjName() { const e = IX && IX.list.find(x => x.id === curId); $('#projName').textContent = e && e.named ? e.name : autoName(); }
async function flushSave() { clearTimeout(saveTimer); if (curId && !restoring) { try { await saveProject(); } catch (e) { console.warn(e); } } }
function teardown() {
  stopPlay(); selText = null; selCap = false;
  for (const m of Array.from(LIVE)) disposeMedia(m);
  LIVE.clear(); UNDO.length = 0; REDO.length = 0;
  media = []; durOv = []; sync = null; voice = null; music = null; ovl = []; trans = []; sel = 0; playT = 0;
  lost = { voice: null, sync: null, music: null, objs: [] };
}
async function restoreProject(id) {
  let pj = null;
  try { pj = await idb('state', 'readonly', st => st.get('p:' + id)); } catch (e) { return; }
  if (!pj) return;
  restoring = true;
  lost = { voice: null, sync: null, music: null, objs: [] };
  const note = $('#photoNote');
  note.textContent = 'Opening your project…';
  try {
    const getFile = async fid => { const f = await idb('files', 'readonly', st => st.get(fid)); if (f) fileIds.set(f, fid); return f || null; };
    // a missing file is gone; a file that is there but won't open now is kept for next time
    const openObj = async o => {
      const f = await getFile(o.fid);
      if (!f) return null;
      try {
        const m = o.kind === 'video' ? await loadClip(f) : { kind: 'image', img: await loadImage(f), name: o.name, file: f };
        m.name = o.name || m.name;
        Object.assign(m, pickF(o, LOOKF));
        if (o.kind === 'video') { Object.assign(m, { in: clamp(+o.in || 0, 0, m.dur), out: clamp(+o.out || m.dur, 0, m.dur), speed: +o.speed || 1, vol: o.vol == null ? 1 : +o.vol, fit: o.fit, endMode: o.endMode || 'loop' }); if (m.out - m.in < 0.1) { m.in = 0; m.out = m.dur; } applyLoop(m); if (o.useSound) { await ensureClipAudio(m); m.useSound = !!m.audio; } }
        return m;
      } catch (e) { console.warn('[script-to-video] could not open', o.name, e); return false; }
    };
    const objs = [];
    for (let k = 0; k < pj.objs.length; k++) {
      const o = pj.objs[k], m = await openObj(o);
      if (m === false) lost.objs.push({ o, at: pj.scenes.reduce((a, x, i) => x === k ? a.concat(i) : a, []) });
      objs.push(m || null);
    }
    if (pj.look && typeof pj.look === 'object') { const q = S.quality; S = load.call(null, pj.look); S.quality = q; }
    if (typeof pj.script === 'string') { S.script = pj.script; }
    $('#script').value = S.script; $('#handle').value = S.handle;
    media = pj.scenes.map(k => k >= 0 ? objs[k] || null : null);
    // photos and clips that couldn't open last time: try again, back on their scenes if those are still free
    for (const x of Array.isArray(pj.lost) ? pj.lost : []) {
      if (!x || !x.o || !x.o.fid) continue;
      const m = await openObj(x.o);
      if (m) { (x.at || []).forEach(i => { if (i < media.length && !media[i]) media[i] = m; }); }
      else if (m === false) lost.objs.push(x);
    }
    durOv = Array.isArray(pj.durOv) ? pj.durOv.map(x => x == null ? undefined : +x) : [];
    if (pj.voice) {
      const f = await getFile(pj.voice.fid);
      if (f) {
        try { const b = await decodeFile(f); voice = { buffer: b, dur: b.duration, name: pj.voice.name, made: pj.voice.made, rec: !!pj.voice.rec, key: pj.voice.key, voiceName: pj.voice.voiceName, file: f }; }
        catch (e) { console.warn('[script-to-video] could not open the voiceover', e); voice = null; lost.voice = pj.voice; lost.sync = Array.isArray(pj.sync) ? pj.sync : null; }
      }
    }
    if (pj.music) {
      const f = await getFile(pj.music.fid);
      if (f) {
        try { const b = await decodeFile(f); music = { buffer: b, dur: b.duration, name: pj.music.name, file: f }; }
        catch (e) { console.warn('[script-to-video] could not open the music', e); music = null; lost.music = pj.music; }
      }
    }
    sync = voice && Array.isArray(pj.sync) ? pj.sync : null;
    trans = Array.isArray(pj.trans) ? pj.trans.map(t => OPTS.trans.some(x => x[0] === t) ? t : null) : [];
    ovl = Array.isArray(pj.ovl) ? pj.ovl.map(a => Array.isArray(a) ? a.filter(o => o && typeof o.text === 'string') : []) : [];
    sel = pj.sel || 0; playT = +pj.playT || 0;
    const missed = [lost.voice && 'voiceover', lost.music && 'music', lost.objs.length && (lost.objs.length === 1 ? 'one clip' : lost.objs.length + ' clips')].filter(Boolean);
    note.textContent = missed.length ? 'Your ' + missed.join(' and ') + ' couldn’t open just now, so ' + (missed.length > 1 || lost.objs.length > 1 ? 'they are' : 'it is') + ' kept safe. Close this page and open it again to bring ' + (missed.length > 1 || lost.objs.length > 1 ? 'them' : 'it') + ' back.'
      : (pj.objs || []).length || pj.voice ? 'Your project is back. Find your other videos in My projects at the top.' : PHOTO_NOTE;
  } finally { restoring = false; }
  renderChips(); sizePreview(); refresh(); setProjName();
}
async function newProject() {
  if (busy || aiBusy || restoring) return;
  await flushSave();
  teardown();
  const id = newId(), now = Date.now(), ix = await getIndex();
  ix.list.unshift({ id, name: '', named: false, created: now, updated: now, dur: 0, scenes: 0, thumb: '', files: [] });
  curId = id; await putIndex(ix);
  S.script = ''; S.capY = null; $('#script').value = '';
  refresh(); renderPhotoNote(); setProjName();
  $('#photoNote').textContent = 'New project started. Your other videos are kept in My projects at the top.';
  closeProjects();
}
async function openProject(id) {
  if (busy || aiBusy || restoring) return;
  if (id === curId) return closeProjects();
  await flushSave();
  teardown();
  curId = id; await putIndex(await getIndex());
  closeProjects();
  await restoreProject(id);
  undoUI();
}
async function copyProject(id) {
  if (id === curId) await flushSave();
  const ix = await getIndex(), e = ix.list.find(x => x.id === id), pj = await idb('state', 'readonly', st => st.get('p:' + id));
  if (!e || !pj) return;
  const nid = newId(), now = Date.now();
  await idb('state', 'readwrite', st => st.put(pj, 'p:' + nid));
  ix.list.splice(ix.list.indexOf(e) + 1, 0, Object.assign({}, e, { id: nid, name: 'Copy of ' + e.name, named: true, created: now, updated: now }));
  await putIndex(ix); renderProjects();
}
async function deleteProject(id) {
  const ix = await getIndex(), e = ix.list.find(x => x.id === id);
  if (!e) return;
  ix.list.splice(ix.list.indexOf(e), 1);
  await idb('state', 'readwrite', st => st.delete('p:' + id));
  if (id === curId) {
    teardown();
    if (!ix.list.length) { await putIndex(ix); curId = null; await newProject(); return; }
    curId = ix.list.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0))[0].id; await putIndex(ix);
    await restoreProject(curId);
  } else await putIndex(ix);
  await flushSave(); renderProjects();
}
async function renameProject(id, name) {
  const ix = await getIndex(), e = ix.list.find(x => x.id === id);
  if (!e) return;
  name = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  e.named = !!name; e.name = name || (id === curId ? autoName() : e.name);
  await putIndex(ix); renderProjects();
  if (id === curId) $('#projName').textContent = e.name;
}
// ---- the My projects window
let renaming = null, delArmed = null;
function when(t) {
  const d = new Date(t), now = new Date(), day = 86400000;
  const hm = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return 'today ' + hm;
  if (new Date(now - day).toDateString() === d.toDateString()) return 'yesterday ' + hm;
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + hm;
}
async function renderProjects() {
  const ix = await getIndex(), ol = $('#projList');
  ol.innerHTML = ix.list.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0)).map(e => {
    const cur = e.id === curId, ren = renaming === e.id;
    return '<li class="proj' + (cur ? ' cur' : '') + '" data-id="' + e.id + '">' +
      '<button type="button" class="pthumb" data-pact="open" aria-label="Open ' + esc(e.name || 'project') + '">' + (e.thumb ? '<img src="' + e.thumb + '" alt="">' : '') + '</button>' +
      '<div class="pinfo">' + (ren ? '<input class="pren" type="text" maxlength="60" value="' + esc(e.name || '') + '" aria-label="Project name">' : '<p class="pname">' + esc(e.name || 'Untitled video') + '</p>') +
      '<p class="pmeta">' + fmtT(e.dur || 0) + ' · ' + (e.scenes || 0) + (e.scenes === 1 ? ' scene' : ' scenes') + ' · ' + when(e.updated || e.created) + '</p></div>' +
      '<div class="pbtns">' + (ren ? '<button type="button" class="btn" data-pact="save">Save name</button>' : (cur ? '<span class="tag">Open now</span>' : '<button type="button" class="btn" data-pact="open">Open</button>') + '<button type="button" class="btn" data-pact="ren">Rename</button>') +
      '<button type="button" class="btn" data-pact="copy">Copy</button><button type="button" class="btn" data-pact="del">' + (delArmed === e.id ? 'Tap again to delete' : 'Delete') + '</button></div></li>';
  }).join('');
  const inp = ol.querySelector('.pren');
  if (inp) { inp.focus(); inp.select(); }
}
async function openProjects() { if (busy || REC) return; stopPlay(); renaming = null; delArmed = null; await flushSave(); await renderProjects(); $('#projDlg').hidden = false; }
function closeProjects() { $('#projDlg').hidden = true; renaming = null; delArmed = null; }

/* ---------- timeline ---------- */
// The strip scrolls under a fixed playhead in the middle: scrolling it moves through the video.
const PXS = 40; // timeline pixels per second
let tlAuto = -1, tlRaf = 0, editAt = 0;
function tlFollow(t) {
  const st = $('#tlStrip');
  if (!st) return;
  const x = Math.round(t * PXS);
  if (Math.abs(st.scrollLeft - x) > 1) { tlAuto = x; st.scrollLeft = x; }
}
function renderTimeline() {
  if (renderStrip()) { renderClipBox(); opsState(); }
  undoUI();
}
// the strip only (scene blocks and text bars), leaving the panel under it alone
// With no scenes, the Edit tab says how to start instead of going blank.
function emptyBox() {
  const box = $('#clipBox');
  box.hidden = false;
  box.innerHTML = '<div class="cbhead"><b>No scenes yet</b></div><p class="cbtext">Write your script in Script, or tap + Clip to start with your own photos and clips.</p><button type="button" class="linkbtn" data-tabgo="script">Go to Script</button>';
}
function renderStrip() {
  const row = $('#tlRow'), n = TL.scenes.length;
  sel = clamp(sel, 0, Math.max(0, n - 1));
  $('#tl').classList.toggle('empty', !n);
  if (!n) { row.innerHTML = ''; $('#tlTxt').hidden = true; $('#tlAud').hidden = true; emptyBox(); $('#tlSel').textContent = ''; return false; }
  const f = FORMATS[S.format].thumb, H = 56, tw = Math.round(H * f[0] / f[1]);
  row.innerHTML = TL.scenes.map((sc, i) => {
    const m = sc.media, label = sc.kind === 'clip' ? (m && m.kind === 'video' ? 'Clip' : m ? 'Photo' : 'Empty scene') : sc.text;
    return '<button type="button" class="tlb' + (i === sel ? ' sel' : '') + '" data-i="' + i + '" style="width:' + (sc.dur * PXS).toFixed(2) + 'px" aria-pressed="' + (i === sel) + '" aria-label="Scene ' + (i + 1) + ', ' + sc.dur.toFixed(1) + ' seconds">' +
      '<canvas width="' + tw * 2 + '" height="' + H * 2 + '"></canvas><span>' + esc(label) + '</span><i>' + sc.dur.toFixed(1) + 's</i></button>';
  }).join('');
  $$('#tlRow canvas').forEach((c, i) => { const sc = TL.scenes[i]; drawFrame(c.getContext('2d'), c.width, c.height, sc.start + Math.min(sc.talk || sc.dur, sc.dur) * 0.5, { thumb: true }); });
  const bars = [];
  TL.scenes.forEach((sc, i) => (sc.ovl || []).forEach((it, k) => {
    const a = sc.start + Math.min(it.at, sc.dur), b = sc.start + itemEnd(sc, it), on = selText && selText.i === i && selText.k === k;
    bars.push('<button type="button" class="tlt' + (on ? ' sel' : '') + '" data-i="' + i + '" data-k="' + k + '" style="left:' + (a * PXS).toFixed(2) + 'px;width:' + Math.max(14, (b - a) * PXS).toFixed(2) + 'px" aria-label="Text: ' + esc(it.text || '') + '">' + esc(it.text || 'Text') + '</button>');
  }));
  $('#tlTxt').hidden = !bars.length;
  $('#tlTxtIn').style.width = (TL.total * PXS).toFixed(2) + 'px';
  $('#tlTxtIn').innerHTML = bars.join('');
  renderSoundLanes();
  tlFollow(playT);
  return true;
}
// Voice and music under the scenes, so it's plain that they're there and where they play
function renderSoundLanes() {
  const px = x => (x * PXS).toFixed(2) + 'px', out = [];
  let row = 0;
  const bar = (cls, a, b, label, aria) => out.push('<button type="button" class="tla ' + cls + '" style="top:' + row * 20 + 'px;left:' + px(a) + ';width:' + px(Math.max(0.3, b - a)) + '" aria-label="' + esc(aria) + '">' + esc(label) + '</button>');
  if (voice) {
    const plan = TL.vo || [{ at: 0, from: 0, len: voice.dur }], runs = [];
    for (const q of plan) {
      const a = q.at, b = Math.min(TL.total, q.at + q.len);
      if (b - a < 0.02) continue;
      const l = runs[runs.length - 1];
      if (l && a - l[1] < 0.05) l[1] = Math.max(l[1], b); else runs.push([a, b]);
    }
    const nm = 'Voice' + (voice.voiceName ? ' · ' + voice.voiceName : voice.rec ? ' · yours' : '');
    runs.forEach((r, k) => bar('v', r[0], r[1], k ? 'Voice' : nm, 'Voiceover. Open Sound'));
    row++;
  } else if (lost.voice) { bar('lost', 0, TL.total, 'Voiceover saved, couldn’t open. Tap', 'Voiceover saved but couldn’t open. Open Sound'); row++; }
  if (music) { bar('m', 0, TL.total, 'Music · ' + music.name, 'Music. Open Sound'); row++; }
  else if (lost.music) { bar('lost', 0, TL.total, 'Music saved, couldn’t open. Tap', 'Music saved but couldn’t open. Open Sound'); row++; }
  $('#tlAud').hidden = !row;
  const inner = $('#tlAudIn');
  inner.style.width = px(TL.total); inner.style.height = row * 20 + 'px';
  inner.innerHTML = out.join('');
}
function opsState() {
  const n = TL.scenes.length, sp = n ? splitInfo(playT) : { ok: false }, dis = busy || aiBusy;
  $$('#tlOps [data-op]').forEach(b => {
    const op = b.dataset.op;
    b.disabled = dis || !n || (op === 'left' && sel < 1) || (op === 'right' && sel >= n - 1) || (op === 'split' && !sp.ok);
  });
  $('#bAddClip').disabled = dis; $('#bAddText').disabled = dis || !n;
  $('#tlSel').textContent = n ? 'Scene ' + (sel + 1) + ' of ' + n : '';
}
const fmtS = x => (Math.round(x * 10) / 10).toFixed(1) + 's';
function renderClipBox() {
  if (selText && !(ovl[selText.i] && ovl[selText.i][selText.k])) selText = null;
  if (selText) return renderTextBox();
  const box = $('#clipBox'), sc = TL.scenes[sel], m = media[sel];
  if (!sc) { emptyBox(); return; }
  box.hidden = false;
  if (!m) {
    const fixed0 = sync && sc.kind !== 'clip';
    box.innerHTML = sceneHead(sc, '', fmtS(sc.dur)) +
      '<div class="btns">' + (fixed0 ? '<span class="tag">Scene length follows the voiceover</span>' : '<span class="tname">Scene length</span><button type="button" class="btn sq" data-act="minus" aria-label="Shorter scene">−</button><output class="slen">' + fmtS(sc.dur) + '</output><button type="button" class="btn sq" data-act="plus" aria-label="Longer scene">+</button>') + '</div>' +
      '<div class="btns"><button type="button" class="primary" data-act="photo">Add photo or clip</button></div>' + transControls();
    return;
  }
  if (m.kind !== 'video') {
    const fixed = sync && sc.kind !== 'clip';
    box.innerHTML = sceneHead(sc, 'photo', fmtS(sc.dur)) +
      '<div class="btns">' + (fixed ? '<span class="tag">Scene length follows the voiceover</span>' : '<span class="tname">Scene length</span><button type="button" class="btn sq" data-act="minus" aria-label="Shorter scene">−</button><output class="slen">' + fmtS(sc.dur) + '</output><button type="button" class="btn sq" data-act="plus" aria-label="Longer scene">+</button>') + '</div>' +
      '<div class="btns"><button type="button" class="btn" data-act="photo">Replace</button><button type="button" class="btn" data-act="unphoto">Remove photo</button></div>' + lookControls(m) + transControls();
    return;
  }
  const sp = m.speed || 1, vol = Math.round((m.vol == null ? 1 : m.vol) * 100);
  const trim = (k, label, v) => '<div class="trim"><div class="tlab"><span>' + label + '</span><output data-out="' + k + '">' + fmtS(v) + '</output></div><div class="trow">' +
    '<button type="button" class="btn sq" data-trim="' + k + '" data-d="-0.1" aria-label="' + label + ' earlier">−</button>' +
    '<input type="range" data-trim="' + k + '" min="0" max="' + m.dur.toFixed(2) + '" step="0.05" value="' + v.toFixed(2) + '" aria-label="' + label + ' of the clip">' +
    '<button type="button" class="btn sq" data-trim="' + k + '" data-d="0.1" aria-label="' + label + ' later">+</button></div></div>';
  box.innerHTML = sceneHead(sc, 'clip', fmtS(clipLen(m)) + ' of ' + fmtS(m.dur)) +
    trim('in', 'Start', m.in) + trim('out', 'End', m.out) +
    '<div class="btns">' + (sync && sc.kind !== 'clip' ? '<span class="tag">Scene length follows the voiceover</span>' : '<span class="tname">Scene length</span><button type="button" class="btn sq" data-act="minus" aria-label="Shorter scene">−</button><output class="slen">' + fmtS(sc.dur) + '</output><button type="button" class="btn sq" data-act="plus" aria-label="Longer scene">+</button>') + '</div>' +
    clipRowButtons(m) +
    '<div class="field"><span class="lbl">Speed</span><div class="seg" role="radiogroup" aria-label="Clip speed">' +
    [0.5, 0.75, 1, 1.5, 2].map(v => '<button type="button" role="radio" data-speed="' + v + '" aria-checked="' + (Math.abs(sp - v) < 1e-6) + '">' + v + '×</button>').join('') + '</div></div>' +
    '<div class="field"><span class="lbl">Clip sound</span><div class="btns tight">' + (m.noAudio ? '<button type="button" class="btn" data-act="sound" disabled>No sound in clip</button>' :
      '<div class="seg" role="radiogroup" aria-label="Clip sound"><button type="button" role="radio" data-act="sound" data-v="off" aria-checked="' + !m.useSound + '">Off</button><button type="button" role="radio" data-act="sound" data-v="on" aria-checked="' + !!m.useSound + '">On</button></div>') +
    '<label class="cvol"><input type="range" data-vol min="0" max="200" step="5" value="' + vol + '" aria-label="Clip volume"' + (m.useSound ? '' : ' disabled') + '><output data-out="vol">' + vol + '%</output></label></div></div>' +
    '<div class="btns"><button type="button" class="btn" data-act="photo">Replace</button><button type="button" class="btn" data-act="unphoto">Remove clip</button></div>' + lookControls(m) + transControls();
}
function lookControls(m) {
  const z = m.zoom || 1, fit = m.fitMode === 'fit';
  const slider = (k, label, min, max, step, v, out) => '<div class="tlab"><span>' + label + '</span><output data-out="' + k + '">' + out + '</output></div><input type="range" data-frz="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '" aria-label="' + label + '">';
  return '<div class="field"><span class="lbl">Filter</span><div class="seg" role="radiogroup" aria-label="Filter">' + FILTERS.map(f => '<button type="button" role="radio" data-flt="' + f[0] + '" aria-checked="' + ((m.filter || 'none') === f[0]) + '">' + f[1] + '</button>').join('') + '</div></div>' +
    '<div class="field"><span class="lbl">Framing</span><div class="btns tight">' +
    '<button type="button" class="btn" data-frm="fill" aria-pressed="' + !fit + '">Fill</button><button type="button" class="btn" data-frm="fit" aria-pressed="' + fit + '">Fit</button>' +
    '<button type="button" class="btn" data-frm="rot">Rotate' + ((m.rot || 0) % 360 ? ' ' + (m.rot % 360) + '°' : '') + '</button><button type="button" class="btn" data-frm="reset">Reset</button></div>' +
    slider('zoom', 'Zoom', 1, 3, 0.05, z, z.toFixed(2).replace(/0$/, '') + '×') +
    slider('px', 'Left · right', -1, 1, 0.02, m.px || 0, '') + slider('py', 'Up · down', -1, 1, 0.02, m.py || 0, '') + '</div>';
}
function transControls() {
  const cur = trans[sel] || '';
  if (sel === 0) return '<div class="field"><span class="lbl">Transition into this scene</span><p class="hint">The first scene starts the video, so it has no transition in.</p></div>';
  return '<div class="field"><span class="lbl">Transition into this scene</span><div class="seg" role="radiogroup" aria-label="Transition">' +
    [['', 'Same as all']].concat(OPTS.trans).map(t => '<button type="button" role="radio" data-trn="' + t[0] + '" aria-checked="' + (cur === t[0]) + '">' + t[1] + '</button>').join('') + '</div></div>';
}
function sceneHead(sc, what, right) {
  return '<div class="cbhead"><b>Scene ' + (sel + 1) + (what ? ' ' + what : '') + '</b><span data-out="len">' + right + '</span></div>' +
    '<p class="cbtext">' + (sc.kind === 'clip' ? 'No words in this scene, just the picture.' : esc(sc.text)) + '</p>' +
    '<button type="button" class="linkbtn" data-tabgo="script">Change the words in Script</button>';
}
function clipRowButtons(m) {
  const locked = !!voice && !sync, whole = m.fit !== 'cut' && !locked, hold = m.endMode === 'hold';
  const opt = (act, v, on, label) => '<button type="button" role="radio" data-act="' + act + '" data-v="' + v + '" aria-checked="' + on + '"' + (locked && act === 'fit' ? ' disabled' : '') + '>' + label + '</button>';
  return '<div class="field"><span class="lbl">Clip length</span><div class="seg" role="radiogroup" aria-label="Clip length">' + opt('fit', 'whole', whole, 'Whole clip') + opt('fit', 'cut', !whole, 'Cut to fit') + '</div>' +
    '<p class="hint">' + (locked ? 'Clips are cut to fit your recording. Use Tap to sync in Sound so whole clips can play.' : whole ? 'The scene stretches so the whole clip plays.' : 'The clip is cut to the length of the scene.') + '</p></div>' +
    '<div class="field"><span class="lbl">When the clip runs out</span><div class="seg" role="radiogroup" aria-label="When the clip runs out">' + opt('endmode', 'loop', !hold, 'Loop') + opt('endmode', 'hold', hold, 'Hold last frame') + '</div></div>';
}
function setTrim(m, k, v) {
  if (k === 'in') m.in = clamp(Math.round(v * 100) / 100, 0, Math.max(0, m.out - 0.1));
  else m.out = clamp(Math.round(v * 100) / 100, Math.min(m.dur, m.in + 0.1), m.dur);
  applyLoop(m);
}
function trimView(k) {
  // show the frame at the trim point while it moves
  LC.clear(); build();
  const sc = TL.scenes[sel], m = media[sel];
  if (!sc || !m) return;
  show(k === 'in' ? sc.start + 0.02 : sc.start + Math.max(0.02, Math.min(sc.dur, clipLen(m)) - 0.06));
  const box = $('#clipBox');
  const o = q => box.querySelector('[data-out="' + q + '"]');
  if (o('in')) o('in').textContent = fmtS(m.in);
  if (o('out')) o('out').textContent = fmtS(m.out);
  if (o('len')) o('len').textContent = fmtS(clipLen(m)) + ' of ' + fmtS(m.dur);
}
const editStart = () => { if (Date.now() - editAt > 1500) remember(); editAt = Date.now(); };

/* ---------- text panel ---------- */
const curItem = () => selText && ovl[selText.i] ? ovl[selText.i][selText.k] : null;
function renderTextBox() {
  const box = $('#clipBox'), it = curItem(), sc = TL.scenes[selText.i];
  if (!it || !sc) { selText = null; return renderClipBox(); }
  box.hidden = false;
  const seg = (attr, list, cur) => '<div class="seg" role="radiogroup">' + list.map(o => '<button type="button" role="radio" ' + attr + '="' + o[0] + '" aria-checked="' + (cur === o[0]) + '"' + (attr === 'data-txf' ? ' style="font-family:' + FONTS[o[0]].fam + '"' : '') + '>' + o[1] + '</button>').join('') + '</div>';
  const end = itemEnd(sc, it);
  box.innerHTML = '<div class="cbhead"><b>Text on scene ' + (selText.i + 1) + '</b><span data-out="span">' + fmtS(it.at) + ' to ' + fmtS(end) + '</span></div>' +
    '<textarea class="txin" data-tx="text" rows="2" aria-label="Text">' + esc(it.text) + '</textarea>' +
    '<p class="hint">Drag the text on the video to move it.</p>' +
    '<div class="field"><div class="tlab"><span>Size</span><output data-out="size">' + Math.round(it.size * 1000) / 10 + '</output></div><input type="range" data-tx="size" min="3" max="14" step="0.5" value="' + (it.size * 100).toFixed(1) + '" aria-label="Text size"></div>' +
    '<div class="field"><span class="lbl">Colour</span><div class="tsws" role="radiogroup">' + TCOLORS.map(c => '<button type="button" class="tsw" role="radio" data-txc="' + c + '" aria-checked="' + (it.color === c) + '" aria-label="Colour ' + c + '" style="--c:' + c + '"></button>').join('') + '</div></div>' +
    '<div class="field"><span class="lbl">Background</span>' + seg('data-txbg', [['box', 'Box'], ['outline', 'Outline'], ['shadow', 'Shadow'], ['none', 'None']], it.bg) + '</div>' +
    '<div class="field"><span class="lbl">Font</span>' + seg('data-txf', OPTS.font, it.font) + '</div>' +
    '<div class="field"><span class="lbl">Animation</span>' + seg('data-txa', [['pop', 'Pop'], ['fade', 'Fade'], ['rise', 'Rise'], ['none', 'None']], it.anim) + '</div>' +
    '<div class="field"><span class="lbl">Timing</span>' +
    '<div class="trow"><span class="tname">Starts</span><button type="button" class="btn sq" data-txt="at" data-d="-0.1" aria-label="Start earlier">−</button><output data-out="at">' + fmtS(it.at) + '</output><button type="button" class="btn sq" data-txt="at" data-d="0.1" aria-label="Start later">+</button></div>' +
    '<div class="trow"><span class="tname">Lasts</span><button type="button" class="btn sq" data-txt="dur" data-d="-0.1" aria-label="Shorter">−</button><output data-out="dur">' + (it.dur == null ? 'to scene end' : fmtS(it.dur)) + '</output><button type="button" class="btn sq" data-txt="dur" data-d="0.1" aria-label="Longer">+</button></div>' +
    '<div class="btns"><button type="button" class="btn" data-txt="end" aria-pressed="' + (it.dur == null) + '">Until scene ends</button></div></div>' +
    '<div class="field"><span class="lbl">Place</span><div class="btns tight"><button type="button" class="btn" data-txp="0.16">Top</button><button type="button" class="btn" data-txp="0.5">Middle</button><button type="button" class="btn" data-txp="0.84">Bottom</button></div></div>' +
    '<div class="btns"><button type="button" class="btn" data-txo="dup">Duplicate text</button><button type="button" class="btn" data-txo="del">Delete text</button><button type="button" class="primary" data-txo="done">Done</button></div>';
}
function addText() {
  if (busy || aiBusy || !TL.scenes.length) return;
  stopPlay();
  const i = sceneAt(playT), sc = TL.scenes[i];
  let at = Math.max(0, playT - sc.start);
  if (at > sc.dur - 0.5) at = 0;
  remember();
  (ovl[i] = ovl[i] || []).push({ text: 'Your text', at: Math.round(at * 10) / 10, dur: null, x: 0.5, y: 0.2, size: 0.065, font: S.font, color: '#ffffff', bg: 'box', anim: 'pop' });
  sel = i; selText = { i, k: ovl[i].length - 1 };
  refresh();
  show(sc.start + at + 0.4);
  const ta = $('#clipBox .txin');
  if (ta) { ta.focus(); ta.select(); }
}
function showItem() {
  // move the playhead to where the selected text is on screen
  const it = curItem(), sc = selText && TL.scenes[selText.i];
  if (!it || !sc) return;
  const end = itemEnd(sc, it);
  if (playT < sc.start + it.at || playT >= sc.start + end) show(sc.start + Math.min(end - 0.05, it.at + 0.45));
}
function textChanged(full) {
  LC.clear(); build();
  if (full) { renderTimeline(); show(playT); } else show(playT);
  queueSave();
}

/* ---------- editing: scene operations and undo ---------- */
// The script stays the source of truth: scene operations rewrite it with one scene per paragraph,
// and each scene's clip, length and stretch of voiceover move with it.
let sel = 0;
const UNDO = [], REDO = [];
const sceneLine = r => r.kind === 'title' ? '# ' + r.text : r.kind === 'clip' ? '[clip]' : r.text;
function rows() {
  return TL.scenes.map((sc, i) => ({ kind: sc.kind, text: sc.text, m: media[i] || null, d: durOv[i], v: sync && sync[i] ? { from: sync[i].from, len: sync[i].len } : null, o: (ovl[i] || []).map(o => Object.assign({}, o)), tr: trans[i] || null }));
}
function applyRows(list, pick, pre) {
  const script = list.map(sceneLine).join('\n\n'), check = parse(script);
  if (check.length !== list.length || check.some((c, i) => c.kind !== list[i].kind || c.text !== list[i].text)) {
    if (pre) for (const [m, v] of pre.ms) { const o = Object.assign({}, v); delete o._look; Object.assign(m, o); applyLoop(m); }
    $('#photoNote').textContent = 'That change would alter the wording of a scene, so it wasn’t made. Edit the script instead.';
    return false;
  }
  const voiceOk = !!(voice && (voice.made || voice.rec) && voice.key === scriptKey()), hadSync = !!sync;
  remember(pre);
  S.script = script; $('#script').value = script;
  media = list.map(r => r.m || null); durOv = list.map(r => r.d); ovl = list.map(r => r.o || []); trans = list.map(r => r.tr || null); selText = null;
  sync = hadSync ? list.map(r => r.v || { from: 0, len: 0 }) : null;
  sel = clamp(pick == null ? sel : pick, 0, Math.max(0, list.length - 1));
  build();
  if (voiceOk) voice.key = scriptKey();
  const sc = TL.scenes[sel];
  if (sc) playT = sc.start;
  refresh();
  return true;
}
async function cloneMedia(m) {
  if (!m) return null;
  if (m.kind !== 'video') return Object.assign({}, m);
  const c = await loadClip(m.file);
  Object.assign(c, pickF(m, CLIPF), pickF(m, LOOKF), { audio: m.audio, noAudio: m.noAudio, name: m.name });
  applyLoop(c);
  return c;
}
// the quietest moment near t in the voice, so a split never cuts a word in half
function quietNear(buf, t, win) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, step = Math.round(sr * 0.01);
  let best = t, low = Infinity;
  for (let x = Math.max(0, t - win); x <= Math.min(buf.duration, t + win); x += 0.01) {
    const a = Math.floor(x * sr); let e = 0;
    for (let k = a; k < Math.min(d.length, a + step); k++) e += d[k] * d[k];
    const w = e + Math.abs(x - t) * 1e-4;
    if (w < low) { low = w; best = x; }
  }
  return best;
}
const sharedClip = i => { const m = media[i]; return !!m && m.kind === 'video' && (media[i - 1] === m || media[i + 1] === m); };
function splitInfo(t) {
  // what Split would do with the playhead at time t
  const i = sceneAt(t), sc = TL.scenes[i];
  if (!sc) return { ok: false };
  const lt = t - sc.start, m = media[i];
  if (m && m.kind === 'video') {
    if (sharedClip(i)) return { ok: false, why: 'This clip runs across more than one scene, so it can’t be split.' };
    if (lt < 0.15 || lt > clipLen(m) - 0.15) return { ok: false, why: 'Move the playhead inside the clip to split it.' };
    return { ok: true, i, kind: 'clip', lt };
  }
  if (sc.words.length < 2) return { ok: false, why: 'Move the playhead into a scene with a clip or at least two words.' };
  let k = 0;
  while (k < sc.words.length && (sc.wt[k].t0 + sc.wt[k].t1) / 2 < lt) k++;
  k = clamp(k, 1, sc.words.length - 1);
  return { ok: true, i, kind: 'words', k };
}
async function sceneOp(op) {
  if (busy || aiBusy) return;
  const n = TL.scenes.length;
  if (op !== 'split' && (sel < 0 || sel >= n)) return;
  stopPlay();
  const list = rows(), i = sel, r = list[i];
  if (op === 'left') { if (i < 1) return; [list[i - 1], list[i]] = [list[i], list[i - 1]]; return applyRows(list, i - 1); }
  if (op === 'right') { if (i >= n - 1) return; [list[i + 1], list[i]] = [list[i], list[i + 1]]; return applyRows(list, i + 1); }
  if (op === 'del') { list.splice(i, 1); return applyRows(list, Math.min(i, list.length - 1)); }
  if (op === 'dup') { list.splice(i + 1, 0, Object.assign({}, r, { m: await cloneMedia(r.m) })); return applyRows(list, i + 1); }
  if (op === 'split') {
    const info = splitInfo(playT);
    if (!info.ok) { $('#photoNote').textContent = info.why || 'Nothing to split here.'; return; }
    const j = info.i, q = list[j], sc = TL.scenes[j];
    if (info.kind === 'clip') {
      const m = q.m, cut = m.in + info.lt * (m.speed || 1), m2 = await cloneMedia(m), pre = snap();
      m2.in = cut; m.out = cut; applyLoop(m); applyLoop(m2);
      const o = q.o || [];
      q.o = o.filter(t => t.at < info.lt);
      list.splice(j + 1, 0, { kind: 'clip', text: '', m: m2, d: undefined, tr: 'cut', v: sync ? { from: 0, len: 0 } : null, o: o.filter(t => t.at >= info.lt).map(t => Object.assign(t, { at: Math.round((t.at - info.lt) * 100) / 100 })) });
      return applyRows(list, j + 1, pre);
    }
    const w = sc.words, k = info.k;
    let v1 = q.v, v2 = q.v;
    if (q.v && voice) {
      let c = quietNear(voice.buffer, q.v.from + sc.wt[k].t0, 0.25) - q.v.from;
      c = clamp(c, 0.05, Math.max(0.05, q.v.len - 0.05));
      v1 = { from: q.v.from, len: c }; v2 = { from: q.v.from + c, len: Math.max(0, q.v.len - c) };
    }
    const cutT = v1 && v1.len != null && q.v ? v1.len : sc.wt[k].t0, o = q.o || [];
    list.splice(j, 1, { kind: q.kind, text: w.slice(0, k).join(' '), m: q.m, d: undefined, v: v1, o: o.filter(t => t.at < cutT) },
      { kind: q.kind, text: w.slice(k).join(' '), m: q.m, d: undefined, tr: 'cut', v: v2, o: o.filter(t => t.at >= cutT).map(t => Object.assign(t, { at: Math.round((t.at - cutT) * 100) / 100 })) });
    return applyRows(list, j + 1);
  }
}
async function addScenes(files) {
  const got = [];
  let failed = 0;
  for (const f of files) { try { got.push(await loadMedia(f)); } catch (err) { failed++; console.warn(err); } }
  if (!got.length) { $('#photoNote').textContent = 'Those files couldn’t be opened. Try JPG or PNG photos, or MP4 clips.'; return; }
  const list = rows(), at = TL.scenes.length ? sel + 1 : 0;
  list.splice(at, 0, ...got.map(m => ({ kind: 'clip', text: '', m, d: m.kind === 'video' ? undefined : 3, v: sync ? { from: 0, len: 0 } : null, o: [] })));
  applyRows(list, at);
  $('#photoNote').textContent = failed ? failed + ' file' + (failed === 1 ? '' : 's') + ' couldn’t be opened. The rest were added.' : got.length + (got.length === 1 ? ' scene added.' : ' scenes added.');
}
function snap() {
  const ms = new Map();
  for (const m of media) if (m && !ms.has(m)) ms.set(m, Object.assign(m.kind === 'video' ? pickF(m, CLIPF) : {}, pickF(m, LOOKF), { _look: LOOKF.filter(k => m[k] === undefined) }));
  return { script: S.script, media: media.slice(), durOv: durOv.slice(), sync: sync ? sync.map(r => ({ from: r.from, len: r.len })) : null, voice, voiceKey: voice ? voice.key : null, music, ms, sel, ovl: ovl.map(a => (a || []).map(o => Object.assign({}, o))), capY: S.capY, trans: trans.slice() };
}
function remember(pre) {
  UNDO.push(pre || snap()); if (UNDO.length > 30) UNDO.shift();
  REDO.length = 0; undoUI();
}
function restore(st) {
  S.script = st.script; $('#script').value = st.script;
  media = st.media.slice(); durOv = st.durOv.slice(); sync = st.sync ? st.sync.map(r => ({ from: r.from, len: r.len })) : null;
  voice = st.voice; if (voice && st.voiceKey != null) voice.key = st.voiceKey;
  music = st.music;
  for (const [m, v] of st.ms) { for (const k of v._look || []) delete m[k]; const o = Object.assign({}, v); delete o._look; Object.assign(m, o); applyLoop(m); }
  sel = st.sel || 0; selText = null;
  trans = (st.trans || []).slice();
  ovl = (st.ovl || []).map(a => (a || []).map(o => Object.assign({}, o)));
  S.capY = st.capY == null ? null : st.capY;
  refresh();
}
function undo() { if (!UNDO.length || busy || aiBusy) return; stopPlay(); REDO.push(snap()); restore(UNDO.pop()); undoUI(); }
function redo() { if (!REDO.length || busy || aiBusy) return; stopPlay(); UNDO.push(snap()); restore(REDO.pop()); undoUI(); }
function undoUI() {
  const u = $('#bUndo'), r = $('#bRedo');
  if (u) u.disabled = !UNDO.length || busy;
  if (r) r.disabled = !REDO.length || busy;
}

/* ---------- events ---------- */
$('#play').addEventListener('click', () => { if (playing) { stopPlay(); show(playT); } else play(); });
$('#seek').addEventListener('input', e => { stopPlay(); show(e.target.value / 1000 * TL.total); });
$('#go').addEventListener('click', startExport);
$('#jobCancel').addEventListener('click', () => { if (JOB) JOB.cancel = true; else $('#job').hidden = true; });
$('#share').addEventListener('click', async () => {
  const f = outFile();
  if (!f) return;
  const b = $('#share'); b.disabled = true;
  try { await navigator.share({ files: [f], title: f.name }); saveUI('Done.'); }
  catch (e) { if (!e || e.name !== 'AbortError') saveUI('That didn’t work here. Try Download instead.'); }
  finally { b.disabled = false; }
});
$('#save').addEventListener('click', async () => {
  if (!DL || !lastOut) return;
  const b = $('#save'); b.disabled = true;
  try { const r = await DL.save({ filename: lastOut.name, data: lastOut.blob }); saveUI(r && r.status === 'delivered' ? 'Sent.' : 'Saved.'); }
  catch (e) {
    const c = e && e.code;
    if (['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(c)) { DL = null; saveUI('Saving isn’t available in this view.'); }
    else saveUI(c === 'declined' ? 'Not saved.' : c === 'rate_limited' ? 'Another save is still open. Try again in a moment.' : c === 'too_large' ? 'This file is too large to save here. Try 720p.' : 'Couldn’t save the video. Try again.');
  } finally { b.disabled = false; }
});
let typing = 0;
let typedAt = 0;
$('#script').addEventListener('input', e => { if (Date.now() - typedAt > 2500) remember(); typedAt = Date.now(); clearTimeout(typing); typing = setTimeout(() => { S.script = e.target.value; refresh(); }, 280); });
$('#bNew').addEventListener('click', newProject);
$('#bProjects').addEventListener('click', openProjects);
$('#projClose').addEventListener('click', closeProjects);
$('#projNew').addEventListener('click', newProject);
$('#projList').addEventListener('click', e => {
  const b = e.target.closest('[data-pact]'), li = e.target.closest('.proj');
  if (!b || !li) return;
  const id = li.dataset.id, a = b.dataset.pact;
  if (a !== 'del') delArmed = null;
  if (a === 'open') openProject(id);
  else if (a === 'ren') { renaming = id; renderProjects(); }
  else if (a === 'save') { const v = li.querySelector('.pren').value; renaming = null; renameProject(id, v); }
  else if (a === 'copy') copyProject(id);
  else if (a === 'del') { if (delArmed === id) { delArmed = null; deleteProject(id); } else { delArmed = id; renderProjects(); } }
});
$('#projList').addEventListener('keydown', e => { if (e.target.classList.contains('pren') && e.key === 'Enter') { e.preventDefault(); const li = e.target.closest('.proj'); renaming = null; renameProject(li.dataset.id, e.target.value); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#projDlg').hidden) closeProjects(); });
$('#bClear').addEventListener('click', () => { if (busy || !$('#script').value) return; clearTimeout(typing); S.script = $('#script').value; remember(); S.script = ''; $('#script').value = ''; refresh(); $('#script').focus(); });
$('#bSample').addEventListener('click', () => { if (busy) return; clearTimeout(typing); S.script = $('#script').value; remember(); S.script = SAMPLE; $('#script').value = SAMPLE; playT = 0.9; refresh(); });
if ($('#scenes')) $('#scenes').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || busy) return;
  sceneAct(b.dataset.act, +b.closest('li').dataset.i, b);
});
function sceneAct(act, i, b) {
  const sc = TL.scenes[i];
  if (!sc) return;
  if (act === 'seek') { stopPlay(); sel = i; selText = null; show(sc.start + Math.min(sc.dur * 0.6, 1.2)); renderTimeline(); }
  else if (act === 'minus' || act === 'plus') { remember(); durOv[i] = clamp(Math.round((sc.dur + (act === 'plus' ? 0.5 : -0.5)) * 2) / 2, 0.5, MAXCLIP); playT = sc.start; refresh(); }
  else if (act === 'photo') { pendingImg = i; $('#fPhoto').click(); }
  else if (act === 'unphoto') { remember(); media[i] = null; refresh(); }
  else if (act === 'fit' && media[i]) { const m = media[i], now = m.fit === 'cut' ? 'cut' : 'whole', v = b && b.dataset.v || (now === 'cut' ? 'whole' : 'cut'); if (v === now) return; remember(); m.fit = v; playT = sc.start; refresh(); }
  else if (act === 'endmode' && media[i]) { const m = media[i], now = m.endMode === 'hold' ? 'hold' : 'loop', v = b && b.dataset.v || (now === 'hold' ? 'loop' : 'hold'); if (v === now) return; remember(); m.endMode = v; applyLoop(m); refresh(); }
  else if (act === 'sound' && media[i]) {
    const m = media[i];
    if (b && b.dataset.v && (b.dataset.v === 'on') === !!m.useSound) return;
    remember();
    if (m.useSound) { m.useSound = false; refresh(); return; }
    b.disabled = true; b.textContent = 'Reading sound…'; getCtx();
    ensureClipAudio(m).then(() => { m.useSound = !!m.audio; refresh(); if (m.noAudio) $('#photoNote').textContent = 'That clip has no sound this browser can read.'; });
  }
}
$('#bPhotos').addEventListener('click', () => $('#fPhotos').click());
$('#bPhotosX').addEventListener('click', () => { remember(); media = []; refresh(); });
$('#bAuto').addEventListener('click', () => { remember(); durOv = []; sync = null; refresh(); });
$('#fPhotos').addEventListener('change', async e => {
  const files = Array.from(e.target.files || []).slice(0, 40); e.target.value = '';
  if (!files.length) return;
  const note = $('#photoNote'), was = note.textContent;
  note.textContent = 'Opening ' + files.length + (files.length === 1 ? ' file…' : ' files…');
  const got = [];
  let failed = 0;
  for (const f of files) { try { got.push(await loadMedia(f)); } catch (err) { failed++; console.warn(err); } }
  note.textContent = !got.length ? 'Those files couldn’t be opened. Try JPG or PNG photos, or MP4 clips.' : failed ? failed + ' file' + (failed === 1 ? '' : 's') + ' couldn’t be opened. The rest were added.' : was;
  if (!got.length) return;
  remember();
  media = [];
  // the same file reused further down gets its own copy, so editing one scene's clip leaves the others alone
  const n = Math.max(1, TL.scenes.length), seen = new Map();
  for (let i = 0; i < n; i++) {
    const g = got[i % got.length];
    media[i] = !seen.has(g) || media[i - 1] === seen.get(g) ? g : await cloneMedia(g);
    seen.set(g, media[i]);
  }
  refresh();
});
$('#fPhoto').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f || pendingImg < 0) return;
  $('#photoNote').textContent = 'Opening ' + (f.name || 'file') + '…';
  try { const m = await loadMedia(f); remember(); media[pendingImg] = m; renderPhotoNote(); refresh(); }
  catch (err) { $('#photoNote').textContent = 'That file couldn’t be opened. Try a JPG or PNG photo, or an MP4 clip.'; }
});
$('#bVoice').addEventListener('click', () => { getCtx(); $('#fVoice').click(); });
$('#bMusic').addEventListener('click', () => { getCtx(); $('#fMusic').click(); });
$('#fVoice').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f) return;
  $('#voiceNote').textContent = 'Reading ' + f.name + '…';
  try { const b = await decodeFile(f); remember(); voice = { buffer: b, dur: b.duration, name: f.name, file: f }; sync = null; durOv = []; refresh(); }
  catch (err) { renderAudio(); $('#voiceNote').textContent = 'That file couldn’t be read. Try MP3, M4A or WAV.'; }
});
$('#fMusic').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f) return;
  $('#musicNote').textContent = 'Reading ' + f.name + '…';
  try { const b = await decodeFile(f); remember(); music = { buffer: b, dur: b.duration, name: f.name, file: f }; refresh(); }
  catch (err) { renderAudio(); $('#musicNote').textContent = 'That file couldn’t be read. Try MP3, M4A or WAV.'; }
});
$('#bVoiceX').addEventListener('click', () => { remember(); voice = null; sync = null; lost.voice = null; refresh(); });
$('#bMake').addEventListener('click', makeVoice);
$('#bHear').addEventListener('click', hearVoice);
$('#bStop').addEventListener('click', () => { if (aiBusy) { aiStop = true; aiNoteSet('Stopping…'); } });
$('#bPlayVoice').addEventListener('click', playFromStart);
$('#bSaveVoice').addEventListener('click', saveVoice);
$('#aiSpeed').addEventListener('input', e => { S.aiSpeed = clamp(+e.target.value, 0.8, 1.2); $('#aiSpeedVal').textContent = S.aiSpeed.toFixed(2).replace(/0$/, '') + '×'; save(); });
$('#bMusicX').addEventListener('click', () => { remember(); music = null; lost.music = null; refresh(); });
$('#bSync').addEventListener('click', () => { getCtx(); openSync(); });
$('#syncBtn').addEventListener('click', syncTap);
$('#syncCancel').addEventListener('click', closeSync);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && SY) { e.preventDefault(); closeSync(); } });
$('#vol').addEventListener('input', e => { S.musicVol = clamp(e.target.value / 100, 0, 1); $('#volVal').textContent = Math.round(S.musicVol * 100) + '%'; stopPlay(); save(); });
$('#pace').addEventListener('input', e => { S.wpm = +e.target.value; $('#paceVal').textContent = S.wpm + ' words a minute'; clearTimeout(typing); typing = setTimeout(refresh, 120); });
$('#tUpper').addEventListener('change', e => { S.upper = e.target.checked; changed(); });
$('#tProg').addEventListener('change', e => { S.progress = e.target.checked; save(); show(playT); });
$('#handle').addEventListener('input', e => { S.handle = e.target.value; save(); show(playT); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-key] [data-v]');
  if (!b || busy) return;
  const key = b.closest('[data-key]').dataset.key, v = key === 'quality' ? +b.dataset.v : b.dataset.v;
  if (key === 'pos' && S.capY != null) { S.capY = null; S.pos = v; changed(); return; }
  if (S[key] === v) return;
  if (key === 'aiVoice' && aiBusy) return;
  S[key] = v;
  if (key === 'look') { S.font = LOOKS[v].font; S.upper = LOOKS[v].upper; }
  if (key === 'quality' || key === 'aiVoice') { renderChips(); save(); return; }
  changed();
});


/* ---------- timeline events ---------- */
$('#tlStrip').addEventListener('scroll', () => {
  const st = $('#tlStrip');
  if (tlAuto >= 0 && Math.abs(st.scrollLeft - tlAuto) <= 2) { tlAuto = -1; return; }
  tlAuto = -1;
  if (busy) return;
  if (playing) stopPlay();
  cancelAnimationFrame(tlRaf);
  tlRaf = requestAnimationFrame(() => show(clamp(st.scrollLeft / PXS, 0, TL.total)));
}, { passive: true });
$('#tlRow').addEventListener('click', e => {
  const b = e.target.closest('.tlb');
  if (!b || busy) return;
  sel = +b.dataset.i;
  if (selText) { selText = null; renderTimeline(); show(playT); return; }
  $$('#tlRow .tlb').forEach(x => { const on = +x.dataset.i === sel; x.classList.toggle('sel', on); x.setAttribute('aria-pressed', on); });
  renderClipBox(); opsState();
});
$('#tlOps').addEventListener('click', e => { const b = e.target.closest('[data-op]'); if (b && !b.disabled) sceneOp(b.dataset.op); });
$('#bUndo').addEventListener('click', undo);
$('#bRedo').addEventListener('click', redo);
$('#bAddClip').addEventListener('click', () => $('#fAdd').click());
$('#fAdd').addEventListener('change', e => {
  const files = Array.from(e.target.files || []).slice(0, 40); e.target.value = '';
  if (files.length) { $('#photoNote').textContent = 'Opening ' + files.length + (files.length === 1 ? ' file…' : ' files…'); addScenes(files); }
});
$('#clipBox').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || busy || b.disabled) return;
  const m = media[sel];
  if (b.dataset.act) return sceneAct(b.dataset.act, sel, b);
  if (b.dataset.trim && m && m.kind === 'video') { remember(); setTrim(m, b.dataset.trim, (b.dataset.trim === 'in' ? m.in : m.out) + +b.dataset.d); refresh(); trimView(b.dataset.trim); return; }
  if (b.dataset.speed && m && m.kind === 'video') { remember(); m.speed = +b.dataset.speed; refresh(); }
});
$('#clipBox').addEventListener('input', e => {
  const t = e.target, m = media[sel];
  if (!m || m.kind !== 'video' || busy) return;
  if (t.dataset.trim) { editStart(); setTrim(m, t.dataset.trim, +t.value); trimView(t.dataset.trim); }
  else if (t.hasAttribute('data-vol')) { editStart(); m.vol = clamp(+t.value / 100, 0, 2); const o = $('#clipBox [data-out="vol"]'); if (o) o.textContent = Math.round(m.vol * 100) + '%'; queueSave(); }
});
$('#clipBox').addEventListener('change', e => { if (e.target.dataset.trim) { const k = e.target.dataset.trim; refresh(); trimView(k); } });
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const tag = (e.target && e.target.tagName) || '';
  if (/^(TEXTAREA|INPUT)$/.test(tag) && e.target.type !== 'range') return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
});

/* ---------- text events ---------- */
$('#bAddText').addEventListener('click', addText);
$('#tlTxtIn').addEventListener('click', e => {
  const b = e.target.closest('.tlt');
  if (!b || busy) return;
  stopPlay();
  selText = { i: +b.dataset.i, k: +b.dataset.k }; sel = selText.i;
  renderTimeline(); showItem();
});
$('#clipBox').addEventListener('click', e => {
  const b = e.target.closest('button');
  const it = curItem();
  if (!b || !it || busy || b.disabled) return;
  const sc = TL.scenes[selText.i];
  if (b.dataset.txc) { remember(); it.color = b.dataset.txc; textChanged(true); }
  else if (b.dataset.txbg) { remember(); it.bg = b.dataset.txbg; textChanged(true); }
  else if (b.dataset.txf) { remember(); it.font = b.dataset.txf; textChanged(true); }
  else if (b.dataset.txa) { remember(); it.anim = b.dataset.txa; textChanged(true); show(sc.start + it.at + 0.02); }
  else if (b.dataset.txp) { remember(); it.y = +b.dataset.txp; it.x = 0.5; textChanged(true); }
  else if (b.dataset.txt === 'at') { remember(); it.at = clamp(Math.round((it.at + +b.dataset.d) * 10) / 10, 0, Math.max(0, sc.dur - 0.2)); textChanged(true); showItem(); }
  else if (b.dataset.txt === 'dur') { remember(); const cur = it.dur == null ? itemEnd(sc, it) - it.at : it.dur; it.dur = clamp(Math.round((cur + +b.dataset.d) * 10) / 10, 0.3, MAXCLIP); textChanged(true); }
  else if (b.dataset.txt === 'end') { remember(); it.dur = it.dur == null ? Math.max(0.3, Math.round((sc.dur - it.at) * 10) / 10) : null; textChanged(true); }
  else if (b.dataset.txo === 'dup') { remember(); const c = Object.assign({}, it, { y: clamp(it.y + 0.08, 0.04, 0.96) }); ovl[selText.i].push(c); selText = { i: selText.i, k: ovl[selText.i].length - 1 }; textChanged(true); }
  else if (b.dataset.txo === 'del') { remember(); ovl[selText.i].splice(selText.k, 1); selText = null; textChanged(true); }
  else if (b.dataset.txo === 'done') { selText = null; renderTimeline(); show(playT); }
}, true);
$('#clipBox').addEventListener('input', e => {
  const t = e.target, it = curItem();
  if (!it || busy) return;
  if (t.dataset.tx === 'text') { editStart(); it.text = t.value.slice(0, 200); textChanged(false); const bar = $('#tlTxtIn .tlt.sel'); if (bar) bar.textContent = it.text || 'Text'; }
  else if (t.dataset.tx === 'size') { editStart(); it.size = clamp(+t.value / 100, 0.03, 0.14); const o = $('#clipBox [data-out="size"]'); if (o) o.textContent = Math.round(it.size * 1000) / 10; textChanged(false); }
}, true);
$('#clipBox').addEventListener('change', e => { if (curItem() && e.target.dataset.tx) { LC.clear(); build(); renderStrip(); show(playT); queueSave(); } }, true);
// drag text and captions on the preview
let drag = null;
function cvPoint(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
function hitAt(pt) {
  for (let k = HITS.length - 1; k >= 0; k--) { const h = HITS[k]; if (pt.x >= h.x0 && pt.x <= h.x1 && pt.y >= h.y0 && pt.y <= h.y1) return h; }
  return null;
}
cv.addEventListener('touchstart', e => { const t = e.touches[0], h = !busy && t && e.touches.length === 1 ? hitAt(cvPoint(t)) : null; if (h && (h.kind === 'text' || selCap)) e.preventDefault(); }, { passive: false });
cv.addEventListener('pointerdown', e => {
  if (busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const pt = cvPoint(e), h = hitAt(pt);
  if (!h) { if (selText || selCap) { selText = null; selCap = false; renderTimeline(); show(playT); } return; }
  if (h.kind === 'cap' && !selCap) { selCap = true; if (selText) { selText = null; renderTimeline(); } show(playT); $('#photoNote').textContent = 'Captions selected. Drag them up or down on the video.'; return; }
  e.preventDefault();
  if (playing) stopPlay();
  if (h.kind === 'text') selCap = false;
  let ox = 0.5, oy = S.capY != null ? S.capY : 0.5;
  if (h.kind === 'text') {
    const it = ovl[h.i] && ovl[h.i][h.k];
    if (!it) return;
    if (!selText || selText.i !== h.i || selText.k !== h.k) { selText = { i: h.i, k: h.k }; sel = h.i; renderTimeline(); }
    ox = it.x; oy = it.y;
  } else if (S.capY == null) oy = S.pos === 'lower' ? FORMATS[S.format].lowerY : 0.5;
  drag = { h, x0: pt.x, y0: pt.y, ox, oy, moved: false, id: e.pointerId };
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
});
cv.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const pt = cvPoint(e);
  if (!drag.moved && Math.hypot(pt.x - drag.x0, pt.y - drag.y0) < cv.width / 90) return;
  if (!drag.moved) { remember(); drag.moved = true; }
  const dx = (pt.x - drag.x0) / cv.width, dy = (pt.y - drag.y0) / cv.height;
  if (drag.h.kind === 'text') {
    const it = ovl[drag.h.i] && ovl[drag.h.i][drag.h.k];
    if (!it) return;
    let x = clamp(drag.ox + dx, 0.06, 0.94);
    if (Math.abs(x - 0.5) < 0.025) x = 0.5;
    it.x = x; it.y = clamp(drag.oy + dy, 0.04, 0.96);
  } else S.capY = clamp(drag.oy + dy, 0.12, 0.88);
  show(playT);
});
function endDrag(e) {
  if (!drag || (e && e.pointerId !== drag.id)) return;
  const moved = drag.moved, kind = drag.h.kind;
  drag = null;
  if (!moved) return;
  if (kind === 'cap') { save(); renderChips(); }
  textChanged(true);
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

/* ---------- sound events ---------- */
$('#bRec').addEventListener('click', () => { getCtx(); openRec(); });
$('#recBtn').addEventListener('click', recTap);
$('#recStop').addEventListener('click', recFinish);
$('#recCancel').addEventListener('click', closeRec);
$('#recFrom').addEventListener('click', e => {
  const b = e.target.closest('[data-from]');
  if (!b || !REC || REC.state !== 'ready') return;
  REC.pos = REC.pos0 = +b.dataset.from; REC.partial = REC.pos0 > 0;
  $$('#recFrom [data-from]').forEach(x => x.setAttribute('aria-pressed', x === b));
  recShow();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && REC && REC.state !== 'processing') { e.preventDefault(); closeRec(); } });
$('#vvol').addEventListener('input', e => { S.voiceVol = clamp(+e.target.value / 100, 0, 2); $('#vvVal').textContent = Math.round(S.voiceVol * 100) + '%'; save(); });
$('#tDuck').addEventListener('change', e => { S.duck = e.target.checked; save(); });

/* ---------- look events ---------- */
$('#clipBox').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || busy || b.disabled || selText) return;
  const m = media[sel];
  if (b.dataset.trn != null) { remember(); trans[sel] = b.dataset.trn || null; refresh(); show(TL.scenes[sel] ? TL.scenes[sel].start : playT); return; }
  if (!m) return;
  if (b.dataset.flt) { remember(); m.filter = b.dataset.flt === 'none' ? undefined : b.dataset.flt; refresh(); }
  else if (b.dataset.frm === 'fill' || b.dataset.frm === 'fit') { remember(); m.fitMode = b.dataset.frm === 'fit' ? 'fit' : undefined; refresh(); }
  else if (b.dataset.frm === 'rot') { remember(); m.rot = ((m.rot || 0) + 90) % 360 || undefined; refresh(); }
  else if (b.dataset.frm === 'reset') { remember(); for (const k of LOOKF) if (k !== 'filter') delete m[k]; refresh(); }
});
$('#clipBox').addEventListener('input', e => {
  const t = e.target, m = media[sel], k = t.dataset.frz;
  if (!k || !m || busy || selText) return;
  editStart();
  m[k] = clamp(+t.value, k === 'zoom' ? 1 : -1, k === 'zoom' ? 3 : 1);
  if (k === 'zoom') { const o = $('#clipBox [data-out="zoom"]'); if (o) o.textContent = m.zoom.toFixed(2).replace(/0$/, '') + '×'; }
  LC.clear(); show(playT);
});
$('#clipBox').addEventListener('change', e => { if (e.target.dataset.frz && !selText) { renderStrip(); scheduleThumbs(); queueSave(); } });

/* ---------- tabs ---------- */
const TABKEY = 'script-to-video:tab';
function setTab(t, scroll) {
  if (!document.querySelector('[data-pane="' + t + '"]')) t = 'edit';
  $$('.tabs [role=tab]').forEach(b => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  $$('.tabpanel').forEach(p => { p.hidden = p.dataset.pane !== t; });
  try { localStorage.setItem(TABKEY, t); } catch (e) {}
  if (t === 'sound') engineWarm();
  if (scroll) { const tb = $('.tabs'); if (tb) tb.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
$('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; const stuck = $('.tabs').getBoundingClientRect().top <= 2; setTab(b.dataset.tab); if (stuck) $('#panel').scrollIntoView({ block: 'start' }); });
$('.tabs').addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const all = $$('.tabs [role=tab]'), k = all.findIndex(b => b.getAttribute('aria-selected') === 'true');
  const nx = all[(k + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
  e.preventDefault(); setTab(nx.dataset.tab); nx.focus();
});
$('#bToExport').addEventListener('click', () => setTab('export', true));
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tabgo]');
  if (!b) return;
  setTab(b.dataset.tabgo, true);
  if (b.dataset.tabgo === 'script') setTimeout(() => { try { $('#script').focus({ preventScroll: true }); } catch (err) {} }, 350);
});
// picking something on the timeline or the video opens its tools
$('#tlRow').addEventListener('click', e => { if (e.target.closest('.tlb')) setTab('edit'); });
$('#tlTxtIn').addEventListener('click', e => { if (e.target.closest('.tlt')) setTab('edit'); });
$('#tlAudIn').addEventListener('click', e => { if (e.target.closest('.tla')) { stopPlay(); setTab('sound'); } });
$('#bAddText').addEventListener('click', () => setTab('edit'));
$('#bAddClip').addEventListener('click', () => setTab('edit'));
cv.addEventListener('pointerdown', () => { if (selText) setTab('edit'); });
setTab((() => { try { return localStorage.getItem(TABKEY) || 'edit'; } catch (e) { return 'edit'; } })());

/* ---------- website check: notice when the site's security settings block the tool ---------- */
function serverNotice(what) {
  let el = $('#serverNote');
  if (!el) { el = document.createElement('p'); el.id = 'serverNote'; el.className = 'notice'; el.setAttribute('role', 'status'); document.querySelector('.top').after(el); }
  el.textContent = 'This website is blocking ' + what + ' with its security settings. If you just added the tool, restart the site so its new settings load (in VPS Control Center, deploy Blog again).';
}
const cspSeen = new Set();
document.addEventListener('securitypolicyviolation', e => {
  const d = e.effectiveDirective || e.violatedDirective || '', u = String(e.blockedURI || ''), src = String(e.sourceFile || '');
  // ignore anything the site or Cloudflare adds to the page (analytics, bot checks); only this tool's own files count
  const ours = u === 'blob' || u.startsWith('blob:') || u === 'wasm-eval' || (u.startsWith(location.origin) && u.includes('/video/')) || ((u === 'eval' || u === 'inline') && src.includes('/video/'));
  if (!ours || cspSeen.has(d)) return;
  cspSeen.add(d);
  serverNotice(/media/.test(d) ? 'video playback' : /script|worker|wasm/.test(d) ? 'part of the tool' : 'part of the tool');
});
if (window.top === window && location.protocol.startsWith('http')) {
  fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(r => {
    const csp = r.headers.get('content-security-policy') || '';
    if (csp && !/wasm-unsafe-eval|'unsafe-eval'/.test(csp)) serverNotice('the AI voice engine');
    else if (csp && !r.headers.get('cross-origin-embedder-policy')) { slowVoiceHint = true; if (!aiBusy) aiNoteSet(aiDefaultNote()); }
  }).catch(() => {});
}

/* ---------- start ---------- */
$('#script').value = S.script; $('#handle').value = S.handle;
renderChips(); build(); sizePreview(); renderScenes(); renderAudio(); renderTimeline(); show(Math.min(0.9, TL.total));
$('#ver').textContent = 'Version ' + VERSION;
(async () => {
  try {
    const ix = await getIndex();
    curId = ix.current && ix.list.some(x => x.id === ix.current) ? ix.current : ix.list[0].id;
    setProjName();
    await restoreProject(curId);
  } catch (e) { console.warn('[script-to-video] projects unavailable', e); }
})();
const screenObserver = new ResizeObserver(() => { if (busy) return; sizePreview(); show(playT); });
screenObserver.observe($('#screen'));
const redrawAll = () => { if (busy) return; LC.clear(); show(playT); scheduleThumbs(); };
window.addEventListener('load', () => { fontsReady().then(redrawAll); });
if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', redrawAll);
const hasClaude = () => !!(window.claude && typeof window.claude.use === 'function');
function useClaudeSaving() {
  IN_CLAUDE = true;
  window.claude.use('downloads').then(d => { DL = d || null; if (lastOut) saveUI(); renderAudio(); }).catch(() => { DL = null; });
}
function useNormalDownloads() {
  // Your own copy on any website: save with a normal download.
  DL = { save: o => new Promise(res => {
    const url = URL.createObjectURL(o.data instanceof Blob ? o.data : new Blob([o.data]));
    const a = document.createElement('a'); a.href = url; a.download = o.filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    res({ status: 'saved' });
  }) };
  if (lastOut) saveUI();
  renderAudio();
}
if (hasClaude()) useClaudeSaving();
else setTimeout(() => { if (hasClaude()) useClaudeSaving(); else useNormalDownloads(); }, 1200);
window.__stvVoice = () => ({ threads: vwThreads, saidLines: said.size, warm: warmAsked, coi: !!window.crossOriginIsolated, audio: actx ? actx.state : null, voice: voice ? +voice.dur.toFixed(2) : null, voiceRate: voice ? voice.buffer.sampleRate : null, lost: { voice: !!lost.voice, music: !!lost.music, objs: lost.objs.length }, nodes: nodes.length, playing, hint: $('#mlabel').textContent, ctx: () => actx });
window.__stv = { exportNow: startExport, out: () => lastOut, dbg: () => ({ trans, look: media.map(m => m ? Object.assign({ kind: m.kind }, pickF(m, LOOKF)) : null), drag: drag ? { kind: drag.h.kind, moved: drag.moved } : null, playT, sel, undo: UNDO.length, redo: REDO.length, script: S.script, sync, ovl, capY: S.capY, selText, selCap, cv: [cv.width, cv.height], hits: HITS.map(h => ({ kind: h.kind, i: h.i, k: h.k, x0: Math.round(h.x0), y0: Math.round(h.y0), x1: Math.round(h.x1), y1: Math.round(h.y1) })), media: media.map(m => m && m.kind === 'video' ? { in: m.in, out: m.out, speed: m.speed, vol: m.vol, dur: m.dur, name: m.name } : m ? 'image' : null) }), state: () => ({ S, total: TL.total, scenes: TL.scenes.map(s => ({ kind: s.kind, text: s.text, start: s.start, dur: s.dur })) }),
  set: o => { if (o.look && !('font' in o)) o = Object.assign({ font: LOOKS[o.look].font, upper: LOOKS[o.look].upper }, o); Object.assign(S, o); changed(); }, frame: (t, W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; drawFrame(c.getContext('2d'), W, H, t); return c.toDataURL('image/jpeg', 0.9); } };
}
