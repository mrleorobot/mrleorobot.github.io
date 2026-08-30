from pathlib import Path
import random

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, FrameBreak, HRFlowable, PageTemplate, Paragraph, Spacer


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "curriculo.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4

BG = colors.HexColor("#05060A")
PANEL = colors.HexColor("#0B0D13")
WHITE = colors.HexColor("#F7F8FC")
TEXT = colors.HexColor("#D9DCE5")
MUTED = colors.HexColor("#9298A8")
LINE = colors.HexColor("#343946")
ACCENT = colors.HexColor("#B9C9FF")
ACCENT_SOFT = colors.HexColor("#8799D8")

FONT_PATH = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
FONT_BOLD_PATH = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
pdfmetrics.registerFont(TTFont("DejaVu", str(FONT_PATH)))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONT_BOLD_PATH)))
FONT = "DejaVu"
FONT_BOLD = "DejaVu-Bold"


styles = getSampleStyleSheet()
body = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName=FONT,
    fontSize=7.35,
    leading=10.15,
    textColor=TEXT,
    spaceAfter=3,
)
small = ParagraphStyle(
    "Small",
    parent=body,
    fontSize=6.85,
    leading=9.25,
    textColor=MUTED,
)
section = ParagraphStyle(
    "Section",
    parent=body,
    fontName=FONT_BOLD,
    fontSize=8.5,
    leading=10.5,
    textColor=WHITE,
    spaceBefore=4,
    spaceAfter=5,
)
role = ParagraphStyle(
    "Role",
    parent=body,
    fontName=FONT_BOLD,
    fontSize=8.2,
    leading=10,
    textColor=WHITE,
    spaceAfter=1,
)
meta = ParagraphStyle(
    "Meta",
    parent=small,
    fontName=FONT_BOLD,
    fontSize=6.65,
    leading=8.6,
    textColor=ACCENT,
    spaceAfter=2.5,
)
bullet = ParagraphStyle(
    "Bullet",
    parent=small,
    leftIndent=7,
    firstLineIndent=-7,
    bulletIndent=0,
    spaceAfter=1.5,
)
side_section = ParagraphStyle(
    "SideSection",
    parent=section,
    fontSize=7.75,
    leading=9.5,
    spaceBefore=5,
    spaceAfter=4,
)
side_body = ParagraphStyle(
    "SideBody",
    parent=small,
    fontSize=6.75,
    leading=9.3,
    textColor=TEXT,
    spaceAfter=3,
)


def paragraph(text, style):
    return Paragraph(text, style)


def divider(width="100%", color=LINE):
    return HRFlowable(width=width, thickness=0.55, color=color, spaceBefore=3, spaceAfter=1.5)


def section_title(title, sidebar=False):
    return [divider(), paragraph(title.upper(), side_section if sidebar else section)]


def job(title, company, dates, bullets):
    items = [paragraph(title, role), paragraph(f"{company} | {dates}", meta)]
    items.extend(paragraph(f"- {item}", bullet) for item in bullets)
    items.append(Spacer(1, 2.2))
    return items


def project(title, role_text, description, url):
    return [
        paragraph(f'<link href="{url}" color="#F7F8FC"><u>{title}</u></link>', role),
        paragraph(role_text, meta),
        paragraph(description, small),
        Spacer(1, 2.8),
    ]


def draw_layered_glow(canvas, x, y, radius_x, radius_y, color, opacity, rotation=0, layers=30):
    """Gradiente elíptico suave construído em camadas transparentes."""
    canvas.saveState()
    canvas.translate(x, y)
    canvas.rotate(rotation)
    canvas.setFillColor(colors.HexColor(color))
    layer_alpha = opacity / layers
    for index in range(layers, 0, -1):
        scale = index / layers
        canvas.setFillAlpha(layer_alpha)
        canvas.ellipse(
            -radius_x * scale,
            -radius_y * scale,
            radius_x * scale,
            radius_y * scale,
            fill=1,
            stroke=0,
        )
    canvas.restoreState()


