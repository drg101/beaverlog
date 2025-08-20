export function generateAppCredentials() {
  return {
    app_id: `app_${crypto.randomUUID()}`,
    public_key: `pk_${crypto.randomUUID()}`,
    private_key: `sk_${crypto.randomUUID()}`
  };
}