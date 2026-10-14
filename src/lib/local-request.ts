import "server-only";

export function isLocalRequest(request: Request) {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || !origin) return false;
  try {
    const hostUrl = new URL(`http://${host}`);
    const originUrl = new URL(origin);
    return (
      ["localhost", "127.0.0.1", "[::1]"].includes(hostUrl.hostname) &&
      originUrl.protocol === "http:" &&
      originUrl.host === host
    );
  } catch {
    return false;
  }
}
