import requests
from bs4 import BeautifulSoup


def crawler_page(url: str):

    response = requests.get(
        url,
        timeout=10
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    text = soup.get_text(separator=" ")

    return " ".join(text.split())