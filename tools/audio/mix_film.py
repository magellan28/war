"""Full-film soundtrack: original procedural score + synthesised SFX + fenrir
narration, with music ducked under the voice. Everything here is generated in
code (no third-party samples), so there are no licensing constraints.

Output: public/audio/film_mix.wav (48 kHz stereo) and out/audio/stems/*.wav
Timeline comes from src/data/layout.json; sentence timings from
public/voice/timings.json (same numbers the visuals use).
"""
import json, os
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 48000
FPS = 30
L = json.load(open(os.path.join(ROOT, "src/data/layout.json")))
TIM = json.load(open(os.path.join(ROOT, "public/voice/timings.json")))
N = int(L["duration"] / FPS * SR) + SR
rng = np.random.default_rng(1941)
OUTD = os.path.join(ROOT, "out/audio/stems")
os.makedirs(OUTD, exist_ok=True)

music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)
voice = np.zeros((N, 2), np.float32)


def lp(x, hz, o=2):
    b, a = signal.butter(o, min(hz, SR / 2 - 100) / (SR / 2), "low")
    return signal.lfilter(b, a, x, axis=0).astype(np.float32)


def hp(x, hz, o=2):
    b, a = signal.butter(o, hz / (SR / 2), "high")
    return signal.lfilter(b, a, x, axis=0).astype(np.float32)


