"""Rebuild the free, offline voice fallback. Requires FFmpeg with its libflite filter."""
from pathlib import Path
import json
import argparse
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'letter-lane'
WORDS = 'jam cat sun bus cup dog hat map pig bed pen hen'.split()
NAMES = ['ay', 'bee', 'see', 'dee', 'ee', 'eff', 'jee', 'aitch', 'eye', 'jay', 'kay', 'ell', 'em', 'en', 'oh', 'pee', 'cue', 'ar', 'ess', 'tee', 'you', 'vee', 'double you', 'ex', 'why', 'zee']
clips = {**{'word-' + w: w + '.' for w in WORDS}, **{'letter-' + chr(97+i): n + '.' for i,n in enumerate(NAMES)},
 'find-letter': 'Find the letter.',
 'tap-letter': 'Tap a letter to drive to it.',
 'which-first': 'Which letter comes first?',
 'which-next': 'Which letter comes next?',
 'help-tip': 'Tap Show me if you want a clue.',
 'try-again': 'Let us try again.',
 'complete': 'You built the word. Great driving!',
 'how': 'Welcome to Letter Lane. We will build the word jam. Look at the picture. Listen to the word. Tap the glowing letter to drive your car to it and collect stars. Take your time. Tap Let us drive to begin.',
 'voice-on': 'Voice on.'}

def main(driving=False):
 selected = dict(clips)
 if driving:
  selected.update({
   "drive-how": "Your car drives by itself. Steer left and right to collect letters and stars. Up arrow coins give you jumps. Press Jump or swipe up to hop over cones. Lightning coins make you faster. A bump just slows you down. Let us drive!",
   "steer-left": "Steer left.", "steer-middle": "Steer to the middle.", "steer-right": "Steer right.",
   "jump-ready": "Jump power! Press Jump!", "boost-ready": "Speed boost!", "jump-now": "Jump!",
   "jump-coin-first": "Get an up arrow coin to jump.", "boost-coin-first": "Get a lightning coin to go faster."
  })
 voice_name = "driving-voice.mp3" if driving else "voice.mp3"
 cues_name = "driving-cues.mjs" if driving else "voice-cues.mjs"
 export_name = "DRIVING_CUES" if driving else "VOICE_CUES"
 OUT.mkdir(parents=True, exist_ok=True)
 cues, frames, position = {}, [], 0
 rate = 22050
 with tempfile.TemporaryDirectory(prefix='letter-lane-voice-') as temporary:
  directory = Path(temporary)
  for index, (key, text) in enumerate(selected.items()):
   source, target = directory / f'{index}.txt', directory / f'{index}.wav'
   source.write_text(text)
   subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-f', 'lavfi', '-i', f'flite=textfile={source}:voice=slt', '-af', 'atempo=0.9', '-ar', str(rate), '-ac', '1', '-c:a', 'pcm_s16le', str(target)], check=True)
   with wave.open(str(target), 'rb') as audio:
    data = audio.readframes(audio.getnframes())
   count = len(data) // 2
   cues[key] = {'start': round(position / rate, 5), 'end': round((position + count) / rate, 5), 'text': text}
   frames.extend([data, b'\0\0' * int(rate * .45)])
   position += count + int(rate * .45)
  combined = directory / 'voice.wav'
  with wave.open(str(combined), 'wb') as audio:
   audio.setnchannels(1)
   audio.setsampwidth(2)
   audio.setframerate(rate)
   audio.writeframes(b''.join(frames))
  subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(combined), '-c:a', 'libmp3lame', '-b:a', '48k', str(OUT / voice_name)], check=True)
 (OUT / cues_name).write_text('export const ' + export_name + ' = Object.freeze(' + json.dumps(cues, indent=2) + ');\n')
 print(f'{len(cues)} voice clips, {position / rate:.1f} seconds, {(OUT / voice_name).stat().st_size} bytes')

if __name__ == '__main__':
 parser = argparse.ArgumentParser()
 parser.add_argument("--driving", action="store_true")
 main(parser.parse_args().driving)
