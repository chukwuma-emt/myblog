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
  '16:9': { hint: 'Wide. YouTube and presentations.', w: 1920, h: 1080, cap: [4, 24, 100], sub: [42, 50, 0.88], lowerY: 0.74, thumb: [120, 68] }
};
const OPTS = {
  look: Object.keys(LOOKS).map(v => [v, LOOKS[v].label]),
  format: Object.keys(FORMATS).map(v => [v, v]),
  font: Object.keys(FONTS).map(v => [v, FONTS[v].label]),
  hl: [['box', 'Box'], ['colour', 'Colour'], ['off', 'Off']],
  pos: [['middle', 'Middle'], ['lower', 'Lower']],
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
const DEF = { script: SAMPLE, look: 'captions', format: '9:16', theme: 'night', font: 'montserrat', upper: true, pos: 'middle', hl: 'box', wpm: 160, handle: '', progress: true, quality: 1080, musicVol: 0.3, aiVoice: 'af_heart', aiSpeed: 1 };

function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
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
  return o;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

let S = load();
let media = [], durOv = [], sync = null, voice = null, music = null;
const MAXCLIP = 600; // longest a single clip can make its scene, in seconds
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
function parse(text) {
  const src = String(text || '').replace(/\r\n?/g, '\n').replace(/\[[^\]\n]*\]/g, ' ');
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
    // each scene's narration, straight from the voice timing
    const end = Math.max(voice.dur + 0.4, sync[n - 1] + 0.8);
    talk = sync.map((s, i) => Math.max(0.05, (i + 1 < n ? sync[i + 1] : end) - s));
    durs = talk.slice();
  } else {
    durs = raw.map((s, i) => {
      if (durOv[i] != null) return durOv[i];
      const m = clipAt(i);
      if (m && !voice && !sharedAt(i) && m.fit !== 'cut') return clamp(m.dur, 1, MAXCLIP);
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
    if (m && m.fit !== 'cut' && (sync || durOv[j] == null)) {
      let sum = 0; for (let k = i; k <= j; k++) sum += durs[k];
      const need = Math.min(m.dur, MAXCLIP) - sum;
      if (need > 0.02) durs[j] += need;
    }
    i = j + 1;
  }
  const starts = []; let acc = sync ? sync[0] : 0;
  for (const d of durs) { starts.push(acc); acc += d; }
  // where each scene's narration plays now that some scenes may be longer than their lines
  let vo = null;
  if (sync) {
    vo = [];
    [{ at: 0, from: 0, len: sync[0] }].concat(sync.map((x, i) => ({ at: starts[i], from: x, len: talk[i] }))).forEach(q => {
      if (q.len <= 0) return;
      const l = vo[vo.length - 1];
      if (l && Math.abs(l.at + l.len - q.at) < 1e-6 && Math.abs(l.from + l.len - q.from) < 1e-6) l.len += q.len;
      else vo.push(Object.assign({}, q));
    });
  }
  const scenes = raw.map((s, i) => Object.assign(s, { start: starts[i], dur: durs[i], talk: Math.min(talk[i], durs[i]), media: media[i] || null }));
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
function photoBg(ctx, W, H, img, p, idx, th) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const iw = img.width, ih = img.height;
  if (iw && ih) {
    const z = 1.04 + 0.1 * p, s = Math.max(W / iw, H / ih) * z, dw = iw * s, dh = ih * s, d = idx % 4;
    const ax = [0.35, 0.65, 0.5, 0.5][d], bx = [0.65, 0.35, 0.5, 0.5][d], ay = [0.5, 0.5, 0.35, 0.65][d], by = [0.5, 0.5, 0.65, 0.35][d];
    ctx.drawImage(img, -(dw - W) * (ax + (bx - ax) * p), -(dh - H) * (ay + (by - ay) * p), dw, dh);
  }
  scrim(ctx, W, H, th, 0.46, 0.74);
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
function clipTime(m, x) { return m.endMode === 'hold' ? Math.min(Math.max(0, x), Math.max(0, m.dur - 0.05)) : ((x % m.dur) + m.dur) % m.dur; }
function videoBg(ctx, W, H, m, mode, th) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let src = null, sw = 0, sh = 0;
  if (mode === 'export' && m.exportFrame) { src = m.exportFrame; sw = src.width; sh = src.height; }
  else if (mode !== 'thumb' && m.el && m.el.readyState >= 2 && m.el.videoWidth) { src = m.el; sw = m.el.videoWidth; sh = m.el.videoHeight; }
  else if (m.poster) { src = m.poster; sw = src.width; sh = src.height; }
  if (src && sw && sh) {
    const k = Math.max(W / sw, H / sh), dw = sw * k, dh = sh * k;
    try { ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh); } catch (e) {}
  }
  scrim(ctx, W, H, th, 0.3, 0.6);
}
function bg(ctx, W, H, sc, lt, t, th, mode) {
  const m = sc.media;
  if (m && m.kind === 'video') videoBg(ctx, W, H, m, mode, th);
  else if (m) photoBg(ctx, W, H, m.img, clamp(lt / Math.max(sc.dur, 0.1), 0, 1), sc.i, th);
  else gradientBg(ctx, W, H, t, sc.i, th);
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
  ctx.translate(W / 2, S.pos === 'lower' ? H * fm.lowerY : H * 0.5); ctx.scale(pop, pop);
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
  const prev = i > 0 && lt < TR ? scs[i - 1] : null;
  const sameClip = prev && sc.media && sc.media.kind === 'video' && prev.media === sc.media;
  if (prev && !sameClip) {
    bg(ctx, W, H, prev, prev.dur + lt, t, th, mode);
    ctx.globalAlpha = out3(lt / TR); bg(ctx, W, H, sc, lt, t, th, mode); ctx.globalAlpha = 1;
  } else bg(ctx, W, H, sc, lt, t, th, mode);
  if (prev) {
    const fade = prev.kind === 'title' || sc.kind === 'title' || S.look === 'story' || S.look === 'typewriter';
    const a = (1 - clamp(lt / 0.2, 0, 1)) * textFade(prev, prev.dur);
    if (fade && a > 0) drawText(ctx, W, H, U, prev, prev.dur - 1e-3, a, th);
  }
  const ta = textFade(sc, lt);
  if (ta > 0) drawText(ctx, W, H, U, sc, lt, ta, th);
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
  const i = sceneAt(t), sc = scs[i], lt = t - sc.start, p = i > 0 && lt < TR ? scs[i - 1] : null;
  // a clip that played right to its end holds its last frame through the crossfade instead of starting over
  if (p && p.media && p.media.kind === 'video' && p.media !== sc.media) out.push({ m: p.media, x: p.dur + lt + p.clipOffset, hold: Math.abs(p.clipOffset + p.dur - p.media.dur) < 0.05 });
  if (sc.media && sc.media.kind === 'video') out.push({ m: sc.media, x: lt + sc.clipOffset });
  out.forEach(v => {
    const hold = v.hold || v.m.endMode === 'hold';
    v.ct = hold ? Math.min(Math.max(0, v.x), Math.max(0, v.m.dur - 0.05)) : clipTime(v.m, v.x);
    v.ended = hold && v.x >= v.m.dur - 0.05;
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
      if (m.endMode !== 'hold' && m.dur > 0) d = ((d % m.dur) + 1.5 * m.dur) % m.dur - m.dur / 2;
      if (Math.abs(d) > 0.3) { try { el.currentTime = w.ct; } catch (e) {} d = 0; }
      if (Math.abs(d) > 0.08) m.rate = d > 0 ? 1.12 : 0.9; else if (Math.abs(d) < 0.02) m.rate = 1;
      const r = m.rate || 1; if (el.playbackRate !== r) el.playbackRate = r;
      if (el.paused) el.play().catch(() => {});
    } else {
      if (!el.paused) el.pause();
      if (m.rate && m.rate !== 1) { m.rate = 1; el.playbackRate = 1; }
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
  if (i !== curScene) {
    $$('#scenes .scene.on').forEach(el => el.classList.remove('on'));
    const li = $('#scenes [data-i="' + i + '"]');
    if (li) li.classList.add('on');
    curScene = i;
  }
}
function getCtx() {
  try {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  } catch (e) { return null; }
}
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
      if (cut) { // tiny fades so the joins never click
        const g = ctx.createGain(), f = Math.min(0.006, len / 3);
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + f);
        g.gain.setValueAtTime(1, at + len - f); g.gain.linearRampToValueAtTime(0, at + len);
        s.connect(g); g.connect(out);
      } else s.connect(out);
      s.start(at, from, len); list.push(s);
    }
  }
  if (music) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), v = Math.max(0.0001, S.musicVol), fl = Math.min(1.5, total * 0.2);
    s.buffer = music.buffer; s.loop = true;
    g.gain.setValueAtTime(offset < 0.05 ? 0.0001 : v, when);
    if (offset < 0.05) g.gain.linearRampToValueAtTime(v, when + 0.3);
    if (end > fl) g.gain.setValueAtTime(v, when + end - fl);
    g.gain.linearRampToValueAtTime(0.0001, when + end);
    s.connect(g); g.connect(out);
    s.start(when, offset % music.buffer.duration); s.stop(when + end + 0.05); list.push(s);
  }
  scheduleClipSound(ctx, out, offset, when, list);
  return { nodes: list, when };
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
    const a = r.m.audio;
    if (!r.m.useSound || !a || r.t1 <= offset) continue;
    const from = Math.max(r.t0, offset), pos = from - r.t0, len = Math.min(a.duration, r.m.dur);
    let at = pos;
    const s = ctx.createBufferSource(); s.buffer = a;
    if (r.m.endMode === 'loop') { s.loop = true; s.loopStart = 0; s.loopEnd = len; at = pos % len; }
    else if (pos >= a.duration) continue;
    s.connect(out); s.start(when + (from - offset), at); s.stop(when + (r.t1 - offset)); list.push(s);
  }
}
function stopAudio() { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = []; }
function nowT() {
  if (!clock) return playT;
  if (clock.a) {
    if (clock.a.state !== 'running') {
      if (performance.now() - clock.p0 > 500) clock = { t0: performance.now(), off: clock.off };
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
function play() {
  if (busy || !TL.total) return;
  if (playT >= TL.total - 0.05) playT = 0;
  const ctx = voice || music || hasClipSound() ? getCtx() : null;
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
    g.innerHTML = OPTS[key].map(o => '<button type="button" role="radio" aria-checked="' + (String(S[key]) === o[0]) + '" data-v="' + o[0] + '"' + (key === 'font' ? ' style="font-family:' + FONTS[o[0]].fam + '"' : '') + '>' + o[1] + '</button>').join('');
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
  $('#sampleNote').hidden = S.script !== SAMPLE;
  $('#mfmt').textContent = S.format + ' · ' + fmtT(TL.total);
  curScene = -1;
  if (!n) { ol.innerHTML = '<li class="empty">No scenes yet. Type your script above and they appear here.</li>'; return; }
  ol.style.setProperty('--tw', th[0] + 'px'); ol.style.setProperty('--th', th[1] + 'px');
  ol.innerHTML = TL.scenes.map((s, i) => '<li class="scene" data-i="' + i + '">' +
    '<button type="button" class="thumb" data-act="seek" aria-label="Preview scene ' + (i + 1) + '"><canvas width="' + th[0] * 2 + '" height="' + th[1] * 2 + '"></canvas></button>' +
    '<div><p class="stext"><span class="kind">' + (s.kind === 'title' ? 'Title' : i + 1) + '</span>' + esc(s.text) + '</p><div class="smeta">' +
    '<span class="dur">' + s.dur.toFixed(1) + 's</span>' +
    (sync ? '<span class="tag">Synced to voice</span>' : '<button type="button" class="btn sq" data-act="minus" aria-label="Shorten scene ' + (i + 1) + '">−</button><button type="button" class="btn sq" data-act="plus" aria-label="Lengthen scene ' + (i + 1) + '">+</button>') +
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
    ? '<b>' + esc(voice.name) + '</b> · ' + fmtT(voice.dur) + '. ' + (voice.made ? 'Each scene starts exactly where its line begins.' : sync ? 'Scenes change where you tapped.' : 'Scenes stretch to fit it. For exact timing, tap to sync.')
    : 'Or record yourself reading the script (a voice memo works) and add the file. Scenes stretch to fit it. A video file works too; its sound is used.';
  $('#bVoice').textContent = v ? 'Use my recording' : 'Add my recording';
  $('#bSync').hidden = !v || !!voice.made; $('#bSync').textContent = sync ? 'Sync again' : 'Tap to sync';
  $('#aiSpeed').value = S.aiSpeed; $('#aiSpeedVal').textContent = S.aiSpeed.toFixed(2).replace(/0$/, '') + '×';
  $('#bSaveVoice').hidden = !(v && voice.made && DL);
  $('#bPlayVoice').hidden = !(v && voice.made);
  if (!aiBusy) aiNoteSet(aiDefaultNote());
  $('#bVoiceX').hidden = !v;
  $('#musicNote').innerHTML = music ? '<b>' + esc(music.name) + '</b> · ' + fmtT(music.dur) + '. Loops if it is shorter than the video and fades out at the end.' : 'Optional background track. It loops and fades out at the end.';
  $('#bMusic').textContent = music ? 'Replace' : 'Add music';
  $('#bMusicX').hidden = !music; $('#volRow').hidden = !music; $('#vol').value = Math.round(S.musicVol * 100);
  $('#pace').disabled = v; $('#pace').value = S.wpm; $('#paceVal').textContent = S.wpm;
  $('#paceNote').textContent = v ? 'Timing follows your voiceover.' : 'Used when there is no voiceover. Most people speak at 140 to 170.';
}
function refresh() {
  stopPlay(); LC.clear(); build(); renderScenes(); renderAudio();
  show(Math.min(playT, TL.total)); save();
}
function changed() { renderChips(); sizePreview(); refresh(); }

/* ---------- media ---------- */
const PHOTO_NOTE = 'Photos and clips fill the scenes in order and repeat if you add fewer than the number of scenes. Clips play in full: the scene stretches to fit and the voiceover waits. Tap Whole clip on a scene to cut that clip to fit instead. Tap a scene to preview it.';
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
    return { kind: 'video', file, url, el, dur: el.duration, poster, useSound: false, endMode: 'loop', name: file.name || 'clip', audio: null, noAudio: false };
  } catch (e) { el.remove(); URL.revokeObjectURL(url); throw e; }
}
async function loadMedia(file) { return isVideoFile(file) ? loadClip(file) : { kind: 'image', img: await loadImage(file), name: file.name || 'photo' }; }
function dropUnused(old) {
  const keep = new Set(media.filter(Boolean));
  for (const m of new Set(old.filter(Boolean))) {
    if (keep.has(m) || m.kind !== 'video') continue;
    try { m.el.pause(); m.el.removeAttribute('src'); m.el.load(); } catch (e) {}
    m.el.remove(); URL.revokeObjectURL(m.url); m.audio = null;
  }
}
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
async function decodeFile(file) {
  const ctx = getCtx();
  if (!ctx) throw new Error('no audio support');
  const data = await file.arrayBuffer();
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
let VW = null, vwReady = null, vwRes = null, vwRej = null, vwOnProgress = null, vwSeq = 0, aiBusy = false, aiStop = false, aiSample = null;
const vwPending = new Map();
function voiceWorker() {
  if (VW) return VW;
  VW = new Worker('lib/voice/worker.js');
  VW.onmessage = e => {
    const m = e.data;
    if (m.type === 'progress') { if (vwOnProgress) vwOnProgress(m.loaded, m.total); }
    else if (m.type === 'status') { aiNoteSet('Starting the voice engine…'); engineStarting(); }
    else if (m.type === 'ready') { if (vwRes) vwRes(); }
    else if (m.type === 'audio') { const p = vwPending.get(m.id); vwPending.delete(m.id); if (p) p.res(m.audio); }
    else if (m.type === 'error') {
      if (m.id != null && vwPending.has(m.id)) { const p = vwPending.get(m.id); vwPending.delete(m.id); p.rej(new Error(m.message)); }
      else if (vwRej) vwRej(new Error(m.message));
    }
  };
  VW.onerror = e => {
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
      voiceWorker().postMessage({ type: 'init' });
    }).catch(e => { vwReady = null; if (VW) { try { VW.terminate(); } catch (x) {} VW = null; } throw e; });
  }
  return vwReady;
}
function engineStarting() {
  clearTimeout(vwTimer);
  vwTimer = setTimeout(() => { if (vwRej) vwRej(new Error('start timeout')); }, 120000);
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
const scriptKey = () => TL.scenes.map(s => s.text).join('\n');
function aiNoteSet(t) { $('#aiNote').textContent = t; }
function aiBarSet(p) { $('#aiBar').hidden = p == null; if (p != null) $('#aiBarI').style.width = (clamp(p, 0, 1) * 100).toFixed(1) + '%'; }
function aiDefaultNote() {
  if (voice && voice.made && voice.key !== scriptKey()) return 'You changed the script after making this voice. Make the voiceover again so they match.';
  if (voice && voice.made) return 'Voiceover ready in ' + voice.voiceName + '. Tap Play from start to hear the whole script with your video.';
  return 'Free voices made on this phone from your script. The first time, it downloads the voice engine (about 110 MB) once. After that it starts in seconds.';
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
  const ctx = getCtx();
  stopPlay(); stopSample(); setAiBusy(true, 'hear');
  try {
    await ensureEngine();
    aiNoteSet('Making a short sample…'); aiBarSet(null);
    const first = (TL.scenes.length && sentences(TL.scenes.find(s => s.kind === 'text') ? TL.scenes.find(s => s.kind === 'text').text : TL.scenes[0].text)[0]) || 'Hello! This is how I sound.';
    const a = await speakAI(first.slice(0, 220), S.aiVoice, S.aiSpeed);
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
    let made = 0;
    const totalSent = scenes.reduce((a, s) => a + sentences(s.text).length, 0);
    for (let i = 0; i < n; i++) {
      const parts = [];
      for (const s of sentences(scenes[i].text)) {
        if (aiStop) throw new Error('stopped');
        aiNoteSet('Making the voice: scene ' + (i + 1) + ' of ' + n + '…'); aiBarSet(made / totalSent);
        const a = await speakAI(s, vId, speed);
        parts.push(a, silence(0.22)); made++;
      }
      if (parts.length) parts[parts.length - 1] = silence(scenes[i].kind === 'title' ? 0.7 : 0.45);
      else parts.push(silence(1));
      pieces.push(joinF32(parts));
    }
    const starts = []; let acc = 0;
    pieces.forEach(p => { starts.push(acc / VSR); acc += p.length; });
    let all = joinF32(pieces.concat([silence(0.3)]));
    try {
      const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const oc = new O(1, all.length, VSR), src = oc.createBufferSource(), cmp = oc.createDynamicsCompressor(), mk = oc.createGain();
      const b0 = oc.createBuffer(1, all.length, VSR); b0.copyToChannel(all, 0); src.buffer = b0;
      cmp.threshold.value = -28; cmp.knee.value = 10; cmp.ratio.value = 4; cmp.attack.value = 0.004; cmp.release.value = 0.2; mk.gain.value = 2.2;
      src.connect(cmp); cmp.connect(mk); mk.connect(oc.destination); src.start(0);
      all = new Float32Array((await oc.startRendering()).getChannelData(0));
    } catch (e) { /* keep the uncompressed voice */ }
    let peak = 0;
    for (let i = 0; i < all.length; i++) { const v = Math.abs(all[i]); if (v > peak) peak = v; }
    if (peak > 0) { const g = Math.min(3, 0.89 / peak); for (let i = 0; i < all.length; i++) all[i] *= g; }
    const buf = ctx.createBuffer(1, all.length, VSR); buf.copyToChannel(all, 0);
    voice = { buffer: buf, dur: buf.duration, name: VOICE_NAMES[vId] + ' (AI voice)', made: true, key, voiceName: VOICE_NAMES[vId] };
    sync = starts; durOv = [];
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
  sync = m.slice(0, n); durOv = [];
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
  return engineP || (engineP = (window.STVMB ? Promise.resolve() : loadScript('lib/engine.js')).then(() => {
    if (!window.STVMB) throw new Error('The video encoder didn’t load');
    return window.STVMB;
  }).catch(e => { engineP = null; throw e; }));
}
async function wasmAac() {
  if (!window.STVAac) await loadScript('lib/aac.js');
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
      const sink = new M.CanvasSink(track, { width: W, height: H, fit: 'cover', poolSize: 2 });
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
  const first = (TL.scenes[0] && TL.scenes[0].text) || 'video';
  const slug = first.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '') || 'video';
  return slug + '.' + ext;
}
function saveUI(msg) {
  $('#save').hidden = !DL;
  $('#saveNote').textContent = msg || (!DL ? 'Saving works when this page is open in Claude or on claude.ai. Open it there to save the video.' : IN_CLAUDE ? 'Claude asks you to confirm, then the video goes to your downloads, or to the share sheet on a phone.' : 'The video goes to your Downloads folder.');
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

/* ---------- events ---------- */
$('#play').addEventListener('click', () => { if (playing) { stopPlay(); show(playT); } else play(); });
$('#seek').addEventListener('input', e => { stopPlay(); show(e.target.value / 1000 * TL.total); });
$('#go').addEventListener('click', startExport);
$('#jobCancel').addEventListener('click', () => { if (JOB) JOB.cancel = true; else $('#job').hidden = true; });
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
$('#script').addEventListener('input', e => { clearTimeout(typing); typing = setTimeout(() => { S.script = e.target.value; refresh(); }, 280); });
$('#bClear').addEventListener('click', () => { S.script = ''; $('#script').value = ''; refresh(); $('#script').focus(); });
$('#bSample').addEventListener('click', () => { S.script = SAMPLE; $('#script').value = SAMPLE; playT = 0.9; refresh(); });
$('#scenes').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || busy) return;
  const i = +b.closest('li').dataset.i, sc = TL.scenes[i], act = b.dataset.act;
  if (!sc) return;
  if (act === 'seek') { stopPlay(); show(sc.start + Math.min(sc.dur * 0.6, 1.2)); }
  else if (act === 'minus' || act === 'plus') { durOv[i] = clamp(Math.round((sc.dur + (act === 'plus' ? 0.5 : -0.5)) * 2) / 2, 0.5, MAXCLIP); playT = sc.start; refresh(); }
  else if (act === 'photo') { pendingImg = i; $('#fPhoto').click(); }
  else if (act === 'unphoto') { const old = media.slice(); media[i] = null; dropUnused(old); refresh(); }
  else if (act === 'fit' && media[i]) { const m = media[i]; m.fit = m.fit === 'cut' ? 'whole' : 'cut'; playT = sc.start; refresh(); }
  else if (act === 'endmode' && media[i]) { const m = media[i]; m.endMode = m.endMode === 'hold' ? 'loop' : 'hold'; m.el.loop = m.endMode === 'loop'; refresh(); }
  else if (act === 'sound' && media[i]) {
    const m = media[i];
    if (m.useSound) { m.useSound = false; refresh(); return; }
    b.disabled = true; b.textContent = 'Reading sound…'; getCtx();
    ensureClipAudio(m).then(() => { m.useSound = !!m.audio; refresh(); if (m.noAudio) $('#photoNote').textContent = 'That clip has no sound this browser can read.'; });
  }
});
$('#bPhotos').addEventListener('click', () => $('#fPhotos').click());
$('#bPhotosX').addEventListener('click', () => { const old = media.slice(); media = []; dropUnused(old); refresh(); });
$('#bAuto').addEventListener('click', () => { durOv = []; sync = null; refresh(); });
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
  const old = media.slice();
  media = [];
  for (let i = 0; i < Math.max(1, TL.scenes.length); i++) media[i] = got[i % got.length];
  dropUnused(old);
  refresh();
});
$('#fPhoto').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f || pendingImg < 0) return;
  $('#photoNote').textContent = 'Opening ' + (f.name || 'file') + '…';
  try { const m = await loadMedia(f), old = media.slice(); media[pendingImg] = m; dropUnused(old); renderPhotoNote(); refresh(); }
  catch (err) { $('#photoNote').textContent = 'That file couldn’t be opened. Try a JPG or PNG photo, or an MP4 clip.'; }
});
$('#bVoice').addEventListener('click', () => { getCtx(); $('#fVoice').click(); });
$('#bMusic').addEventListener('click', () => { getCtx(); $('#fMusic').click(); });
$('#fVoice').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f) return;
  $('#voiceNote').textContent = 'Reading ' + f.name + '…';
  try { const b = await decodeFile(f); voice = { buffer: b, dur: b.duration, name: f.name }; sync = null; durOv = []; refresh(); }
  catch (err) { renderAudio(); $('#voiceNote').textContent = 'That file couldn’t be read. Try MP3, M4A or WAV.'; }
});
$('#fMusic').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = '';
  if (!f) return;
  $('#musicNote').textContent = 'Reading ' + f.name + '…';
  try { const b = await decodeFile(f); music = { buffer: b, dur: b.duration, name: f.name }; refresh(); }
  catch (err) { renderAudio(); $('#musicNote').textContent = 'That file couldn’t be read. Try MP3, M4A or WAV.'; }
});
$('#bVoiceX').addEventListener('click', () => { voice = null; sync = null; refresh(); });
$('#bMake').addEventListener('click', makeVoice);
$('#bHear').addEventListener('click', hearVoice);
$('#bStop').addEventListener('click', () => { if (aiBusy) { aiStop = true; aiNoteSet('Stopping…'); } });
$('#bPlayVoice').addEventListener('click', playFromStart);
$('#bSaveVoice').addEventListener('click', saveVoice);
$('#aiSpeed').addEventListener('input', e => { S.aiSpeed = clamp(+e.target.value, 0.8, 1.2); $('#aiSpeedVal').textContent = S.aiSpeed.toFixed(2).replace(/0$/, '') + '×'; save(); });
$('#bMusicX').addEventListener('click', () => { music = null; refresh(); });
$('#bSync').addEventListener('click', () => { getCtx(); openSync(); });
$('#syncBtn').addEventListener('click', syncTap);
$('#syncCancel').addEventListener('click', closeSync);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && SY) { e.preventDefault(); closeSync(); } });
$('#vol').addEventListener('input', e => { S.musicVol = clamp(e.target.value / 100, 0, 1); stopPlay(); save(); });
$('#pace').addEventListener('input', e => { S.wpm = +e.target.value; $('#paceVal').textContent = S.wpm; clearTimeout(typing); typing = setTimeout(refresh, 120); });
$('#tUpper').addEventListener('change', e => { S.upper = e.target.checked; changed(); });
$('#tProg').addEventListener('change', e => { S.progress = e.target.checked; save(); show(playT); });
$('#handle').addEventListener('input', e => { S.handle = e.target.value; save(); show(playT); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-key] [data-v]');
  if (!b || busy) return;
  const key = b.closest('[data-key]').dataset.key, v = key === 'quality' ? +b.dataset.v : b.dataset.v;
  if (S[key] === v) return;
  if (key === 'aiVoice' && aiBusy) return;
  S[key] = v;
  if (key === 'look') { S.font = LOOKS[v].font; S.upper = LOOKS[v].upper; }
  if (key === 'quality' || key === 'aiVoice') { renderChips(); save(); return; }
  changed();
});


