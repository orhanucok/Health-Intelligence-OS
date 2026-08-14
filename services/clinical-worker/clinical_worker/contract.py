"""Versioned boundary types for the local clinical worker.

The worker accepts fixtures only; it never contacts a provider and never makes
diagnostic or treatment claims.
"""

from dataclasses import dataclass
from typing import Any, Literal

CONTRACT_VERSION = "1.0"
TrustTier = Literal["synthetic"]


@dataclass(frozen=True)
class ExtractionRequest:
    fixture_id: str
    document_type: str
    locale: str
    text: str
    metadata: dict[str, Any]
    contract_version: str = CONTRACT_VERSION


@dataclass(frozen=True)
class Observation:
    code: str
    label: str
    value: float
    unit: str
    trust_tier: TrustTier
    source_fixture: str


@dataclass(frozen=True)
class ExtractionResponse:
    fixture_id: str
    observations: tuple[Observation, ...]
    warnings: tuple[str, ...]
    contract_version: str = CONTRACT_VERSION


def request_from_fixture(fixture: dict[str, Any]) -> ExtractionRequest:
    required = ("fixture_id", "document_type", "locale", "text", "metadata")
    missing = [key for key in required if key not in fixture]
    if missing:
        raise ValueError(f"missing fixture fields: {', '.join(missing)}")
    unknown = sorted(set(fixture) - set(required))
    if unknown:
        raise ValueError(f"unknown fixture fields: {', '.join(unknown)}")
    if not isinstance(fixture["metadata"], dict):
        raise ValueError("fixture metadata must be an object")
    return ExtractionRequest(**{key: fixture[key] for key in required})
