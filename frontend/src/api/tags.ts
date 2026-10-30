import { http } from '@/api/client'

export interface Tag {
    id: string
    name: string
}

interface ListTagsResponse {
    items: Tag[]
}

export async function listTags(signal?: AbortSignal): Promise<Tag[]> {
    const response = await http.get<ListTagsResponse>('/tags', { signal })
    return response.items
}
