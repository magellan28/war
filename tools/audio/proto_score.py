"""Original programmatic score + sound design for the 25 s prototype.

Everything is synthesised here (no samples), so there are no licensing
constraints. Cue times are in seconds and mirror the frame timings in
src/scenes/proto/KidoButaiApproach.tsx (frame / 30).
"""
import os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 25.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(1941)
OUT = os.path.join(os.path.dirname(__file__), "../../public/audio/proto_mix.wav")


def env(points):
    """Piecewise-linear envelope from [(time, gain), ...]."""
    ts, gs = zip(*points)
    return np.interp(t, ts, gs)


def lp(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def hp(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def at(sec):
    return int(sec * SR)


def place(buf, clip, sec, gain=1.0):
    i = at(sec)
    j = min(len(buf), i + len(clip))
    if i < len(buf):
        buf[i:j] += clip[: j - i] * gain


L = np.zeros(N)
R = np.zeros(N)

# --- 1. Drone bed: D minor-ish cluster, slow beating, opening filter -------
drone = np.zeros(N)
for f, g in [(36.71, 1.0), (55.0, 0.55), (73.42, 0.45), (110.0, 0.18), (146.8, 0.08), (174.6, 0.05)]:
    for det in (-0.18, 0.18):
        ph = rng.uniform(0, 2 * np.pi)
        drone += g * np.sin(2 * np.pi * (f + det) * t + ph + 0.3 * np.sin(2 * np.pi * 0.07 * t))
drone = lp(drone, 900)
drone *= env([(0, 0), (2.5, 0.55), (9, 0.7), (15, 0.75), (20, 0.95), (23.4, 1.05), (23.55, 0.0), (24.2, 0.0), (25, 0.0)])
L += drone * 0.16
R += drone * 0.16

# --- 2. Ocean / wind air: filtered noise with slow swells ------------------
noise = rng.standard_normal(N)
air = bp(noise, 120, 1800)
air *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + 1.0)
air *= env([(0, 0), (2, 0.5), (14, 0.6), (17, 0.35), (23.5, 0.5), (23.55, 0), (25, 0)])
L += air * 0.05
R += np.roll(air, 900) * 0.05

# --- 3. Low pulse (heartbeat) accelerating toward the attack ---------------
def thump(f0=48, dur=0.5):
    tt = np.arange(int(SR * dur)) / SR
    return np.sin(2 * np.pi * f0 * tt * (1 - 0.35 * tt)) * np.exp(-tt * 9)

beat_times = []
s = 3.3
while s < 23.3:
    beat_times.append(s)
    interval = np.interp(s, [3, 15, 20, 23.3], [1.6, 1.2, 0.75, 0.42])
    s += interval
for bt in beat_times:
    g = np.interp(bt, [3, 10, 20, 23.3], [0.25, 0.35, 0.5, 0.65])
    th = thump()
    place(L, th, bt, g * 0.55)
    place(R, th, bt, g * 0.55)

# --- 4. Whooshes on camera moves -------------------------------------------
def whoosh(dur=1.6, lo=200, hi=3500, peak=0.55):
    n = int(SR * dur)
    x = rng.standard_normal(n)
    tt = np.linspace(0, 1, n)
    centre = lo * (hi / lo) ** np.sin(np.pi * tt * 0.5)
    out = np.zeros(n)
    hop = 2048
    for k in range(0, n, hop):
        c = centre[min(k + hop // 2, n - 1)]
        seg = x[max(0, k - 512): k + hop]
        y = bp(seg, max(60, c * 0.6), min(SR / 2 - 100, c * 1.4))
        out[k: k + hop] = y[-len(out[k: k + hop]):]
    e = np.where(tt < peak, (tt / peak) ** 2, ((1 - tt) / (1 - peak)) ** 1.5)
    return out * e

for sec, g, d in [(2.9, 0.22, 1.8), (8.6, 0.18, 2.2), (14.6, 0.24, 1.8), (16.4, 0.28, 1.6), (20.6, 0.3, 1.8)]:
    w = whoosh(d)
    place(L, w, sec, g)
    place(R, np.roll(w, 400), sec, g)

# --- 5. Interface blips on markers / labels --------------------------------
def blip(f=1760, dur=0.12):
    tt = np.arange(int(SR * dur)) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt)) * np.exp(-tt * 38)

for sec, f, pan in [(2.07, 1480, 0.3), (3.33, 1760, 0.6), (10.0, 1320, 0.7), (15.2, 1760, 0.5),
                    (19.7, 2093, 0.35), (19.93, 2093, 0.7), (20.13, 1975, 0.6), (20.2, 2349, 0.45)]:
    b = blip(f)
    place(L, b, sec, 0.07 * (1 - pan))
    place(R, b, sec, 0.07 * pan)

# --- 6. Sonar-like ping at the launch area ---------------------------------
tt = np.arange(int(SR * 2.4)) / SR
ping = np.sin(2 * np.pi * 1046 * tt) * np.exp(-tt * 2.6)
ping = ping + 0.5 * np.convolve(ping, np.exp(-np.arange(int(SR * 0.4)) / SR * 9) * 0.002, "same")
place(L, ping, 15.25, 0.06)
place(R, np.roll(ping, 1400), 15.25, 0.06)

# --- 7. Riser into the flash -------------------------------------------------
rs, re_ = 17.2, 23.53
n = at(re_) - at(rs)
tt = np.linspace(0, 1, n)
riser = np.zeros(n)
for k in range(4):
    f = 70 * 2 ** k * (1 + tt * 1.0)
    riser += np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 ** k)
rnoise = hp(rng.standard_normal(n), 2500) * tt ** 3
riser = riser * tt ** 2.2 * 0.5 + rnoise * 0.25
place(L, riser, rs, 0.32)
place(R, riser, rs, 0.32)

# --- 8. Impact at the flash (23.53 s) + low tail under the title ------------
tt = np.arange(int(SR * 3.5)) / SR
boom = np.sin(2 * np.pi * 42 * tt * (1 - 0.25 * tt)) * np.exp(-tt * 1.6)
crack = hp(rng.standard_normal(len(tt)), 1200) * np.exp(-tt * 14)
body = lp(rng.standard_normal(len(tt)), 400) * np.exp(-tt * 2.2)
impact = boom * 1.0 + crack * 0.35 + body * 0.6
place(L, impact, 23.53, 0.6)
place(R, impact, 23.53, 0.6)

tail = lp(rng.standard_normal(N), 140) * env([(0, 0), (23.6, 0), (24.0, 1), (25, 0.6)])
L += tail * 0.12
R += np.roll(tail, 700) * 0.12

# --- master: gentle stereo widening, soft clip, fades ----------------------
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.8, 1), (24.4, 1), (25, 0)])[:, None]
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.4) / np.tanh(1.4) * 0.89
wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
print("wrote", OUT, "peak", peak)
