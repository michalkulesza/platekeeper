import { useLocalSearchParams, Redirect } from 'expo-router'

export default function ShareRedirect() {
  const params = useLocalSearchParams<{ type?: string; value?: string }>()
  return <Redirect href={{ pathname: '/import-recipe', params }} />
}
