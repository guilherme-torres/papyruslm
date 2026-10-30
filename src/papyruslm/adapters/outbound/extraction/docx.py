from typing import BinaryIO

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph


class DocxExtractor:
    def extract(self, content: BinaryIO) -> str:
        blocks: list[str] = []
        for block in Document(content).iter_inner_content():
            text = self._paragraph(block) if isinstance(block, Paragraph) else self._table(block)
            if text:
                blocks.append(text)
        return "\n\n".join(blocks)

    @staticmethod
    def _paragraph(paragraph: Paragraph) -> str:
        return paragraph.text.strip()

    def _table(self, table: Table) -> str:
        rows = [self._row_cells(row) for row in table.rows]
        rows = [row for row in rows if any(row)]
        if not rows:
            return ""
        width = max(len(row) for row in rows)
        rows = [row + [""] * (width - len(row)) for row in rows]
        lines = [self._markdown_row(rows[0]), self._markdown_row(["---"] * width)]
        lines.extend(self._markdown_row(row) for row in rows[1:])
        return "\n".join(lines)

    @staticmethod
    def _row_cells(row) -> list[str]:
        cells: list[str] = [""] * row.grid_cols_before
        previous = None
        for cell in row.cells:
            merged = cell._tc is previous
            previous = cell._tc
            cells.append("" if merged else " ".join(cell.text.split()).replace("|", "\\|"))
        return cells + [""] * row.grid_cols_after

    @staticmethod
    def _markdown_row(cells: list[str]) -> str:
        return "| " + " | ".join(cells) + " |"
