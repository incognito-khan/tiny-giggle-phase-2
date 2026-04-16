import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export const useChat = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const openOrCreateChat = useCallback(async (recipientId, recipientType = "patient", recipientName = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      // First, try to get existing chat
      const checkResponse = await fetch(
        `/api/v1/doctors/chats/check?recipientId=${recipientId}&recipientType=${recipientType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (checkResponse.ok) {
        const existingChat = await checkResponse.json();
        if (existingChat.data?.id) {
          router.push(`/chat/${existingChat.data.id}`);
          return;
        }
      }

      // If no existing chat, create new one
      const createResponse = await fetch("/api/v1/doctors/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          [recipientType === "patient" ? "patientId" : "parentId"]: recipientId,
          title: `Chat with ${recipientName}`,
        }),
      });

      if (createResponse.ok) {
        const newChat = await createResponse.json();
        router.push(`/chat/${newChat.data.id}`);
      } else {
        const errorData = await createResponse.json();
        setError(errorData.message || "Failed to create chat");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    openOrCreateChat,
    isLoading,
    error,
  };
};
