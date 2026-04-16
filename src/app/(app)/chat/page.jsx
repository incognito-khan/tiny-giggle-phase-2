"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import {
  createMessage,
  getAllMessages,
  addMessage,
} from "@/store/slices/messageSlice";
import { getAllChats } from "@/store/slices/chatSlice";
import Loading from "@/components/loading";
import ButtonLoader from "@/components/button-loader"
import { pusherClient } from "@/lib/pusher-client";
import { Plus, Mic, StopCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const chats = useSelector((state) => state.chat.chats);
  console.log(chats);
  const messages = useSelector((state) => state.message.messages);
  console.log(messages, "messages");
  const user = useSelector((state) => state.auth.user);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);

  const [recording, setRecording] = useState(false);
  const [audioLevels, setAudioLevels] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const recordingRef = useRef(false);

  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(getAllChats({ setLoading, userId: user.id, userRole: user.role }));
  }, []);

  // Auto-select chat from URL parameter
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && chats.length > 0 && !selectedChat.id) {
      const chatToSelect = chats.find(chat => chat.id === chatId);
      if (chatToSelect) {
        handleChatChange(chatToSelect);
      }
    }
  }, [chats, searchParams, selectedChat.id]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedChat?.id) return;

    const channel = pusherClient.subscribe(`chat-${selectedChat.id}`);

    channel.bind("new-message", (newMsg) => {
      dispatch(addMessage(newMsg));
    });

    return () => {
      pusherClient.unsubscribe(`chat-${selectedChat.id}`);
    };
  }, [selectedChat?.id, dispatch]);


  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    recordingRef.current = true;
    setRecording(true);
    setAudioLevels([]);

    // Animate waveform
    const animate = () => {
      if (!recordingRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      const levels = Array.from(dataArray).slice(0, 50).map(v => v / 255);
      setAudioLevels(levels);
      requestAnimationFrame(animate);
    };
    animate();

    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    recordingRef.current = false;
    setRecording(false);
    mediaRecorderRef.current?.stop();
    audioContextRef.current?.close();
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage && !audioBlob) return;

    let imageBase64 = null;
    let imageType = null;

    if (selectedImage) {
      imageType = selectedImage.type;
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          imageBase64 = (reader.result).split(",")[1];
          resolve(true);
        };
      });
    };

    let voiceBase64 = null;
    let voiceType = null;

    if (audioBlob) {
      voiceType = audioBlob.type;
      const arrayBuffer = await audioBlob.arrayBuffer();
      voiceBase64 = Buffer.from(arrayBuffer).toString("base64");
    };


    await dispatch(
      createMessage({
        parentId: user.id,
        chatId: selectedChat?.id,
        senderId: user.id,
        content: input || null,
        imageBase64,
        imageType,
        voiceBase64,
        voiceType,
        setMessageLoading
      })
    ).unwrap();
    setInput("");
    setSelectedImage(null);
    setAudioBlob(null);
    setAudioLevels([]);
  };

  const handleChatChange = (chat) => {
    setSelectedChat(chat);
    dispatch(
      getAllMessages({ setLoading, userId: user.id, userRole: user.role, chatId: chat.id })
    );
  };

  return (
    <div className="flex h-[calc(100vh-150px)] bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {loading && <Loading />}
      {/* Sidebar */}
      <aside className="w-[20%] border-r border-pink-100 bg-white/60 backdrop-blur-sm p-4">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Chats</h2>
        <ScrollArea className="h-[70vh] pr-2">
          {chats?.map((chat, idx) => (
            <Card
              key={idx}
              className="mb-3 bg-white/80 border-pink-100 hover:shadow-md rounded-2xl cursor-pointer transition-all"
              onClick={() => handleChatChange(chat)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                    {chat?.title ? chat.title.charAt(0).toUpperCase() : ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{chat?.title}</p>
                  {/* <p className="text-xs text-gray-500">Last message...</p> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </aside>

      {/* Chat Window */}
      {selectedChat?.id && (
        <main className="flex flex-1 flex-col h-full">
          {/* Header */}
          <header className="bg-white/70 backdrop-blur-sm border-b border-pink-100 p-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                {selectedChat?.title
                  ? selectedChat?.title.charAt(0).toUpperCase()
                  : ""}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-800">
                {selectedChat?.title}
              </p>
            </div>
          </header>

          {/* Messages */}
          {messages?.length !== 0 ? (
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar"
              ref={containerRef}
            >
              {messages?.map((msg) => (
                <div
                  key={msg?.id}
                  className={`flex ${msg?.senderId === user?.id ? "justify-end" : "justify-start"} pb-3`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs ${msg?.senderId === user?.id
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      : "bg-white border border-pink-100 text-gray-800"
                      }`}
                  >
                    {msg?.message && <p>{msg?.message}</p>}
                    {msg?.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="chat image"
                        className="mt-2 rounded-xl min-w-[150px]"
                      />
                    )}
                    {msg?.voiceUrl && (
                      <audio
                        controls
                        src={msg.voiceUrl}
                        className="mt-2 w-full min-w-[250px]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 h-full w-full flex justify-center items-center">
              <h3 className="text-lg font-semibold text-gray-500">
                No Message Found. Be the First!
              </h3>
            </div>
          )}

          {selectedImage && (
            <div className="relative w-32 h-32">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="preview"
                className="w-full h-full object-cover rounded-xl border border-pink-200"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 shadow cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-pink-100 bg-white/60 backdrop-blur-sm flex items-center gap-3 mb-5">
            <label className="cursor-pointer">
              <div className="bg-pink-100 rounded-full p-2">
                <span className="text-2xl font-bold text-pink-500"><Plus /></span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedImage(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`bg-pink-100 rounded-full p-2 cursor-pointer ${recording ? "text-red-500" : "text-pink-500"
                }`}
            >
              {recording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {/* <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="rounded-full bg-gray-50 border-gray-200"
            /> */}

            {recording ? (
              <div className="flex items-end gap-1 h-10 w-full">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className="bg-pink-500 rounded flex-1"
                    style={{
                      height: `${Math.max(level * 50, 5)}%`,
                      width: '2px', // thin bar
                    }}
                  />
                ))}
              </div>
            ) : audioBlob ? (
              // Audio player after recording stops
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded-full flex-1">
                <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1 mr-2" />
                <button
                  onClick={() => setAudioBlob(null)}
                  className="text-red-500 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="rounded-full bg-gray-50 border-gray-200 flex-1"
              />
            )}

            <Button
              onClick={handleSend}
              disabled={messageLoading}
              className={`rounded-full ${messageLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} bg-gradient-to-r from-pink-500 to-purple-500 text-white`}
            >
              {messageLoading ? <ButtonLoader className="w-5 h-5 text-white" /> : "Send"}
            </Button>
          </div>
        </main>
      )}
      {!selectedChat?.id && (
        <div className="h-[calc(100vh-150px)] w-full flex justify-center items-center">
          <h2 className="text-lg font-semibold text-gray-500">
            Select Chat to See Messages
          </h2>
        </div>
      )}
    </div>
  );
}