def draw_flared_star(canvas, x, y, radius, alpha=1.0, color=WHITE):
    """Estrela fotográfica com núcleo, halo e quatro raios delicados."""
    canvas.saveState()
    canvas.setFillColor(color)
    for scale, glow_alpha in [(4.8, 0.018), (3.1, 0.035), (2.0, 0.075)]:
        canvas.setFillAlpha(alpha * glow_alpha)
        canvas.circle(x, y, radius * scale, fill=1, stroke=0)

    canvas.setStrokeColor(color)
    canvas.setLineCap(1)
    canvas.setLineWidth(max(0.22, radius * 0.16))
    canvas.setStrokeAlpha(alpha * 0.68)
    canvas.line(x - radius * 3.8, y, x + radius * 3.8, y)
    canvas.setLineWidth(max(0.18, radius * 0.12))
    canvas.setStrokeAlpha(alpha * 0.48)
    canvas.line(x, y - radius * 5.2, x, y + radius * 5.2)

    path = canvas.beginPath()
    path.moveTo(x, y + radius * 1.8)
    path.lineTo(x + radius * 0.32, y + radius * 0.32)
    path.lineTo(x + radius * 1.8, y)
    path.lineTo(x + radius * 0.32, y - radius * 0.32)
    path.lineTo(x, y - radius * 1.8)
    path.lineTo(x - radius * 0.32, y - radius * 0.32)
    path.lineTo(x - radius * 1.8, y)
    path.lineTo(x - radius * 0.32, y + radius * 0.32)
    path.close()
    canvas.setFillAlpha(alpha)
    canvas.drawPath(path, fill=1, stroke=0)
    canvas.circle(x, y, radius * 0.5, fill=1, stroke=0)
    canvas.restoreState()


def cubic_point(t, start, control_1, control_2, end):
    inverse = 1 - t
    return (
        inverse ** 3 * start[0]
        + 3 * inverse ** 2 * t * control_1[0]
        + 3 * inverse * t ** 2 * control_2[0]
        + t ** 3 * end[0],
        inverse ** 3 * start[1]
        + 3 * inverse ** 2 * t * control_1[1]
        + 3 * inverse * t ** 2 * control_2[1]
        + t ** 3 * end[1],
    )


def stream_fade(t):
    """Máscara de opacidade: zero nas pontas e máxima apenas no miolo."""
    entrance = min(1.0, t / 0.12)
    exit_fade = min(1.0, (1.0 - t) / 0.42)
    return max(0.0, min(entrance, exit_fade)) ** 1.7


def draw_aurora_ribbon(canvas, curve):
    """Aurora segmentada cuja transparência desaparece nas duas pontas."""
    canvas.saveState()
    ribbon_specs = [
        (colors.HexColor("#B54656"), 14.0, 0.018, -6.0),
        (colors.HexColor("#D86B55"), 9.0, 0.025, -3.0),
        (colors.HexColor("#765ACD"), 5.0, 0.035, -1.0),
        (colors.HexColor("#AFC0FF"), 2.3, 0.060, 1.0),
        (colors.HexColor("#F0F3FF"), 0.64, 0.28, 2.3),
    ]
    segment_count = 160
    for color, width, peak_alpha, y_offset in ribbon_specs:
        previous = cubic_point(0, *curve)
        for index in range(1, segment_count + 1):
            t = index / segment_count
            current = cubic_point(t, *curve)
            fade = stream_fade((index - 0.5) / segment_count)
            canvas.setStrokeColor(color)
            canvas.setStrokeAlpha(peak_alpha * fade)
            canvas.setLineWidth(width * mm)
            # Butt caps join the small gradient segments without leaving the
            # bead-like edge created by a rounded cap on every segment.
            canvas.setLineCap(0)
            canvas.line(
                previous[0], previous[1] + y_offset * mm,
                current[0], current[1] + y_offset * mm,
            )
            previous = current
    canvas.restoreState()


