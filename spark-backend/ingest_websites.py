from crawler import crawler_page
from ingest import add_document


pages = [
    "https://www.sparkcurv.com/",
    "https://www.sparkcurv.com/About",
    "https://www.sparkcurv.com/contact",
    "https://www.sparkcurv.com/ai-ml",
    "https://www.sparkcurv.com/managed-cloud-service",
    "https://www.sparkcurv.com/application-development",
    "https://www.sparkcurv.com/digital-growth",
    "https://www.sparkcurv.com/pricing",
    "https://www.sparkcurv.com/blog"
]


for page in pages:

    try:

        print(f"Crawling: {page}")

        text = crawler_page(page)

        add_document(
            text=text,
            source=page
        )

        print(f"Finished: {page}")

    except Exception as e:

        print(f"Failed: {page}")
        print(e)