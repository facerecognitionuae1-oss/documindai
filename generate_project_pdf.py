from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "PROJECT_DOCUMENTATION.md"
OUTPUT = ROOT / "Document_Analysis_Workspace_Documentation.pdf"


def parse_markdown(text: str):
    blocks = []
    lines = text.splitlines()
    current_bullets = []
    current_paragraph = []

    def flush_paragraph():
        nonlocal current_paragraph
        if current_paragraph:
            blocks.append(("p", " ".join(current_paragraph).strip()))
            current_paragraph = []

    def flush_bullets():
        nonlocal current_bullets
        if current_bullets:
            for bullet in current_bullets:
                blocks.append(("bullet", bullet))
            current_bullets = []

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            flush_paragraph()
            flush_bullets()
            continue

        if line.startswith("# "):
            flush_paragraph()
            flush_bullets()
            blocks.append(("h1", line[2:].strip()))
            continue

        if line.startswith("## "):
            flush_paragraph()
            flush_bullets()
            blocks.append(("h2", line[3:].strip()))
            continue

        if line.startswith("### "):
            flush_paragraph()
            flush_bullets()
            blocks.append(("h3", line[4:].strip()))
            continue

        if line.startswith("- "):
            flush_paragraph()
            current_bullets.append(line[2:].strip())
            continue

        current_paragraph.append(line.strip())

    flush_paragraph()
    flush_bullets()
    return blocks


def build_pdf():
    text = SOURCE.read_text(encoding="utf-8")
    blocks = parse_markdown(text)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#135d66"),
            alignment=TA_LEFT,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#15211d"),
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Subsection",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=15,
            textColor=colors.HexColor("#135d66"),
            spaceBefore=6,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.3,
            leading=15,
            textColor=colors.HexColor("#36433f"),
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletItem",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.3,
            leading=15,
            leftIndent=12,
            firstLineIndent=-8,
            bulletIndent=0,
            textColor=colors.HexColor("#36433f"),
            spaceAfter=2,
        )
    )

    story = []
    for kind, content in blocks:
        safe = (
            content.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )
        if kind == "h1":
            story.append(Paragraph(safe, styles["DocTitle"]))
            story.append(Spacer(1, 4))
        elif kind == "h2":
            story.append(Paragraph(safe, styles["Section"]))
        elif kind == "h3":
            story.append(Paragraph(safe, styles["Subsection"]))
        elif kind == "bullet":
            story.append(Paragraph(f"• {safe}", styles["BulletItem"]))
        else:
            story.append(Paragraph(safe, styles["Body"]))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT)