/* ---------- website check: notice when the site's security settings block the tool ---------- */
function serverNotice(what) {
  let el = $('#serverNote');
  if (!el) { el = document.createElement('p'); el.id = 'serverNote'; el.className = 'notice'; el.setAttribute('role', 'status'); document.querySelector('.top').after(el); }
  el.textContent = 'This website is blocking ' + what + ' with its security settings. If you just added the tool, restart the site so its new settings load (in VPS Control Center, deploy Blog again).';
}
const cspSeen = new Set();
document.addEventListener('securitypolicyviolation', e => {
  const d = e.effectiveDirective || e.violatedDirective || '';
  if (cspSeen.has(d)) return;
  cspSeen.add(d);
  serverNotice(/media/.test(d) ? 'video playback' : /script|worker|wasm/.test(d) ? 'part of the tool' : 'part of the tool');
});
if (window.top === window && location.protocol.startsWith('http')) {
  fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(r => {
    const csp = r.headers.get('content-security-policy') || '';
    if (csp && !/wasm-unsafe-eval|'unsafe-eval'/.test(csp)) serverNotice('the AI voice engine');
  }).catch(() => {});
}

/* ---------- start ---------- */
$('#script').value = S.script; $('#handle').value = S.handle;
renderChips(); build(); sizePreview(); renderScenes(); renderAudio(); show(Math.min(0.9, TL.total));
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
window.__stv = { exportNow: startExport, out: () => lastOut, state: () => ({ S, total: TL.total, scenes: TL.scenes.map(s => ({ kind: s.kind, text: s.text, start: s.start, dur: s.dur })) }),
  set: o => { if (o.look && !('font' in o)) o = Object.assign({ font: LOOKS[o.look].font, upper: LOOKS[o.look].upper }, o); Object.assign(S, o); changed(); }, frame: (t, W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; drawFrame(c.getContext('2d'), W, H, t); return c.toDataURL('image/jpeg', 0.9); } };
}
