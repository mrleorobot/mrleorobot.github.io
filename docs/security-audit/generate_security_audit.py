#!/usr/bin/env python3
"""Gera o relatorio A4 da auditoria de seguranca do portfolio."""

from __future__ import annotations

import argparse
import re
import tempfile
from pathlib import Path
from xml.sax.saxutils import escape

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


PROJECT = "mrleorobot.github.io"
AUDIT_DATE = "30/08/2026"
AUDIT_COMMIT = "8d87d1c44fb2a3a69055f1440f0a29993003695b"

CRITICAL = colors.HexColor("#B91C1C")
HIGH = colors.HexColor("#EA580C")
MEDIUM = colors.HexColor("#D97706")
LOW = colors.HexColor("#2563EB")
STRONG = colors.HexColor("#059669")
INFO = colors.HexColor("#64748B")
INK = colors.HexColor("#152033")
MUTED = colors.HexColor("#536176")
LINE = colors.HexColor("#DCE3EC")
PAPER = colors.HexColor("#F7F9FC")
NAVY = colors.HexColor("#07111F")
VIOLET = colors.HexColor("#5B4FB3")


def register_fonts() -> tuple[str, str, str]:
    regular = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    bold = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    mono = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")
    if regular.exists() and bold.exists() and mono.exists():
        pdfmetrics.registerFont(TTFont("AuditSans", str(regular)))
        pdfmetrics.registerFont(TTFont("AuditSans-Bold", str(bold)))
        pdfmetrics.registerFont(TTFont("AuditMono", str(mono)))
        return "AuditSans", "AuditSans-Bold", "AuditMono"
    return "Helvetica", "Helvetica-Bold", "Courier"


FONT, FONT_BOLD, FONT_MONO = register_fonts()


PTBR_WORDS = {
    "aplicacao": "aplicação",
    "aplicavel": "aplicável",
    "atribuicoes": "atribuições",
    "autenticacao": "autenticação",
    "autorizacao": "autorização",
    "arvore": "árvore",
    "alcancavel": "alcançável",
    "alcancaveis": "alcançáveis",
    "codigo": "código",
    "conteudo": "conteúdo",
    "contem": "contém",
    "compilacao": "compilação",
    "condicao": "condição",
    "condicoes": "condições",
    "configuracao": "configuração",
    "configuracoes": "configurações",
    "correcao": "correção",
    "critica": "crítica",
    "criterio": "critério",
    "criterios": "critérios",
    "dependencias": "dependências",
    "descricao": "descrição",
    "disponiveis": "disponíveis",
    "distribuicao": "distribuição",
    "dinamico": "dinâmico",
    "dinamicos": "dinâmicos",
    "evidencia": "evidência",
    "evidencias": "evidências",
    "execucao": "execução",
    "exploracao": "exploração",
    "exploravel": "explorável",
    "funcao": "função",
    "funcoes": "funções",
    "fundacao": "fundação",
    "ha": "há",
    "historico": "histórico",
    "injecao": "injeção",
    "integracao": "integração",
    "metodologica": "metodológica",
    "media": "média",
    "nao": "não",
    "navegacao": "navegação",
    "necessaria": "necessária",
    "necessarias": "necessárias",
    "necessario": "necessário",
    "ocorrencias": "ocorrências",
    "operacoes": "operações",
    "pagina": "página",
    "papeis": "papéis",
    "permissao": "permissão",
    "podera": "poderá",
    "preferencia": "preferência",
    "producao": "produção",
    "portfolio": "portfólio",
    "publica": "pública",
    "recomendacoes": "recomendações",
    "reducao": "redução",
    "relatorio": "relatório",
    "repositorio": "repositório",
    "repositorios": "repositórios",
    "revisao": "revisão",
    "rotacao": "rotação",
    "sanitizacao": "sanitização",
    "secao": "seção",
    "secoes": "seções",
    "seguranca": "segurança",
    "sera": "será",
    "sessao": "sessão",
    "sugestao": "sugestão",
    "superficie": "superfície",
    "so": "só",
    "tecnica": "técnica",
    "tecnico": "técnico",
    "validacao": "validação",
    "validas": "válidas",
    "variaveis": "variáveis",
    "verificacao": "verificação",
    "versao": "versão",
    "visao": "visão",
    "estatico": "estático",
    "estaticos": "estáticos",
    "estatica": "estática",
    "esta": "está",
    "ficara": "ficará",
    "inventario": "inventário",
    "padroes": "padrões",
    "publico": "público",
    "sistematica": "sistemática",
    "substituida": "substituída",
    "titulo": "título",
    "unico": "único",
    "vulneravel": "vulnerável",
    "ate": "até",
}
PTBR_PATTERN = re.compile(r"\b(" + "|".join(sorted(PTBR_WORDS, key=len, reverse=True)) + r")\b", re.IGNORECASE)


def ptbr(text: str) -> str:
    def replace_word(match: re.Match[str]) -> str:
        source = match.group(0)
        target = PTBR_WORDS[source.lower()]
        if source.isupper():
            return target.upper()
        if source[:1].isupper():
            return target[:1].upper() + target[1:]
        return target

    return PTBR_PATTERN.sub(replace_word, text)


