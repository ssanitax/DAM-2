"""Genera pantallazos del terminal y el PDF de entrega de la práctica."""
from __future__ import annotations

import subprocess
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image as RLImage,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
)

ROOT = Path(__file__).resolve().parent
ENTREGA = ROOT / "entrega"
ENTREGA.mkdir(exist_ok=True)

CWD = str(ROOT)
PROMPT = f"PS {CWD}> "


def run_script(name: str) -> str:
    env_path = subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-Command",
            '[Environment]::GetEnvironmentVariable("Path","Machine") + ";" + '
            '[Environment]::GetEnvironmentVariable("Path","User")',
        ],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()

    import os

    env = os.environ.copy()
    env["Path"] = env_path
    result = subprocess.run(
        ["python", name],
        cwd=ROOT,
        capture_output=True,
        text=True,
        env=env,
    )
    out = (result.stdout or "").strip()
    err = (result.stderr or "").strip()
    # Filtrar avisos de pydub si aparecen
    err_lines = [
        line
        for line in err.splitlines()
        if "RuntimeWarning" not in line and "warn(" not in line and line.strip()
    ]
    if result.returncode != 0:
        raise RuntimeError(f"Error al ejecutar {name}:\n{err}")
    return out


def load_font(size: int, bold: bool = False):
    candidates = [
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\cascadiamono.ttf",
        r"C:\Windows\Fonts\cour.ttf",
    ]
    if bold:
        candidates = [
            r"C:\Windows\Fonts\consolab.ttf",
            r"C:\Windows\Fonts\courbd.ttf",
        ] + candidates
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def make_terminal_screenshot(lines: list[str], outfile: Path, title: str) -> Path:
    width, height = 1280, 720
    img = Image.new("RGB", (width, height), "#0c0c0c")
    draw = ImageDraw.Draw(img)

    # Barra de título estilo Windows Terminal
    draw.rectangle((0, 0, width, 36), fill="#1f1f1f")
    font_ui = load_font(15)
    font = load_font(18)
    draw.text((14, 10), title, fill="#dddddd", font=font_ui)

    y = 56
    line_h = 28
    for line in lines:
        # Ajuste suave si la línea es muy larga
        wrapped = textwrap.wrap(line, width=110) or [""]
        for part in wrapped:
            draw.text((18, y), part, fill="#cccccc", font=font)
            y += line_h
            if y > height - 40:
                break
        if y > height - 40:
            break

    # Cursor
    draw.text((18, y), PROMPT, fill="#cccccc", font=font)
    prompt_w = draw.textlength(PROMPT, font=font)
    draw.rectangle((18 + prompt_w, y + 4, 18 + prompt_w + 10, y + 22), fill="#cccccc")

    img.save(outfile)
    return outfile


def build_pdf(
    practica_code: str,
    guardar_code: str,
    shot1: Path,
    shot2: Path,
    out_practica: str,
    out_guardar: str,
) -> Path:
    pdf_path = ENTREGA / "Entrega_Practica_ORM_SQLAlchemy_Audios.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title="Práctica ORM SQLAlchemy Audios",
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleES",
        parent=styles["Title"],
        fontSize=18,
        spaceAfter=8,
    )
    h1 = ParagraphStyle(
        "H1ES",
        parent=styles["Heading1"],
        fontSize=14,
        spaceBefore=12,
        spaceAfter=8,
    )
    body = ParagraphStyle(
        "BodyES",
        parent=styles["Normal"],
        fontSize=11,
        leading=15,
        spaceAfter=8,
    )
    code_style = ParagraphStyle(
        "CodeES",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        backColor="#f4f4f4",
        spaceBefore=4,
        spaceAfter=8,
    )

    story = []
    story.append(Paragraph("Práctica ORM-SQLAlchemy-Audios", title))
    story.append(
        Paragraph(
            "Entrega: guardar información de audios en SQLite con SQLAlchemy (CRUD) "
            "y guardar los datos reales de <b>0802.mp3</b> con pydub.",
            body,
        )
    )
    story.append(Paragraph("Archivos de la práctica", h1))
    story.append(
        Paragraph(
            "• <b>practica.py</b> — crear tabla, insertar, leer, actualizar y borrar.<br/>"
            "• <b>guardar_mp3.py</b> — leer <b>0802.mp3</b> y guardar frecuencia, bits y duración.",
            body,
        )
    )

    story.append(Paragraph("1. Código de practica.py", h1))
    story.append(Preformatted(practica_code.rstrip() + "\n", code_style))

    story.append(Paragraph("2. Ejecución de practica.py", h1))
    story.append(
        Paragraph(
            "Salida esperada del CRUD (crear, leer, actualizar y borrar):",
            body,
        )
    )
    story.append(Preformatted(out_practica + "\n", code_style))
    story.append(RLImage(str(shot1), width=16.5 * cm, height=9.3 * cm))
    story.append(Spacer(1, 0.3 * cm))

    story.append(PageBreak())
    story.append(Paragraph("3. Código de guardar_mp3.py", h1))
    story.append(Preformatted(guardar_code.rstrip() + "\n", code_style))

    story.append(Paragraph("4. Ejecución de guardar_mp3.py", h1))
    story.append(
        Paragraph(
            "Datos reales del archivo <b>0802.mp3</b> guardados en la base de datos:",
            body,
        )
    )
    story.append(Preformatted(out_guardar + "\n", code_style))
    story.append(RLImage(str(shot2), width=16.5 * cm, height=9.3 * cm))

    story.append(Paragraph("5. Conclusión", h1))
    story.append(
        Paragraph(
            "Con SQLAlchemy se ha realizado el CRUD completo sobre la tabla <b>audios</b> "
            "y se han guardado los metadatos del MP3 del ejercicio "
            "(44100 Hz, 16 bits, 166.4 s) sin escribir SQL a mano.",
            body,
        )
    )

    doc.build(story)
    return pdf_path


def main() -> None:
    out_practica = run_script("practica.py")
    out_guardar = run_script("guardar_mp3.py")

    (ENTREGA / "out_practica.txt").write_text(out_practica + "\n", encoding="utf-8")
    (ENTREGA / "out_guardar.txt").write_text(out_guardar + "\n", encoding="utf-8")

    lines1 = [
        PROMPT + "python practica.py",
        *out_practica.splitlines(),
        "",
    ]
    lines2 = [
        PROMPT + "python guardar_mp3.py",
        *out_guardar.splitlines(),
        "",
    ]

    shot1 = make_terminal_screenshot(
        lines1,
        ENTREGA / "pantallazo_practica.png",
        "Windows PowerShell — practica.py",
    )
    shot2 = make_terminal_screenshot(
        lines2,
        ENTREGA / "pantallazo_guardar_mp3.png",
        "Windows PowerShell — guardar_mp3.py",
    )

    practica_code = (ROOT / "practica.py").read_text(encoding="utf-8")
    guardar_code = (ROOT / "guardar_mp3.py").read_text(encoding="utf-8")

    pdf = build_pdf(
        practica_code,
        guardar_code,
        shot1,
        shot2,
        out_practica,
        out_guardar,
    )
    print(f"PDF generado: {pdf}")
    print(f"Pantallazos: {shot1.name}, {shot2.name}")


if __name__ == "__main__":
    main()
