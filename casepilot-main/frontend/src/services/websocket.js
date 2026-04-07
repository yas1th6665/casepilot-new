import { API_BASE } from "./api";

function toWebSocketUrl(base) {
  if (base.startsWith("https://")) return base.replace("https://", "wss://");
  if (base.startsWith("http://")) return base.replace("http://", "ws://");
  return base;
}

export function createChatSocket() {
  const wsBase = toWebSocketUrl(API_BASE);
  return new WebSocket(`${wsBase}/ws/chat`);
}
