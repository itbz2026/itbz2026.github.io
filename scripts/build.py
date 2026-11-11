from pathlib import Path
from html.parser import HTMLParser
import json
import re
import html
import markdown

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
OUTPUT = ROOT / "pages" / "generated"
SEARCH_INDEX = ROOT / "data" / "search-index.json"

class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "nav", "aside", "footer"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "nav", "aside", "footer") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            value = re.sub(r"\s+", " ", data).strip()
            if value:
                self.parts.append(value)

def parse_front_matter(text):
    if not text.startswith("---\n"):
        raise ValueError("Markdown article needs YAML front matter")
    _, front, body = text.split("---", 2)
    meta = {}
    for line in front.strip().splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip().strip('"').strip("'")
    return meta, body.strip()

def render_article(source):
    raw = source.read_text(encoding="utf-8")
    meta, body = parse_front_matter(raw)
    required = ("title", "description", "slug")
    missing = [key for key in required if not meta.get(key)]
    if missing:
        raise ValueError(f"{source}: missing metadata: {', '.join(missing)}")
    rendered = markdown.markdown(body, extensions=["fenced_code", "tables", "toc", "sane_lists"])
    title = html.escape(meta["title"])
    description = html.escape(meta["description"])
    category = html.escape(meta.get("category", "Documentation"))
    page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{description}">
<title>{title} | IT Knowledge Base</title>
<link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
<div class="layout">
<aside></aside>
<main>
<div class="top"><span>IT Knowledge Base / {category} / {title}</span></div>
<a class="back" href="../proxmox.html">← Zur Proxmox-Übersicht</a>
<header class="hero"><small>IT Knowledge Base · Practical Documentation</small><h1>{title}</h1><p>{description}</p></header>
<article class="article markdown-article">{rendered}</article>
<footer>IT Knowledge Base · Generated from Markdown source: {html.escape(str(source.relative_to(ROOT)))}</footer>
</main>
</div>
<script src="/assets/js/navigation.js" defer></script>
<script src="/assets/js/code-blocks.js?v=20261111-2" defer></script>
</body>
</html>
"""
    OUTPUT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT / f"{meta['slug']}.html"
    destination.write_text(page, encoding="utf-8")
    print(f"Generated {destination.relative_to(ROOT)}")

def create_search_index():
    entries = []
    candidates = [ROOT / "index.html"] + sorted((ROOT / "pages").rglob("*.html"))
    for path in candidates:
        if not path.is_file():
            continue
        raw = path.read_text(encoding="utf-8", errors="ignore")
        title_match = re.search(r"<title[^>]*>(.*?)</title>", raw, re.I | re.S)
        desc_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', raw, re.I | re.S)
        title = html.unescape(re.sub(r"<[^>]+>", "", title_match.group(1))).strip() if title_match else path.stem
        description = html.unescape(desc_match.group(1)).strip() if desc_match else ""
        parser = VisibleText()
        parser.feed(raw)
        visible = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
        relative = path.relative_to(ROOT).as_posix()
        href = "/" + relative
        category = relative.split("/")[1] if relative.startswith("pages/") else "Start"
        entries.append({
            "title": title,
            "description": description,
            "category": category.replace("-", " ").replace("_", " ").title(),
            "href": href,
            "text": visible[:9000]
        })
    SEARCH_INDEX.parent.mkdir(parents=True, exist_ok=True)
    SEARCH_INDEX.write_text(json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Indexed {len(entries)} HTML pages in {SEARCH_INDEX.relative_to(ROOT)}")

def main():
    sources = sorted(CONTENT.rglob("*.md"))
    for source in sources:
        render_article(source)
    create_search_index()

if __name__ == "__main__":
    main()
