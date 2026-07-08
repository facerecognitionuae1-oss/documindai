from pathlib import Path
import json
import sys


def extract_text(file_path: Path) -> dict:
    suffix = file_path.suffix.lower()
    try:
        if suffix in {".txt", ".md", ".csv", ".rtf"}:
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            return {"ok": True, "method": "local_text_read", "preview": preview(text), "text": full_text(text)}

        if suffix == ".pdf":
            from pypdf import PdfReader

            reader = PdfReader(str(file_path))
            text = []
            for page in reader.pages:
                text.append(page.extract_text() or "")
            joined = " ".join(text)
            return {"ok": True, "method": "pypdf_extract", "preview": preview(joined), "text": full_text(joined)}

        return {"ok": False, "method": "unsupported_local_extract", "preview": "", "text": ""}
    except Exception as exc:
        return {"ok": False, "method": "extract_error", "preview": str(exc), "text": ""}


def full_text(value: str) -> str:
    return " ".join((value or "").split())[:40000]


def preview(value: str) -> str:
    return full_text(value)[:1500]


if __name__ == "__main__":
    target = Path(sys.argv[1]).resolve()
    print(json.dumps(extract_text(target)))
