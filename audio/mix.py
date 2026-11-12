"""Score, foley and mix for Explore Surabaya (one timeline, 120 BPM, bar = 2 s). Everything is synthesised (no samples).
Music: tuned percussion grows one voice per course (marimba, saron, glockenspiel, vibraphone, xylophone, harp, horn) over a
D-Bm-G-A loop in D major pentatonic; a two-note station chime marks the turns; the bonang alone carries the night.
Foley comes from each part's events (the map's stops and drops, each window's own gestures). Voice: the scratch narration
(voice/scratch_vo.wav) until the final recording exists. Output: audio/mix_<fmt>.wav (48 kHz stereo, about -16 LUFS).
    python audio/mix.py reels|tv
"""
import json, os, sys
import numpy as np
from scipy.signal import resample_poly
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.join(os.path.dirname(__file__), '..', '..', '..')), 'core', 'audio'))
import sfx
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress, limit

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FMT = sys.argv[1] if len(sys.argv) > 1 else 'reels'
DUR = 188.0 if FMT == 'tv' else 180.0
BAR = 2.0; BEAT = .5
WIN = {'S0': (0, 10), 'S2': (29, 40), 'S3': (47, 58), 'S4': (67, 76), 'S5': (82, 90), 'S6': (92, 104), 'S7': (107, 116), 'S8': (128, 135), 'S9': (141, 151)}
rng = np.random.default_rng(3)
N = int(DUR * SR) + SR
music = np.zeros((N, 2)); fx = np.zeros((N, 2)); amb = np.zeros((N, 2))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------ instruments
def mallet(f, d, parts, decays, v=1.0, bright=1.0):
    t = t_(d); x = np.zeros_like(t)
    for (r, a), tau in zip(parts, decays): x += a * np.sin(2 * np.pi * f * r * t + rng.random() * 6) * np.exp(-t / tau)
    att = np.minimum(1, t / .002); return (x * att * v).astype(np.float32)
def marimba(f, v=1): return mallet(f, .9, [(1, 1), (4, .25 * 1), (9.9, .06)], [.35, .05, .02], v)
def glock(f, v=1): return mallet(f, 1.2, [(1, 1), (2.76, .35), (5.4, .15)], [.7, .25, .1], v)
def vibes(f, v=1):
    x = mallet(f, 1.6, [(1, 1), (4, .12)], [1.1, .2], v); t = t_(1.6); return (x * (1 + .25 * np.sin(2 * np.pi * 5.5 * t))).astype(np.float32)
def xylo(f, v=1): return mallet(f, .4, [(1, 1), (3, .35), (6.2, .12)], [.12, .05, .02], v)
def saron(f, v=1): return mallet(f, 2.2, [(1, 1), (2.4, .3), (3.9, .12), (5.6, .05)], [1.2, .4, .2, .1], v)
def bonang(f, v=1):
    x = mallet(f, 3.0, [(1, 1), (1.52, .35), (2.42, .3), (3.1, .1)], [1.6, .9, .5, .2], v); t = t_(3.0); return (x * (1 + .15 * np.sin(2 * np.pi * 3.1 * t))).astype(np.float32)
def harp(f, v=1):
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(1.6 * SR))
    for i in range(len(out)): out[i] = buf[i % n]; buf[i % n] = .996 * .5 * (buf[i % n] + buf[(i + 1) % n])
    return (lp(out, 5000) * v * np.minimum(1, t_(1.6) / .003)).astype(np.float32)
def horn(f, d=.35, v=1):
    t = t_(d + .3); ph = 2 * np.pi * f * t; x = sum(np.sin(ph * k) / k ** 1.3 for k in range(1, 7))
    env = np.minimum(1, t / .04) * np.exp(-np.maximum(0, t - d) / .12); return (lp(x, 1800) * env * v * .5).astype(np.float32)
def pad(fs, d, v=1):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * (1 + dt) * t + rng.random() * 6) for f in fs for dt in (-.004, 0, .004))
    env = np.minimum(1, t / .8) * np.minimum(1, (d - t) / .8); return (lp(x, 1400) * env * v / len(fs) * .35).astype(np.float32)
def bass(f, d, v=1):
    t = t_(d); x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .15 * np.sin(6 * np.pi * f * t)
    return (x * np.exp(-t / .5) * np.minimum(1, t / .005) * v).astype(np.float32)
