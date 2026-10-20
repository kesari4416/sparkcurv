"""Mail settings and connection (mailer.py). No network, no database."""
import importlib
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

ENV_NAMES = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_EMAIL", "SMTP_PASSWORD", "SMTP_FROM", "CONTACT_TO", "NOTIFY_EMAIL"]


@pytest.fixture
def load(monkeypatch):
    """Reload mailer with exactly the given environment (and without reading the real .env)."""
    monkeypatch.setattr("dotenv.load_dotenv", lambda *a, **k: None)

    def _load(**env):
        for name in ENV_NAMES:
            monkeypatch.delenv(name, raising=False)
        for name, value in env.items():
            monkeypatch.setenv(name, value)
        import mailer

        return importlib.reload(mailer)

    return _load


def test_defaults_when_nothing_is_set(load):
    m = load()
    assert (m.HOST, m.PORT) == ("smtp.gmail.com", 465)
    assert m.missing() == ["SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO"]


def test_buildnexa_style_names(load):
    m = load(
        SMTP_HOST="mail.example.test",
        SMTP_PORT="587",
        SMTP_USER="login@example.test",
        SMTP_PASSWORD="secret",
        SMTP_FROM="SparkCurv <sales@example.test>",
        CONTACT_TO="inbox@example.test",
    )
    assert (m.HOST, m.PORT, m.USER, m.TO) == ("mail.example.test", 587, "login@example.test", "inbox@example.test")
    assert m.FROM == "SparkCurv <sales@example.test>"
    assert m.FROM_ADDRESS == "sales@example.test"  # the envelope sender has no display name
    assert m.missing() == []


def test_older_names_still_work_and_from_defaults_to_user(load):
    m = load(SMTP_EMAIL="me@example.test", SMTP_PASSWORD="secret", NOTIFY_EMAIL="inbox@example.test")
    assert (m.USER, m.TO) == ("me@example.test", "inbox@example.test")
    assert m.FROM == m.FROM_ADDRESS == "me@example.test"
    assert m.missing() == []


def test_new_names_win_over_older_ones(load):
    m = load(SMTP_USER="new@example.test", SMTP_EMAIL="old@example.test", CONTACT_TO="new-to@example.test", NOTIFY_EMAIL="old-to@example.test")
    assert (m.USER, m.TO) == ("new@example.test", "new-to@example.test")


def test_missing_names_each_empty_setting(load):
    m = load(SMTP_USER="me@example.test")
    assert m.missing() == ["SMTP_PASSWORD", "CONTACT_TO"]


def test_bad_port_falls_back_to_465(load):
    assert load(SMTP_PORT="not-a-number").PORT == 465


def test_port_465_uses_ssl_and_587_uses_starttls(load, monkeypatch):
    seen = []

    class FakeSSL:
        def __init__(self, host, port, timeout=None):
            seen.append(("ssl", host, port))

    class FakePlain:
        def __init__(self, host, port, timeout=None):
            seen.append(("plain", host, port))

        def starttls(self):
            seen.append(("starttls",))

    import smtplib

    monkeypatch.setattr(smtplib, "SMTP_SSL", FakeSSL)
    monkeypatch.setattr(smtplib, "SMTP", FakePlain)

    load(SMTP_HOST="mail.example.test", SMTP_PORT="465").connect()
    load(SMTP_HOST="mail.example.test", SMTP_PORT="587").connect()
    assert seen == [("ssl", "mail.example.test", 465), ("plain", "mail.example.test", 587), ("starttls",)]