def bp(x, lo, hi, o=2):
    b, a = signal.butter(o, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band")
    return signal.lfilter(b, a, x, axis=0).astype(np.float32)


def put(buf, clip, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(clip) <= 0:
        return
    if i < 0:
        clip, i = clip[-i:], 0
    j = min(len(buf), i + len(clip))
    c = clip[: j - i]
    if c.ndim == 1:
        lg, rg = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        buf[i:j, 0] += c * gain * lg * 1.414
        buf[i:j, 1] += c * gain * rg * 1.414
    else:
        buf[i:j] += c * gain


def env_adsr(n, a=0.5, r=1.0):
    e = np.ones(n, np.float32)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def tt(n):
    return np.arange(n, dtype=np.float32) / SR


# ------------------------------------------------------------- instruments
def saw(f, n, det=0.0):
    t = tt(n)
    ph = (f * (1 + det)) * t
    return (2 * (ph % 1) - 1).astype(np.float32)


def pad(freqs, dur, bright=900, a=1.5, r=2.0):
    n = int(dur * SR)
    x = np.zeros(n, np.float32)
    for f in freqs:
        for d in (-0.004, 0.0, 0.0045):
            x += saw(f, n, d) * 0.3
    x = lp(x, bright, 2)
    st = np.stack([x, np.roll(x, 300)], 1)
    return st * env_adsr(n, a, r)[:, None] / max(1, len(freqs))


def sub(f, dur, a=2, r=2):
    n = int(dur * SR)
    t = tt(n)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    return (x * env_adsr(n, a, r)).astype(np.float32)


def drum(f0=55, dur=0.9, decay=7, noise=0.25):
    n = int(dur * SR)
    t = tt(n)
    x = np.sin(2 * np.pi * f0 * t * (1 - 0.3 * t)) * np.exp(-t * decay)
    x += lp(rng.standard_normal(n).astype(np.float32), 900) * np.exp(-t * decay * 2.5) * noise
    return x.astype(np.float32)


def bell(f, dur=3.0):
    n = int(dur * SR)
    t = tt(n)
    x = sum(np.sin(2 * np.pi * f * m * t) * w * np.exp(-t * (1.5 + m)) for m, w in ((1, 1), (2.01, 0.4), (3.02, 0.2), (4.2, 0.1)))
    return (x * 0.5).astype(np.float32)


def tick():
    n = int(0.03 * SR)
    return (hp(rng.standard_normal(n).astype(np.float32), 3000) * np.exp(-tt(n) * 200)).astype(np.float32)


NOTE = {"C2": 65.41, "D2": 73.42, "E2": 82.41, "F2": 87.31, "G2": 98.0, "A2": 110.0, "Bb2": 116.54, "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.0, "A3": 220.0, "Bb3": 233.08, "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0}
CH = lambda *ns: [NOTE[n] for n in ns]  # noqa: E731

PROG = {
    "tension": [CH("D2", "A2", "D3", "F3"), CH("Bb2", "F3", "D3"), CH("D2", "A2", "E3", "F3")],
    "history": [CH("D2", "A2", "D3", "F3"), CH("Bb2", "D3", "F3"), CH("F2", "C3", "A3"), CH("C3", "E3", "G3")],
    "strategy": [CH("A2", "E3", "A3", "C4"), CH("F2", "C3", "A3"), CH("G2", "D3", "Bb3"), CH("A2", "E3", "A3")],
    "intel": [CH("E2", "B2" if False else "G2", "E3", "G3"), CH("C3", "E3", "G3"), CH("D3", "F3", "A3"), CH("E2", "G2", "E3")],
    "fleet": [CH("D2", "A2", "D3"), CH("C3", "G3", "C4"), CH("Bb2", "F3", "Bb3"), CH("A2", "E3", "A3")],
    "attack": [CH("D2", "A2", "D3", "F3"), CH("Bb2", "F3", "Bb3"), CH("C3", "G3", "C4"), CH("A2", "E3", "A3")],
    "elegy": [CH("D3", "F3", "A3"), CH("Bb2", "D3", "F3"), CH("G2", "Bb2", "D3"), CH("A2", "C3", "E3")],
    "resolve": [CH("F2", "C3", "F3", "A3"), CH("D3", "F3", "A3"), CH("Bb2", "D3", "F3"), CH("C3", "E3", "G3")],
    "finale": [CH("D2", "A2", "D3", "F3"), CH("Bb2", "F3", "Bb3", "D4"), CH("F2", "C3", "F3", "A3"), CH("C3", "G3", "C4", "E4")],
}
STYLE = {  # chord length (s), brightness, pulse bpm (0=none), drums, bells
    "tension": (6, 500, 52, False, False),
    "history": (5, 900, 0, False, True),
    "strategy": (5, 800, 0, False, True),
    "intel": (4, 700, 120, False, False),
    "fleet": (4, 800, 72, True, False),
    "attack": (3, 1400, 132, True, False),
    "elegy": (7, 600, 0, False, True),
    "resolve": (4, 1100, 0, True, True),
    "finale": (5, 1300, 0, True, True),
}


def score(mood, t0, dur, seed):
    prog, (clen, bright, bpm, drums, bells) = PROG[mood], STYLE[mood]
    r = np.random.default_rng(seed)
    t = 0.0
    k = 0
    while t < dur:
        chord = prog[k % len(prog)]
        cl = min(clen + 1.5, dur - t + 0.5)
        put(music, pad(chord, cl, bright, a=1.2, r=1.8), t0 + t, 0.22)
        put(music, sub(chord[0] / 2 if chord[0] > 80 else chord[0], cl, 1.0, 1.5), t0 + t, 0.18)
        if bells and k % 2 == 0:
            put(music, bell(chord[-1] * 2), t0 + t + 0.4, 0.06, pan=r.uniform(-0.6, 0.6))
        t += clen
        k += 1
    if bpm:
        step = 60 / bpm
        n = int(dur / step)
        for i in range(n):
            tt_ = t0 + i * step
            ramp_in = min(1, (i * step) / 4) * min(1, (dur - i * step) / 3)
            if mood == "intel":
                put(music, tick(), tt_, 0.10 * ramp_in, pan=0.3 if i % 2 else -0.3)
            elif mood == "tension":
                put(music, drum(48, 0.6, 8, 0.05), tt_, 0.35 * ramp_in)
            else:
                put(music, drum(52 if i % 2 == 0 else 60, 0.7, 7), tt_, (0.32 if i % 4 == 0 else 0.18) * ramp_in, pan=0.15 if i % 2 else -0.15)
                if mood == "attack" and i % 8 == 7:
                    put(music, drum(90, 0.4, 12, 0.6), tt_ + step / 2, 0.2 * ramp_in)
    if drums and mood in ("finale", "resolve"):
        for i in range(int(dur / 2.5)):
            put(music, drum(45, 1.4, 3.5), t0 + i * 2.5, 0.25 * min(1, i / 3))


# ------------------------------------------------------------- SFX library
def engine(dur, f=95, rough=0.4):
    n = int(dur * SR)
    t = tt(n)
    x = sum(np.sign(np.sin(2 * np.pi * f * h * t + h)) * w for h, w in ((1, 1), (2, 0.4), (3, 0.2)))
    x = lp(x.astype(np.float32), 600) + lp(rng.standard_normal(n).astype(np.float32), 800) * rough
    return (x * (0.8 + 0.2 * np.sin(2 * np.pi * 7 * t))).astype(np.float32)


def flyby(dur=4.0, f=95):
    n = int(dur * SR)
    t = np.linspace(-1, 1, n)
    doppler = f * (1 + 0.08 * -np.tanh(t * 3))
    ph = np.cumsum(doppler) / SR
    x = sum(np.sign(np.sin(2 * np.pi * ph * h + h)) * w for h, w in ((1, 1), (2, 0.4)))
    x = lp(x.astype(np.float32), 900) + lp(rng.standard_normal(n).astype(np.float32), 1200) * 0.5
    e = np.exp(-(t * 2.2) ** 2)
    st = np.stack([x * e * (0.5 - 0.5 * t), x * e * (0.5 + 0.5 * t)], 1)
    return st.astype(np.float32)


def boom(size=1.0, dur=3.5):
    n = int(dur * SR)
    t = tt(n)
    x = np.sin(2 * np.pi * 38 * t * (1 - 0.2 * t)) * np.exp(-t * 1.4 / size)
    x += lp(rng.standard_normal(n).astype(np.float32), 500) * np.exp(-t * 1.8 / size) * 0.9
    x += hp(rng.standard_normal(n).astype(np.float32), 1500) * np.exp(-t * 12) * 0.3
    return (x * size).astype(np.float32)


def siren(dur=8.0):
    n = int(dur * SR)
    t = tt(n)
    f = 420 + 260 * (0.5 - 0.5 * np.cos(2 * np.pi * t / 4))
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) + 0.3 * np.sin(4 * np.pi * ph)
    return (bp(x.astype(np.float32), 300, 2500) * env_adsr(n, 1.5, 2)).astype(np.float32)


def sea(dur, level=1.0):
    n = int(dur * SR)
    t = tt(n)
    x = lp(rng.standard_normal((n, 2)).astype(np.float32), 700)
    sw = 0.6 + 0.4 * np.sin(2 * np.pi * t / 6.5)
    return (x * sw[:, None] * env_adsr(n, 1, 1.5)[:, None] * level).astype(np.float32)


def gun(n_shots=1):
    x = np.zeros(int(1.5 * SR), np.float32)
    for i in range(n_shots):
        s = int(i * 0.35 * SR)
        b = boom(0.35, 1.0)
        x[s: s + len(b)] += b[: len(x) - s]
    return x


def teletype(dur):
    n = int(dur * SR)
    x = np.zeros(n, np.float32)
    k = tick()
    t = 0
    while t < n - len(k):
        x[t: t + len(k)] += k * rng.uniform(0.5, 1)
        t += int(rng.uniform(0.04, 0.09) * SR)
    return x


def typewriter(dur):
    n = int(dur * SR)
    x = np.zeros(n, np.float32)
    t = 0
    while t < n - SR // 10:
        c = (bp(rng.standard_normal(SR // 30).astype(np.float32), 800, 4000) * np.exp(-tt(SR // 30) * 120))
        x[t: t + len(c)] += c
        t += int(rng.uniform(0.07, 0.16) * SR)
    return x


def hum(dur, f=60):
    n = int(dur * SR)
    t = tt(n)
    return ((np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 3 * t)) * 0.4 * env_adsr(n, 0.5, 1)).astype(np.float32)


def ping(f=1046):
    n = int(2.5 * SR)
    t = tt(n)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2)).astype(np.float32)


def whoosh(dur=1.6):
    n = int(dur * SR)
    x = rng.standard_normal(n).astype(np.float32)
    t = np.linspace(0, 1, n)
    out = np.zeros(n, np.float32)
    for k in range(0, n, 2048):
        c = 200 * (16 ** np.sin(np.pi * min(1, (k + 1024) / n) * 0.5))
        seg = bp(x[max(0, k - 512): k + 2048], c * 0.6, c * 1.4)
        out[k: k + 2048] = seg[-len(out[k: k + 2048]):]
    return out * np.where(t < 0.55, (t / 0.55) ** 2, ((1 - t) / 0.45) ** 1.5)


def metal(dur=4):
    n = int(dur * SR)
    t = tt(n)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((143, 0.8), (311, 1.1), (467, 1.6)))
    return (x * 0.3 * env_adsr(n, 0.6, 1)).astype(np.float32)


