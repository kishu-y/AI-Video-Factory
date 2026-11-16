"""Preview the O'Keeffe narration using Kokoro neural TTS, without the unavailable ZIP.
No video assets are required for this voice test. All audio samples come from
Kokoro, NOT from the eSpeak NG phonemizer.
"""
from __future__ import annotations

import hashlib
import os
import sys
import urllib.request
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL_DIR = HERE / "models"
MODEL = MODEL_DIR / "kokoro-v1.0.int8.onnx"
VOICES = MODEL_DIR / "voices-v1.0.bin"
URL_BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/"
EXPECTED_SHA256 = {
    MODEL.name: "ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c",
    VOICES.name: "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}
SAMPLE = (
    "Behind a row of coats, a wooden crate sat untouched for decades. "
    "Inside was a painting that could be worth millions. "
    "How did it end up there?"
)

def ensure_espeak() -> None:
    if os.name != "nt":
        return
    for p in (
        Path(r"C:\Program Files\eSpeak NG\libespeak-ng.dll"),
        Path(r"C:\Program Files (x86)\eSpeak NG\libespeak-ng.dll"),
    ):
        if p.is_file():
            os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = str(p)
            d = p.parent / "espeak-ng-data"
            if d.joinpath("phontab").exists():
                os.environ["PHONEMIZER_ESPEAK_DATA_PATH"] = str(d)
            return
    if not os.getenv("PHONEMIZER_ESPEAK_LIBRARY"):
        raise RuntimeError(
            "eSpeak NG phonemizer is missing. Install it with: "
            "winget install --id eSpeak-NG.eSpeak-NG -e"
        )

def ensure_model(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    expected = EXPECTED_SHA256[path.name]
    if path.is_file() and hashlib.file_digest(path.open("rb"), "sha256").hexdigest() == expected:
        print("Verified cached file:", path.name, flush=True)
        return
    tmp = path.with_suffix(path.suffix + ".part")
    tmp.unlink(missing_ok=True)
    print("Downloading model:", path.name, flush=True)
    req = urllib.request.Request(URL_BASE + path.name, headers={"User-Agent": "Kokoro-Voice-Preview/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as response, tmp.open("wb") as f:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)
        with tmp.open("rb") as f:
            actual = hashlib.file_digest(f, "sha256").hexdigest()
        if actual != expected:
            raise ValueError("Model checksum mismatch: " + path.name)
        tmp.replace(path)
    finally:
        tmp.unlink(missing_ok=True)

def main() -> None:
    ensure_espeak()
    for p in (MODEL, VOICES):
        ensure_model(p)
    import numpy as np
    from kokoro_onnx import Kokoro
    print("Generating a fresh Kokoro neural voice preview...", flush=True)
    tts = Kokoro(str(MODEL), str(VOICES))
    audio, sample_rate = tts.create(SAMPLE, voice="af_sarah", speed=0.96, lang="en-us")
    a = np.asarray(audio, dtype=np.float32)
    if a.ndim != 1:
        a = np.mean(a, axis=-1)
    if len(a) < sample_rate:
        raise RuntimeError("Speech returned no usable audio")
    pcm = (np.clip(a * 0.9, -1.0, 1.0) * 32767).astype(np.int16)
    output = HERE / "LISTEN_FIRST_kokoro_neural.wav"
    with wave.open(str(output), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes(pcm.tobytes())
    print("SUCCESS:", output, flush=True)
    if os.name == "nt":
        os.startfile(output)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("ERROR:", exc, file=sys.stderr)
        sys.exit(1)
