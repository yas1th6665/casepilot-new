import { API_BASE } from "./api";

function toWebSocketUrl(base) {
  if (base.startsWith("https://")) return base.replace("https://", "wss://");
  if (base.startsWith("http://")) return base.replace("http://", "ws://");
  // Empty base means same origin — derive from current page location
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

export function createChatSocket() {
  const wsBase = toWebSocketUrl(API_BASE);
  return new WebSocket(`${wsBase}/ws/chat`);
}
