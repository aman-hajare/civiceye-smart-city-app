import re
import io
import sys
import logging
from threading import Lock

from PIL import Image, UnidentifiedImageError


# Load once and reuse for all requests to keep inference fast.
_PIPELINE = None
_PIPELINE_LOCK = Lock()
logger = logging.getLogger(__name__)

_CATEGORY_PROMPTS = {
    "pothole": "a pothole on a road",
    "garbage": "garbage dump on a street",
    "streetlight": "a streetlight pole or broken street light",
    "traffic": "traffic signal, traffic congestion, or road traffic",
    "other": "an urban issue unrelated to pothole, garbage, streetlight, or traffic",
}


class AIValidationError(Exception):
    """Raised when image validation cannot be completed reliably."""


def _normalize_category(category):
    if not category:
        return ""

    normalized = re.sub(r"[^a-z]", "", str(category).lower())
    aliases = {
        "streetlight": "streetlight",
        "streetlights": "streetlight",
        "pothole": "pothole",
        "garbage": "garbage",
        "traffic": "traffic",
        "other": "other",
    }
    return aliases.get(normalized, normalized)


def _get_pipeline():
    global _PIPELINE

    if _PIPELINE is not None:
        return _PIPELINE

    with _PIPELINE_LOCK:
        if _PIPELINE is None:
            try:
                import torch  # noqa: F401
                from transformers import pipeline
            except Exception as exc:
                raise AIValidationError(
                    f"AI dependencies are missing in interpreter '{sys.executable}'. Details: {exc}"
                ) from exc

            _PIPELINE = pipeline(
                task="zero-shot-image-classification",
                model="openai/clip-vit-base-patch32",
                device=-1,
            )
    return _PIPELINE


def _reset_pipeline():
    global _PIPELINE
    with _PIPELINE_LOCK:
        _PIPELINE = None


def _is_transient_model_error(exc):
    message = str(exc).lower()
    transient_tokens = [
        "timed out",
        "timeout",
        "connection",
        "max retries exceeded",
        "failed to download",
        "temporary failure",
        "out of memory",
        "not enough memory",
        "allocation",
    ]
    return any(token in message for token in transient_tokens)


def predict_issue_image(image_path):
    """
    Predict issue category for an uploaded image.

    Returns:
        tuple[str, float]: (predicted_class, confidence_score)
    """
    try:
        if hasattr(image_path, "read"):
            image_path.seek(0)
            image_bytes = image_path.read()
            image_source = io.BytesIO(image_bytes)
        else:
            image_source = image_path

        with Image.open(image_source) as img:
            image = img.convert("RGB")
            # Downscale very large uploads to keep CPU inference stable.
            image.thumbnail((1024, 1024))
    except FileNotFoundError as exc:
        raise AIValidationError("Uploaded image file was not found.") from exc
    except UnidentifiedImageError as exc:
        raise AIValidationError("Uploaded file is not a valid image.") from exc
    except OSError as exc:
        raise AIValidationError("Could not read the uploaded image.") from exc

    candidate_labels = list(_CATEGORY_PROMPTS.values())
    result = None
    last_error = None

    # Retry once for transient first-load or network hiccups.
    for attempt in range(2):
        try:
            classifier = _get_pipeline()
            try:
                result = classifier(
                    image,
                    candidate_labels=candidate_labels,
                    hypothesis_template="This image shows {}.",
                )
            except TypeError:
                # Compatibility fallback for environments where template arg differs.
                result = classifier(
                    image,
                    candidate_labels=candidate_labels,
                )
            break
        except AIValidationError as exc:
            # Surface explicit validator/dependency errors directly.
            raise exc
        except Exception as exc:
            last_error = exc
            logger.exception("AI inference attempt %s failed", attempt + 1)

            if attempt == 0 and _is_transient_model_error(exc):
                _reset_pipeline()
                continue

    if result is None:
        if isinstance(last_error, AIValidationError):
            raise last_error

        if last_error and _is_transient_model_error(last_error):
            raise AIValidationError(
                "AI model is initializing or network is unstable. Please retry in a few seconds."
            ) from last_error
        error_type = last_error.__class__.__name__ if last_error else "UnknownError"
        raise AIValidationError(
            f"AI model inference failed ({error_type}). Please try another clear JPG/PNG image."
        ) from last_error

    if not result:
        raise AIValidationError("AI model could not classify this image.")

    top_prediction = result[0]
    predicted_prompt = top_prediction.get("label", "")
    confidence_score = float(top_prediction.get("score", 0.0))

    prompt_to_category = {
        prompt: category
        for category, prompt in _CATEGORY_PROMPTS.items()
    }
    predicted_class = prompt_to_category.get(predicted_prompt, "other")

    return _normalize_category(predicted_class), confidence_score

