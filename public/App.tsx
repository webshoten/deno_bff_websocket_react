import { useEffect, useRef, useState } from "react";

function App() {
  const [status, setStatus] = useState<
    "connecting" | "open" | "closed" | "error"
  >("connecting");
  const [lastMessage, setLastMessage] = useState<string>("");
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 今開いているホストに対して /ws で接続する
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
    };

    ws.onmessage = (event) => {
      setLastMessage(String(event.data));
    };

    ws.onclose = () => {
      setStatus("closed");
    };

    ws.onerror = () => {
      setStatus("error");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(input || "hello");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-xl font-semibold">WebSocket Test</h1>

        <div>
          <span className="font-mono text-sm">
            status: {status === "connecting"
              ? "🔄 connecting"
              : status === "open"
              ? "🟢 open"
              : status === "closed"
              ? "⚪️ closed"
              : "🔴 error"}
          </span>
        </div>

        <div className="space-y-2">
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="送信するメッセージ"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={status !== "open"}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            send
          </button>
        </div>

        <div className="mt-4 border-t pt-4 text-sm">
          <div className="font-medium">last message from server:</div>
          <div className="mt-1 rounded bg-white px-3 py-2 font-mono text-xs">
            {lastMessage || "(まだ何も受信していません)"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