def hammer(dur):
    n = int(dur * SR)
    x = np.zeros(n, np.float32)
    t = 0
    while t < n - SR // 4:
        c = bell(rng.uniform(900, 1300), 0.25) * 0.8
        x[t: t + len(c)] += c
        t += int(rng.uniform(0.35, 0.8) * SR)
    return x


# ------------------------------------------------------------- timeline
def scene_t(cid, sid):
    ch = L["chapters"][cid - 1]
    sc = next(s for s in ch["scenes"] if s["id"] == sid)
    base = (ch["filmFrom"] + sc["from"]) / FPS
    va = sc["voiceAt"] / FPS
    sent = TIM[sid]["sentences"]
    return base, (lambda i: base + va + sent[min(i, len(sent) - 1)]["start"]), sc["duration"] / FPS


# voice
from scipy.io import wavfile as _wf  # noqa: E402
for ch in L["chapters"]:
    for sc in ch["scenes"]:
        sr, v = _wf.read(os.path.join(ROOT, f"public/voice/{sc['id']}.wav"))
        v = v.astype(np.float32) / 32768
        v = signal.resample_poly(v, SR, sr).astype(np.float32)
        put(voice, v, (ch["filmFrom"] + sc["from"] + sc["voiceAt"]) / FPS, 1.0)