def build_styles():
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.9,
            leading=13.0,
            textColor=INK,
            spaceAfter=5,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=7.5,
            leading=10.5,
            textColor=MUTED,
        ),
        "cover_kicker": ParagraphStyle(
            "CoverKicker",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=9,
            leading=12,
            tracking=2,
            textColor=colors.HexColor("#9FB6D5"),
            spaceAfter=14,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=31,
            leading=35,
            textColor=colors.white,
            spaceAfter=16,
        ),
        "cover_sub": ParagraphStyle(
            "CoverSub",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#C7D4E8"),
            spaceAfter=8,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=20,
            leading=24,
            textColor=NAVY,
            spaceBefore=4,
            spaceAfter=11,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=13.5,
            leading=17,
            textColor=INK,
            spaceBefore=12,
            spaceAfter=7,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName=FONT_BOLD,
            fontSize=10.5,
            leading=14,
            textColor=INK,
            spaceBefore=8,
            spaceAfter=5,
        ),
        "callout": ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=9.3,
            leading=14,
            textColor=INK,
            backColor=colors.HexColor("#EDF3FA"),
            borderColor=colors.HexColor("#BCD0E8"),
            borderWidth=0.8,
            borderPadding=9,
            spaceBefore=5,
            spaceAfter=10,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName=FONT_MONO,
            fontSize=6.9,
            leading=9.6,
            textColor=colors.HexColor("#DCE8F8"),
            backColor=colors.HexColor("#101B2B"),
            borderColor=colors.HexColor("#2D3D55"),
            borderWidth=0.7,
            borderPadding=8,
            leftIndent=0,
            rightIndent=0,
            spaceBefore=5,
            spaceAfter=9,
        ),
        "issue": ParagraphStyle(
            "Issue",
            parent=base["Code"],
            fontName=FONT_MONO,
            fontSize=6.8,
            leading=9.1,
            textColor=INK,
            backColor=colors.HexColor("#F1F4F8"),
            borderColor=LINE,
            borderWidth=0.8,
            borderPadding=9,
            leftIndent=0,
            rightIndent=0,
            spaceBefore=5,
            spaceAfter=8,
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.6,
            leading=9.5,
            textColor=colors.white,
        ),
        "table": ParagraphStyle(
            "Table",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=7.6,
            leading=10.5,
            textColor=INK,
        ),
        "table_bold": ParagraphStyle(
            "TableBold",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.6,
            leading=10.5,
            textColor=INK,
        ),
        "chip": ParagraphStyle(
            "Chip",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.1,
            leading=8.6,
            alignment=TA_CENTER,
            textColor=colors.white,
        ),
        "metric": ParagraphStyle(
            "Metric",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=18,
            leading=20,
            alignment=TA_CENTER,
            textColor=NAVY,
        ),
        "metric_label": ParagraphStyle(
            "MetricLabel",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=6.8,
            leading=8.5,
            alignment=TA_CENTER,
            textColor=MUTED,
        ),
    }


S = build_styles()


def para(text: str, style: str = "body") -> Paragraph:
    return Paragraph(ptbr(text), S[style])


def bullet(text: str, color=INK) -> Paragraph:
    style = ParagraphStyle(
        "BulletDynamic",
        parent=S["body"],
        leftIndent=12,
        firstLineIndent=-9,
        bulletIndent=0,
        textColor=color,
        spaceAfter=4,
    )
    return Paragraph(ptbr(f"- {text}"), style)


def section_title(title: str, kicker: str | None = None):
    items = []
    if kicker:
        items.append(
            Paragraph(
                escape(ptbr(kicker.upper())),
                ParagraphStyle(
                    "SectionKicker",
                    parent=S["small"],
                    fontName=FONT_BOLD,
                    textColor=VIOLET,
                    spaceAfter=3,
                ),
            )
        )
    items.append(para(escape(title), "h1"))
    items.append(HRFlowable(width="100%", thickness=0.8, color=LINE, spaceAfter=12))
    return items


def standard_table(data, widths, header=True, severity_rows=None):
    table = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT", splitByRow=1)
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [colors.white, PAPER]),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ]
        )
    if severity_rows:
        for row_index, color in severity_rows:
            commands.extend(
                [
                    ("BACKGROUND", (0, row_index), (0, row_index), color),
                    ("TEXTCOLOR", (0, row_index), (0, row_index), colors.white),
                    ("VALIGN", (0, row_index), (0, row_index), "MIDDLE"),
                ]
            )
    table.setStyle(TableStyle(commands))
    return table


