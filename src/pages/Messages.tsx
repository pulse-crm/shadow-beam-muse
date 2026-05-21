import * as React from "react";
import {
  Send,
  Search,
  Plus,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Zap,
  Users,
  UserPlus,
  LogOut,
  Trash2,
  Forward,
  SmilePlus,
  Reply,
  Pencil,
  Ban,
  Check,
  CheckCheck,
  X,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Button } from "@/components/ui/button/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar/avatar";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Separator } from "@/components/ui/separator/separator";
import { Popover } from "@/components/ui/popover/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog/dialog";
import { toast } from "@/components/ui/toast/toaster";
import { cn } from "@/lib/cn";
import { users as systemUsers } from "@/data/mock";

type Status = "Online" | "Away" | "Busy" | "Offline";

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  time: string;
  edited?: boolean;
  deleted?: boolean;
  replyToId?: string;
  forwardedFrom?: { senderName: string; conversationName?: string; isGroup?: boolean };
  reactions?: Reaction[];
  readBy?: string[];
}

interface Conversation {
  id: string;
  isGroup: boolean;
  participants: string[];
  groupName?: string;
  groupIcon?: string;
  groupDescription?: string;
  groupAdmin?: string;
  lastTime?: string;
}

const CURRENT_USER_ID = "U001";
const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];
const groupIcons = ["👥", "🟢", "💰", "🔧", "📞", "🎯", "🚀", "💬", "📋", "⚡"];

interface CannedResponse {
  id: string;
  title: string;
  text: string;
  category: string;
  shortcut?: string;
}

const cannedResponses: CannedResponse[] = [
  { id: "CR001", title: "Greeting", text: "Hi there! How can I help you today?", category: "General", shortcut: "/hi" },
  { id: "CR002", title: "Acknowledge Issue", text: "Thank you for reporting this. I'm looking into it now and will update you shortly.", category: "General", shortcut: "/ack" },
  { id: "CR003", title: "Escalation Notice", text: "I'm escalating this to our specialist team for priority handling. You'll receive an update within the hour.", category: "Escalation", shortcut: "/esc" },
  { id: "CR004", title: "Payment Received", text: "We've received your payment, thank you! Your account has been updated accordingly.", category: "Billing", shortcut: "/paid" },
  { id: "CR005", title: "SLA Update", text: "We're aware of the issue and working within our SLA commitments. Expected resolution by end of business today.", category: "SLA", shortcut: "/sla" },
  { id: "CR006", title: "Follow-up", text: "Just following up on our earlier conversation. Has the issue been resolved on your end?", category: "General", shortcut: "/fu" },
  { id: "CR007", title: "Closing", text: "Is there anything else I can assist you with? If not, I'll close this conversation.", category: "General", shortcut: "/close" },
  { id: "CR008", title: "Engineer Dispatch", text: "I've scheduled an engineer visit for your location. You'll receive a confirmation SMS with the time slot.", category: "Technical", shortcut: "/eng" },
];

const cannedCategories = Array.from(new Set(cannedResponses.map((r) => r.category)));

