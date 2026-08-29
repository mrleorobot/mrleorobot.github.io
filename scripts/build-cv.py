from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, FrameBreak, HRFlowable, PageTemplate, Paragraph, Spacer


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "curriculo.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4
BLACK = colors.HexColor("#0A0A0A")
INK = colors.HexColor("#171717")
MUTED = colors.HexColor("#575757")
LIGHT = colors.HexColor("#E7E7E7")
PAPER = colors.HexColor("#F7F7F5")
FONT_PATH = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
FONT_BOLD_PATH = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
pdfmetrics.registerFont(TTFont("DejaVu", str(FONT_PATH)))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONT_BOLD_PATH)))
FONT = "DejaVu"
FONT_BOLD = "DejaVu-Bold"


def paragraph(text, style):
    return Paragraph(text, style)


styles = getSampleStyleSheet()
body = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName=FONT,
    fontSize=8.3,
    leading=11.5,
    textColor=INK,
    spaceAfter=4,
)
small = ParagraphStyle(
    "Small",
    parent=body,
    fontSize=7.5,
    leading=10.2,
    textColor=MUTED,
)
section = ParagraphStyle(
    "Section",
    parent=body,
    fontName=FONT_BOLD,
    fontSize=8.3,
    leading=10,
    textColor=BLACK,
    spaceBefore=5,
    spaceAfter=6,
    uppercase=True,
)
role = ParagraphStyle(
    "Role",
    parent=body,
    fontName=FONT_BOLD,
    fontSize=9.3,
    leading=11,
    spaceAfter=1,
)
meta = ParagraphStyle(
    "Meta",
    parent=small,
    fontName=FONT_BOLD,
    fontSize=7.2,
    leading=9.3,
    textColor=MUTED,
    spaceAfter=3,
)
bullet = ParagraphStyle(
    "Bullet",
    parent=small,
    leftIndent=8,
    firstLineIndent=-8,
    bulletIndent=0,
    spaceAfter=2.2,
)
side_section = ParagraphStyle(
    "SideSection",
    parent=section,
    fontSize=7.7,
    leading=9,
    spaceBefore=4,
    spaceAfter=5,
)
side_body = ParagraphStyle(
    "SideBody",
    parent=small,
    fontSize=7.35,
    leading=10.2,
    spaceAfter=3,
)


def divider():
    return HRFlowable(width="100%", thickness=0.55, color=colors.HexColor("#B8B8B8"), spaceBefore=4, spaceAfter=2)


def section_title(title):
    return [divider(), paragraph(title.upper(), section)]


def job(title, company, dates, bullets):
    items = [
        paragraph(title, role),
        paragraph(f"{company} | {dates}", meta),
    ]
    items.extend(paragraph(f"- {item}", bullet) for item in bullets)
    items.append(Spacer(1, 3))
    return items


def project(title, role_text, description, url):
    return [
        paragraph(f'<link href="{url}" color="#171717"><u>{title}</u></link>', role),
        paragraph(role_text, meta),
        paragraph(description, small),
        Spacer(1, 4),
    ]


