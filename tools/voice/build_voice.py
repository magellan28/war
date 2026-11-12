"""Narration: Kokoro-82M (ONNX, Apache-2.0), voice am_fenrir.

Each sentence is synthesised separately (natural pauses, exact subtitle
timings, no truncation), trimmed, and joined per scene with fixed pauses.
Outputs:
  public/voice/<scene>.wav     one narration file per scene (24 kHz mono)
  public/voice/timings.json    per-scene duration + per-sentence start/end
Model files are downloaded once into data/models/ (gitignored).

Usage: python3 tools/voice/build_voice.py [scene_id ...]
"""
import json, os, sys, urllib.request
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS = os.path.join(ROOT, "data/models")
OUT = os.path.join(ROOT, "public/voice")
os.makedirs(MODELS, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
for f in ("kokoro-v1.0.onnx", "voices-v1.0.bin"):
    p = os.path.join(MODELS, f)
    if not os.path.exists(p):
        print("downloading", f)
        urllib.request.urlretrieve(BASE + f, p)

from kokoro_onnx import Kokoro  # noqa: E402

script = json.load(open(os.path.join(ROOT, "script/scenes.json")))
cfg = script["voice"]
assert cfg["voice"] == "am_fenrir", "narration voice is fixed to am_fenrir"
k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))

GAP = 0.42  # pause between sentences (s)

# Pronunciation fixes: phonetic respellings applied to the TTS text only
# (subtitles keep the correct spelling). Checked with the G2P phonemizer.
import re  # noqa: E402
RESPELL = {
    "Kaneohe": "Kahneh-oheh", "Kido Butai": "Keedo Bootai", "Hiryu": "Heeryoo",
    "Fuchida": "Foocheeda", "Minoru Genda": "Meenohroo Ghenda", "Isoroku": "Eesorohkoo",
    "Fusata Iida": "Foosahta Eeeeda", "Iida": "Eeeeda", "Mitsuo": "Meetsoo-oh",
    "Kazuo Sakamaki": "Kahzoo-oh Sahkahmahkee", "Hitokappu": "Heetohkahppoo",
    "Soryu": "Sohryoo", "Shokaku": "Showkahkoo", "Zuikaku": "Zooeekahkoo",
    "Chuichi": "Chooeechee", "Niitaka": "Neetahkah", "Akagi": "Ahkahghi", "Tora": "Tohrah",
    "Opana": "Oh-pahnah",
}


def respell(text):
    for k_, v in RESPELL.items():
        text = re.sub(r"\b" + re.escape(k_) + r"\b", v, text)
    return text


def trim(a, sr, thr=0.004, pad=0.04):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - int(pad * sr))
    e = min(len(a), idx[-1] + int(pad * 1.5 * sr))
    return a[s:e]


only = set(sys.argv[1:])
tpath = os.path.join(OUT, "timings.json")
timings = json.load(open(tpath)) if os.path.exists(tpath) else {}

for ch in script["chapters"]:
    for sc in ch["scenes"]:
        if only and sc["id"] not in only:
            continue
        parts, sents, t, sr = [], [], 0.0, 24000
        for i, line in enumerate(sc["lines"]):
            text = respell(line.get("tts", line["text"])).replace("“", '"').replace("”", '"')
            audio, sr = k.create(text, voice=cfg["voice"], speed=cfg["speed"], lang=cfg["lang"])
            audio = trim(np.asarray(audio, dtype=np.float32), sr)
            if i > 0:
                parts.append(np.zeros(int(GAP * sr), np.float32))
                t += GAP
            sents.append({"text": line["text"], "start": round(t, 3), "end": round(t + len(audio) / sr, 3)})
            parts.append(audio)
            t += len(audio) / sr
        wav = np.concatenate(parts)
        peak = np.max(np.abs(wav))
        wav = wav / peak * 0.89  # normalise peaks per scene
        sf.write(os.path.join(OUT, f"{sc['id']}.wav"), wav, sr, subtype="PCM_16")
        timings[sc["id"]] = {"duration": round(len(wav) / sr, 3), "sentences": sents}
        print(f"{sc['id']}: {len(wav) / sr:.2f}s", flush=True)

json.dump(timings, open(tpath, "w"), indent=1)
print("total voice", round(sum(v["duration"] for v in timings.values()), 1), "s")
