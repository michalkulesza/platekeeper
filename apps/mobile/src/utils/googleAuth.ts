import { GoogleSignin } from '@react-native-google-signin/google-signin'

export const configureGoogleSignin = (): void => {
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  })
}

export const signInWithGoogle = async (): Promise<string> => {
  await GoogleSignin.hasPlayServices()
  const result = await GoogleSignin.signIn()
  const idToken = result.data?.idToken
  if (!idToken) throw new Error('GOOGLE_SIGNIN_NO_TOKEN')
  return idToken
}