def draw_aurora(canvas):
    """Campo astral integrado ao fundo, sem moldura ou limite perceptível."""
    canvas.saveState()
    center_y = PAGE_HEIGHT - 35 * mm
    curve = (
        (-10 * mm, center_y - 6 * mm),
        (8 * mm, center_y + 17 * mm),
        (43 * mm, center_y - 17 * mm),
        (71 * mm, center_y + 4 * mm),
    )

    # Glows radiais continuam além do campo de estrelas e somem suavemente.
    draw_layered_glow(
        canvas, 13 * mm, center_y - 1 * mm,
        53 * mm, 34 * mm, "#C04D52", 0.18, -11, 38,
    )
    draw_layered_glow(
        canvas, 37 * mm, center_y - 2 * mm,
        43 * mm, 23 * mm, "#7658C9", 0.13, 8, 34,
    )
    draw_layered_glow(
        canvas, 54 * mm, center_y + 1 * mm,
        31 * mm, 16 * mm, "#9EB4F8", 0.065, -6, 30,
    )

    draw_aurora_ribbon(canvas, curve)

    random.seed(20260830)
    for _ in range(92):
        # A média de dois sorteios concentra pontos no centro sem criar borda.
        t = (random.random() + random.random()) / 2
        base_x, base_y = cubic_point(t, *curve)
        x = base_x + random.gauss(0, 1.8) * mm
        y = base_y + random.gauss(0, 5.8) * mm
        opacity = random.uniform(0.28, 0.94) * stream_fade(t)
        if opacity < 0.045:
            continue
        star_radius = random.choice([0.12, 0.16, 0.2, 0.27, 0.34]) * mm
        canvas.setFillAlpha(opacity)
        canvas.setFillColor(WHITE)
        canvas.circle(x, y, star_radius, fill=1, stroke=0)

    # A constelação acompanha o mesmo fluxo e também perde opacidade no fim.
    constellation_t = [0.20, 0.31, 0.43, 0.57, 0.70]
    constellation = [cubic_point(t, *curve) for t in constellation_t]
    canvas.setStrokeColor(ACCENT_SOFT)
    canvas.setLineWidth(0.3)
    for index, (start, end) in enumerate(zip(constellation, constellation[1:])):
        midpoint = (constellation_t[index] + constellation_t[index + 1]) / 2
        canvas.setStrokeAlpha(0.22 * stream_fade(midpoint))
        canvas.line(start[0], start[1], end[0], end[1])
    for t, (x, y) in zip(constellation_t, constellation):
        canvas.setFillColor(WHITE)
        canvas.setFillAlpha(0.78 * stream_fade(t))
        canvas.circle(x, y, 0.34 * mm, fill=1, stroke=0)

    # Flares principais seguem a curva; o último já se dissolve antes do nome.
    flare_specs = [
        (0.23, -5.0, 0.72, 0.86, WHITE),
        (0.43, 1.0, 1.18, 1.0, WHITE),
        (0.62, -6.0, 0.60, 0.82, ACCENT),
        (0.77, 7.0, 0.38, 0.58, WHITE),
    ]
    for t, y_offset, radius, alpha, color in flare_specs:
        x, y = cubic_point(t, *curve)
        draw_flared_star(
            canvas, x, y + y_offset * mm, radius * mm,
            alpha * stream_fade(t), color,
        )
    canvas.restoreState()


