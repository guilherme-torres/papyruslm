const CITATION_MARKER = /\[(\d+(?:\s*,\s*\d+)*)\]/g
const CITATION_HREF_PREFIX = '#citation-'

export function linkCitations(text: string, availableIndexes: ReadonlySet<number>): string {
    return text.replace(CITATION_MARKER, (_marker, numbers: string) =>
        numbers
            .split(',')
            .map((number) => Number(number.trim()))
            .map((index) => (availableIndexes.has(index) ? `[${index}](${CITATION_HREF_PREFIX}${index})` : `[${index}]`))
            .join(''),
    )
}

export function citationIndexFromHref(href: string | undefined): number | null {
    if (!href?.startsWith(CITATION_HREF_PREFIX)) return null
    const index = Number(href.slice(CITATION_HREF_PREFIX.length))
    return Number.isInteger(index) ? index : null
}