def make_charts(output_dir: Path) -> tuple[Path, Path]:
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})

    donut_path = output_dir / "severidades.png"
    fig, ax = plt.subplots(figsize=(5.2, 3.2), facecolor="white")
    values = [1, 1]
    labels = ["Baixa", "Informativa"]
    palette = ["#2563EB", "#64748B"]
    wedges, _ = ax.pie(
        values,
        colors=palette,
        startangle=90,
        counterclock=False,
        wedgeprops={"width": 0.34, "edgecolor": "white", "linewidth": 2},
    )
    ax.text(0, 0.08, "2", ha="center", va="center", fontsize=24, weight="bold", color="#07111F")
    ax.text(0, -0.18, "registros", ha="center", va="center", fontsize=9, color="#536176")
    ax.legend(wedges, ["Baixa: 1", "Informativa: 1"], loc="lower center", bbox_to_anchor=(0.5, -0.12), ncol=2, frameon=False)
    ax.set_title("Distribuição por severidade", fontsize=12, weight="bold", color="#152033", pad=10)
    ax.set_aspect("equal")
    fig.tight_layout()
    fig.savefig(donut_path, dpi=190, bbox_inches="tight", facecolor="white")
    plt.close(fig)

    bar_path = output_dir / "categorias.png"
    categories = ["Isolamento\nde dados", "Permissão\nno browser", "IDOR", "Chaves\nexpostas", "XSS"]
    values = [0, 0, 0, 1, 1]
    bar_colors = ["#059669", "#059669", "#059669", "#2563EB", "#64748B"]
    fig, ax = plt.subplots(figsize=(7.2, 3.4), facecolor="white")
    bars = ax.bar(categories, values, color=bar_colors, width=0.62)
    ax.set_ylim(0, 1.35)
    ax.set_yticks([0, 1])
    ax.set_ylabel("Registros")
    ax.set_title("Registros por categoria auditada", fontsize=12, weight="bold", color="#152033", pad=12)
    ax.grid(axis="y", color="#DCE3EC", linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.spines["bottom"].set_color("#DCE3EC")
    for bar, value in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, value + 0.05, str(value), ha="center", va="bottom", weight="bold", color="#152033")
    fig.tight_layout()
    fig.savefig(bar_path, dpi=190, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return donut_path, bar_path


def draw_cover(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, width, height, stroke=0, fill=1)

    # Aurora vetorial sutil, sem imagens raster de fundo.
    for i in range(18):
        alpha = max(0.015, 0.10 - i * 0.0045)
        canvas.setFillAlpha(alpha)
        canvas.setFillColor(colors.HexColor("#6D5BD0"))
        canvas.ellipse(-80 + i * 6, height * 0.48 - i * 2, width * 0.68 + i * 6, height * 1.02 + i * 5, stroke=0, fill=1)
    for i in range(14):
        alpha = max(0.012, 0.075 - i * 0.004)
        canvas.setFillAlpha(alpha)
        canvas.setFillColor(colors.HexColor("#2563EB"))
        canvas.ellipse(width * 0.52 - i * 3, -100 + i * 2, width * 1.14 + i * 5, height * 0.47 + i * 4, stroke=0, fill=1)
    canvas.setFillAlpha(1)
    canvas.setStrokeColor(colors.HexColor("#3B4A61"))
    canvas.setLineWidth(0.7)
    canvas.line(2 * cm, 2.2 * cm, width - 2 * cm, 2.2 * cm)
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(colors.HexColor("#9FB0C7"))
    canvas.drawString(2 * cm, 1.65 * cm, f"AUDIT ID  SEC-2026-08  |  COMMIT {AUDIT_COMMIT[:8]}")
    canvas.restoreState()


def draw_page(canvas, doc):
    width, height = A4
    if doc.page == 1:
        draw_cover(canvas, doc)
        return
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(2 * cm, height - 1.45 * cm, width - 2 * cm, height - 1.45 * cm)
    canvas.line(2 * cm, 1.35 * cm, width - 2 * cm, 1.35 * cm)
    canvas.setFont(FONT_BOLD, 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, height - 1.12 * cm, "RELATÓRIO DE AUDITORIA DE SEGURANÇA")
    canvas.setFont(FONT, 7.2)
    canvas.drawRightString(width - 2 * cm, height - 1.12 * cm, PROJECT)
    canvas.drawString(2 * cm, 0.92 * cm, f"Escopo: commit {AUDIT_COMMIT[:8]}  |  {AUDIT_DATE}")
    canvas.drawRightString(width - 2 * cm, 0.92 * cm, f"Página {doc.page}")
    canvas.restoreState()


def metric_card(value: str, label: str, color) -> Table:
    t = Table(
        [[para(value, "metric")], [para(label, "metric_label")]],
        colWidths=[2.55 * cm],
        rowHeights=[0.8 * cm, 0.7 * cm],
    )
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.9, color),
                ("LINEABOVE", (0, 0), (-1, 0), 4, color),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


def code_block(text: str) -> Table:
    content = Preformatted(ptbr(text.strip("\n")), S["code"], maxLineLength=102)
    block = Table([[content]], colWidths=[15.4 * cm], hAlign="LEFT")
    block.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#101B2B")),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#2D3D55")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return block


def issue_block(text: str) -> Preformatted:
    return Preformatted(ptbr(text.strip("\n")), S["issue"], maxLineLength=100)