def draw_page(canvas, document):
    canvas.saveState()
    canvas.setFillColor(BG)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    # A cor nasce no topo esquerdo, desce atrás da coluna e termina em azul,
    # repetindo o ritmo visual da referência sem depender de uma fotografia.
    draw_layered_glow(
        canvas, 3 * mm, PAGE_HEIGHT - 43 * mm,
        70 * mm, 74 * mm, "#D1524B", 0.255, -15,
    )
    draw_layered_glow(
        canvas, 17 * mm, PAGE_HEIGHT - 112 * mm,
        54 * mm, 104 * mm, "#A94B69", 0.195, 8,
    )
    draw_layered_glow(
        canvas, 7 * mm, PAGE_HEIGHT - 183 * mm,
        42 * mm, 72 * mm, "#6E3F78", 0.085, -8,
    )
    draw_layered_glow(
        canvas, PAGE_WIDTH + 7 * mm, 16 * mm,
        76 * mm, 93 * mm, "#2457C6", 0.24, -12,
    )
    draw_layered_glow(
        canvas, PAGE_WIDTH - 32 * mm, 9 * mm,
        56 * mm, 52 * mm, "#6947BB", 0.105, 16,
    )

    # Pequenas estrelas de fechamento no rodapé, quase como uma assinatura.
    draw_flared_star(canvas, PAGE_WIDTH - 20 * mm, 24 * mm, 0.42 * mm, 0.32, ACCENT)
    draw_flared_star(canvas, PAGE_WIDTH - 10 * mm, 34 * mm, 0.25 * mm, 0.22)

    draw_aurora(canvas)

    panel_x, panel_y, panel_w, panel_h = 15 * mm, 20 * mm, 49 * mm, 204 * mm
    canvas.setFillAlpha(0.56)
    canvas.setFillColor(PANEL)
    canvas.roundRect(panel_x, panel_y, panel_w, panel_h, 5 * mm, fill=1, stroke=0)

    # A aurora atravessa o painel como na referência, mas fica contida dentro
    # do vidro para não competir com a coluna principal.
    canvas.saveState()
    panel_clip = canvas.beginPath()
    panel_clip.roundRect(panel_x, panel_y, panel_w, panel_h, 5 * mm)
    canvas.clipPath(panel_clip, stroke=0, fill=0)
    draw_layered_glow(
        canvas, panel_x + 4 * mm, panel_y + panel_h - 35 * mm,
        52 * mm, 68 * mm, "#CE584D", 0.245, -12,
    )
    draw_layered_glow(
        canvas, panel_x + 8 * mm, panel_y + panel_h - 103 * mm,
        46 * mm, 90 * mm, "#93466F", 0.175, 9,
    )
    draw_layered_glow(
        canvas, panel_x + 1 * mm, panel_y + 38 * mm,
        38 * mm, 60 * mm, "#4C3B82", 0.082, -8,
    )
    canvas.restoreState()

    canvas.setFillAlpha(0.72)
    canvas.setStrokeColor(colors.HexColor("#606777"))
    canvas.setLineWidth(0.7)
    canvas.roundRect(panel_x, panel_y, panel_w, panel_h, 5 * mm, fill=0, stroke=1)

    header_x = 72 * mm
    canvas.setFillAlpha(1)
    canvas.setFillColor(WHITE)
    canvas.setFont(FONT, 20.5)
    canvas.drawString(header_x, PAGE_HEIGHT - 23 * mm, "JOSÉ LEONILSON")
    canvas.drawString(header_x, PAGE_HEIGHT - 33 * mm, "PINHEIRO DE SOUZA")
    canvas.setFont(FONT_BOLD, 8.1)
    canvas.setFillColor(ACCENT)
    canvas.drawString(header_x, PAGE_HEIGHT - 42 * mm, "DESENVOLVEDOR FRONT-END  |  DESIGNER DE INTERFACES")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(header_x, PAGE_HEIGHT - 47 * mm, PAGE_WIDTH - 16 * mm, PAGE_HEIGHT - 47 * mm)

    canvas.setFont(FONT_BOLD, 5.8)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(34 * mm, PAGE_HEIGHT - 64 * mm, "FRONT-END  /  INTERFACE DESIGN")

    canvas.setStrokeColor(LINE)
    canvas.line(15 * mm, 12 * mm, PAGE_WIDTH - 15 * mm, 12 * mm)
    canvas.setFont(FONT, 5.9)
    canvas.setFillColor(MUTED)
    canvas.drawString(16 * mm, 7.5 * mm, "Currículo atualizado em agosto de 2026")
    canvas.drawRightString(PAGE_WIDTH - 16 * mm, 7.5 * mm, "Cases navegáveis em mrleorobot.github.io")
    canvas.restoreState()


main_frame = Frame(
    72 * mm, 17 * mm, 122 * mm, 228 * mm,
    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="main",
)
sidebar_frame = Frame(
    20 * mm, 25 * mm, 39 * mm, 189 * mm,
    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="sidebar",
)

document = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=0,
    rightMargin=0,
    topMargin=0,
    bottomMargin=0,
    title="Currículo - José Leonilson Pinheiro de Souza",
    author="José Leonilson Pinheiro de Souza",
    subject="Desenvolvedor Front-end e Designer de Interfaces",
)
document.addPageTemplates(PageTemplate(id="cv", frames=[main_frame, sidebar_frame], onPage=draw_page))

story = []
story += section_title("Resumo profissional")
story.append(paragraph(
    "Desenvolvedor Front-end e designer de interfaces com foco em experiências web responsivas, acessíveis e visualmente consistentes. Une HTML, CSS e JavaScript a hierarquia, legibilidade e interação para transformar necessidades em produtos digitais claros e navegáveis.",
    body,
))

