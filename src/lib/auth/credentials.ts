/** Server-side mock credentials (prefer non-public env on deploy). */
export function getMockCredentials() {
  return {
    email:
      process.env.MOCK_EMAIL ??
      process.env.NEXT_PUBLIC_MOCK_EMAIL ??
      "user@gmail.com",
    password:
      process.env.MOCK_PASSWORD ??
      process.env.NEXT_PUBLIC_MOCK_PASSWORD ??
      "123456",
  };
}
