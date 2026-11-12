"""Render script/scenes.json + measured layout into script/SCRIPT.md."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(ROOT, "script/scenes.json")))
L = json.load(open(os.path.join(ROOT, "src/data/layout.json")))
lay = {sc["id"]: (ch, sc) for ch in L["chapters"] for sc in ch["scenes"]}
tc = lambda f: f"{int(f / 30 // 60):02d}:{f / 30 % 60:05.2f}"  # noqa: E731
out = [f"# {S['title']}\n", f"Narration: Kokoro-82M, voice `{S['voice']['voice']}`, speed {S['voice']['speed']}. "
       f"Running time: {L['duration'] / 30 / 60:.2f} min ({L['duration']} frames @ 30 fps).\n"]
words = 0
for ch in S["chapters"]:
    c = L["chapters"][ch["n"] - 1]
    out.append(f"\n## Chapter {ch['n']} · {ch['title']}  \n`{tc(c['filmFrom'])}` · {c['duration'] / 30:.1f} s · music mood: {ch['music']}\n")
    for sc in ch["scenes"]:
        _, l = lay[sc["id"]]
        start = c["filmFrom"] + l["from"]
        text = " ".join(x["text"] for x in sc["lines"])
        words += len(text.split())
        out.append(f"\n### {sc['id'].upper()} · `{tc(start)}` · {l['duration'] / 30:.1f} s · {sc['kind']}\n")
        out.append(f"**Narration:** {text}\n")
        for k, lab in (("visual", "Visual"), ("camera", "Camera"), ("animation", "Animation"), ("assets", "Graphics"), ("transition", "Transition"), ("audio", "Music & SFX")):
            out.append(f"- **{lab}:** {sc[k]}")
        out.append(f"- **Sources:** {', '.join(sc['sources']) or '—'} (see research/sources.md)\n")
out.insert(2, f"Narration length: {words} words.\n")
open(os.path.join(ROOT, "script/SCRIPT.md"), "w").write("\n".join(out))
print("words", words)
