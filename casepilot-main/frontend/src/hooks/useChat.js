import { useEffect, useRef } from "react";
import { createChatSocket } from "../services/websocket";
import { getCurrentUserIdentity } from "../services/firebase";
import { useCaseStore } from "../stores/caseStore";
import { useChatStore } from "../stores/chatStore";

export function useChat() {
  const socketRef = useRef(null);
  const { sessionId, focusedCaseNumber, setSessionId, addMessage, setConnected, setTyping } = useChatStore();
  const { cases } = useCaseStore();

  useEffect(() => {
    const socket = createChatSocket();
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "agent_status") {
        setTyping(true);
        return;
      }
      if (payload.type === "agent_response") {
        setTyping(false);
        if (payload.session_id) setSessionId(payload.session_id);
        addMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          text: payload.message,
          actions: payload.actions || [],
          caseContext: payload.case_context || null,
        });
      }
      if (payload.type === "error") {
        setTyping(false);
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          text: payload.message
        });
      }
    };

    return () => {
      socket.close();
    };
  }, [addMessage, setConnected, setSessionId, setTyping]);

  const sendMessage = (message) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        text: "Chat server is not connected yet."
      });
      return;
    }

    addMessage({ id: crypto.randomUUID(), role: "user", text: message });
    setTyping(true);
    const identity = getCurrentUserIdentity();
    const focusedCase = cases.find((item) => item.case_number === focusedCaseNumber);
    socketRef.current.send(
      JSON.stringify({
        message,
        session_id: sessionId,
        user_id: identity.userId,
        user_email: identity.userEmail,
        case_context: focusedCase
          ? {
              case_number: focusedCase.case_number,
              case_title: focusedCase.case_title,
              court_name: focusedCase.court_name,
            }
          : null,
      })
    );
  };

  return { sendMessage };
}
