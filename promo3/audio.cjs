// Synthesises an original soundtrack for the promo, timed to its cuts, and writes promo/score.wav.
// Runs Web Audio's OfflineAudioContext in headless Chromium, so the result is identical on every run.
const { chromium } = require('playwright');
const { writeFileSync } = require('node:fs');
const path = require('node:path');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const b64 = await p.evaluate(async () => {
    const SR = 44100, DUR = 17, ctx = new OfflineAudioContext(2, SR * DUR, SR);
    const master = ctx.createGain(); master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    // fade the whole mix out at the end
    master.gain.setValueAtTime(0.8, 15.8); master.gain.linearRampToValueAtTime(0, 17);
    const noise = ctx.createBuffer(1, SR * 2, SR); { const d = noise.getChannelData(0); let s = 7; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; } }
    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    const out = (node, pan = 0, gain = 1) => { const g = ctx.createGain(); g.gain.value = gain; const pn = ctx.createStereoPanner(); pn.pan.value = pan; node.connect(g); g.connect(pn); pn.connect(master); };
    function kick(t, v = 1) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.16); env(g, t, 0.004, 0.9 * v, 0.3); o.connect(g); out(g); o.start(t); o.stop(t + 0.4); }
    function noiseHit(t, dur, freq, v, type = 'bandpass', pan = 0, q = 1) { const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ctx.createGain(); env(g, t, 0.003, v, dur); s.connect(f); f.connect(g); out(g, pan); s.start(t, (t * 7.3) % 1.5); s.stop(t + dur + 0.05); }
    const hat = (t, v = 0.18) => noiseHit(t, 0.05, 9000, v, 'highpass', 0.25);
    const snare = (t, v = 0.5) => { noiseHit(t, 0.18, 2200, v, 'bandpass', 0, 0.8); const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 190; env(g, t, 0.003, 0.3 * v, 0.12); o.connect(g); out(g); o.start(t); o.stop(t + 0.2); };
    function whoosh(t0, t1, v = 0.35, up = true) { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5; f.frequency.setValueAtTime(up ? 300 : 6000, t0); f.frequency.exponentialRampToValueAtTime(up ? 7000 : 300, t1); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (t1 - t0) * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.08); s.connect(f); f.connect(g); out(g); s.start(t0); s.stop(t1 + 0.1); }
    function impact(t, v = 1) { kick(t, 1.1 * v); noiseHit(t, 0.9, 900, 0.45 * v, 'lowpass', 0, 0.5); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.2); env(g, t, 0.01, 0.7 * v, 1.3); o.connect(g); out(g); o.start(t); o.stop(t + 1.5); }
    function blip(t, freq, v = 0.18, dur = 0.08, type = 'square') { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur); env(g, t, 0.002, v, dur); o.connect(g); out(g, (freq % 3) / 3 - 0.3); o.start(t); o.stop(t + dur + 0.05); }
    const glitch = (t) => { for (let i = 0; i < 4; i++) blip(t + i * 0.025, 900 + i * 340, 0.12, 0.03); };
    function bass(t, f, dur, v = 0.32) { const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(180, t + dur); env(g, t, 0.01, v, dur); o.connect(lp); lp.connect(g); out(g); o.start(t); o.stop(t + dur + 0.05); }
    function pad(t0, dur, freqs, v = 0.06) { freqs.forEach((f, i) => { [-6, 6].forEach((det) => { const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; lp.type = 'lowpass'; lp.frequency.value = 1400; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.4); g.gain.setValueAtTime(v, t0 + dur - 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(lp); lp.connect(g); out(g, det / 12); o.start(t0); o.stop(t0 + dur + 0.05); }); }); }
    function riser(t0, t1, v = 0.12) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(1760, t1); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t1); g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.05); o.connect(g); out(g); o.start(t0); o.stop(t1 + 0.1); whoosh(t0, t1, v * 2.5); }

    // ---- the arrangement: 120 bpm, a hit and glitch on every swap ----
    const swaps = [2.3, 4.3, 6.3, 8.3, 10.3, 12.3, 14.3];
    const A1 = 55, F1 = 43.65, C2 = 65.41, G1 = 49, prog = [A1, A1, F1, F1, C2, C2, G1, G1];
    blip(0.05, 1760, 0.12, 0.05, 'sine'); whoosh(0.0, 0.3, 0.25); impact(0.3, 0.7); glitch(0.3);
    for (let k = 0, t = 0.3; t < 14.25; k++, t += 0.5) {
      kick(t, 0.8); hat(t + 0.25); if (k % 2) snare(t, 0.32);
      bass(t, prog[k % 8], 0.22); bass(t + 0.25, prog[k % 8] * 2, 0.15, 0.18);
      if (k % 4 === 2) blip(t + 0.125, 1318, 0.05, 0.06, 'sine');
    }
    pad(0.3, 14, [220, 261.6, 329.6], 0.035);
    swaps.forEach((s, i) => { glitch(s); noiseHit(s, 0.08, 3000, 0.22, 'bandpass', i % 2 ? 0.4 : -0.4); whoosh(s - 0.25, s, 0.18); });
    for (let i = 0; i < 6; i++) blip(2.3 + i * 0.1, 900 + i * 120, 0.07, 0.04, 'square');   // the count to 80
    riser(9.8, 10.3, 0.1); impact(10.3, 0.9);
    impact(14.3, 1.2); pad(14.3, 2.7, [110, 220, 261.6, 329.6, 440], 0.05); bass(14.3, A1, 2.4, 0.35);
    blip(14.8, 1320, 0.1, 0.3, 'sine'); blip(15.1, 1760, 0.08, 0.4, 'sine');
    const buf = await ctx.startRendering();
    // encode 16-bit PCM WAV
    const n = buf.length, ch = 2, data = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); data.setUint32(4, 36 + n * ch * 2, true); ws(8, 'WAVEfmt '); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true);
    data.setUint32(24, SR, true); data.setUint32(28, SR * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true); ws(36, 'data'); data.setUint32(40, n * ch * 2, true);
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    for (let i = 0, o = 44; i < n; i++, o += 4) { data.setInt16(o, Math.max(-1, Math.min(1, L[i])) * 32767, true); data.setInt16(o + 2, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    let s = ''; const u8 = new Uint8Array(data.buffer); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  });
  await b.close();
  const file = path.join(__dirname, 'score.wav');
  writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log('wrote', file);
})();
