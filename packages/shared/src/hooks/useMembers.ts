import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../api/context'

export const useMembers = (householdId: string | null) => {
  const api = useApiClient()

  return useQuery({
    queryKey: ['members', householdId],
    queryFn: () => api.listMembers(householdId!),
    enabled: !!householdId,
  })
}