story += section_title("Experiência profissional")
story += job(
    "Estagiário Administrativo",
    "ESTEADEB - Escola de Teologia",
    "Mai/2026 - atual",
    [
        "Organização de arquivos, planilhas e dados em sistemas.",
        "Atendimento e apoio na comunicação de informações escolares.",
    ],
)
story += job(
    "Instrutor de Informática e Web Design",
    "Motiva Cursos",
    "Abr/2025 - Out/2025",
    [
        "Condução de aulas e orientação no uso de ferramentas digitais.",
        "Preparação de atividades, materiais e rotinas de acompanhamento.",
    ],
)
story += job(
    "Atendente e Operador de Caixa",
    "Cantina CDF - trabalho informal/terceirizado",
    "2023",
    ["Atendimento ao público, operação de caixa e organização da rotina."],
)

story += section_title("Projetos selecionados")
story += project(
    "Dashboard de Inventário",
    "Front-end e interface | Next.js, TypeScript",
    "Painel responsivo com alertas, filtros e leitura operacional do estoque.",
    "https://dashboard-de-inventario.vercel.app/",
)
story += project(
    "Refúgio Sereno",
    "Front-end e interface | React, Firebase",
    "Aplicativo de organização e foco com tarefas e feedback visual direto.",
    "https://refugiosereno.vercel.app/",
)
story += project(
    "ONE THING",
    "Front-end e direção de interface | JavaScript",
    "Experiência editorial responsiva baseada em tipografia e microinterações.",
    "https://one-thing-alive.vercel.app/",
)

story += section_title("Formação")
story.append(paragraph("<b>Administração - EAD</b> | Centro Universitário ETEP | Cursando desde 2026", body))
story.append(paragraph("<b>Ensino Médio</b> | E.E. Prof. Arnaldo Arsênio de Azevedo | Concluído em 2023", small))

story += section_title("Competências e habilidades")
story.append(paragraph(
    "- Comunicação clara e didática.<br/>"
    "- Organização, adaptabilidade e aprendizado contínuo.<br/>"
    "- Resolução de problemas e atenção à experiência de uso.<br/>"
    "- Colaboração entre definição visual e implementação.",
    body,
))

story += section_title("Disponibilidade profissional")
story.append(paragraph(
    "Oportunidades de nível júnior em Front-end, Desenvolvimento Web, UI Design e Web Design, além de projetos que conectem direção visual e implementação de interfaces.",
    small,
))

story.append(FrameBreak())
story += section_title("Contato", sidebar=True)
story.append(paragraph(
    "Parnamirim, RN - Brasil<br/>"
    '<link href="tel:+5584992238449" color="#D9DCE5">(84) 99223-8449</link><br/>'
    '<link href="mailto:leosouza5555@gmail.com" color="#D9DCE5">leosouza5555@gmail.com</link>',
    side_body,
))

story += section_title("Atuação", sidebar=True)
story.append(paragraph(
    "Front-end<br/>Design de interfaces<br/>Experiências responsivas<br/>Acessibilidade e testes",
    side_body,
))

story += section_title("Tecnologias", sidebar=True)
story.append(paragraph(
    "HTML5, CSS3, JavaScript, responsividade, componentes de interface, Git, GitHub e VS Code.",
    side_body,
))

story += section_title("Design e qualidade", sidebar=True)
story.append(paragraph(
    "Figma, Photoshop, hierarquia visual, wireframes, prototipagem, navegação por teclado e revisão desktop/mobile.",
    side_body,
))

story += section_title("Cursos", sidebar=True)
story.append(paragraph(
    "Design Gráfico - Motiva Cursos (2025)<br/>"
    "Informática - Motiva Cursos (2024)<br/>"
    "Hardware, Redes, Linux e Inteligência Artificial - Curso em Vídeo (2025)",
    side_body,
))

story += section_title("Idiomas", sidebar=True)
story.append(paragraph("Português - nativo<br/>Inglês - básico, em desenvolvimento", side_body))

story += section_title("Em desenvolvimento", sidebar=True)
story.append(paragraph("Algoritmos, Segurança da Informação, Java e Inglês.", side_body))

story += section_title("Links", sidebar=True)
story.append(paragraph(
    '<link href="https://mrleorobot.github.io/" color="#B9C9FF"><u>Portfólio</u></link><br/>'
    '<link href="https://github.com/mrleorobot" color="#B9C9FF"><u>GitHub</u></link><br/>'
    '<link href="https://www.linkedin.com/in/leonilsonsouza/" color="#B9C9FF"><u>LinkedIn</u></link><br/>'
    '<link href="https://wa.me/5584992238449" color="#B9C9FF"><u>WhatsApp</u></link>',
    side_body,
))

document.build(story)
