export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: string }).code) : ''

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid work email address.'
    case 'auth/user-not-found':
      return 'No account was found for that email. Create an account or check the address and try again.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.'
    case 'auth/email-already-in-use':
      return 'An account already exists for that email address.'
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 8 characters.'
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.'
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled. Please try again.'
    case 'auth/network-request-failed':
      return 'Network issue detected. Check your connection and try again.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    default: {
      if (error instanceof Error && error.message) {
        const lowered = error.message.toLowerCase()
        if (lowered.includes('invalid email')) return 'Please enter a valid work email address.'
        if (lowered.includes('wrong password')) return 'Incorrect password. Please try again or reset your password.'
        if (lowered.includes('network')) return 'Network issue detected. Check your connection and try again.'
        if (lowered.includes('password')) return 'Unable to complete that action because the password was rejected. Please try again.'
      }
      return fallback
    }
  }
}