def draw_page(canvas, document):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    header_height = 34 * mm
    canvas.setFillColor(BLACK)
    canvas.rect(0, PAGE_HEIGHT - header_height, PAGE_WIDTH, header_height, fill=1, stroke=0)

    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_BOLD, 21)
    canvas.drawString(16 * mm, PAGE_HEIGHT - 15 * mm, "JOSÉ LEONILSON PINHEIRO DE SOUZA")
    canvas.setFont(FONT, 10.5)
    canvas.setFillColor(colors.HexColor("#D8D8D8"))
    canvas.drawString(16 * mm, PAGE_HEIGHT - 22 * mm, "DESENVOLVEDOR FRONT-END E DESIGNER DE INTERFACES")

    canvas.setFont(FONT, 7.2)
    canvas.setFillColor(colors.HexColor("#BDBDBD"))
    canvas.drawString(16 * mm, PAGE_HEIGHT - 29 * mm, "Parnamirim/RN  |  (84) 99223-8449  |  leosouza5555@gmail.com")
    canvas.drawRightString(PAGE_WIDTH - 16 * mm, PAGE_HEIGHT - 29 * mm, "mrleorobot.github.io")

    canvas.setFillColor(colors.HexColor("#D9D9D9"))
    canvas.rect(135 * mm, 15 * mm, 0.4, PAGE_HEIGHT - header_height - 27 * mm, fill=1, stroke=0)

    canvas.setFont(FONT, 6.8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawString(16 * mm, 8 * mm, "Currículo atualizado em agosto de 2026")
    canvas.drawRightString(PAGE_WIDTH - 16 * mm, 8 * mm, "Cases navegáveis em mrleorobot.github.io")
    canvas.restoreState()


left = Frame(
    16 * mm,
    15 * mm,
    113 * mm,
    PAGE_HEIGHT - 55 * mm,
    leftPadding=0,
    rightPadding=3 * mm,
    topPadding=0,
    bottomPadding=0,
    id="main",
)
right = Frame(
    142 * mm,
    15 * mm,
    52 * mm,
    PAGE_HEIGHT - 55 * mm,
    leftPadding=0,
    rightPadding=0,
    topPadding=0,
    bottomPadding=0,
    id="sidebar",
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
document.addPageTemplates(PageTemplate(id="cv", frames=[left, right], onPage=draw_page))

story = []
story += section_title("Resumo profissional")
story.append(paragraph(
    "Desenvolvedor Front-end e designer de interfaces com foco em experiências web responsivas, acessíveis e visualmente consistentes. Conecta HTML, CSS e JavaScript a princípios de hierarquia, legibilidade e interação. A experiência como instrutor e no atendimento fortalece comunicação, organização e clareza ao transformar necessidades em soluções digitais.",
    body,
))

story += section_title("Projetos selecionados")
story += project(
    "Dashboard de Inventário",
    "Front-end e design de interface | Next.js, TypeScript",
    "Painel responsivo que prioriza alertas, estado do estoque, filtros e leitura operacional.",
    "https://dashboard-de-inventario.vercel.app/",
)
story += project(
    "Refúgio Sereno",
    "Front-end e design de interface | React, Firebase",
    "Aplicativo de organização e foco com hierarquia calma, tarefas e feedback visual direto.",
    "https://refugiosereno.vercel.app/",
)
story += project(
    "ONE THING",
    "Front-end e direção de interface | JavaScript, Framer Motion",
    "Experiência editorial responsiva baseada em tipografia, espaço negativo e microinterações.",
    "https://one-thing-alive.vercel.app/",
)

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

story.append(FrameBreak())
story += section_title("Competências")
story.append(paragraph("<b>Front-end</b><br/>HTML5, CSS3, JavaScript, responsividade e componentes de interface.", side_body))
story.append(paragraph("<b>Design de interfaces</b><br/>Hierarquia visual, wireframes, prototipagem, legibilidade e design responsivo.", side_body))
story.append(paragraph("<b>Qualidade</b><br/>Acessibilidade, navegação por teclado, testes de interface e revisão entre desktop e mobile.", side_body))
story.append(paragraph("<b>Ferramentas</b><br/>Git, GitHub, VS Code, Figma, Photoshop e Google Workspace.", side_body))

story += section_title("Formação")
story.append(paragraph("<b>Administração - EAD</b><br/>Centro Universitário ETEP<br/>Cursando desde 2026", side_body))
story.append(paragraph("<b>Ensino Médio</b><br/>E.E. Prof. Arnaldo Arsênio de Azevedo<br/>Concluído em 2023", side_body))

story += section_title("Cursos")
story.append(paragraph(
    "Design Gráfico - Motiva Cursos (2025)<br/>Informática - Motiva Cursos (2024)<br/>Hardware - Curso em Vídeo (2025)<br/>Redes - Curso em Vídeo (2025)<br/>Linux - Curso em Vídeo (2025)<br/>Inteligência Artificial - Curso em Vídeo (2025)",
    side_body,
))

story += section_title("Em desenvolvimento")
story.append(paragraph("JavaScript, HTML e CSS, Algoritmos, Segurança da Informação, Java e Inglês básico.", side_body))

story += section_title("Links")
story.append(paragraph(
    '<link href="https://mrleorobot.github.io/" color="#171717"><u>Portfólio</u></link><br/>'
    '<link href="https://github.com/mrleorobot" color="#171717"><u>GitHub</u></link><br/>'
    '<link href="https://www.linkedin.com/in/leonilsonsouza/" color="#171717"><u>LinkedIn</u></link><br/>'
    '<link href="mailto:leosouza5555@gmail.com" color="#171717"><u>Email</u></link><br/>'
    '<link href="https://wa.me/5584992238449" color="#171717"><u>WhatsApp</u></link>',
    side_body,
))

document.build(story)
print(OUTPUT)
