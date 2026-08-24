"""Text-to-speech adapter for local development."""


def synthesize_speech(text: str, output_path: str) -> str:
    try:
        import pyttsx3
    except ImportError as exc:
        raise RuntimeError("Install pyttsx3 to enable local TTS output.") from exc

    engine = pyttsx3.init()
    engine.save_to_file(text, output_path)
    engine.runAndWait()
    return output_path
