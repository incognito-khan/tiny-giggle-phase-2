"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function RealtimeTestPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log("✅ RealtimeTestPage mounted");
    // Replace with your real Pusher config
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const chatId = "68cda5ac4e2a6ae075661d30"; // 👈 Test chatId
    const channel = pusher.subscribe(`chat-${chatId}`);
    console.log(channel, 'channel from real-time dummy page')

    channel.bind("new-message", (data) => {
      console.log("📩 New message:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pusher Realtime Test</h1>
      <p className="text-gray-600 mb-6">
        Send messages via Postman API and see them here 👇
      </p>

      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-gray-100 shadow text-gray-800"
          >
            <strong>{msg.senderId}</strong>: {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
}
