import { useAuth } from '../context/AuthContext'

// While auth is resolving, the root `loadingOverlay` in app/_layout.tsx is the only spinner shown.
export const useScreenLoading = (dataLoading: boolean) => {
  const { loading: authLoading } = useAuth()
  return {
    busy: authLoading || dataLoading,
    showSpinner: !authLoading && dataLoading,
  }
}
