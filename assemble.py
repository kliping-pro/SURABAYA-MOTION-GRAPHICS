"""Assemble the film for one format: the map spine with the eight windows cut in on their downbeats, the subtitles
(Indonesian over English, from the narration table in map/timeline.js), the mix, loudness -14 LUFS.
    python assemble.py reels|tv
Writes surabaya-explore-ut_<fmt>.mp4 and surabaya-explore-ut_<fmt>.srt in this folder."""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
FMT = sys.argv[1] if len(sys.argv) > 1 else 'reels'
TV = FMT == 'tv'; W, H = (1920, 1080) if TV else (1080, 1920); DUR = 188.0 if TV else 180.0
P = os.path.join(HERE, 'parts', FMT)
WIN = [('S0', 0, 10), ('S2', 29, 40), ('S3', 47, 58), ('S4', 67, 76), ('S5', 82, 90), ('S6', 92, 104), ('S7', 107, 116), ('S8', 128, 135), ('S9', 141, 151)]
# ------------------------------------------------------------------ the cut list
segs, t = [], 0.0
for name, a, b in WIN:
    if a > t: segs.append(('spine', t, a))
    segs.append((name, 0, b - a)); t = b
segs.append(('spine', t, DUR))
# each piece is cut to its own file (frame-exact re-encode), then joined with the concat demuxer: low memory
pieces = []
for i, (n, a, b) in enumerate(segs):
    f = os.path.join(P, f'piece_{i:02d}.mp4'); pieces.append(f)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(P, f'{n}.mp4'), '-vf', f'trim=start={a}:end={b},setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1',
                    '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-an', f], check=True)
lst = os.path.join(P, 'pieces.txt'); open(lst, 'w').write(''.join(f"file '{f}'\n" for f in pieces))
cutf = os.path.join(P, 'cut.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', cutf], check=True)
args = ['ffmpeg', '-v', 'error', '-y', '-i', cutf]; inputs = ['cut']; fc = ['[0:v]null[cut]']
# ------------------------------------------------------------------ subtitles (ASS: paper strip, Inter, ID bold over EN)
src = open(os.path.join(HERE, 'map', 'timeline.js')).read()
block = src[src.index('const VO = ['):src.index('].map(', src.index('const VO = ['))]
rows = re.findall(r"\[(\d+), (\d+), ([\d.]+), '((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\]", block)
cues = []
for b, bt, d, idt, en in rows:
    t0 = (int(b) - 1) * 2 + (int(bt) - 1) * .5; need = max(1.8, float(d) + .6, len(idt) / 15 + 1.5)
    cues.append((t0, t0 + need, idt.replace("\\'", "'"), en.replace("\\'", "'")))
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
fs1, fs2 = (40, 26) if TV else (40, 27)
mv = 70 if TV else 520                       # reels: the strip sits 1300-1480 px from the top of 1920
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter,{fs1},&H001E1C1B,&H001E1C1B,&H18E5EEF2,&H18E5EEF2,0,0,0,0,100,100,0,0,3,14,0,2,{60 if TV else 70},{60 if TV else 70},{mv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
srt = []
for i, (a, b, idt, en) in enumerate(cues):
    ass += f"Dialogue: 0,{ts(a)},{ts(b)},Sub,,0,0,0,,{{\\fad(150,150)\\b1}}{idt}\\N{{\\b0\\fs{fs2}\\c&H00404A4A&}}{en}\n"
    f = lambda x: f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)):03d}'
    srt.append(f'{i + 1}\n{f(a)} --> {f(b)}\n{idt}\n{en}\n')
open(os.path.join(HERE, f'subs_{FMT}.ass'), 'w').write(ass)
open(os.path.join(HERE, f'surabaya-explore-ut_{FMT}.srt'), 'w').write('\n'.join(srt))
fonts = os.path.join(HERE, 'map', 'fonts')
if TV:   # BRANDING.md: a small logo bug (UT + SENMASTER on a white plate, 85 %) top-right from the title to the tagline, for viewers who walk by
    from PIL import Image, ImageDraw
    hh, pad = 72, 12; ims = [Image.open(os.path.join(HERE, 'brand', f'logo-{n}.png')).convert('RGBA') for n in ('ut', 'senmaster')]
    ims = [im.resize((int(im.width * hh / im.height), hh), Image.LANCZOS) for im in ims]; wd = sum(im.width for im in ims) + pad * 3
    plate = Image.new('RGBA', (wd, hh + pad * 2), (0, 0, 0, 0)); ImageDraw.Draw(plate).rounded_rectangle([0, 0, wd - 1, hh + pad * 2 - 1], 12, fill=(255, 255, 255, 255))
    x = pad
    for im in ims: plate.alpha_composite(im, (x, pad)); x += im.width + pad
    plate.putalpha(plate.getchannel('A').point(lambda v: int(v * .85))); bug = os.path.join(HERE, 'parts', 'tv', 'bug.png'); plate.save(bug)
    args += ['-i', bug]; k = len(inputs)
    fc.append(f"[cut][{k}:v]overlay=W-w-34:34:enable='between(t,10.5,170)*not(between(t,127.8,135.2))'[cutb]"); src_label = 'cutb'
else: src_label = 'cut'
fc.append(f"[{src_label}]subtitles={os.path.join(HERE, f'subs_{FMT}.ass')}:fontsdir={fonts}[vout]")
silent = os.path.join(HERE, 'parts', FMT, 'picture.mp4')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', silent], check=True)
# ------------------------------------------------------------------ loudness: two-pass loudnorm to -14 LUFS, true peak -1.5
mixw = os.path.join(HERE, 'audio', f'mix_{FMT}.wav')
m = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mixw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
out = os.path.join(HERE, f'surabaya-explore-ut_{FMT}.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', silent, '-i', mixw, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', ln + ',aresample=48000', '-c:a', 'aac', '-b:a', '256k', '-t', str(DUR), '-movflags', '+faststart', out], check=True)
print('done', out)
