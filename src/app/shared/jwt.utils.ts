export function decodeToken(token: string | null): { email: string; role?: string } | null {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
}
