// The existing classroom service remains the sole authority for private records.
export const ENDPOINT =
  "https://tyzpophjoptciihaszqj.supabase.co/functions/v1/classroom-monitor";
export async function request(action, body = {}, credential = "") {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(credential ? { Authorization: "Bearer " + credential } : {}),
      },
      body: JSON.stringify({ action, ...body }),
      signal: controller.signal,
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok)
      throw Object.assign(
        Error(data.error || "Learning records are unavailable."),
        { status: response.status },
      );
    return data;
  } finally {
    clearTimeout(timer);
  }
}
export function existingDevice(host = window) {
  try {
    const n =
      host.sessionStorage.getItem("ttCurrent") ||
      host.localStorage.getItem("ttCurrent") ||
      "";
    const name =
      { Max: "Bradley", Nick: "Nicholas", Jayden: "Jaden", Aubry: "Aubrey" }[
        n
      ] || n;
    return (
      host.sessionStorage.getItem("ttMonitorDevice:" + name) ||
      host.localStorage.getItem("ttMonitorDevice:" + name) ||
      ""
    );
  } catch {
    return "";
  }
}
export function connectionKey(host = window) {
  try {
    return host.sessionStorage.getItem("ttArcadeDevice") || "";
  } catch {
    return "";
  }
}
