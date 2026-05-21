import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, X, GripHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import neoAvatar from "@/assets/neo-avatar.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { cn } from "@/lib/cn";
import { toast } from "@/components/ui/toast/toaster";

interface Message {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
}

const STORE_KEY = "pulse-neo-quickchat";
const NEO_ID = "neo";
const USER_ID = "me";

function simpleMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
    .replace(/^[-•]\s+(.+)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul class='list-disc pl-4 space-y-0.5'>$1</ul>")
    .replace(/\n/g, "<br/>");
}

function greeting(): Message {
  return {
    id: "neo-welcome",
    sender_id: NEO_ID,
    text: "Hi, I'm **Neo**, your Pulse AI assistant. Ask me about customers, tickets, analytics, KB articles, or anything else and I'll point you in the right direction.",
    timestamp: new Date().toISOString(),
  };
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [greeting()];
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [greeting()];
  } catch {
    return [greeting()];
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(messages));
  } catch {
    /* storage may be full or unavailable */
  }
}

function cannedReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("ticket")) {
    return "You can review and triage **tickets** from the *Tickets* page. I can help you spot SLA risks, summarise long threads, or draft replies — just ask.";
  }
  if (q.includes("customer") || q.includes("account")) {
    return "Head to **Customer Management** to browse accounts. Open any customer to see their tickets, billing, and contract details in one place.";
  }
  if (q.includes("analytic") || q.includes("report") || q.includes("dashboard")) {
    return "The **Dashboard** and *Performance* pages cover analytics — volume trends, CSAT, and agent throughput. Tell me what metric you care about and I'll explain it.";
  }
  if (q.includes("kb") || q.includes("article") || q.includes("knowledge")) {
    return "Check the **Knowledge Base** for help articles. I can summarise an article or suggest one to attach to a ticket.";
  }
  if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
    return "Hello! How can I help you with Pulse today?";
  }
  return "Good question. In this prototype I respond with canned guidance, but here's the gist: explore the relevant page from the sidebar, and I'll help you interpret what you find. Try asking about *tickets*, *customers*, or *analytics*.";
}

export function NeoQuickChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [centered, setCentered] = useState(true);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Persist conversation to localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Cleanup pending reply timer on unmount
  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    const msgId = `neo-q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const optimistic: Message = { id: msgId, sender_id: USER_ID, text, timestamp: now };
    setMessages((prev) => [...prev, optimistic]);

    replyTimer.current = setTimeout(() => {
      const replyId = `neo-r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const reply: Message = {
        id: replyId,
        sender_id: NEO_ID,
        text: cannedReply(text),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      setSending(false);
    }, 900);
  }, [input, sending]);

  const isNeo = (senderId: string) => senderId === NEO_ID;

  const clearChatHistory = useCallback(() => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setSending(false);
    setMessages([greeting()]);
    setClearConfirmOpen(false);
    toast({ title: "Chat cleared", description: "Your conversation history with Neo has been cleared." });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (centered) {
      // Initialize position from current panel location
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        const x = rect.left;
        const y = rect.top;
        setPosition({ x, y });
        setCentered(false);
        dragRef.current = { startX: e.clientX, startY: e.clientY, origX: x, origY: y };
      }
    } else {
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: position.x, origY: position.y };
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPosition({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <button
        type="button"
        title="Chat with Neo"
        aria-label="Chat with Neo"
        onClick={() => {
          setOpen(true);
          setCentered(true);
        }}
        className="h-8 w-8 shrink-0 rounded-full overflow-hidden p-0 bg-transparent border-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <img src={neoAvatar} alt="Neo" className="h-8 w-8 rounded-full object-cover" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/80 animate-fade-in"
            onClick={() => setOpen(false)}
          />

          {/* Draggable panel */}
          <div
            ref={panelRef}
            className={cn(
              "fixed z-50 w-[500px] max-w-[95vw] h-[600px] max-h-[90vh] flex flex-col border border-border bg-background shadow-lg rounded-lg overflow-hidden",
              centered && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
            style={!centered ? { left: position.x, top: position.y, transform: "none" } : undefined}
          >
            {/* Header - drag handle */}
            <div
              className="px-4 py-3 border-b border-border flex-shrink-0 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2 text-base font-semibold leading-none tracking-tight">
                <img
                  src={neoAvatar}
                  alt="Neo"
                  className="h-7 w-7 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  title="Clear chat history"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setClearConfirmOpen(true);
                  }}
                />
                Neo AI Assistant
              </div>
              <div className="flex items-center gap-1">
                <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 rounded-sm opacity-70 hover:opacity-100"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && !sending && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
                  <img
                    src={neoAvatar}
                    alt="Neo"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <p className="text-sm font-medium">Chat with Neo</p>
                  <p className="text-xs max-w-[260px]">
                    Ask about customers, tickets, analytics, KB articles, or anything else.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-2", isNeo(msg.sender_id) ? "justify-start" : "justify-end")}
                >
                  {isNeo(msg.sender_id) && (
                    <img
                      src={neoAvatar}
                      alt="Neo"
                      className="h-6 w-6 mt-1 flex-shrink-0 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      isNeo(msg.sender_id)
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {isNeo(msg.sender_id) ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none [&>ul]:my-1 [&>br]:leading-5"
                        dangerouslySetInnerHTML={{ __html: simpleMarkdown(msg.text) }}
                      />
                    ) : (
                      <span>{msg.text}</span>
                    )}
                    <div
                      className={cn(
                        "text-[10px] mt-1 opacity-60",
                        isNeo(msg.sender_id) ? "text-muted-foreground" : "text-primary-foreground/70"
                      )}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-2 justify-start">
                  <img
                    src={neoAvatar}
                    alt="Neo"
                    className="h-6 w-6 mt-1 flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Neo is typing…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-border px-4 py-3 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Neo anything…"
                  className="flex-1 h-9 text-sm"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9"
                  disabled={!input.trim() || sending}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </>
      )}

      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear chat history?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all messages in your conversation with Neo. This action
              cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={clearChatHistory}>
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
