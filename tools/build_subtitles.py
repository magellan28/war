"""English subtitles (SRT) from the layout + per-sentence narration timings.
Long sentences are split into cues of <= 2 lines x 42 chars, timed
proportionally to their length. Output: subtitles/pearl_harbor_en.srt"""
import json, os, textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = json.load(open(os.path.join(ROOT, "src/data/layout.json")))
T = json.load(open(os.path.join(ROOT, "public/voice/timings.json")))
FPS = L["fps"]


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def chunks(text, maxlen=84):
    words, out, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > maxlen and cur:
            out.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        out.append(cur)
    # avoid a tiny orphan last chunk
    if len(out) > 1 and len(out[-1]) < 18:
        last = out.pop()
        out[-1] += " " + last
    return out


cues = []
for ch in L["chapters"]:
    for sc in ch["scenes"]:
        base = (ch["filmFrom"] + sc["from"] + sc["voiceAt"]) / FPS
        for s in T[sc["id"]]["sentences"]:
            parts = chunks(s["text"])
            total = sum(len(p) for p in parts)
            t = base + s["start"]
            span = s["end"] - s["start"]
            for p in parts:
                d = span * len(p) / total
                cues.append((t, t + d, "\n".join(textwrap.wrap(p, 42))))
                t += d

os.makedirs(os.path.join(ROOT, "subtitles"), exist_ok=True)
with open(os.path.join(ROOT, "subtitles/pearl_harbor_en.srt"), "w") as f:
    for i, (a, b, txt) in enumerate(cues, 1):
        b = min(b + 0.15, cues[i][0] - 0.05) if i < len(cues) else b + 0.3
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n")
print(len(cues), "cues")