def chime(at, v=1.0):          # the two-note station chime: vibraphone A5 -> F#5 with glockenspiel an octave up
    for i, m in enumerate((81, 78)):
        add(music, vibes(hz(m), .55 * v), at + i * .36, 1.0, -.1); add(music, glock(hz(m + 12), .25 * v), at + i * .36, 1.0, .1)

# ------------------------------------------------------------------ harmony and the growing ostinato
CHORDS = [(62, [62, 66, 69, 74]), (59, [59, 62, 66, 71]), (55, [55, 59, 62, 67]), (57, [57, 61, 64, 69])]   # D Bm G A
PENTA = [62, 64, 66, 69, 71]
def chord_at(t): return CHORDS[int(t // BAR) % 4]
# voices enter by bar (SECTIONS.md); each = (from_bar, to_bar, fn, pattern, octave, gain, pan)
VOICES = [
    (6, 76.5, marimba, [0, 2, 1, 3, 2, 1, 3, 2], 12, .30, -.35),
    (12, 76.5, saron, [0, None, 1, None, 2, None, 1, None], 12, .22, .3),
    (22, 76.5, glock, [None, 3, None, 2, None, 3, None, 1], 24, .14, .45),
    (31, 76.5, vibes, [0, None, None, 2, None, None, 1, None], 12, .18, -.15),
    (40, 76.5, xylo, [3, 2, 1, 0, 1, 2, 3, 2], 24, .12, .2),
    (53, 76.5, harp, [0, 1, 2, 3, None, 2, 1, None], 12, .16, -.4),
    (60, 70, horn, [0, None, None, None, 1, None, None, None], 0, .16, 0),
    (78, 90.5, marimba, [0, 2, 1, 3, 2, 1, 3, 2], 12, .30, -.35), (79, 90.5, saron, [0, None, 1, None, 2, None, 1, None], 12, .22, .3),
    (80, 90.5, glock, [None, 3, None, 2, None, 3, None, 1], 24, .14, .45), (81, 90.5, vibes, [0, None, None, 2, None, None, 1, None], 12, .18, -.15),
    (82, 90.5, xylo, [3, 2, 1, 0, 1, 2, 3, 2], 24, .12, .2), (83, 90.5, harp, [0, 1, 2, 3, None, 2, 1, None], 12, .16, -.4), (84, 88, horn, [0, None, None, None, 1, None, None, None], 0, .16, 0),
]
HUSH = [(20.8, 22.2), (151.6, 154.0)]
def hush(t): return 0.08 if any(a <= t < b for a, b in HUSH) else 1.0
def in_window(t): return next((k for k, (a, b) in WIN.items() if a <= t < b), None)
for b0, b1, fn, pat, octv, g, pan in VOICES:
    t = (b0 - 1) * BAR
    while t < min((b1 - 1) * BAR, DUR - 2):
        _, tones = chord_at(t); step = int(round((t % BAR) / (BEAT / 2))) % 8; k = pat[step]
        if k is not None:
            w = in_window(t); g2 = g * hush(t) * (.75 if w else 1.0)
            if fn is horn: add(music, horn(hz(tones[k] - 12 + octv), .35, 1), t, g2, pan)
            else: add(music, fn(hz(tones[k] + octv)), t, g2, pan)
        t += BEAT / 2
# bass on the downbeat of every bar from the first course to the end (not in the hushes)
for b in range(6, 91):
    t = (b - 1) * BAR
    if t >= DUR - 1 or hush(t) < 1: continue
    add(music, bass(hz(chord_at(t)[0] - 12), 1.6, 1), t, .32, 0)
# the montage (S6, bars 47-52): hand percussion on every eighth, an accent per poster pull
for i in range(int(12 / .25)):
    t = 92 + i * .25; x = bp(noise(.08), 1800, 6000) * env_exp(.08, .02); add(music, x.astype(np.float32), t, .25 if i % 2 else .45, (-.3, .3)[i % 2])
# pads: the opening (orbit), the night (S9) and the finale tail
add(music, pad([hz(50), hz(57), hz(62)], 10.5), 0, .9, 0)
add(music, pad([hz(50), hz(54), hz(57), hz(62)], 13.0), 141, .7, 0)
add(music, pad([hz(50), hz(57), hz(62), hz(66)], DUR - 168), 168, .8, 0)
# the bonang alone at night (bars 70-77)
for i, m in enumerate([74, 69, 71, 66, 69, 62]): add(music, bonang(hz(m)), 141.5 + i * 1.5, .3, (-.2, .2)[i % 2])
# the chime at the turns
for at in (10.2, 27.2, 46.0, 64.8, 82.0, 106.4, 123.0, 140.0, 154.0, 160.0, 178.0):
    if at < DUR: chime(at, 1.0 if at in (10.2, 154.0, 178.0) else .6)
# the landing at the campus (160.0): descending whistle, a low hit, the full chord
def whistle(d=.42):
    t = t_(d); f = 1800 * np.exp(-t * 3.2); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .02) * (1 - t / d) * .3).astype(np.float32)
