import { http } from '@/api/client'

export interface Tag {
    id: string
    name: string
}

export interface TagUsage extends Tag {
    notebooks_total: number
}

interface ListTagsResponse {
    items: TagUsage[]
}

export async function listTags(signal?: AbortSignal): Promise<TagUsage[]> {
    const response = await http.get<ListTagsResponse>('/tags', { signal })
    return response.items
}
