import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../api/context'

export const useHouseholdLeaveNotifications = () => {
  const api = useApiClient()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['householdLeaveNotifications'],
    queryFn: api.listHouseholdLeaveNotifications,
    refetchInterval: 30_000,
  })

  const dismiss = useMutation({
    mutationFn: api.dismissHouseholdLeaveNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['householdLeaveNotifications'] }),
  })

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    dismiss,
  }
}