# score per chapter (with crossfaded tails)
for ch in L["chapters"]:
    t0 = ch["filmFrom"] / FPS
    score(ch["music"], t0, ch["duration"] / FPS, ch["n"] * 7)

# chapter-card stingers
for ch in L["chapters"][1:]:
    t0 = ch["filmFrom"] / FPS
    put(sfx, boom(0.6, 3), t0 + 0.4, 0.35)
    put(sfx, whoosh(1.4), t0 + 0.1, 0.2)

# scene-specific sound design
b, s, d = scene_t(1, "c1s1"); put(sfx, sea(d + 1), b, 0.12); put(sfx, drum(40, 2, 2), b + 1.2, 0.5)
b, s, d = scene_t(1, "c1s2")
put(sfx, siren(d), b + 1.0, 0.12)
for i in range(4):
    put(sfx, flyby(4.0, 92 + i * 6), s(0) - 1.0 + i * 0.6, 0.35)
for i, x in enumerate([1.5, 2.4, 3.3, 4.2, 5.1, 6.6, 8.0, 9.5, 11.0]):
    put(sfx, boom(0.7 + 0.1 * (i % 3), 3), b + x + 0.4, 0.3, pan=((i % 5) - 2) / 3)
b, s, d = scene_t(1, "c1s3"); put(sfx, whoosh(2.2), b + 0.2, 0.35); put(sfx, boom(1.0, 4), s(1) + 4.3, 0.4)
b, s, d = scene_t(3, "c3s3")
for i in range(4):
    put(sfx, boom(0.4, 2), (scene_t(3, "c3s3")[1](0)) + (70 + i * 16) / FPS, 0.18)
