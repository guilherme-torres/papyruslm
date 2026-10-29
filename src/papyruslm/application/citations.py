import re

from papyruslm.application.ports import Source
from papyruslm.domain.value_objects import Citation

CITATION_MARKER = re.compile(r"\[(\d+(?:\s*,\s*\d+)*)\]")


def resolve_citations(answer: str, sources: list[Source]) -> list[Citation]:
    sources_by_index = {source.index: source for source in sources}
    cited = {
        int(number)
        for marker in CITATION_MARKER.findall(answer)
        for number in marker.split(",")
        if int(number) in sources_by_index
    }
    return [_to_citation(sources_by_index[index]) for index in sorted(cited)]


def _to_citation(source: Source) -> Citation:
    return Citation(
        index=source.index,
        document_id=source.chunk.document_id,
        document_name=source.document_name,
        start=source.chunk.start,
        end=source.chunk.end,
        excerpt=source.chunk.text,
        content_checksum=source.content_checksum,
    )
