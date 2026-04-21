"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import ParentHeader from "@/components/layout/header/parent-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Navigation, Send, ShieldAlert, ShoppingBag, Trash2, Edit2, X, Check } from "lucide-react";

const QUICK_PROMPTS = [
  "My baby has high temperature, what should I do first?",
  "Which products in store can help with fever care?",
  "How can I track health progress from dashboard data?",
  "What warning signs mean I should go to a doctor now?",
];

const DEFAULT_CONVERSATION_TITLE = "New Conversation";

function getInitialMessages() {
  return [
    {
      role: "assistant",
      content:
        "I am Parent Agent. Share your baby concern and I will suggest practical next steps, warning signs to watch, and related Tiny Giggle products when relevant.",
      followUps: QUICK_PROMPTS.slice(0, 2),
    },
  ];
}

function getRouteLabel(path) {
  if (!path || path === "/") return "Home";

  return path
    .replace(/^\//, "")
    .split("/")
    .map((part) => part.replace(/-/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

export default function ParentAgentPage() {
  const user = useSelector((state) => state.auth.user);
  const pathname = usePathname();
  const router = useRouter();
  const listRef = useRef(null);

  const [messages, setMessages] = useState(getInitialMessages());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydratedHistory, setHydratedHistory] = useState(false);
  const [conversationTitle, setConversationTitle] = useState(DEFAULT_CONVERSATION_TITLE);
  const [clearing, setClearing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleEdit, setTitleEdit] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!user?.id || hydratedHistory) {
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/tiny-agent/parent?parentId=${user.id}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (typeof data?.conversationTitle === "string" && data.conversationTitle.trim()) {
          setConversationTitle(data.conversationTitle.trim());
        }

        if (Array.isArray(data?.messages) && data.messages.length > 0) {
          setMessages(data.messages.map((item) => ({
            role: item.role,
            content: item.content,
          })));
        } else {
          setMessages(getInitialMessages());
        }
      } catch (error) {
        console.error("Failed to load parent agent history:", error);
      } finally {
        setHydratedHistory(true);
      }
    };

    loadHistory();
  }, [user?.id, hydratedHistory]);

  const sendMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const nextInput = input.trim();
    const userMessage = { role: "user", content: nextInput };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        suggestedRoute: null,
        followUps: [],
        suggestedProducts: [],
        safetyNote: null,
      },
    ]);

    try {
      const response = await fetch("/api/tiny-agent/parent", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: nextInput,
          parentId: user?.id,
          currentPath: pathname || "/parent-dashboard/agent",
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get agent response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n").map((line) => line.trim());
          const dataLine = lines.find((line) => line.startsWith("data:"));

          if (!dataLine) {
            continue;
          }

          const payload = dataLine.replace(/^data:\s*/, "");

          let parsed = null;
          try {
            parsed = JSON.parse(payload);
          } catch (parseError) {
            console.error("Parent agent stream parse error:", parseError);
            continue;
          }

          if (parsed?.error) {
            throw new Error(parsed.error);
          }

          if (parsed?.token) {
            streamText += parsed.token;
            setMessages((prev) => {
              const next = [...prev];
              if (next[assistantIndex]) {
                next[assistantIndex] = {
                  ...next[assistantIndex],
                  content: streamText,
                };
              }
              return next;
            });
          }

          if (parsed?.done && parsed?.payload) {
            setMessages((prev) => {
              const next = [...prev];
              if (next[assistantIndex]) {
                next[assistantIndex] = {
                  role: "assistant",
                  content: parsed.payload.reply,
                  suggestedRoute: parsed.payload.suggestedRoute || null,
                  followUps: Array.isArray(parsed.payload.followUps)
                    ? parsed.payload.followUps
                    : [],
                  suggestedProducts: Array.isArray(parsed.payload.suggestedProducts)
                    ? parsed.payload.suggestedProducts
                    : [],
                  safetyNote:
                    typeof parsed.payload.safetyNote === "string"
                      ? parsed.payload.safetyNote
                      : null,
                };
              }
              return next;
            });

            if (
              typeof parsed.payload.conversationTitle === "string" &&
              parsed.payload.conversationTitle.trim()
            ) {
              setConversationTitle(parsed.payload.conversationTitle.trim());
            }
          }
        }
      }
    } catch (error) {
      console.error("Parent agent chat error:", error);
      setMessages((prev) => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            role: "assistant",
            content: "I could not connect right now. Please try again in a moment.",
          };
        }
        return next;
      });
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

  const handleFollowUpClick = (question) => {
    setInput(question);
  };

  const handleRouteNavigation = (path) => {
    router.push(path);
  };

  const handleGoStore = () => {
    router.push("/parent-dashboard/store");
  };

  const handleClearHistory = async () => {
    if (!user?.id || clearing || loading) {
      return;
    }

    const confirmed = window.confirm("Clear this Agent conversation history for your account?");
    if (!confirmed) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch(`/api/tiny-agent/parent?parentId=${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear history");
      }

      setConversationTitle(DEFAULT_CONVERSATION_TITLE);
      setMessages(getInitialMessages());
    } catch (error) {
      console.error("Failed to clear parent agent history:", error);
    } finally {
      setClearing(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!user?.id || !titleEdit.trim() || savingTitle) {
      return;
    }

    setSavingTitle(true);
    try {
      const response = await fetch("/api/tiny-agent/parent", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: user.id,
          newTitle: titleEdit.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update title");
      }

      setConversationTitle(titleEdit.trim());
      setEditingTitle(false);
      setTitleEdit("");
    } catch (error) {
      console.error("Failed to update conversation title:", error);
      alert("Failed to update title. Please try again.");
    } finally {
      setSavingTitle(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      <ParentHeader />

      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white/85 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-pink-100 p-2 text-pink-600">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Agent</p>
              {editingTitle ? (
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    type="text"
                    value={titleEdit}
                    onChange={(e) => setTitleEdit(e.target.value)}
                    maxLength={100}
                    placeholder="Enter conversation title"
                    className="h-7 border-pink-200 text-xs"
                    autoFocus
                    disabled={savingTitle}
                  />
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={handleUpdateTitle}
                    disabled={savingTitle || !titleEdit.trim()}
                    className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setEditingTitle(false);
                      setTitleEdit("");
                    }}
                    disabled={savingTitle}
                    className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-pink-700">{conversationTitle}</p>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setEditingTitle(true);
                      setTitleEdit(conversationTitle);
                    }}
                    disabled={loading || clearing}
                    className="h-5 w-5 p-0 text-pink-600 hover:bg-pink-100"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <p className="text-[11px] text-gray-600">
                Parenting guidance with Tiny Giggle context and store suggestions.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={clearing || loading}
            className="h-8 gap-2 border-pink-200 bg-white text-pink-700 hover:bg-pink-50"
            onClick={handleClearHistory}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {clearing ? "Clearing..." : "Clear History"}
          </Button>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white/90 shadow-sm">
          <div ref={listRef} className="h-[58vh] overflow-y-auto p-4 md:p-6">
            <div className="space-y-4">
              {messages.length <= 1 ? (
                <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-700">
                    Quick Start
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs text-pink-700 hover:bg-pink-50"
                        onClick={() => handleFollowUpClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : "border border-pink-100 bg-white text-gray-800"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-pink-600">
                        <Bot className="h-3.5 w-3.5" />
                        Parent Agent
                      </div>
                    ) : null}

                    <div className="whitespace-pre-wrap">{message.content}</div>

                    {message.role === "assistant" && message?.safetyNote ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Safety Note
                        </div>
                        {message.safetyNote}
                      </div>
                    ) : null}

                    {message.role === "assistant" && message?.suggestedRoute?.path ? (
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 border-pink-200 bg-white text-pink-700 hover:bg-pink-50"
                          onClick={() => handleRouteNavigation(message.suggestedRoute.path)}
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          Open {getRouteLabel(message.suggestedRoute.path)}
                        </Button>
                        {message?.suggestedRoute?.reason ? (
                          <p className="mt-1 text-xs text-gray-600">
                            {message.suggestedRoute.reason}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {message.role === "assistant" &&
                    Array.isArray(message.suggestedProducts) &&
                    message.suggestedProducts.length > 0 ? (
                      <div className="mt-3 rounded-xl border border-pink-100 bg-pink-50/30 p-2.5">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-pink-700">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Suggested Products
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 border-pink-200 bg-white px-2.5 text-xs text-pink-700 hover:bg-pink-50"
                            onClick={handleGoStore}
                          >
                            Open Store
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {message.suggestedProducts.map((product) => (
                            <div
                              key={product.id || product.name}
                              className="rounded-lg border border-pink-100 bg-white p-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-gray-800">
                                  {product.name}
                                </p>
                                <p className="text-xs font-semibold text-pink-700">
                                  {product?.price != null ? `PKR ${product.price}` : "View in store"}
                                </p>
                              </div>
                              {product?.category ? (
                                <p className="mt-0.5 text-[11px] text-gray-600">
                                  Category: {product.category}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {message.role === "assistant" &&
                    Array.isArray(message.followUps) &&
                    message.followUps.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.followUps.map((followUp) => (
                          <button
                            key={followUp}
                            type="button"
                            className="rounded-full border border-pink-200 bg-white px-2.5 py-1 text-xs text-pink-700 hover:bg-pink-50"
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

              {loading ? (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl border border-pink-100 bg-white px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-pink-500"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-pink-500"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-pink-500"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-pink-100 bg-white p-3">
            <div className="mb-2 text-[11px] text-gray-600">
              Ask about baby care, fever concerns, milestones, vaccinations, or product suggestions.
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Agent about your baby..."
                disabled={loading}
                className="border-pink-200 bg-white text-gray-800 focus-visible:ring-pink-200"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