b, s, d = scene_t(3, "c3s5"); put(sfx, whoosh(1.2), s(0) + 1.2, 0.2); put(sfx, boom(0.5, 2), s(1) + 122 / FPS, 0.3)
b, s, d = scene_t(4, "c4s1"); put(sfx, teletype(d - 1), b + 0.5, 0.18)
b, s, d = scene_t(4, "c4s2"); put(sfx, lp(rng.standard_normal(int(4 * SR)).astype(np.float32), 3000) * env_adsr(int(4 * SR), 0.2, 3), b, 0.06)
b, s, d = scene_t(4, "c4s3"); put(sfx, bell(880, 1.5), s(0) + 2, 0.08)
b, s, d = scene_t(4, "c4s4"); put(sfx, typewriter(6), s(0) - 0.6, 0.2)
b, s, d = scene_t(4, "c4s5")
for i in range(int(d / 1.0)):
    put(sfx, tick(), b + i, 0.25)
b, s, d = scene_t(4, "c4s6"); put(sfx, sea(d), b, 0.12); put(sfx, gun(2), s(1) + 2.6, 0.45); put(sfx, boom(0.6, 2.5), s(1) + 3.6, 0.35)
b, s, d = scene_t(4, "c4s7"); put(sfx, hum(d, 60), b, 0.06); put(sfx, ping(), s(0) + 1.2, 0.12); put(sfx, ping(1318), s(0) + 2.2, 0.08)
for sid in ("c5s1", "c5s2", "c5s3", "c5s4", "c5s5"):
    b, s, d = scene_t(5, sid)
    put(sfx, sea(d + 0.6, 1.4), b, 0.18)
b, s, d = scene_t(5, "c5s4"); put(sfx, ping(660), s(0), 0.15); put(sfx, ping(660), s(0) + 0.5, 0.12)
b, s, d = scene_t(6, "c6s1"); put(sfx, sea(d, 1.2), b, 0.16)
for i in range(7):
    put(sfx, flyby(4.0, 100 + i * 3), s(0) - 0.4 + i * 26 / FPS, 0.28, pan=0.2)
b, s, d = scene_t(6, "c6s2"); put(sfx, engine(d, 90, 0.5) * env_adsr(int(d * SR), 2, 2), b, 0.12); put(sfx, siren(d - 2), s(1), 0.1)
for i in range(4):
    put(sfx, boom(0.5, 2.5), s(1) + (60 + i * 10) / FPS, 0.25, pan=(i - 1.5) / 2)
b, s, d = scene_t(6, "c6s3"); put(sfx, ping(880), s(0) + 2.0, 0.15); put(sfx, ping(880), s(0) + 2.47, 0.15); put(sfx, ping(880), s(0) + 2.94, 0.15)
b, s, d = scene_t(6, "c6s4"); put(sfx, flyby(5, 88), s(1) - 0.5, 0.3)
b, s, d = scene_t(6, "c6s5")
put(sfx, siren(d), b, 0.1)
for x in (10, 22, 60, 95):
    put(sfx, boom(0.8, 3), s(0) + x / FPS, 0.35, pan=-0.4)
put(sfx, metal(4), s(0) + 1.5, 0.25)
for x in (-20, 10, 40):
    put(sfx, boom(0.8, 3), s(1) + x / FPS, 0.35, pan=0.4)
b, s, d = scene_t(6, "c6s6"); put(sfx, flyby(3, 92), s(0) - 0.3, 0.25); put(sfx, boom(2.2, 6), s(0) + 70 / FPS, 0.75)
put(sfx, hp(rng.standard_normal(int(5 * SR)).astype(np.float32), 6000) * np.exp(-tt(int(5 * SR)) * 0.8), s(0) + 70 / FPS + 0.3, 0.02)
b, s, d = scene_t(6, "c6s7")
for i in range(18):
    put(sfx, boom(0.35, 1.5), b + 1 + i * 0.85, 0.18, pan=((i * 7) % 5 - 2) / 2.5)
