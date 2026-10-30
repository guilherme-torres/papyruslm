import re

from papyruslm.application.ports import Source

CITATION_MARKER = re.compile(r"\s*\[\d+(?:\s*,\s*\d+)*\]")

ANSWER_SYSTEM_PROMPT = """Você é um assistente que responde perguntas sobre os documentos do usuário.

Regras:
- Responda usando somente as informações das fontes abaixo. Não use conhecimento próprio.
- Depois de cada afirmação, cite a fonte usada entre colchetes com o número dela, por exemplo [1] ou [1][3].
- Use apenas os números das fontes listadas. Nunca invente números.
- Se a resposta não estiver nas fontes, diga que não encontrou essa informação nos documentos.
- Responda no mesmo idioma da pergunta, de forma direta e clara."""

NO_SOURCES_PROMPT = """Nenhum trecho dos documentos do usuário é relevante para a pergunta.
Responda apenas com uma frase curta, no idioma da pergunta, dizendo que não encontrou essa informação nos \
documentos. Não acrescente nenhuma outra informação, sugestão ou conhecimento próprio."""

REWRITE_SYSTEM_PROMPT = """Sua única tarefa é reescrever a última pergunta do usuário como uma pergunta completa, \
que possa ser entendida sem a conversa anterior. Use a conversa apenas para descobrir a que "isso", "ele", \
"a segunda etapa" etc. se referem. Não responda à pergunta. Se ela já for completa, repita-a sem mudanças.
Responda somente com a pergunta reescrita, em uma linha.

Exemplo:
Conversa:
Usuário: O que é a fotossíntese?
Assistente: É o processo em que as plantas convertem luz em energia química.
Última pergunta: e onde ela acontece?
Pergunta reescrita: Onde acontece a fotossíntese nas plantas?"""

ROLE_LABELS = {"human": "Usuário", "ai": "Assistente"}


def rewrite_user_prompt(conversation: list[tuple[str, str]], question: str) -> str:
    lines = "\n".join(f"{ROLE_LABELS[role]}: {content}" for role, content in conversation)
    return f"Conversa:\n{lines}\nÚltima pergunta: {question}\nPergunta reescrita:"


def answer_system_prompt(sources: list[Source]) -> str:
    if not sources:
        return NO_SOURCES_PROMPT
    formatted = "\n\n".join(format_source(source) for source in sources)
    return f"{ANSWER_SYSTEM_PROMPT}\n\nFontes:\n\n{formatted}"


def format_source(source: Source) -> str:
    return f"[{source.index}] ({source.document_name})\n{source.chunk.text}"


def strip_citation_markers(text: str) -> str:
    return CITATION_MARKER.sub("", text)
