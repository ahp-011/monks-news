// Synthesises an original soundtrack for the promo, timed to its cuts, and writes promo/score.wav.
// Runs Web Audio's OfflineAudioContext in headless Chromium, so the result is identical on every run.
const { chromium } = require('playwright');
const { writeFileSync } = require('node:fs');
const path = require('node:path');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const b64 = await p.evaluate(async () => {
    const SR = 44100, DUR = 14, ctx = new OfflineAudioContext(2, SR * DUR, SR);
    const master = ctx.createGain(); master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    // fade the whole mix out at the end
    master.gain.setValueAtTime(0.8, 12.9); master.gain.linearRampToValueAtTime(0, 14);
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

    // ---- the arrangement, every hit on the frame of its cut ----
    const A1 = 55, F1 = 43.65, C2 = 65.41, G1 = 49;
    // 0 to 1.6: ticking clock under the mosaic, whip into TODAY
    for (let t = 0; t < 1.25; t += 0.125) blip(t, t % 0.5 < 0.01 ? 1760 : 1320, t % 0.5 < 0.01 ? 0.12 : 0.06, 0.03, 'sine');
    pad(0, 1.7, [110, 164.8, 220], 0.035);
    whoosh(1.15, 1.56, 0.4); impact(1.58);
    // 1.6 to 6.8: the groove (120 bpm), A minor
    const beat = 0.5; const prog = [A1, A1, F1, F1, C2, C2, G1, G1];
    for (let k = 0, t = 1.6; t < 6.75; k++, t += beat) {
      kick(t, 0.85); hat(t + beat / 2); if (k % 2) snare(t, 0.35);
      bass(t, prog[k % 8], 0.22); bass(t + 0.25, prog[k % 8] * 2, 0.15, 0.2);
    }
    pad(1.6, 5.2, [220, 261.6, 329.6], 0.04);
    glitch(2.42); glitch(2.58);
    blip(2.66, 2600, 0.14, 0.06, 'sine');            // the white disc pops
    whoosh(2.73, 2.88, 0.3); kick(2.92, 0.7);         // grows, red disc lands
    riser(3.1, 3.4, 0.1); impact(3.4, 0.8);           // iris opens
    whoosh(4.04, 4.5, 0.25, false);                   // panel retreats
    [4.92, 4.98, 5.04, 5.1, 5.16].forEach((t, i) => noiseHit(t, 0.06, 1500 + i * 400, 0.25, 'bandpass', i % 2 ? 0.4 : -0.4)); // blocks
    impact(5.4, 0.8); whoosh(5.42, 5.8, 0.22, false); // title slides in
    blip(6.1, 1900, 0.16, 0.05, 'sine'); whoosh(6.12, 6.36, 0.25); whoosh(6.38, 6.78, 0.3); // dot, ring, iris
    // 6.8 to 8.4: rapid cuts, a hit on each
    [6.8, 7.2, 7.5, 7.8, 8.1].forEach((t, i) => { (i ? snare : impact)(t, i ? 0.6 : 0.9); glitch(t); });
    for (let t = 6.8; t < 8.35; t += 0.25) hat(t, 0.12);
    // 8.4 to 10.7: mosaic two and the zoom into DM Bytes
    impact(8.4, 0.9);
    for (let k = 0, t = 8.4; t < 9.7; k++, t += beat) { kick(t, 0.85); hat(t + 0.25); if (k % 2) snare(t, 0.35); bass(t, prog[(k + 4) % 8], 0.22); }
    riser(9.4, 10.02, 0.12); impact(10.05, 0.8);
    whoosh(10.2, 10.68, 0.28);
    // 10.7: the end card lands
    impact(10.7, 1.2);
    pad(10.7, 4.3, [110, 220, 261.6, 329.6, 440], 0.05);
    bass(10.7, A1, 2.5, 0.35);
    blip(11.0, 1320, 0.1, 0.3, 'sine'); blip(11.3, 1760, 0.08, 0.4, 'sine');
    glitch(12.5); glitch(13.1);

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
