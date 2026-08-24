"""Speech-to-text adapter.

Uses faster-whisper when installed. Twilio deployments can also provide a
transcript directly through Twilio's <Gather input="speech"> flow.
"""


def transcribe_audio(audio_path: str, model_size: str = "base") -> str:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError(
            "Install faster-whisper to use local audio transcription, or use Twilio speech input."
        ) from exc

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio_path)
    return " ".join(segment.text.strip() for segment in segments).strip()
