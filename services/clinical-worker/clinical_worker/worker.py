"""Deterministic fixture extraction; intentionally no network or clinical inference."""

import re
from typing import Any

from .contract import ExtractionResponse, Observation, request_from_fixture

_DIRECT_IDENTIFIERS = re.compile(
    "(?:\\bname\\b|\\bad(?:\\u0131|i)?\\b|\\bsoyad(?:\\u0131|i)?\\b|"
    "tc[_ -]?kimlik|telefon|phone|address|adres|email|e-?posta)",
    re.I,
)
_LABS = {
    "Hemoglobin": ("hemoglobin", "g/dL"),
    "Glucose": ("glukoz", "mg/dL"),
    "CRP": ("crp", "mg/L"),
}


def _guard(req: Any) -> None:
    if req.locale.lower() not in {"tr", "tr-tr"}:
        raise ValueError("only synthetic Turkish (tr/tr-TR) fixtures are accepted")
    if req.metadata.get("synthetic") is not True:
        raise ValueError("fixture must explicitly declare synthetic=true")
    fixture_text = " ".join(
        [req.fixture_id, req.document_type, req.text]
        + [f"{key}={value}" for key, value in req.metadata.items()]
    ).replace("_", " ")
    if _DIRECT_IDENTIFIERS.search(fixture_text):
        raise ValueError("direct-identifier-like fixture content is not accepted")
    if req.metadata.get("source") not in {"synthetic_fixture", "test_fixture"}:
        raise ValueError("fixture source must be synthetic_fixture or test_fixture")


def extract_fixture(fixture: dict[str, Any]) -> ExtractionResponse:
    req = request_from_fixture(fixture)
    _guard(req)
    observations: list[Observation] = []
    warnings = ["Synthetic fixture extraction only; clinician review required."]
    for code, (label, unit) in _LABS.items():
        match = re.search(
            rf"{re.escape(label)}\s*[:=]\s*([0-9]+(?:[.,][0-9]+)?)\s*([A-Za-z/]+)",
            req.text,
            re.I,
        )
        if match:
            reported_unit = match.group(2)
            if reported_unit.casefold() != unit.casefold():
                warnings.append(
                    f"{code}: unsupported unit {reported_unit}; observation omitted."
                )
                continue
            observations.append(
                Observation(
                    code,
                    label,
                    float(match.group(1).replace(",", ".")),
                    unit,
                    "synthetic",
                    req.fixture_id,
                )
            )
    return ExtractionResponse(
        req.fixture_id,
        tuple(observations),
        tuple(warnings),
    )
