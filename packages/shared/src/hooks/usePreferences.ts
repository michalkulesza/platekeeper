import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../api/context'
import type { UserPreferences } from '../types'

export const usePreferences = () => {
  const api = useApiClient()
  const qc = useQueryClient()

  const query = useQuery({ queryKey: ['preferences'], queryFn: api.getPreferences })

  const update = useMutation({
    mutationFn: (data: Partial<UserPreferences>) => api.updatePreferences(data),
    onSuccess: (updated) => qc.setQueryData(['preferences'], updated),
  })

  return {
    preferences: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    update,
  }
}