const statusColors: Record<Status, string> = {
  Online: "bg-success",
  Away: "bg-warning",
  Busy: "bg-destructive",
  Offline: "bg-muted-foreground/40",
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const initialConversations: Conversation[] = [
  { id: "c1", isGroup: false, participants: ["U001", "U002"], lastTime: "09:05" },
  { id: "c2", isGroup: false, participants: ["U001", "U003"], lastTime: "08:23" },
  { id: "c3", isGroup: false, participants: ["U001", "U004"], lastTime: "yesterday" },
  { id: "g1", isGroup: true, participants: ["U001", "U002", "U003", "U004"], groupName: "support-noc", groupIcon: "🟢", groupDescription: "24/7 NOC operations", groupAdmin: "U001", lastTime: "10:16" },
  { id: "g2", isGroup: true, participants: ["U001", "U002", "U005"], groupName: "enterprise-accounts", groupIcon: "💰", groupDescription: "Strategic account team", groupAdmin: "U001", lastTime: "1h" },
  { id: "g3", isGroup: true, participants: ["U001", "U004", "U005"], groupName: "billing-team", groupIcon: "📋", groupDescription: "Invoices and adjustments", groupAdmin: "U004", lastTime: "3h" },
];

const initialMessages: Message[] = [
  { id: "m1", conversationId: "c1", senderId: "U002", text: "Hey — did you see the Globex outage ticket?", time: "09:01", readBy: ["U001", "U002"] },
  { id: "m2", conversationId: "c1", senderId: "U001", text: "Yes, just assigned it to you. Critical priority.", time: "09:02", readBy: ["U001", "U002"] },
  { id: "m3", conversationId: "c1", senderId: "U002", text: "Got it — I'll pick up the Globex ticket.", time: "09:04", readBy: ["U001", "U002"] },
  { id: "m4", conversationId: "c1", senderId: "U002", text: "ETA ~30 mins once I'm on the bridge with NOC.", time: "09:05", readBy: ["U001"] },
  { id: "m5", conversationId: "c2", senderId: "U003", text: "Sent proposal v2 to Stark Industries.", time: "08:21", readBy: ["U001", "U003"] },
  { id: "m6", conversationId: "c2", senderId: "U001", text: "Awesome — let me know if they push back on the SLA.", time: "08:23", readBy: ["U001"] },
  { id: "m7", conversationId: "g1", senderId: "U002", text: "Heads up — possible BGP flap in eu-west.", time: "10:12", readBy: ["U001", "U002", "U004"] },
  { id: "m8", conversationId: "g1", senderId: "U004", text: "Looking now. Restoring on backup peer.", time: "10:14", readBy: ["U001", "U002", "U004"] },
  { id: "m9", conversationId: "g1", senderId: "U001", text: "Thanks team. Keep me posted.", time: "10:16", readBy: ["U001", "U002"], reactions: [{ emoji: "👍", userIds: ["U002", "U004"] }] },
];

function statusFor(user?: { status: string }): Status {
  if (!user) return "Offline";
  return (["Online", "Away", "Busy", "Offline"] as const).includes(user.status as Status)
    ? (user.status as Status)
    : "Offline";
}

export default function Messages() {
  const [conversations, setConversations] = React.useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [activeId, setActiveId] = React.useState<string>("c1");
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [msgSearchOpen, setMsgSearchOpen] = React.useState(false);
  const [msgSearchQ, setMsgSearchQ] = React.useState("");
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [newGroupOpen, setNewGroupOpen] = React.useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = React.useState(false);
  const [forwardMsg, setForwardMsg] = React.useState<Message | null>(null);
  const [replyTo, setReplyTo] = React.useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = React.useState<Message | null>(null);
  const [editText, setEditText] = React.useState("");
  const [highlightedMsgId, setHighlightedMsgId] = React.useState<string | null>(null);
  const [cannedOpen, setCannedOpen] = React.useState(false);
  const [cannedFilter, setCannedFilter] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const allUsers = systemUsers;
  const otherUsers = allUsers.filter((u) => u.id !== CURRENT_USER_ID);

  const getOther = (conv: Conversation) =>
    allUsers.find((u) => conv.participants.find((p) => p !== CURRENT_USER_ID) === u.id);

  const getConvName = (conv: Conversation) =>
    conv.isGroup ? `#${conv.groupName ?? "group"}` : getOther(conv)?.name ?? "Unknown";

  const onlineCount = allUsers.filter((u) => u.status === "Online").length;

  const filteredConversations = conversations.filter((c) => {
    if (!search.trim()) return true;
    const name = getConvName(c).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeConv = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const activeMessages = messages.filter((m) => m.conversationId === activeConv.id);
  const otherOf = activeConv && !activeConv.isGroup ? getOther(activeConv) : undefined;

  const msgSearchResults = msgSearchQ
    ? messages
        .filter((m) => !m.deleted && m.text.toLowerCase().includes(msgSearchQ.toLowerCase()))
        .slice(0, 20)
    : [];

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeId]);

  React.useEffect(() => {
    setReplyTo(null);
    setEditingMsg(null);
    setEditText("");
  }, [activeId]);

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      conversationId: activeConv.id,
      senderId: CURRENT_USER_ID,
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      replyToId: replyTo?.id,
      readBy: [CURRENT_USER_ID],
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    setReplyTo(null);
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const reactions = m.reactions ?? [];
        const existing = reactions.find((r) => r.emoji === emoji);
        if (existing) {
          const has = existing.userIds.includes(CURRENT_USER_ID);
          const updated = has
            ? existing.userIds.filter((u) => u !== CURRENT_USER_ID)
            : [...existing.userIds, CURRENT_USER_ID];
          if (updated.length === 0) {
            return { ...m, reactions: reactions.filter((r) => r.emoji !== emoji) };
          }
          return {
            ...m,
            reactions: reactions.map((r) => (r.emoji === emoji ? { ...r, userIds: updated } : r)),
          };
        }
        return { ...m, reactions: [...reactions, { emoji, userIds: [CURRENT_USER_ID] }] };
      })
    );
  };

  const handleEditSave = () => {
    if (!editingMsg || !editText.trim()) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === editingMsg.id ? { ...m, text: editText.trim(), edited: true } : m))
    );
    setEditingMsg(null);
    setEditText("");
    toast({ title: "Message edited" });
  };

  const handleDelete = (msg: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, deleted: true } : m)));
    toast({ title: "Message deleted", variant: "destructive" });
  };

  const handleForward = (msg: Message, targetConvId: string) => {
    const fromConv = conversations.find((c) => c.id === msg.conversationId);
    const sender = allUsers.find((u) => u.id === msg.senderId);
    const forwarded: Message = {
      id: `m${Date.now()}`,
      conversationId: targetConvId,
      senderId: CURRENT_USER_ID,
      text: msg.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      forwardedFrom: {
        senderName: sender?.name ?? "Unknown",
        conversationName: fromConv?.isGroup ? `#${fromConv.groupName}` : undefined,
        isGroup: fromConv?.isGroup,
      },
      readBy: [CURRENT_USER_ID],
    };
    setMessages((prev) => [...prev, forwarded]);
    const targetConv = conversations.find((c) => c.id === targetConvId);
    toast({
      title: "Message Forwarded",
      description: `Sent to ${targetConv ? getConvName(targetConv) : "conversation"}`,
    });
    setForwardMsg(null);
  };

  const handleStartConversation = (userId: string) => {
    const existing = conversations.find(
      (c) => !c.isGroup && c.participants.includes(CURRENT_USER_ID) && c.participants.includes(userId)
    );
    if (existing) {
      setActiveId(existing.id);
      setNewChatOpen(false);
      return;
    }
    const newConv: Conversation = {
      id: `c${Date.now()}`,
      isGroup: false,
      participants: [CURRENT_USER_ID, userId],
      lastTime: "now",
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setNewChatOpen(false);
  };

  const handleCreateGroup = (name: string, members: string[], desc: string, icon: string) => {
    const newGroup: Conversation = {
      id: `g${Date.now()}`,
      isGroup: true,
      groupName: name,
      groupIcon: icon,
      groupDescription: desc,
      groupAdmin: CURRENT_USER_ID,
      participants: [CURRENT_USER_ID, ...members],
      lastTime: "now",
    };
    setConversations((prev) => [...prev, newGroup]);
    setActiveId(newGroup.id);
    toast({ title: "Group created", description: `#${name}` });
  };

  const handleAddMember = (uid: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id ? { ...c, participants: [...c.participants, uid] } : c
      )
    );
  };

  const handleRemoveMember = (uid: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? { ...c, participants: c.participants.filter((p) => p !== uid) }
          : c
      )
    );
  };

  const handleLeaveGroup = () => {
    setConversations((prev) => prev.filter((c) => c.id !== activeConv.id));
    const next = conversations.find((c) => c.id !== activeConv.id);
    setActiveId(next?.id ?? "");
    setGroupInfoOpen(false);
    toast({ title: "Left group", variant: "destructive" });
  };

  const handleUpdateGroupIcon = (icon: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, groupIcon: icon } : c))
    );
  };

  const jumpToMessage = (msgId: string, convId: string) => {
    setActiveId(convId);
    setMsgSearchOpen(false);
    setMsgSearchQ("");
    setTimeout(() => {
      setHighlightedMsgId(msgId);
      const el = document.getElementById(`msg-${msgId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }, 100);
  };

  const previewFor = (conv: Conversation) => {
    const list = messages
      .filter((m) => m.conversationId === conv.id && !m.deleted)
      .slice(-1);
    return list[0]?.text ?? "No messages yet";
  };

  const unreadCountFor = (conv: Conversation) =>
    messages.filter(
      (m) =>
        m.conversationId === conv.id &&
        m.senderId !== CURRENT_USER_ID &&
        !(m.readBy ?? []).includes(CURRENT_USER_ID)
    ).length;

  return (
    <div className="page-stack flex flex-col">
      <Card className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden min-h-[640px]">
        {/* Left rail */}
        <div data-tour="messenger-conversation-list" className="border-r border-border flex flex-col bg-muted/20 min-w-0">
          <div data-tour="messenger-header" className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Messages</h2>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {onlineCount} online
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7"
                  onClick={() => setMsgSearchOpen((v) => !v)}
                  aria-label="Search messages"
                  title="Search messages"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7"
                  onClick={() => setNewGroupOpen(true)}
                  aria-label="New group"
                  title="New group"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  data-tour="messenger-new-chat-btn"
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7"
                  onClick={() => setNewChatOpen(true)}
                  aria-label="New message"
                  title="New message"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {msgSearchOpen ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search all messages…"
                    value={msgSearchQ}
                    onChange={(e) => setMsgSearchQ(e.target.value)}
                    className="pl-8 h-8 text-xs"
                    autoFocus
                  />
                  {msgSearchQ && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setMsgSearchQ("")}
                      aria-label="Clear"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {msgSearchResults.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                    {msgSearchResults.map((m) => {
                      const sender = allUsers.find((u) => u.id === m.senderId);
                      return (
                        <button
                          key={m.id}
                          className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => jumpToMessage(m.id, m.conversationId)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-primary">
                              {sender?.name ?? "Unknown"}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{m.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {m.text}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
                {msgSearchQ && msgSearchResults.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-2">
                    No messages found
                  </p>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversations…"
                  className="pl-8 h-8 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No conversations</p>
            ) : (
              filteredConversations.map((c) => {
                const other = !c.isGroup ? getOther(c) : undefined;
                const unread = unreadCountFor(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "w-full px-3 py-2.5 flex items-start gap-2.5 text-left hover:bg-muted/50 transition-colors border-b border-border/40",
                      activeId === c.id && "bg-muted/70"
                    )}
                  >
                    {c.isGroup ? (
                      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 text-base">
                        {c.groupIcon ?? "👥"}
                      </div>
                    ) : (
                      <div className="relative shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initialsOf(other?.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                            statusColors[statusFor(other)]
                          )}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {c.isGroup ? `#${c.groupName}` : other?.name ?? "Unknown"}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {c.lastTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p
                          className={cn(
                            "text-xs truncate max-w-[180px]",
                            unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {previewFor(c)}
                        </p>
                        {unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-semibold shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main thread */}
        {!activeConv ? (
          <div className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-w-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
              {activeConv.isGroup ? (
                <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg">
                  {activeConv.groupIcon ?? "👥"}
                </div>
              ) : (
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initialsOf(otherOf?.name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                      statusColors[statusFor(otherOf)]
                    )}
                  />
                </div>
              )}
              <button
                type="button"
                className="flex-1 min-w-0 text-left"
                onClick={() => activeConv.isGroup && setGroupInfoOpen(true)}
                disabled={!activeConv.isGroup}
              >
                <p className="text-sm font-semibold truncate">
                  {activeConv.isGroup ? `#${activeConv.groupName}` : otherOf?.name ?? "Unknown"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {activeConv.isGroup
                    ? `${activeConv.participants.length} members`
                    : statusFor(otherOf)}
                </p>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
              {activeMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center">
                  {activeConv.isGroup
                    ? "No messages yet. Start the conversation! 🎉"
                    : "No messages yet. Say hello! 👋"}
                </p>
              ) : (
                activeMessages.map((m, idx) => {
                  const isMine = m.senderId === CURRENT_USER_ID;
                  const sender = allUsers.find((u) => u.id === m.senderId);
                  const prev = idx > 0 ? activeMessages[idx - 1] : null;
                  const showAuthor =
                    !isMine &&
                    activeConv.isGroup &&
                    (!prev || prev.senderId !== m.senderId);
                  const repliedMsg = m.replyToId
                    ? messages.find((x) => x.id === m.replyToId)
                    : null;
                  const repliedSender = repliedMsg
                    ? allUsers.find((u) => u.id === repliedMsg.senderId)
                    : null;

                  return (
                    <div
                      key={m.id}
                      id={`msg-${m.id}`}
                      className={cn(
                        "group flex justify-end rounded-lg transition-colors duration-500",
                        highlightedMsgId === m.id && "bg-primary/10 -mx-2 px-2 py-1"
                      )}
                    >
                      {!m.deleted && (
                        <div className="flex items-start gap-0.5 mr-1 mt-1 order-1">
                          {isMine && (
                            <>
                              <button
                                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                  setEditingMsg(m);
                                  setEditText(m.text);
                                }}
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                              <button
                                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => handleDelete(m)}
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                              </button>
                            </>
                          )}
                          {!isMine && (
                            <>
                              <Popover
                                side="top"
                                align="start"
                                width={260}
                                trigger={
                                  <button
                                    className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="React"
                                    title="React"
                                  >
                                    <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                }
                              >
                                <div className="flex gap-0.5 p-1.5">
                                  {quickEmojis.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleReact(m.id, emoji)}
                                      className="h-8 w-8 rounded-md flex items-center justify-center text-base hover:bg-accent transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </Popover>
                              <button
                                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => setReplyTo(m)}
                                title="Reply"
                              >
                                <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </>
                          )}
                          <button
                            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => setForwardMsg(m)}
                            title="Forward"
                          >
                            <Forward className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      )}

                      <div className="max-w-[70%] space-y-1 order-2 flex flex-col items-end">
                        {showAuthor && sender && (
                          <span className="text-[10px] text-muted-foreground mr-1">
                            {sender.name}
                          </span>
                        )}
                        {repliedMsg && (
                          <button
                            type="button"
                            onClick={() => jumpToMessage(repliedMsg.id, repliedMsg.conversationId)}
                            className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-t-lg border-l-2 text-left w-full bg-muted/70 border-primary/40 text-muted-foreground"
                          >
                            <Reply className="h-3 w-3 shrink-0" />
                            <span className="font-medium">{repliedSender?.name ?? "Unknown"}</span>
                            <span className="truncate">
                              {repliedMsg.deleted ? "Deleted message" : repliedMsg.text.slice(0, 60)}
                            </span>
                          </button>
                        )}
                        {m.deleted ? (
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-muted/30 border border-dashed border-border justify-start">
                            <Ban className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground italic">
                              This message was deleted
                            </span>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-2 space-y-1 rounded-bl-md",
                              isMine
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100",
                              repliedMsg && "rounded-t-none"
                            )}
                          >
                            {m.forwardedFrom && (
                              <div
                                className={cn(
                                  "flex items-center gap-1 text-[10px] opacity-70 border-l-2 pl-1.5 mb-1",
                                  isMine
                                    ? "border-white/40"
                                    : "border-foreground/20"
                                )}
                              >
                                <Forward className="h-2.5 w-2.5" />
                                {m.forwardedFrom.isGroup ? (
                                  <>
                                    Forwarded from {m.forwardedFrom.senderName} in{" "}
                                    {m.forwardedFrom.conversationName}
                                  </>
                                ) : (
                                  <>Forwarded from {m.forwardedFrom.senderName}</>
                                )}
                              </div>
                            )}
                            <div className="flex items-end gap-2">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1 break-words">
                                {m.text}
                              </p>
                              <span className="flex items-center gap-1 shrink-0 translate-y-0.5">
                                {m.edited && (
                                  <span className="text-[9px] opacity-50 italic">edited</span>
                                )}
                                <span
                                  className={cn(
                                    "text-[10px]",
                                    isMine ? "text-white/70" : "text-muted-foreground"
                                  )}
                                >
                                  {m.time}
                                </span>
                                {isMine &&
                                  ((m.readBy ?? []).length > 1 ? (
                                    <CheckCheck className="h-3 w-3 opacity-60" />
                                  ) : (
                                    <Check className="h-3 w-3 opacity-60" />
                                  ))}
                              </span>
                            </div>
                          </div>
                        )}
                        {m.reactions && m.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 px-1">
                            {m.reactions.map((r) => {
                              const iReacted = r.userIds.includes(CURRENT_USER_ID);
                              return (
                                <button
                                  key={r.emoji}
                                  type="button"
                                  onClick={() => !isMine && handleReact(m.id, r.emoji)}
                                  className={cn(
                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors",
                                    isMine
                                      ? "cursor-default bg-muted/50 border-border"
                                      : iReacted
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-muted/50 border-border hover:bg-accent"
                                  )}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {r.userIds.length}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {isMine && activeConv.isGroup && (m.readBy?.length ?? 0) > 1 && (
                          <div className="flex -space-x-1.5 mt-0.5">
                            {(m.readBy ?? [])
                              .filter((id) => id !== CURRENT_USER_ID)
                              .slice(0, 4)
                              .map((id) => {
                                const u = allUsers.find((x) => x.id === id);
                                return (
                                  <Avatar key={id} className="h-3.5 w-3.5 border border-card">
                                    <AvatarFallback className="text-[6px] bg-muted">
                                      {initialsOf(u?.name ?? "?").slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                );
                              })}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
              {!activeConv.isGroup && statusFor(otherOf) === "Online" && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="inline-flex gap-0.5 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:240ms]" />
                  </span>
                  {otherOf?.name} is typing…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply preview */}
            {replyTo && (
              <div className="px-4 pt-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border-l-2 border-primary">
                  <Reply className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-primary">
                      {allUsers.find((u) => u.id === replyTo.senderId)?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{replyTo.text}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Edit bar */}
            {editingMsg && (
              <div className="px-4 pt-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border-l-2 border-warning">
                  <Pencil className="h-3.5 w-3.5 text-warning shrink-0" />
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") {
                        setEditingMsg(null);
                        setEditText("");
                      }
                    }}
                    className="h-8 text-xs flex-1"
                    autoFocus
                  />
                  <Button size="sm" className="h-7 text-xs" onClick={handleEditSave}>
                    Save
                  </Button>
                  <button
                    onClick={() => {
                      setEditingMsg(null);
                      setEditText("");
                    }}
                    aria-label="Cancel edit"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Compose */}
            <div data-tour="messenger-compose-area" className="p-3 border-t border-border">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Attach file">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Attach image">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Emoji">
                  <Smile className="h-4 w-4" />
                </Button>
                <Popover
                  open={cannedOpen}
                  onOpenChange={(o) => {
                    setCannedOpen(o);
                    if (!o) setCannedFilter("");
                  }}
                  side="top"
                  align="start"
                  width={288}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      aria-label="Quick replies"
                      title="Quick Replies"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  }
                >
                  <div className="p-0">
                    <div className="p-2 border-b border-border">
                      <Input
                        placeholder="Search templates…"
                        value={cannedFilter}
                        onChange={(e) => setCannedFilter(e.target.value)}
                        className="h-7 text-xs"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-1">
                      {cannedCategories.map((cat) => {
                        const items = cannedResponses.filter(
                          (r) =>
                            r.category === cat &&
                            (!cannedFilter ||
                              r.title.toLowerCase().includes(cannedFilter.toLowerCase()) ||
                              r.text.toLowerCase().includes(cannedFilter.toLowerCase()))
                        );
                        if (items.length === 0) return null;
                        return (
                          <div key={cat}>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1">
                              {cat}
                            </p>
                            {items.map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                                onClick={() => {
                                  setDraft((prev) => (prev ? prev + "\n" + r.text : r.text));
                                  setCannedOpen(false);
                                  setCannedFilter("");
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{r.title}</span>
                                  {r.shortcut && (
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {r.shortcut}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                  {r.text}
                                </p>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      {cannedFilter &&
                        cannedResponses.filter(
                          (r) =>
                            r.title.toLowerCase().includes(cannedFilter.toLowerCase()) ||
                            r.text.toLowerCase().includes(cannedFilter.toLowerCase())
                        ).length === 0 && (
                          <p className="text-[10px] text-muted-foreground text-center py-3">
                            No templates match
                          </p>
                        )}
                    </div>
                  </div>
                </Popover>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                    if (e.key === "Escape") setReplyTo(null);
                  }}
                  rows={1}
                  placeholder={
                    replyTo
                      ? "Type your reply…"
                      : "Type a message… (⚡ for templates)"
                  }
                  className="min-h-[40px] max-h-[120px] resize-none text-sm flex-1"
                />
                <Button data-tour="messenger-send-btn" onClick={handleSend} disabled={!draft.trim()} size="icon" className="h-9 w-9 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* New Message Dialog */}
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        users={otherUsers}
        onStart={handleStartConversation}
      />

      {/* New Group Dialog */}
      <NewGroupDialog
        open={newGroupOpen}
        onOpenChange={setNewGroupOpen}
        users={otherUsers}
        onCreate={handleCreateGroup}
      />

      {/* Group Info Dialog */}
      {activeConv?.isGroup && (
        <GroupInfoDialog
          open={groupInfoOpen}
          onOpenChange={setGroupInfoOpen}
          conv={activeConv}
          users={allUsers}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onLeave={handleLeaveGroup}
          onChangeIcon={handleUpdateGroupIcon}
        />
      )}

      {/* Forward Dialog */}
      <ForwardDialog
        msg={forwardMsg}
        conversations={conversations}
        onClose={() => setForwardMsg(null)}
        onForward={handleForward}
        getConvName={getConvName}
        getOther={getOther}
      />
    </div>
  );
}

// ====== sub-components ======

function NewChatDialog({
  open,
  onOpenChange,
  users,
  onStart,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: { id: string; name: string; role: string; status: string }[];
  onStart: (userId: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);
  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
          autoFocus
        />
        <div className="max-h-[300px] overflow-y-auto space-y-1 mt-2">
          {filtered.map((u) => (
            <button
              key={u.id}
              className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-colors text-left"
              onClick={() => onStart(u.id)}
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initialsOf(u.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                    statusColors[statusFor(u)]
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.role}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewGroupDialog({
  open,
  onOpenChange,
  users,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: { id: string; name: string; role: string; status: string }[];
  onCreate: (name: string, members: string[], desc: string, icon: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [icon, setIcon] = React.useState("👥");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setName("");
      setDesc("");
      setIcon("👥");
      setSelected([]);
      setSearch("");
    }
  }, [open]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase())
  );

  const create = () => {
    if (!name.trim() || selected.length === 0) {
      toast({
        title: "Missing info",
        description: "Please enter a group name and select at least one member.",
        variant: "destructive",
      });
      return;
    }
    onCreate(name.trim(), selected, desc.trim(), icon);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> New Group
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
            autoFocus
          />
          <Input
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="h-9"
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Group Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {groupIcons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center text-sm hover:bg-accent transition-colors",
                    icon === ic && "bg-accent ring-1 ring-primary"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground font-medium">
            Add members ({selected.length} selected)
          </p>
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="h-[220px] overflow-y-auto space-y-0.5">
            {filtered.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
              >
                <Checkbox checked={selected.includes(u.id)} onCheckedChange={() => toggle(u.id)} />
                <div className="relative">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                      {initialsOf(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-card",
                      statusColors[statusFor(u)]
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">{u.role}</p>
                </div>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={create} disabled={!name.trim() || selected.length === 0}>
            <Users className="h-3.5 w-3.5" /> Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupInfoDialog({
  open,
  onOpenChange,
  conv,
  users,
  onAddMember,
  onRemoveMember,
  onLeave,
  onChangeIcon,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conv: Conversation;
  users: { id: string; name: string; role: string; status: string }[];
  onAddMember: (uid: string) => void;
  onRemoveMember: (uid: string) => void;
  onLeave: () => void;
  onChangeIcon: (icon: string) => void;
}) {
  const [addOpen, setAddOpen] = React.useState(false);
  const [addSearch, setAddSearch] = React.useState("");
  const isAdmin = conv.groupAdmin === CURRENT_USER_ID;
  const members = conv.participants
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const nonMembers = users.filter((u) => !conv.participants.includes(u.id));
  const filteredNonMembers = nonMembers.filter(
    (u) => !addSearch || u.name.toLowerCase().includes(addSearch.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Group Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center text-2xl">
                {conv.groupIcon ?? "👥"}
              </div>
              <h3 className="font-semibold text-lg">#{conv.groupName}</h3>
              {conv.groupDescription && (
                <p className="text-xs text-muted-foreground text-center">{conv.groupDescription}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {conv.participants.length} members
              </p>
            </div>
            {isAdmin && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Group Icon</p>
                <div className="flex flex-wrap gap-1.5">
                  {groupIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => onChangeIcon(ic)}
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center text-sm hover:bg-accent transition-colors",
                        conv.groupIcon === ic && "bg-accent ring-1 ring-primary"
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Members</p>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setAddOpen(true)}
                  >
                    <UserPlus className="h-3 w-3" /> Add
                  </Button>
                )}
              </div>
              <div className="space-y-0.5">
                {members.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-2 p-1.5 rounded-md group"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {initialsOf(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                          statusColors[statusFor(u)]
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">
                        {u.name}
                        {u.id === CURRENT_USER_ID && (
                          <span className="text-muted-foreground"> (You)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {u.role}
                        {u.id === conv.groupAdmin && " · Admin"}
                      </p>
                    </div>
                    {isAdmin && u.id !== CURRENT_USER_ID && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => onRemoveMember(u.id)}
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <Button variant="destructive" size="sm" className="w-full text-xs" onClick={onLeave}>
              <LogOut className="h-3.5 w-3.5" /> Leave Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search…"
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            className="h-8 text-xs"
            autoFocus
          />
          <div className="max-h-[220px] overflow-y-auto mt-2">
            {filteredNonMembers.map((u) => (
              <button
                key={u.id}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left"
                onClick={() => {
                  onAddMember(u.id);
                  setAddOpen(false);
                  setAddSearch("");
                }}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {initialsOf(u.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{u.name}</span>
              </button>
            ))}
            {filteredNonMembers.length === 0 && (
              <p className="text-xs text-muted-foreground p-4 text-center">
                All users are already in this group
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ForwardDialog({
  msg,
  conversations,
  onClose,
  onForward,
  getConvName,
  getOther,
}: {
  msg: Message | null;
  conversations: Conversation[];
  onClose: () => void;
  onForward: (msg: Message, convId: string) => void;
  getConvName: (conv: Conversation) => string;
  getOther: (conv: Conversation) => { id: string; name: string; status: string } | undefined;
}) {
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    if (!msg) setSearch("");
  }, [msg]);

  if (!msg) return null;
  const targets = conversations.filter(
    (c) =>
      c.id !== msg.conversationId &&
      (!search || getConvName(c).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Dialog open={!!msg} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-4 w-4" /> Forward Message
          </DialogTitle>
        </DialogHeader>
        <div className="p-2 rounded-lg bg-muted/50 text-xs">
          <p className="line-clamp-3">{msg.text}</p>
        </div>
        <Input
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs"
          autoFocus
        />
        <div className="max-h-[250px] overflow-y-auto space-y-0.5 mt-2">
          {targets.map((conv) => {
            const other = !conv.isGroup ? getOther(conv) : undefined;
            return (
              <button
                key={conv.id}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => onForward(msg, conv.id)}
              >
                {conv.isGroup ? (
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-base">
                    {conv.groupIcon ?? "👥"}
                  </div>
                ) : (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initialsOf(other?.name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{getConvName(conv)}</p>
                  {conv.isGroup && (
                    <p className="text-[10px] text-muted-foreground">
                      {conv.participants.length} members
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {targets.length === 0 && (
            <p className="text-xs text-muted-foreground p-4 text-center">
              No conversations to forward to
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}