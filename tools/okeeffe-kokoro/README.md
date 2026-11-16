# O'Keeffe neural narration — no ChatGPT ZIP required

These files are distributed through GitHub because ChatGPT ZIP links were not downloadable for the user.

## Get the preview on Windows

Run in **Command Prompt**, not PowerShell:

```cmd
cd /d C:\Users\kishu\AI-Video-Factory
git pull myfork feature/chatgpt-manual-agent-input
winget install --id eSpeak-NG.eSpeak-NG -e
cd tools\okeeffe-kokoro
PREVIEW_VOICE.bat
```

The batch file installs dependencies in an isolated `.venv`, downloads Kokoro ONNX CPU model weights from the official GitHub release with **SHA-256 verification**, and creates `LISTEN_FIRST_kokoro_neural.wav`. eSpeak NG is used only to prepare phonemes; Kokoro synthesizes the audible voice. The initial model download requires internet; inference can run on CPU once cached.

**Listen first.** Do not generate a full video unless the voice is actually clear and acceptable. This is a voice preview only: it deliberately does **not** claim to supply the old 6.4-MB clean video asset from the previously inaccessible ZIP. The video can be rebuilt only once the user has a local clean source or a regenerated animation.

If you receive a package-install, model-download, phonemizer-DLL, or ONNX error, copy the console output rather than retrying with robotic eSpeak audio.

Upstream project: https://github.com/thewh1teagle/kokoro-onnx
