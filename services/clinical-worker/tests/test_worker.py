import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

import pytest
from clinical_worker.contract import CONTRACT_VERSION, request_from_fixture
from clinical_worker.worker import extract_fixture


def fixture(**overrides):
    value = {
        "fixture_id": "tr-lab-001",
        "document_type": "lab",
        "locale": "tr-TR",
        "text": "Hemoglobin: 13,2 g/dL; Glukoz: 96 mg/dL; CRP: 2,4 mg/L",
        "metadata": {"synthetic": True, "source": "synthetic_fixture"},
    }
    value.update(overrides)
    return value


def test_contract_and_deterministic_extraction():
    request = request_from_fixture(fixture())
    response = extract_fixture(fixture())
    assert request.contract_version == CONTRACT_VERSION
    assert [(o.code, o.value) for o in response.observations] == [
        ("Hemoglobin", 13.2),
        ("Glucose", 96.0),
        ("CRP", 2.4),
    ]
    assert all(o.trust_tier == "synthetic" for o in response.observations)


@pytest.mark.parametrize(
    "metadata",
    [
        {"source": "synthetic_fixture"},
        {"synthetic": True, "source": "cloud"},
        {"synthetic": True, "source": "synthetic_fixture", "patient_name": "Ada"},
    ],
)
def test_synthetic_only_guard(metadata):
    with pytest.raises(ValueError):
        extract_fixture(fixture(metadata=metadata))


def test_non_turkish_fixture_rejected():
    with pytest.raises(ValueError, match="Turkish"):
        extract_fixture(fixture(locale="en-US"))


def test_unknown_top_level_field_and_identifier_text_are_rejected():
    with pytest.raises(ValueError, match="unknown fixture fields"):
        extract_fixture(fixture(patient_name="Ada"))
    with pytest.raises(ValueError, match="identifier"):
        extract_fixture(fixture(text="Ad: Ada; CRP: 2,4 mg/L"))


def test_mismatched_unit_is_never_silently_relabelled():
    response = extract_fixture(fixture(text="Glukoz: 96 mmol/L"))
    assert response.observations == ()
    assert any("unsupported unit mmol/L" in warning for warning in response.warnings)
