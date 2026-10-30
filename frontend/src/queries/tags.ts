import { queryOptions } from '@tanstack/react-query'
import { listTags } from '@/api/tags'
import { tagKeys } from '@/queries/keys'

export function tagsQueryOptions() {
    return queryOptions({
        queryKey: tagKeys.all,
        queryFn: ({ signal }) => listTags(signal),
    })
}
