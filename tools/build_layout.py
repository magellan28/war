"""Film timeline from the script + measured narration.

scene frames = round((lead + voice + tail) * FPS)
Within a chapter, scenes are joined by transitions that overlap the two
scenes by `overlap` frames. Chapters are joined end-to-end (hard joins, each
chapter fades in/out itself), so chapters can be rendered independently.

Writes src/data/layout.json (used by Remotion, the audio mix and subtitles).
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
script = json.load(open(os.path.join(ROOT, "script/scenes.json")))
timings = json.load(open(os.path.join(ROOT, "public/voice/timings.json")))


def tx_type(desc: str):
    d = desc.lower()
    if d.startswith(("dip to black", "fade to black", "fade →", "fade through smoke", "fade to")) or "chapter" in d:
        return "chapter", 0
    if "smoke" in d:
        return "smoke", 24
    if "flash" in d:
        return "flash", 14
    if "continuous" in d or d.startswith("cut") or "match cut" in d or "clock-driven" in d:
        return "cut", 0
    if "slide" in d or "wipe" in d or "push" in d or "pull" in d or "pan" in d or "follow" in d or "zoom" in d:
        return "wipe", 18
    return "fade", 18


chapters = []
film_t = 0
for ch in script["chapters"]:
    scenes, t = [], 0
    for i, sc in enumerate(ch["scenes"]):
        voice = timings[sc["id"]]["duration"]
        dur = round((sc["lead"] + voice + sc["tail"]) * FPS)
        if i > 0:
            t -= scenes[-1]["outOverlap"]
        kind, ov = tx_type(sc["transition"])
        last = i == len(ch["scenes"]) - 1
        if last:
            kind, ov = "chapterEnd", 0
        scenes.append({
            "id": sc["id"], "kind": sc["kind"], "from": t, "duration": dur,
            "voiceAt": round(sc["lead"] * FPS), "voiceDur": round(voice * FPS),
            "outTransition": kind, "outOverlap": ov,
        })
        t += dur
    credits = 8 * FPS if ch["n"] == len(script["chapters"]) else 0
    chapters.append({"n": ch["n"], "title": ch["title"], "music": ch["music"], "duration": t + credits, "credits": credits, "filmFrom": film_t, "scenes": scenes})
    t += credits
    film_t += t

layout = {"fps": FPS, "duration": film_t, "chapters": chapters}
json.dump(layout, open(os.path.join(ROOT, "src/data/layout.json"), "w"), indent=1)
print("film", film_t, "frames =", round(film_t / FPS / 60, 2), "min")
for c in chapters:
    print(c["n"], c["title"], round(c["duration"] / FPS, 1), "s")