add(fx, whistle(), 160.0 - .42, .6, 0); add(fx, sfx.thump(1.0, 60), 160.0, 1.0, 0)
for m in (50, 57, 62, 66, 69): add(music, horn(hz(m), 1.2, 1), 160.0, .2, 0)
# the tagline (170.4): resolve on the tonic, the last chime at 178
for m in (62, 66, 69, 74): add(music, vibes(hz(m)), 170.4, .25, 0); add(music, harp(hz(m - 12)), 170.4, .2, 0)

# ------------------------------------------------------------------ foley from the events
def ev(name): return json.load(open(os.path.join(HERE, f'audio_events_{name}.json')))['ev']
LINE_NOTE = {'M': 62, 'K': 64, 'B': 66, 'H': 69, 'O': 71, 'N': 74, 'U': 76}
def felt(d):  # a felt-tip glide under a drawing pen tip
    x = bp(noise(d), 900, 4200) * .12; t = t_(d); return (x * np.minimum(1, t / .1) * np.minimum(1, (d - t) / .1)).astype(np.float32)
for e in ev('map'):
    t = e['t']
    if in_window(t): continue
    if e['type'] == 'stop': add(fx, glock(hz(LINE_NOTE.get(e.get('line'), 69) + 12), .5), t, .35 if e.get('tier', 3) <= 3 else .15, e.get('pan', 0))
    elif e['type'] == 'minor': add(fx, xylo(hz(PENTA[int(t * 7) % 5] + 24), .3), t, .12, e.get('pan', 0))
    elif e['type'] == 'x': add(fx, sfx.pop(.6), t, .5, e.get('pan', 0)); add(fx, sfx.thump(.4, 90), t, .4, e.get('pan', 0))
    elif e['type'] == 'drop' and abs(t - 160) > .5: add(fx, whistle(), t - .42, .4, e.get('pan', 0)); add(fx, sfx.thump(.8, 70), t, .7, e.get('pan', 0))
    elif e['type'] == 'depart' and e.get('t1'): add(fx, felt(max(.2, e['t1'] - t)), t, .5, e.get('pan', 0))
    elif e['type'] == 'window': add(fx, sfx.whoosh(.35, .5), t - .2, .35, 0)
# window foley (window events are local: add the window start)
def pings(t0, f=1250, v=.4):
    t = t_(.6); x = np.sin(2 * np.pi * f * t + 2 * np.sin(2 * np.pi * 7 * t)) * np.exp(-t / .15); add(fx, x.astype(np.float32), t0, v, .2)
