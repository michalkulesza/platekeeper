import { createContext, useContext, createElement, type ReactNode } from 'react'
import type { ApiClient } from './client'

const ApiClientContext = createContext<ApiClient | null>(null)

export const ApiClientProvider = ({
  client,
  children,
}: {
  client: ApiClient
  children: ReactNode
}) => createElement(ApiClientContext.Provider, { value: client }, children)

export const useApiClient = (): ApiClient => {
  const ctx = useContext(ApiClientContext)
  if (!ctx) throw new Error('useApiClient must be used within ApiClientProvider')
  return ctx
}
