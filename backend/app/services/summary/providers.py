"""Narrative generation strategies.

The template provider is the default and always works offline. LLM providers are opt-in
through SUMMARY_PROVIDER and fall back to the template when the call fails.
"""

import logging
from typing import Protocol

import httpx

from app.config import Settings
from app.models import Patient, PatientNote
from app.schemas.patient import calculate_age

logger = logging.getLogger(__name__)

LLM_TIMEOUT_SECONDS = 10.0
MAX_CONCURRENT_LLM_CALLS = 20
MAX_NARRATIVE_TOKENS = 600
MAX_NOTES_IN_PROMPT = 12
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = (
    "You are a clinical documentation assistant for a family medicine practice. "
    "Write a concise, factual summary of the patient's recent course in plain English, "
    "two to four short paragraphs, newest information first. Only use facts present in "
    "the notes and profile. Do not invent diagnoses, medications, or dates. Do not add "
    "headings or bullet points."
)


# One client per process: connection reuse, and a ceiling on concurrent upstream calls.
llm_http_client = httpx.AsyncClient(
    timeout=LLM_TIMEOUT_SECONDS,
    limits=httpx.Limits(max_connections=MAX_CONCURRENT_LLM_CALLS),
)


class SummaryProvider(Protocol):
    name: str

    async def narrative(self, patient: Patient, notes: list[PatientNote]) -> str: ...


def join_naturally(phrases: list[str]) -> str:
    if not phrases:
        return ""
    if len(phrases) == 1:
        return phrases[0]
    return f"{', '.join(phrases[:-1])} and {phrases[-1]}"


class TemplateSummaryProvider:
    name = "template"

    async def narrative(self, patient: Patient, notes: list[PatientNote]) -> str:
        return render_template_narrative(patient, notes)


def render_template_narrative(patient: Patient, notes: list[PatientNote]) -> str:
    age = calculate_age(patient.date_of_birth)
    paragraphs = [describe_profile(patient, age), describe_notes(patient, notes)]
    return "\n\n".join(paragraph for paragraph in paragraphs if paragraph)


def describe_profile(patient: Patient, age: int) -> str:
    status_phrase = {
        "active": "an active patient of the practice",
        "pending": "a new patient whose intake is pending",
        "inactive": "an inactive patient who has not been seen recently",
        "discharged": "a former patient who has been discharged from the practice",
    }[patient.status.value]
    sentence = f"{patient.first_name} {patient.last_name}, {age}, is {status_phrase}."

    if patient.conditions:
        sentence += f" Documented conditions include {join_naturally(patient.conditions)}."
    else:
        sentence += " No chronic conditions are documented."

    if patient.allergies:
        sentence += f" Known allergies: {join_naturally(patient.allergies)}."
    else:
        sentence += " No known allergies."
    return sentence


def describe_notes(patient: Patient, notes: list[PatientNote]) -> str:
    if not notes:
        return "There are no clinical notes on file yet."

    newest_first = sorted(notes, key=lambda note: note.noted_at, reverse=True)
    latest = newest_first[0]
    lines = [
        f"The chart holds {len(notes)} clinical {'note' if len(notes) == 1 else 'notes'}, "
        f"the most recent from {latest.noted_at:%B %d, %Y}: {latest.content.strip()}"
    ]
    earlier = newest_first[1:3]
    if earlier:
        earlier_sentences = "; ".join(
            f"on {note.noted_at:%B %d, %Y}, {first_sentence(note.content)}" for note in earlier
        )
        lines.append(f"Earlier, {earlier_sentences}.")
    if patient.last_visit_at:
        lines.append(f"Last visit was recorded on {patient.last_visit_at:%B %d, %Y}.")
    return " ".join(lines)


def first_sentence(text: str) -> str:
    """Return the first sentence, lower-cased so it reads mid-sentence (acronyms kept)."""
    stripped = text.strip()
    sentence_end = stripped.find(". ")
    sentence = (stripped if sentence_end == -1 else stripped[:sentence_end]).rstrip(".")
    starts_with_ordinary_word = len(sentence) > 1 and sentence[1].islower()
    if starts_with_ordinary_word:
        return sentence[0].lower() + sentence[1:]
    return sentence


def build_prompt(patient: Patient, notes: list[PatientNote]) -> str:
    age = calculate_age(patient.date_of_birth)
    newest_first = sorted(notes, key=lambda note: note.noted_at, reverse=True)
    note_lines = [
        f"- {note.noted_at:%Y-%m-%d}: {note.content.strip()}"
        for note in newest_first[:MAX_NOTES_IN_PROMPT]
    ]
    return "\n".join(
        [
            f"Patient: {patient.first_name} {patient.last_name}, {age} years old, "
            f"status {patient.status.value}.",
            f"Blood type: {patient.blood_type.value if patient.blood_type else 'unknown'}.",
            f"Conditions: {', '.join(patient.conditions) or 'none documented'}.",
            f"Allergies: {', '.join(patient.allergies) or 'none known'}.",
            "Clinical notes, newest first:",
            *(note_lines or ["- (no notes on file)"]),
        ]
    )


class AnthropicSummaryProvider:
    name = "anthropic"

    def __init__(self, api_key: str, model: str | None) -> None:
        self.api_key = api_key
        self.model = model or DEFAULT_ANTHROPIC_MODEL

    async def narrative(self, patient: Patient, notes: list[PatientNote]) -> str:
        response = await llm_http_client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": self.model,
                "max_tokens": MAX_NARRATIVE_TOKENS,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": build_prompt(patient, notes)}],
            },
        )
        response.raise_for_status()
        content_blocks = response.json()["content"]
        return "".join(block.get("text", "") for block in content_blocks).strip()


class OpenAISummaryProvider:
    name = "openai"

    def __init__(self, api_key: str, model: str | None) -> None:
        self.api_key = api_key
        self.model = model or DEFAULT_OPENAI_MODEL

    async def narrative(self, patient: Patient, notes: list[PatientNote]) -> str:
        response = await llm_http_client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "max_tokens": MAX_NARRATIVE_TOKENS,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": build_prompt(patient, notes)},
                ],
            },
        )
        response.raise_for_status()
        message = response.json()["choices"][0]["message"]["content"]
        return str(message).strip()


def select_provider(settings: Settings) -> SummaryProvider:
    if settings.summary_provider == "anthropic" and settings.anthropic_api_key:
        return AnthropicSummaryProvider(settings.anthropic_api_key, settings.summary_model)
    if settings.summary_provider == "openai" and settings.openai_api_key:
        return OpenAISummaryProvider(settings.openai_api_key, settings.summary_model)
    if settings.summary_provider != "template":
        logger.warning(
            "SUMMARY_PROVIDER=%s has no API key configured; using the template provider",
            settings.summary_provider,
        )
    return TemplateSummaryProvider()