for name, (a, b) in WIN.items():
    for e in ev(name):
        t = a + e['t']; ty = e['type']
        if name in ('S0', 'S8'):
            if ty in ('lock', 'land'): pings(t, 1250, .5); add(fx, sfx.thump(.5, 80), t, .4)
            elif ty in ('search', 'range'): [pings(t + k * .4, 900, .15) for k in range(4)]
            elif ty == 'colour': add(fx, bp(noise(1.5), 300, 2500).astype(np.float32) * np.exp(-t_(1.5) / .6).astype(np.float32), t, .15)
        elif name == 'S2':
            if ty == 'relay': add(fx, sfx.click(.6, 1), t, .6)
            elif ty == 'strike': add(fx, (bp(noise(.25), 2000, 9000) * env_exp(.25, .05)).astype(np.float32), t, .4); add(fx, sfx.thump(.4, 60), t, .3)
            elif ty == 'flute': add(fx, glock(hz([74, 76, 78, 81, 83, 86, 88, 90, 93, 95][e.get('i', 0) % 10]), .4), t, .35)
            elif ty == 'climb': x = bp(noise(2.4), 400, 3000) * np.linspace(0, 1, int(2.4 * SR)) ** 2 * .3; add(fx, x.astype(np.float32), t, .5)
            elif ty == 'land': add(music, horn(hz(50), .9, 1), t, .3); add(fx, sfx.thump(.7, 55), t, .6)
        elif name == 'S3' and ty == 'pen': d = min(.6, e.get('dur', .3)); add(fx, (bp(noise(d), 1600, 7500) * .2 * (.6 + .4 * np.sin(np.arange(int(d * SR)) / SR * 90))).astype(np.float32), t, .25, rng.uniform(-.3, .3))
        elif name == 'S3' and ty == 'wash': add(fx, (bp(noise(.9), 300, 2000) * env_exp(.9, .3)).astype(np.float32), t, .2)
        elif name == 'S4' and ty in ('tick', 'label'): add(fx, sfx.click(1.6 if ty == 'tick' else 1.0, .5), t, .35)
        elif name == 'S4' and ty in ('cut', 'open'): add(fx, sfx.whoosh(.3, .5), t, .35)
        elif name == 'S5' and ty == 'tick': add(fx, sfx.click(2.0, .3), t, .15)
        elif name == 'S6' and ty == 'pull': x = bp(noise(.32), 500, 3000) * np.sin(np.linspace(0, np.pi, int(.32 * SR))) * .5; add(fx, x.astype(np.float32), t, .35, rng.uniform(-.3, .3))
        elif name == 'S7': add(fx, marimba(hz(PENTA[int(e['t'] * 13) % 5] + (24 if ty == 'tile' else 12)), .5), t, .12 if ty == 'tile' else .3, rng.uniform(-.4, .4))
        elif name == 'S9' and ty == 'layer': add(fx, bonang(hz(PENTA[int(t) % 5] + 12), .4), t, .2)
# ambience beds: the city (traffic, horns) under S5, the night market under S9, the room tone under S2, the harbour wind under S8
amb_seg = {'S5': (bp(noise(8.5), 120, 1800) * .25), 'S9': (bp(noise(10.5), 300, 3500) * .12), 'S2': (lp(noise(11.5), 300) * .08), 'S8': (bp(noise(7.5), 80, 900) * .18)}
for k, x in amb_seg.items():
    a, b = WIN[k]; d = len(x) / SR; env = np.minimum(1, t_(d) / .4) * np.minimum(1, (d - t_(d)) / .4); add(amb, (x * env).astype(np.float32), a - .25, 1.0, 0)
for k in range(3): add(fx, horn(hz(68 + k * 3), .12, 1), 84.0 + k * 1.7, .06, (-.5, .5, 0)[k])

# ------------------------------------------------------------------ voice and mix
import soundfile as sf
vo, vsr = sf.read(os.path.join(ROOT, 'voice', 'scratch_vo.wav'), dtype='float32')
vo = resample_poly(vo, SR, vsr).astype(np.float32); vo = vo[:N]
voice = np.zeros(N); voice[:len(vo)] = vo * 1.6
# duck music under the voice (envelope follower, -9 dB)
envv = np.convolve(np.abs(voice), np.ones(int(.12 * SR)) / int(.12 * SR), 'same'); duck = 1 - .65 * np.clip(envv / (envv.max() * .25 + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(int(.2 * SR)) / int(.2 * SR), 'same')
music = hp(music.T, 40).T
mix = music * .9 * duck[:, None] + fx * .8 + amb * .7 + voice[:, None] * .9
mix = mix[:int(DUR * SR)]
if FMT == 'tv':   # the loop bridge: fade the last 2 s so the restart does not click
    n = int(2 * SR); mix[-n:] *= np.linspace(1, 0, n)[:, None]
mix = np.stack([limit(compress(mix[:, c], .3, 2.5), .9) for c in range(2)], 1)
out = os.path.join(HERE, f'mix_{FMT}.wav'); sf.write(out, mix.astype(np.float32), SR)
print('mix', out, f'{len(mix) / SR:.1f}s peak {np.abs(mix).max():.2f}')
