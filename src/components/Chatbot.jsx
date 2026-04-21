"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Navigation, Bot } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function normalizeHistory(messages) {
  return messages
    .filter((entry) => entry.role === "assistant" || entry.role === "user")
    .map((entry) => ({
      role: entry.role,
      content: entry.content,
    }))
    .slice(-12);
}

const QUICK_PROMPTS = [
  "Where can I see pricing?",
  "Take me to milestone tracking",
  "How do I manage vaccinations?",
  "Where is the parent dashboard?",
];

function getRouteLabel(path) {
  if (!path || path === "/") return "Home";

  return path
    .replace(/^\//, "")
    .split("/")
    .map((part) => part.replace(/-/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function TinyBabyIcon() {
  return (
    <div className="relative h-10 w-10 rounded-full border-2 border-[#70167e] bg-[#fdfaf6] dark:bg-black">
      <div className="absolute left-1/2 top-[6px] h-3 w-5 -translate-x-1/2 rounded-full bg-[#70167e]" />
      <div className="absolute left-1/2 top-3 h-5 w-6 -translate-x-1/2 rounded-full border border-[#70167e] bg-[#fdfaf6] dark:bg-black">
        <span className="absolute left-[6px] top-[6px] h-1 w-1 rounded-full bg-[#70167e]" />
        <span className="absolute right-[6px] top-[6px] h-1 w-1 rounded-full bg-[#70167e]" />
        <span className="absolute left-1/2 top-[11px] h-0.5 w-2 -translate-x-1/2 rounded-full bg-[#70167e]" />
      </div>
    </div>
  );
}

export default function Chatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am Tiny Agent. Ask me anything about Tiny Giggle, and I can also guide you directly to the right page.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // Do not render the chatbot on chat pages
  if (pathname?.includes("/chat")) {
    return null;
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const nextInput = input.trim();
    const userMessage = { role: "user", content: nextInput };
    const historySnapshot = normalizeHistory([...messages, userMessage]);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/tiny-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: nextInput,
          history: historySnapshot,
          currentPath: pathname || "/",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.reply,
        suggestedRoute: data.suggestedRoute || null,
        followUps: Array.isArray(data.followUps) ? data.followUps : [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I am having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRouteNavigation = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleFollowUpClick = (question) => {
    setInput(question);
  };

  const renderQuickPrompts = messages.length <= 1 && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full border-2 border-[#fdfaf6] bg-[#70167e] text-[#fdfaf6] hover:opacity-90 dark:border-black dark:bg-[#70167e] dark:text-[#fdfaf6]"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[96vw] max-w-[430px] flex-col overflow-hidden border border-[#70167e] bg-[#fdfaf6] p-0 dark:border-[#70167e] dark:bg-black">
        <DialogHeader className="border-b border-[#70167e] bg-[#fdfaf6] px-5 py-4 dark:bg-black">
          <DialogTitle className="flex items-center gap-3 text-[#70167e]">
            <TinyBabyIcon />
            <div className="space-y-0.5">
              <p className="text-base font-bold tracking-wide text-[#70167e]">Tiny Agent</p>
              <p className="text-xs font-medium text-[#70167e]">Your Tiny Giggle assistant</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div ref={listRef} className="flex-1 overflow-y-auto bg-[#fdfaf6] px-4 py-4 dark:bg-black">
          <div className="space-y-4 pb-2">
            {renderQuickPrompts ? (
              <div className="rounded-2xl border border-[#70167e] bg-[#fdfaf6] p-3 dark:bg-black">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#70167e]">Quick Start</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="rounded-full border border-[#70167e] bg-[#fdfaf6] px-3 py-1.5 text-xs font-medium text-[#70167e] transition hover:opacity-90 dark:bg-black"
                      onClick={() => handleFollowUpClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "bg-[#70167e] text-[#fdfaf6]"
                    : "border border-[#70167e] bg-[#fdfaf6] text-[#70167e] dark:bg-black"
                }`}>
                  {message.role === "assistant" ? (
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#70167e]">
                      <Bot className="h-3.5 w-3.5" />
                      Tiny Agent
                    </div>
                  ) : null}

                  {message.content}

                  {message.role === "assistant" && message?.suggestedRoute?.path ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 border-[#70167e] bg-[#fdfaf6] text-[#70167e] hover:opacity-90 dark:bg-black"
                        onClick={() => handleRouteNavigation(message.suggestedRoute.path)}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Open {getRouteLabel(message.suggestedRoute.path)}
                      </Button>
                      {message?.suggestedRoute?.reason ? (
                        <p className="mt-1 text-xs text-[#70167e]">{message.suggestedRoute.reason}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {message.role === "assistant" && Array.isArray(message.followUps) && message.followUps.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.followUps.map((followUp) => (
                        <button
                          key={followUp}
                          type="button"
                          className="rounded-full border border-[#70167e] bg-[#fdfaf6] px-2.5 py-1 text-xs text-[#70167e] transition hover:opacity-90 dark:bg-black"
                          onClick={() => handleFollowUpClick(followUp)}
                        >
                          {followUp}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl border border-[#70167e] bg-[#fdfaf6] px-3 py-2 dark:bg-black">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#70167e]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#70167e]" style={{ animationDelay: "0.1s" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#70167e]" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-[#70167e] bg-[#fdfaf6] p-3 dark:bg-black">
          <div className="mb-2 text-[11px] text-[#70167e]">
            Ask about features, pages, dashboard, milestones, or support.
          </div>
          <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Tiny Agent..."
            disabled={loading}
            className="border-[#70167e] bg-[#fdfaf6] text-[#70167e] focus-visible:ring-[#70167e]/40 dark:bg-black"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-[#70167e] text-[#fdfaf6] hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