def build_story(donut_path: Path, bar_path: Path):
    story = []

    # Capa
    story.extend(
        [
            Spacer(1, 3.2 * cm),
            para("AUDITORIA TECNICA INDEPENDENTE", "cover_kicker"),
            para(f"Relatorio de Auditoria de Seguranca - {PROJECT}", "cover_title"),
            para("Revisao orientada por evidencia das cinco classes solicitadas: isolamento de dados, autorizacao, IDOR, segredos e XSS.", "cover_sub"),
            Spacer(1, 1.1 * cm),
        ]
    )
    cover_data = [
        [para("DATA", "table_head"), para("ESCOPO AUDITADO", "table_head")],
        [para(AUDIT_DATE, "table_bold"), para(f"Arvore de trabalho correspondente ao commit publicado {AUDIT_COMMIT[:8]}; codigo de runtime, scripts de build, configuracoes, CI, dados estaticos e 10 commits alcancaveis do historico Git.", "table")],
    ]
    cover_table = standard_table(cover_data, [3.2 * cm, 11.3 * cm])
    cover_table.setStyle(TableStyle([("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#EAF0F8"))]))
    story.append(cover_table)
    story.append(Spacer(1, 0.8 * cm))
    story.append(
        Paragraph(
            ptbr("<b>Nota metodologica.</b> Cada categoria foi primeiro mapeada para a stack detectada. Categorias sem superficie correspondente foram registradas como nao aplicaveis. Somente evidencias verificadas no codigo receberam severidade; condicoes necessarias para exploracao foram mantidas junto ao achado."),
            ParagraphStyle("CoverNote", parent=S["cover_sub"], fontSize=9, leading=14, textColor=colors.HexColor("#D7E1EF")),
        )
    )
    story.append(PageBreak())

    # Resumo executivo
    story.extend(section_title("Resumo executivo", "Visao geral"))
    story.append(
        para(
            "A versao publicada do portfolio apresenta <b>baixa superficie de ataque</b>: é um site estatico, sem banco, backend, autenticacao, sessao ou rotas de objeto. Nao foi confirmada vulnerabilidade critica, alta ou media. Foram registrados <b>um achado de severidade baixa</b> e <b>uma observacao informativa</b>, ambos condicionais e ligados a codigo residual que nao participa do fluxo de producao atual."
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    metric_row = Table(
        [[
            metric_card("0", "CRITICA", CRITICAL),
            metric_card("0", "ALTA", HIGH),
            metric_card("0", "MEDIA", MEDIUM),
            metric_card("1", "BAIXA", LOW),
            metric_card("1", "INFORMATIVA", INFO),
        ]],
        colWidths=[2.82 * cm] * 5,
        hAlign="LEFT",
    )
    metric_row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]))
    story.append(metric_row)
    story.append(Spacer(1, 0.35 * cm))
    charts = Table(
        [[Image(str(donut_path), width=7.0 * cm, height=4.45 * cm), Image(str(bar_path), width=8.2 * cm, height=4.25 * cm)]],
        colWidths=[7.25 * cm, 8.15 * cm],
    )
    charts.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    story.append(charts)
    story.append(Spacer(1, 0.25 * cm))
    story.append(
        para(
            "<b>Leitura de risco:</b> nenhum segredo real foi encontrado no codigo atual, nos JavaScript publicados ou nos 10 commits disponiveis localmente. O risco baixo nasce da configuracao que passaria uma chave de servidor ao bundle do navegador caso o caminho Vite fosse reativado. A observacao de XSS é igualmente latente: a funcao vulneravel está comentada e o elemento de destino nao existe no HTML atual.",
            "callout",
        )
    )
    story.append(PageBreak())

    # Stack
    story.extend(section_title("Stack detectada e mapeamento", "Fundacao tecnica"))
    stack_data = [
        [para("Camada", "table_head"), para("Tecnologia detectada", "table_head"), para("Evidencia", "table_head")],
        [para("Linguagem", "table_bold"), para("HTML5, CSS3 e JavaScript ES Modules", "table"), para("index.html; app.js:1-4; package.json:5-16", "table")],
        [para("Frontend", "table_bold"), para("DOM nativo. Nao ha framework ativo nem bundle de aplicacao.", "table"), para("app.js:1-4 importa arquivos JS diretamente; package.json nao declara dependencias de runtime.", "table")],
        [para("PWA", "table_bold"), para("Service Worker e manifest JSON", "table"), para("sw.js:1-85; manifest.json:1-66", "table")],
        [para("Dados", "table_bold"), para("projects.json estatico, transformado por script de build", "table"), para("scripts/sync-projects.mjs:5-7 e 94-117", "table")],
        [para("Backend / API", "table_bold"), para("Nao existe no repositorio", "table"), para("Nenhum handler HTTP, pasta api/server/routes ou dependencia de servidor.", "table")],
        [para("Banco / ORM", "table_bold"), para("Nao existe", "table"), para("Nenhuma dependencia ou configuracao Supabase, Prisma, Sequelize, TypeORM, Drizzle, Knex ou banco SQL/NoSQL.", "table")],
        [para("Autenticacao", "table_bold"), para("Nao existe", "table"), para("Nenhuma sessao, token, login, papel ou gate isAdmin/canEdit.", "table")],
        [para("Build residual", "table_bold"), para("vite.config.ts referencia React/Tailwind e Gemini, mas as dependencias e o script build nao existem", "table"), para("vite.config.ts:1-13; package.json:7-17; package-lock.json contem apenas o pacote raiz.", "table")],
        [para("Deploy / CI", "table_bold"), para("GitHub Pages e GitHub Actions", "table"), para(".github/workflows/portfolio-qa.yml:1-46. Sem Docker, Helm ou Terraform.", "table")],
    ]
    story.append(standard_table(stack_data, [3.1 * cm, 6.1 * cm, 6.2 * cm]))
    story.append(Spacer(1, 0.4 * cm))

    mapping_data = [
        [para("Categoria solicitada", "table_head"), para("Equivalente nesta stack", "table_head"), para("Resultado", "table_head")],
        [para("1. Banco sem tranca", "table_bold"), para("RLS, middleware tenant ou filtros user_id/org_id", "table"), para("Nao aplicavel: nao ha banco, API ou dados privados por usuario.", "table")],
        [para("2. Permissao no navegador", "table_bold"), para("Gates de papel na UI cruzados com rotas sensiveis", "table"), para("Nao aplicavel: nao ha papel, login, escrita privilegiada ou servidor.", "table")],
        [para("3. IDOR", "table_bold"), para("Todos os handlers por ID no backend", "table"), para("Nao aplicavel: zero handlers de backend.", "table")],
        [para("4. Chaves expostas", "table_bold"), para("Codigo, config, CI, historico Git e artefatos cliente", "table"), para("1 achado baixo e nenhum segredo real confirmado.", "table")],
        [para("5. Inputs sem tratamento", "table_bold"), para("29 sinks HTML/eval, fontes externas, URL, localStorage e sanitizacao", "table"), para("1 observacao informativa; fluxo vulneravel esta desativado.", "table")],
    ]
    story.append(para("Como as cinco categorias foram adaptadas", "h2"))
    story.append(standard_table(mapping_data, [4.25 * cm, 5.7 * cm, 5.45 * cm]))
    story.append(PageBreak())

    # Metodologia e cobertura
    story.extend(section_title("Cobertura e metodologia", "Evidencia antes de severidade"))
    story.append(para("A revisao combinou inventario da arvore, busca estatica por padroes, rastreamento manual de fonte ate sink, leitura integral dos pontos encontrados e verificacao do historico Git disponivel."))
    for item in [
        "Inventario de codigo, configuracoes, dados, CI, arquivos ocultos relevantes e artefatos de deploy.",
        "Busca por frameworks, ORMs, bancos, middleware, rotas HTTP, gates de papel, IDs e operacoes privilegiadas.",
        "Revisao de 29 ocorrencias de innerHTML/equivalentes e de todas as atribuicoes runtime a href/src encontradas.",
        "Rastreamento das fontes URL, hash, localStorage, sessionStorage, fetch e JSON ate os sinks DOM.",
        "Busca de formatos conhecidos de AWS, Google, GitHub, OpenAI, JWT e chaves privadas em todos os 10 commits alcancaveis.",
        "Busca por defaults de segredo no formato ${VAR:-valor} e por senhas/JWT/webhooks literais.",
        "Verificacao do bundle efetivo: o deploy atual importa app.js e cinco modulos JavaScript diretamente; nao existe dist/build versionado.",
    ]:
        story.append(bullet(item))
    story.append(
        para(
            "<b>Limite do historico:</b> o clone e raso (<i>shallow</i>) e expoe 10 commits, de 28 a 30 de agosto de 2026. A conclusao historica vale somente para esses objetos Git alcancaveis; uma verificacao forense integral exige clone sem profundidade.",
            "callout",
        )
    )
    coverage_data = [
        [para("Grupo", "table_head"), para("Arquivos / superficies revisadas", "table_head")],
        [para("Runtime web", "table_bold"), para("index.html, offline.html, app.js, script.js, awwwards-upgrade.js, hero-ink.js, evolution.js, sw.js", "table")],
        [para("Build e dados", "table_bold"), para("scripts/sync-projects.mjs, scripts/build-css.mjs, scripts/build-cv.py, take-screenshots.mjs, projects.json", "table")],
        [para("Configuracao", "table_bold"), para("package.json, package-lock.json, vite.config.ts, tsconfig.json, manifest.json, .gitignore, .emergent/emergent.yml", "table")],
        [para("QA e deploy", "table_bold"), para("qa/package.json, qa/package-lock.json, qa/playwright.config.mjs, qa/tests/portfolio.spec.mjs, .github/workflows/portfolio-qa.yml", "table")],
        [para("Historico", "table_bold"), para("10 commits alcancaveis; busca de segredos de alta confianca e defaults inseguros.", "table")],
    ]
    story.append(standard_table(coverage_data, [3.4 * cm, 12 * cm]))
    story.append(PageBreak())

    # Pontos fortes e fracos
    story.extend(section_title("Pontos fortes e pontos fracos", "Postura atual"))
    story.append(para("Pontos fortes", "h2"))
    strengths = [
        ("Superficie pequena", "Nao ha backend, banco, autenticacao, cookies de sessao ou dados privados. As tres primeiras categorias nao possuem objeto exploravel neste repositorio."),
        ("Escape no gerador de projetos", "scripts/sync-projects.mjs:9-13 define escapeHtml; linhas 62-89 aplicam o escape a textos e atributos gerados."),
        ("Overlay protegido", "awwwards-upgrade.js:202-218 escapa titulo, descricao, tags, imagem e link; linhas 269-272 implementam o escape com textContent."),
        ("Insercao segura de texto", "evolution.js:763-777 e script.js:2048-2057 usam textContent e createElement para conteudo dinamico ativo."),
        ("Service Worker restrito", "sw.js:47-52 ignora metodos diferentes de GET e origens diferentes da origem do site."),
        ("CI com menor privilegio", ".github/workflows/portfolio-qa.yml:9-10 limita o token a contents: read."),
        ("Higiene de segredos", ".gitignore:1-7 exclui .env, credentials.json, PEM, chaves e diretorios de credenciais."),
        ("Historico alcancavel limpo", "Nenhuma credencial de formato conhecido nem default ${VAR:-valor} foi encontrado nos 10 commits disponiveis."),
    ]
    strong_rows = [[para("Evidencia", "table_head"), para("O que esta correto", "table_head")]]
    for label, evidence in strengths:
        strong_rows.append([para(label, "table_bold"), para(evidence, "table")])
    strong_table = standard_table(strong_rows, [4.0 * cm, 11.4 * cm])
    strong_table.setStyle(TableStyle([("LINEBEFORE", (0, 1), (0, -1), 3, STRONG)]))
    story.append(strong_table)
    story.append(Spacer(1, 0.45 * cm))
    story.append(para("Pontos fracos", "h2"))
    for text in [
        "vite.config.ts mantem uma ponte explicita entre GEMINI_API_KEY e o codigo cliente, embora o pipeline Vite esteja inativo.",
        "script.js conserva um renderizador desativado que combina dados da API do GitHub/localStorage com innerHTML sem sanitizacao.",
        "Nao ha biblioteca de sanitizacao nas dependencias. Isso nao é falha por si so no fluxo atual, mas aumenta o risco de reativar o codigo residual sem protecao.",
        "O clone raso impede afirmar que todo o historico remoto antigo esta livre de segredos.",
    ]:
        story.append(bullet(text, color=colors.HexColor("#7C2D12")))
    story.append(PageBreak())

    # Achado 1
    story.extend(section_title("Achados detalhados", "Arquivo por arquivo, linha por linha"))
    story.append(para("F-01 - Chave de API configurada para injecao em bundle cliente", "h2"))
    f1_meta = [
        [para("Severidade", "table_head"), para("Categoria", "table_head"), para("Arquivo:linha", "table_head"), para("Estado", "table_head")],
        [para("BAIXA", "chip"), para("Chaves expostas", "table"), para("vite.config.ts:6-13", "table_bold"), para("Condicional; build Vite inativo", "table")],
    ]
    story.append(standard_table(f1_meta, [2.5 * cm, 3.5 * cm, 4.0 * cm, 5.4 * cm], severity_rows=[(1, LOW)]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(code_block("""
6  export default defineConfig(({mode}) => {
7    const env = loadEnv(mode, '.', '');
8    return {
9      base: './',
10     plugins: [react(), tailwindcss()],
11     define: {
12       'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
13     },
"""))
    story.append(para("<b>Por que é exploravel:</b> o campo <font name='AuditMono'>define</font> do Vite substitui a expressao no codigo compilado. Se esse caminho de build for reativado com uma chave real no ambiente, qualquer visitante podera recuperar o valor no JavaScript ou nas ferramentas de desenvolvimento e usar a cota/permissoes da chave fora do site."))
    story.append(para("<b>Condicao de exploracao:</b> exige instalar/reativar Vite, incluir codigo que referencie <font name='AuditMono'>process.env.GEMINI_API_KEY</font> e executar o build com a variavel preenchida. O <font name='AuditMono'>package.json:7-17</font> atual nao possui script build nem dependencias Vite/React/Tailwind; portanto a versao publicada hoje nao expoe o valor."))
    story.append(para("<b>Correcao:</b> remover a definicao e o arquivo residual se nao forem usados. Se o portfolio voltar a consumir Gemini, encaminhar a chamada por backend/serverless com autenticacao, limites e chave somente no servidor. Adicionar teste de CI que falhe quando nomes de segredos forem definidos no bundle cliente."))
    story.append(PageBreak())

    # Achado 2
    story.extend(section_title("Achados detalhados", "Continuacao"))
    story.append(para("F-02 - Renderizador desativado usa dados externos em innerHTML", "h2"))
    f2_meta = [
        [para("Severidade", "table_head"), para("Categoria", "table_head"), para("Arquivo:linha", "table_head"), para("Estado", "table_head")],
        [para("INFORMATIVA", "chip"), para("Inputs sem tratamento (XSS)", "table"), para("script.js:1514-1518, 1595-1617, 1633-1664", "table_bold"), para("Nao exploravel no deploy atual", "table")],
    ]
    story.append(standard_table(f2_meta, [2.5 * cm, 3.9 * cm, 5.2 * cm, 3.8 * cm], severity_rows=[(1, INFO)]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(code_block("""
1514 const cachedData = localStorage.getItem(cacheKey);
1517 const renderRepos = (reposData) => {
1595   const desc = repo.description ? repo.description : "Sem descricao fornecida.";
1601   article.innerHTML = `
1608     <h3>${repo.name}</h3>
1609     <p>${desc}</p>
1613     ${lang}
1615     <a href="${repo.html_url}" ...>Ver Repositorio</a>`;
1633 const res = await fetch(`https://api.github.com/users/${username}/repos?...`);
1647 renderRepos(data);
1664 // fetchRecentRepos(); // Desativado: secao substituida pela vitrine estatica
"""))
    story.append(para("<b>Por que seria exploravel:</b> nome, descricao, linguagem e URL chegam da API/localStorage e entram em um parser HTML sem escape ou sanitizacao. Se a funcao for reativada e qualquer campo contiver markup executavel, o navegador o interpretara no contexto de <font name='AuditMono'>mrleorobot.github.io</font>."))
    story.append(para("<b>Condicao de exploracao:</b> a chamada esta comentada em <font name='AuditMono'>script.js:1664</font> e <font name='AuditMono'>index.html</font> nao contem <font name='AuditMono'>#github-repos-grid</font>. A funcao retorna antes de ler cache ou rede; nao ha XSS reproduzivel hoje."))
    story.append(para("<b>Sanitizacao:</b> nao existe DOMPurify ou equivalente. Os fluxos ativos seguros usam textContent/createElement ou escapeHtml manual."))
    story.append(para("<b>Correcao:</b> remover a funcao morta. Se ela voltar, usar createElement/textContent, aceitar somente URLs <font name='AuditMono'>https:</font> validas e aplicar DOMPurify se HTML for indispensavel."))
    story.append(PageBreak())

    # Tabela consolidada
    story.extend(section_title("Tabela consolidada de achados", "Referencia rapida"))
    findings_table = [
        [para("Severidade", "table_head"), para("Arquivo:linha", "table_head"), para("Descricao", "table_head")],
        [para("BAIXA", "chip"), para("vite.config.ts:6-13", "table_bold"), para("Configuracao Vite transformaria GEMINI_API_KEY em constante do bundle cliente se o pipeline residual fosse reativado com uma chave real.", "table")],
        [para("INFORMATIVA", "chip"), para("script.js:1514-1518, 1595-1617, 1633-1664", "table_bold"), para("Renderizador GitHub desativado interpola resposta externa/localStorage em innerHTML sem sanitizacao. Nao executa na versao atual.", "table")],
    ]
    story.append(standard_table(findings_table, [2.7 * cm, 5.0 * cm, 7.7 * cm], severity_rows=[(1, LOW), (2, INFO)]))
    story.append(Spacer(1, 0.6 * cm))
    story.append(para("Categorias sem achado", "h2"))
    no_findings = [
        [para("Categoria", "table_head"), para("Conclusao baseada na stack", "table_head")],
        [para("Banco sem tranca", "table_bold"), para("Nao aplicavel. Nao ha banco, ORM, API, dados privados nem mecanismo de tenant a validar.", "table")],
        [para("Permissao definida no navegador", "table_bold"), para("Nao aplicavel. Nao ha autenticacao, papeis, UI administrativa nem rotas de escrita.", "table")],
        [para("IDOR", "table_bold"), para("Nao aplicavel. A busca sistematica encontrou zero handlers de backend e zero operacoes de objeto por ID.", "table")],
        [para("Chaves hardcoded", "table_bold"), para("Nenhuma chave, token, senha, chave privada ou default publico real foi encontrado no codigo atual ou nos 10 commits alcancaveis.", "table")],
        [para("XSS ativo", "table_bold"), para("Nao confirmado. Os sinks ativos recebem constantes/DOM estatico ou aplicam escape/textContent. O unico fluxo externo sem escape esta desativado.", "table")],
    ]
    story.append(standard_table(no_findings, [5.0 * cm, 10.4 * cm]))
    story.append(PageBreak())

    # Recomendacoes
    story.extend(section_title("Recomendacoes priorizadas", "Plano de reducao de risco"))
    priorities = [
        ("P1", "Eliminar a ponte de segredo para o cliente", "Remover vite.config.ts ou, no minimo, a definicao process.env.GEMINI_API_KEY. Qualquer integracao futura com Gemini deve residir em funcao serverless/backend e aplicar autenticacao, limite de uso e rotacao da chave.", LOW),
        ("P2", "Apagar ou reescrever o renderizador GitHub morto", "Preferir remocao. Se a funcionalidade retornar, usar textContent/createElement e validacao estrita de URL https. Cobrir com payloads XSS em teste automatizado.", INFO),
        ("P3", "Adicionar verificacao automatica de segredos", "Executar gitleaks ou ferramenta equivalente no historico completo em push e pull request. Incluir regra especifica que proiba nomes de segredo em Vite define e variaveis VITE_* sensiveis.", STRONG),
        ("P4", "Adicionar teste estatico de sinks", "Falhar o CI quando dados de fetch, localStorage, URL ou hash alcancarem innerHTML sem funcao de sanitizacao aprovada. Manter uma lista pequena de excecoes justificadas.", STRONG),
        ("P5", "Refazer a varredura com clone completo", "Executar git fetch --unshallow em ambiente autorizado e repetir a busca de segredos em todos os objetos e branches remotos. Rotacionar imediatamente qualquer credencial encontrada, mesmo removida do HEAD.", STRONG),
    ]
    for number, title, description, color in priorities:
        badge = Table([[para(number, "chip"), para(title, "table_bold")]], colWidths=[1.2 * cm, 13.8 * cm])
        badge.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, 0), color), ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
        story.append(KeepTogether([badge, para(description), Spacer(1, 0.16 * cm)]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(para("Criterio de encerramento", "h2"))
    story.append(para("O risco residual ficara restrito ao modelo normal de um site estatico quando F-01 for removido, F-02 for apagado ou reescrito e o historico completo receber varredura automatizada. Nenhuma mudanca de RLS, autorizacao ou posse de objeto e necessaria enquanto o projeto permanecer sem backend e sem dados privados."))
    story.append(PageBreak())

    # Issue 1
    story.extend(section_title("ISSUES PARA O GITHUB", "Texto completo em Markdown"))
    issue1 = """
--- ISSUE 1 ---

# [Seguranca] Remover a injecao de GEMINI_API_KEY no bundle cliente

Labels sugeridas: `security`, `severidade:baixa`

## Descricao do problema

O arquivo `vite.config.ts` carrega todas as variaveis de ambiente e define
`process.env.GEMINI_API_KEY` como uma constante de compilacao do Vite. Se esse
pipeline residual for reativado com uma chave real, o valor sera incorporado ao
JavaScript entregue ao navegador.

Isso é exploravel porque qualquer visitante consegue baixar o bundle ou inspecionar
o codigo nas ferramentas do navegador e reutilizar a chave fora do portfolio.

Condicao atual: o `package.json` nao possui script de build nem dependencias Vite,
React ou Tailwind; portanto o deploy atual nao expoe uma chave. A issue previne que
a reativacao futura transforme o padrao residual em vazamento real.

## Evidencia

Arquivo: `vite.config.ts:6-13`

```ts
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
```

## Impacto

- Consumo indevido da cota da API.
- Custos e bloqueio da chave por abuso.
- Uso das permissoes associadas a chave fora do portfolio.
- Necessidade de rotacao emergencial caso o build seja reativado sem revisao.

## Sugestao de correcao

1. Remover `process.env.GEMINI_API_KEY` de `define`.
2. Excluir `vite.config.ts` se ele realmente nao fizer parte do projeto.
3. Se Gemini voltar a ser usado, criar uma funcao serverless/backend que guarde a
   chave somente no servidor e aplique autenticacao, limite de uso e monitoramento.
4. Adicionar uma verificacao de CI que proiba chaves/nomes de segredo no bundle.

## Criterios de aceite

- [ ] `vite.config.ts` nao define nem expoe `GEMINI_API_KEY` ao cliente.
- [ ] Nenhum JavaScript publicado contem o nome ou o valor da chave.
- [ ] A aplicacao continua funcionando sem uma chave Gemini no navegador.
- [ ] Se existir integracao Gemini, a chamada passa por backend/serverless.
- [ ] O CI falha quando uma chave de servidor e inserida no bundle cliente.

--- FIM ISSUE 1 ---
"""
    story.append(issue_block(issue1))
    story.append(PageBreak())

    # Issue 2
    story.extend(section_title("ISSUES PARA O GITHUB", "Continuacao"))
    issue2 = """
--- ISSUE 2 ---

# [Seguranca] Remover ou sanitizar o renderizador GitHub baseado em innerHTML

Labels sugeridas: `security`, `severidade:informativa`

## Descricao do problema

`fetchRecentRepos()` le dados da API do GitHub e do `localStorage` e interpola
`repo.name`, `repo.description`, `repo.language` e `repo.html_url` diretamente em
`article.innerHTML`, sem escape, sanitizacao ou validacao de protocolo.

Se a secao for reativada, markup presente nesses campos sera interpretado no contexto
de `mrleorobot.github.io`, criando uma regressao de DOM XSS.

Condicao atual: a chamada esta comentada em `script.js:1664` e o elemento
`#github-repos-grid` nao existe em `index.html`. O fluxo nao é exploravel no deploy
atual; a issue remove o codigo inseguro antes que ele volte a ser usado.

## Evidencia

Arquivo: `script.js:1514-1518, 1595-1617, 1633-1664`

```js
const cachedData = localStorage.getItem(cacheKey);
const renderRepos = (reposData) => {
  const desc = repo.description ? repo.description : "Sem descricao fornecida.";
  article.innerHTML = `
    <h3>${repo.name}</h3>
    <p>${desc}</p>
    <span>${repo.language}</span>
    <a href="${repo.html_url}">Ver Repositorio</a>`;
};

const res = await fetch("https://api.github.com/users/.../repos");
renderRepos(await res.json());

// fetchRecentRepos(); // Desativado
```

## Impacto

- Execucao de JavaScript na origem do portfolio caso o fluxo volte a ser ativado.
- Alteracao visual, redirecionamento ou phishing dentro da pagina confiavel.
- Persistencia temporaria de payload no `localStorage` usado pelo renderer.

## Sugestao de correcao

Preferencia: remover integralmente `fetchRecentRepos()` por ser codigo morto.

Se a secao voltar:

1. Criar elementos com `document.createElement()`.
2. Inserir nome, descricao e linguagem somente com `textContent`.
3. Validar `repo.html_url` com `new URL()` e aceitar apenas protocolo `https:`.
4. Evitar atributos de evento inline.
5. Usar DOMPurify imediatamente antes do sink somente se HTML for indispensavel.
6. Adicionar teste com payloads como `<img src=x onerror=...>`.

## Criterios de aceite

- [ ] A funcao morta foi removida ou nao usa `innerHTML` com dados externos.
- [ ] Campos textuais vindos da API/localStorage usam `textContent`.
- [ ] Links aceitam somente URLs `https:` validas.
- [ ] O payload de teste e exibido como texto e nao executa codigo.
- [ ] Existe teste automatizado cobrindo API e cache manipulados.

--- FIM ISSUE 2 ---
"""
    story.append(issue_block(issue2))
    return story


def build_pdf(output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="security-audit-charts-") as temp_dir:
        donut, bars = make_charts(Path(temp_dir))
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=1.85 * cm,
            bottomMargin=2.05 * cm,
            title=f"Relatório de Auditoria de Segurança - {PROJECT}",
            author="OpenAI Codex",
            subject="Auditoria de segurança de código e configuração",
        )
        doc.build(build_story(donut, bars), onFirstPage=draw_page, onLaterPages=draw_page)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).with_name("relatorio-auditoria-seguranca.pdf"),
        help="Caminho do PDF de saida.",
    )
    args = parser.parse_args()
    build_pdf(args.output.resolve())
    print(args.output.resolve())


if __name__ == "__main__":
    main()
