export function parsePage(value: unknown): number | undefined {
    const page = Number(value)
    return Number.isInteger(page) && page > 1 ? page : undefined
}
