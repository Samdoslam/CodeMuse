from flask import Flask, request, jsonify
import os
import tempfile
import speech_recognition as sr
from pydub import AudioSegment  # pip install pydub

app = Flask(__name__)
recognizer = sr.Recognizer()

@app.route("/transcribe", methods=["POST"])
def transcribe():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file uploaded"}), 400

        file = request.files["audio"]

        # Save raw uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            raw_path = tmp.name
            file.save(raw_path)

        # Convert to proper PCM WAV
        pcm_wav_path = raw_path.replace(".wav", "_pcm.wav")
        audio = AudioSegment.from_file(raw_path)
        audio = audio.set_channels(1).set_frame_rate(16000).set_sample_width(2)  # mono, 16-bit, 16kHz
        audio.export(pcm_wav_path, format="wav")

        print(f"🎤 Converted to PCM WAV: {pcm_wav_path}")

        # Recognize audio
        with sr.AudioFile(pcm_wav_path) as source:
            audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            text = ""
            print("⚠️ Could not understand audio")
        except sr.RequestError as e:
            print(f"❌ API error: {e}")
            return jsonify({"error": f"API error: {e}"}), 500

        print("🎤 Final transcription:", text)

        # Clean up temp files
        try:
            os.remove(raw_path)
            os.remove(pcm_wav_path)
        except Exception as cleanup_err:
            print("⚠️ Cleanup failed:", cleanup_err)

        return jsonify({"text": text})

    except Exception as e:
        print("❌ Flask error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