put(sfx, engine(d, 85, 0.5) * env_adsr(int(d * SR), 2, 3), b, 0.1)
b, s, d = scene_t(6, "c6s8"); put(sfx, engine(d * 0.6, 80, 0.4) * np.linspace(1, 0, int(d * 0.6 * SR)), b, 0.12); put(sfx, whoosh(2.0), s(1), 0.3)
b, s, d = scene_t(7, "c7s4"); put(sfx, hammer(d - 1), b + 0.8, 0.12); put(sfx, sea(d, 0.6), b, 0.08)
b, s, d = scene_t(8, "c8s1"); put(sfx, lp(rng.standard_normal((int(d * SR), 2)).astype(np.float32), 400) * 0.25, b, 0.1)
b, s, d = scene_t(8, "c8s2"); put(sfx, drum(70, 0.4, 14, 0.8), s(0) + 1.6, 0.25); put(sfx, drum(70, 0.4, 14, 0.8), s(0) + 3.0, 0.25)
b, s, d = scene_t(8, "c8s3")
for i in range(int(d / 0.5)):
    put(sfx, drum(120 if i % 2 else 80, 0.25, 18, 0.9), b + i * 0.5, 0.12)
b, s, d = scene_t(8, "c8s4"); put(sfx, sea(d, 1.0), b, 0.12); put(sfx, metal(5), s(0) + 0.5, 0.12)
b, s, d = scene_t(9, "c9s2")
for i in range(4):
    put(sfx, boom(0.8, 3), s(0) + (90 + i * 14) / FPS, 0.3)
b, s, d = scene_t(9, "c9s4"); put(sfx, sea(d, 1.0), b, 0.1)
b, s, d = scene_t(9, "c9s5"); put(sfx, sea(d + 8, 1.0), b, 0.14); put(sfx, bell(587.3, 5), s(1) + 200 / FPS, 0.12)

# map-move whooshes on wipes/flash transitions
for ch in L["chapters"]:
    for sc in ch["scenes"][:-1]:
        if sc["outTransition"] in ("wipe", "flash", "smoke"):
            put(sfx, whoosh(1.2), (ch["filmFrom"] + sc["from"] + sc["duration"] - sc["outOverlap"]) / FPS - 0.3, 0.16 if sc["outTransition"] != "flash" else 0.25)

# ------------------------------------------------------------- mix
# sidechain duck: music -11 dB and SFX -6 dB under narration
venv = np.abs(voice[:, 0])
win = int(0.25 * SR)
venv = np.convolve(venv, np.ones(win) / win, mode="same")
active = np.clip(venv / 0.02, 0, 1)
k = np.ones(int(0.4 * SR)) / int(0.4 * SR)
active = np.convolve(active, k, mode="same")
mduck = (1 - active * (1 - 10 ** (-11 / 20)))[:, None].astype(np.float32)
sduck = (1 - active * (1 - 10 ** (-6 / 20)))[:, None].astype(np.float32)
music *= mduck
sfx *= sduck

# chapter fades (music) to match picture dips
for ch in L["chapters"]:
    a = int(ch["filmFrom"] / FPS * SR)
    e = int((ch["filmFrom"] + ch["duration"]) / FPS * SR)
    fo = int(0.8 * SR)
    music[e - fo: e] *= np.linspace(1, 0.2, fo)[:, None]

mix = voice * 1.0 + music * 1.0 + sfx * 1.0
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2) * 0.9
for name, arr in (("voice", voice), ("music", music), ("sfx", sfx)):
    wavfile.write(os.path.join(OUTD, f"{name}.wav"), SR, (np.clip(arr / max(1e-6, np.max(np.abs(arr))) * 0.9, -1, 1) * 32767).astype(np.int16))
os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
wavfile.write(os.path.join(ROOT, "public/audio/film_mix_raw.wav"), SR, (mix * 32767).astype(np.int16))
print("mix written", round(len(mix) / SR, 1), "s; peak before norm", round(float(peak), 2))
