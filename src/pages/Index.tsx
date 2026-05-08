import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

/* ============================================================
   ТИПЫ
   ============================================================ */
type Theme = { id: string; name: string; bg: string; accent1: string; accent2: string; accent3: string; gradient: string };
type Wallpaper = { id: string; name: string; value: string; preview: string };
type Chat = { id: number; name: string; avatar: string; lastMsg: string; time: string; unread: number; online: boolean; pinned?: boolean; tags: string[] };
type MsgType = "text" | "voice" | "file" | "video" | "deleted_me" | "deleted_all";
type Message = { id: number; text: string; out: boolean; time: string; status: "sent" | "delivered" | "read"; type?: MsgType; fileName?: string; fileSize?: string; duration?: number };
type Contact = { id: number; name: string; avatar: string; tag: string; online: boolean; status: string };
type CallRecord = { id: number; name: string; avatar: string; type: "in" | "out" | "missed"; time: string; duration?: string };
type Story = { id: number; name: string; avatar: string; gradient: string; seen: boolean; content: string };
type VerifyStyle = "none" | "blue" | "black";

/* ============================================================
   ДАННЫЕ
   ============================================================ */
const THEMES: Theme[] = [
  { id: "violet", name: "Violet Night", bg: "#0d0f1a", accent1: "#7c5cfc", accent2: "#fc5c9c", accent3: "#5cf0fc", gradient: "linear-gradient(135deg,#7c5cfc,#fc5c9c)" },
  { id: "ocean", name: "Deep Ocean", bg: "#071420", accent1: "#0ea5e9", accent2: "#22d3ee", accent3: "#38bdf8", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
  { id: "forest", name: "Emerald", bg: "#071a0f", accent1: "#22c55e", accent2: "#4ade80", accent3: "#86efac", gradient: "linear-gradient(135deg,#16a34a,#0ea5e9)" },
  { id: "fire", name: "Solar Flare", bg: "#1a0a00", accent1: "#f97316", accent2: "#ef4444", accent3: "#fbbf24", gradient: "linear-gradient(135deg,#ef4444,#f97316)" },
  { id: "rose", name: "Rose Quartz", bg: "#1a0a12", accent1: "#ec4899", accent2: "#f472b6", accent3: "#fb7185", gradient: "linear-gradient(135deg,#db2777,#ec4899)" },
  { id: "mono", name: "Monochrome", bg: "#111111", accent1: "#e5e5e5", accent2: "#a3a3a3", accent3: "#737373", gradient: "linear-gradient(135deg,#e5e5e5,#737373)" },
];
const WALLPAPERS: Wallpaper[] = [
  { id: "none", name: "Нет", value: "none", preview: "#1a1a2e" },
  { id: "aurora", name: "Аврора", value: "radial-gradient(ellipse at 20% 50%, rgba(124,92,252,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(252,92,156,0.3) 0%, transparent 60%)", preview: "conic-gradient(from 180deg at 50% 50%, #7c5cfc, #fc5c9c, #5cf0fc, #7c5cfc)" },
  { id: "mesh", name: "Mesh", value: "repeating-linear-gradient(45deg, rgba(124,92,252,0.05) 0px, rgba(124,92,252,0.05) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, rgba(252,92,156,0.05) 0px, rgba(252,92,156,0.05) 1px, transparent 1px, transparent 20px)", preview: "repeating-conic-gradient(rgba(124,92,252,0.3) 0deg 10deg, transparent 10deg 20deg)" },
  { id: "dots", name: "Точки", value: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", preview: "radial-gradient(circle at 50% 50%, #7c5cfc44, #1a1a2e)" },
  { id: "waves", name: "Волны", value: "repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(124,92,252,0.05) 30px, rgba(124,92,252,0.05) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(252,92,156,0.05) 30px, rgba(252,92,156,0.05) 31px)", preview: "linear-gradient(135deg,#1a1a2e,#2d1b69)" },
  { id: "gradient", name: "Градиент", value: "linear-gradient(135deg, #1a0a2e 0%, #0f1a2e 50%, #1a2e0f 100%)", preview: "linear-gradient(135deg,#1a0a2e,#0f1a2e,#1a2e0f)" },
];
const INIT_CHATS: Chat[] = [
  { id: 1, name: "Алиса Морозова", avatar: "АМ", lastMsg: "Окей, встретимся в 7! 🎉", time: "сейчас", unread: 3, online: true, pinned: true, tags: ["работа", "друзья"] },
  { id: 2, name: "Дизайн-команда", avatar: "ДК", lastMsg: "Макет готов, смотри в Figma", time: "2 мин", unread: 12, online: true, tags: ["работа"] },
  { id: 3, name: "Максим Петров", avatar: "МП", lastMsg: "Ты видел новый трейлер?", time: "15 мин", unread: 0, online: false, tags: ["друзья"] },
  { id: 4, name: "Работа 🏢", avatar: "Р", lastMsg: "Собрание перенесено на 14:00", time: "1 ч", unread: 5, online: true, tags: ["работа"] },
  { id: 5, name: "Катя Лис", avatar: "КЛ", lastMsg: "Спасибо большое! 💜", time: "3 ч", unread: 0, online: false, tags: ["друзья"] },
  { id: 6, name: "Новости Крипты", avatar: "НК", lastMsg: "BTC +12% за сутки", time: "вчера", unread: 99, online: true, tags: ["финансы"] },
  { id: 7, name: "Евгений Волков", avatar: "ЕВ", lastMsg: "Погнали на выходных?", time: "вчера", unread: 0, online: false, tags: ["друзья"] },
];
const INIT_MESSAGES: Message[] = [
  { id: 1, text: "Привет! Как дела? 👋", out: false, time: "10:12", status: "read" },
  { id: 2, text: "Всё отлично! Только что закончил проект", out: true, time: "10:13", status: "read" },
  { id: 3, text: "Серьёзно? Это же тот самый с дедлайном на завтра?", out: false, time: "10:14", status: "read" },
  { id: 4, text: "Именно! Успел заранее 😎 Теперь можно отдохнуть", out: true, time: "10:15", status: "read" },
  { id: 5, text: "Круто! Значит сегодня встречаемся?", out: false, time: "10:16", status: "read" },
  { id: 6, text: "Да, в 7 вечера у метро. Всё как договаривались 🎉", out: true, time: "10:17", status: "read" },
  { id: 7, text: "Окей, встретимся в 7! 🎉", out: false, time: "10:18", status: "read" },
];
const CONTACTS: Contact[] = [
  { id: 1, name: "Алиса Морозова", avatar: "АМ", tag: "@alisa_m", online: true, status: "В сети" },
  { id: 2, name: "Максим Петров", avatar: "МП", tag: "@max_petrov", online: false, status: "Был час назад" },
  { id: 3, name: "Катя Лис", avatar: "КЛ", tag: "@katya_lis", online: false, status: "Был вчера" },
  { id: 4, name: "Евгений Волков", avatar: "ЕВ", tag: "@evg_v", online: true, status: "В сети" },
  { id: 5, name: "Дима Орлов", avatar: "ДО", tag: "@dima_or", online: false, status: "Был 3 дня назад" },
  { id: 6, name: "Настя Кова", avatar: "НК", tag: "@nastya_k", online: true, status: "В сети" },
];
const CALLS: CallRecord[] = [
  { id: 1, name: "Алиса Морозова", avatar: "АМ", type: "in", time: "сегодня, 10:00", duration: "12 мин" },
  { id: 2, name: "Максим Петров", avatar: "МП", type: "out", time: "сегодня, 09:15", duration: "3 мин" },
  { id: 3, name: "Дима Орлов", avatar: "ДО", type: "missed", time: "вчера, 22:40" },
  { id: 4, name: "Катя Лис", avatar: "КЛ", type: "in", time: "вчера, 18:00", duration: "45 мин" },
  { id: 5, name: "Дизайн-команда", avatar: "ДК", type: "out", time: "вчера, 14:00", duration: "1 ч 20 мин" },
  { id: 6, name: "Евгений Волков", avatar: "ЕВ", type: "missed", time: "2 дня назад" },
];
const TAG_COLORS: Record<string, string> = {
  работа: "rgba(14,165,233,0.2)",
  друзья: "rgba(124,92,252,0.2)",
  финансы: "rgba(34,197,94,0.2)",
};
const INIT_STORIES: Story[] = [
  { id: 1, name: "Мой статус", avatar: "ВС", gradient: "linear-gradient(135deg,#7c5cfc,#fc5c9c)", seen: false, content: "🚀 Запустил новый проект!" },
  { id: 2, name: "Алиса", avatar: "АМ", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)", seen: false, content: "☕ Утренний кофе и код" },
  { id: 3, name: "Максим", avatar: "МП", gradient: "linear-gradient(135deg,#16a34a,#0ea5e9)", seen: true, content: "🎮 Играю в новую игру" },
  { id: 4, name: "Катя", avatar: "КЛ", gradient: "linear-gradient(135deg,#db2777,#ec4899)", seen: false, content: "🌸 Весна!" },
];

/* ============================================================
   ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
   ============================================================ */
function AvatarComp({ initials, size = 44, gradient }: { initials: string; size?: number; gradient: string }) {
  return (
    <div style={{ width: size, height: size, minWidth: size, background: gradient, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
      {initials}
    </div>
  );
}
function StatusTick({ status, accent1 }: { status: "sent" | "delivered" | "read"; accent1: string }) {
  if (status === "sent") return <Icon name="Check" size={12} style={{ color: "rgba(255,255,255,0.4)" }} />;
  if (status === "delivered") return <Icon name="CheckCheck" size={12} style={{ color: "rgba(255,255,255,0.4)" }} />;
  return <Icon name="CheckCheck" size={12} style={{ color: accent1 }} />;
}
function VerifyBadge({ style, size = 18 }: { style: VerifyStyle; size?: number }) {
  if (style === "none") return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: "50%", background: style === "blue" ? "#0ea5e9" : "#555", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontSize: size * 0.55, fontWeight: 900, lineHeight: 1 }}>✓</span>
    </div>
  );
}

/* ============================================================
   ГОЛОСОВОЕ СООБЩЕНИЕ
   ============================================================ */
function VoiceMessage({ duration, out, accent1 }: { duration: number; out: boolean; accent1: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      const step = 100 / (duration * 10);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPlaying(false);
            return 0;
          }
          return p + step;
        });
      }, 100);
    }
  };

  const bars = Array.from({ length: 24 }, (_, i) => {
    const h = 4 + Math.sin(i * 1.3) * 10 + Math.random() * 6;
    return Math.max(4, Math.min(20, h));
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160 }}>
      <button onClick={toggle} style={{ background: out ? "rgba(255,255,255,0.2)" : accent1 + "33", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <Icon name={playing ? "Pause" : "Play"} size={14} style={{ color: "#fff" }} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: progress > (i / bars.length) * 100 ? (out ? "#fff" : accent1) : "rgba(255,255,255,0.3)", transition: "background 0.1s" }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
        {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ============================================================
   ЛЕНТА ЧАТОВ
   ============================================================ */
function HomeTab({ chats, onOpenChat, onDeleteChat, theme, stories, onViewStory, verifyStyle }: {
  chats: Chat[]; onOpenChat: (c: Chat) => void; onDeleteChat: (id: number) => void;
  theme: Theme; stories: Story[]; onViewStory: (s: Story) => void; verifyStyle: VerifyStyle;
}) {
  const [search, setSearch] = useState("");
  const [chatMenu, setChatMenu] = useState<{ chatId: number; x: number; y: number } | null>(null);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter(c => c.pinned);
  const rest = filtered.filter(c => !c.pinned);

  const handleHoldStart = (chatId: number, e: React.TouchEvent | React.MouseEvent) => {
    holdRef.current = setTimeout(() => {
      const rect = (e.target as HTMLElement).closest("[data-chatitem]")?.getBoundingClientRect();
      setChatMenu({ chatId, x: rect?.left ?? 100, y: rect?.top ?? 100 });
    }, 600);
  };
  const handleHoldEnd = () => { if (holdRef.current) clearTimeout(holdRef.current); };

  const renderChat = (chat: Chat, i: number) => (
    <div
      key={chat.id}
      data-chatitem="1"
      onClick={() => !chatMenu && onOpenChat(chat)}
      onMouseDown={e => handleHoldStart(chat.id, e)}
      onMouseUp={handleHoldEnd}
      onTouchStart={e => handleHoldStart(chat.id, e)}
      onTouchEnd={handleHoldEnd}
      className="q-glass-hover anim-fade-slide"
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, cursor: "pointer", marginBottom: 4, animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: "forwards", userSelect: "none" }}
    >
      <div style={{ position: "relative" }}>
        <AvatarComp initials={chat.avatar} gradient={theme.gradient} />
        {chat.online && <div className="online-dot" style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, border: "2px solid var(--q-bg)" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{chat.name}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--q-text-muted)" }}>{chat.time}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <span style={{ fontSize: 13, color: "var(--q-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{chat.lastMsg}</span>
          {chat.unread > 0 && (
            <div style={{ background: theme.gradient, borderRadius: 12, minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", padding: "0 5px" }}>
              {chat.unread > 99 ? "99+" : chat.unread}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }} onClick={() => setChatMenu(null)}>
      <div style={{ padding: "20px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-1px", background: theme.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>Qwik</span>
          <VerifyBadge style={verifyStyle} size={20} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="q-glass" style={{ border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--q-text-muted)" }}>
            <Icon name="Bell" size={18} />
          </button>
          <button style={{ background: theme.gradient, border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="Plus" size={18} style={{ color: "#fff" }} />
          </button>
        </div>
      </div>

      {/* Статусы/сторис */}
      <div style={{ display: "flex", gap: 12, padding: "6px 20px 12px", overflowX: "auto" }}>
        {stories.map(s => (
          <div key={s.id} onClick={() => onViewStory(s)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}>
            <div style={{ padding: 2, borderRadius: "50%", background: s.seen ? "rgba(255,255,255,0.1)" : s.gradient }}>
              <div style={{ padding: 2, background: "var(--q-bg)", borderRadius: "50%" }}>
                <AvatarComp initials={s.avatar} size={46} gradient={s.gradient} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: "var(--q-text-muted)", maxWidth: 50, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <div className="q-glass" style={{ borderRadius: 14, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
          <Icon name="Search" size={16} style={{ color: "var(--q-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск чатов..."
            style={{ background: "none", border: "none", outline: "none", color: "var(--q-text)", fontSize: 14, flex: 1, fontFamily: "Golos Text, sans-serif" }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        {pinned.length > 0 && (
          <div style={{ fontSize: 11, color: "var(--q-text-muted)", padding: "4px 8px 6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>📌 Закреплённые</div>
        )}
        {[...pinned, ...rest].map((chat, i) => renderChat(chat, i))}
      </div>

      {/* Контекстное меню чата */}
      {chatMenu && (
        <div className="q-glass anim-scale" style={{ position: "fixed", top: chatMenu.y, left: chatMenu.x, zIndex: 100, borderRadius: 16, overflow: "hidden", minWidth: 180, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          onClick={e => e.stopPropagation()}>
          <div onClick={() => { onDeleteChat(chatMenu.chatId); setChatMenu(null); }}
            style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#ef4444" }}
            className="q-glass-hover">
            <Icon name="Trash2" size={16} />
            <span style={{ fontWeight: 500 }}>Удалить чат</span>
          </div>
          <div style={{ height: 1, background: "var(--q-border)" }} />
          <div onClick={() => setChatMenu(null)}
            style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "var(--q-text-muted)" }}
            className="q-glass-hover">
            <Icon name="X" size={16} />
            <span style={{ fontWeight: 500 }}>Отмена</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ПРОСМОТР СТАТУСА
   ============================================================ */
function StoryView({ story, onClose, onDelete, theme }: { story: Story; onClose: () => void; onDelete: (id: number) => void; theme: Theme }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress(p => p >= 100 ? 100 : p + 2), 100);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (progress >= 100) onClose(); }, [progress, onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Прогресс */}
      <div style={{ padding: "16px 16px 0", display: "flex", gap: 4 }}>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#fff", transition: "width 0.1s linear" }} />
        </div>
      </div>
      {/* Хедер */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarComp initials={story.avatar} size={38} gradient={story.gradient} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#fff" }}>{story.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>только что</div>
        </div>
        <button onClick={() => { onDelete(story.id); onClose(); }}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", marginRight: 4 }}>
          <Icon name="Trash2" size={15} />
        </button>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
          <Icon name="X" size={16} />
        </button>
      </div>
      {/* Контент */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: story.gradient, margin: "8px 16px", borderRadius: 24 }}>
        <div style={{ fontSize: 40, textAlign: "center", padding: 32 }}>{story.content}</div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}

/* ============================================================
   ЧАТ
   ============================================================ */
function ChatView({ chat, onBack, theme, wallpaper }: { chat: Chat; onBack: () => void; theme: Theme; wallpaper: Wallpaper }) {
  const [msgs, setMsgs] = useState<Message[]>(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [msgMenu, setMsgMenu] = useState<{ msgId: number; x: number; y: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [inCall, setInCall] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now(), text: input.trim(), out: true, time: now(), status: "sent" };
    setMsgs(m => [...m, newMsg]);
    setInput("");
  };

  const now = () => new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

  // Голосовое
  const startRecord = () => {
    setIsRecording(true);
    setRecordSecs(0);
    recordRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
  };
  const stopRecord = () => {
    if (recordRef.current) clearInterval(recordRef.current);
    if (recordSecs > 0) {
      const newMsg: Message = { id: Date.now(), text: "", out: true, time: now(), status: "sent", type: "voice", duration: recordSecs };
      setMsgs(m => [...m, newMsg]);
    }
    setIsRecording(false);
    setRecordSecs(0);
  };

  // Файлы — любой тип + сжатие видео симуляция
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    const isVideo = file.type.startsWith("video/");
    const label = isVideo ? "Сжатие видео до 720p..." : "Загрузка...";
    // Симулируем прогресс
    let p = 0;
    const interval = setInterval(() => {
      p += isVideo ? 3 : 8;
      setUploadProgress(Math.min(p, 95));
      if (p >= 95) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(null);
          const isImg = file.type.startsWith("image/");
          const newMsg: Message = {
            id: Date.now(), out: true, time: now(), status: "sent",
            type: isVideo ? "video" : isImg ? "file" : "file",
            text: isImg ? URL.createObjectURL(file) : "",
            fileName: file.name,
            fileSize: formatSize(file.size),
          };
          setMsgs(m => [...m, newMsg]);
        }, 300);
      }
    }, 100);
    e.target.value = "";
    void label;
  };

  const formatSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} МБ` : `${(b / 1024).toFixed(0)} КБ`;

  // Долгое нажатие на сообщение
  const handleMsgHoldStart = (msgId: number, e: React.TouchEvent | React.MouseEvent) => {
    holdRef.current = setTimeout(() => {
      const el = (e.target as HTMLElement).closest("[data-msgid]") as HTMLElement | null;
      const rect = el?.getBoundingClientRect();
      setMsgMenu({ msgId, x: rect ? Math.min(rect.left, window.innerWidth - 200) : 60, y: rect?.top ?? 200 });
    }, 600);
  };
  const handleMsgHoldEnd = () => { if (holdRef.current) clearTimeout(holdRef.current); };

  const deleteForMe = (id: number) => {
    setMsgs(m => m.map(msg => msg.id === id ? { ...msg, type: "deleted_me" as MsgType, text: "" } : msg));
    setMsgMenu(null);
  };
  const deleteForAll = (id: number) => {
    setMsgs(m => m.map(msg => msg.id === id ? { ...msg, type: "deleted_all" as MsgType, text: "Сообщение удалено" } : msg));
    setMsgMenu(null);
  };

  const bgStyle: React.CSSProperties = wallpaper.id === "none" ? {} : {
    backgroundImage: wallpaper.value,
    backgroundSize: wallpaper.id === "dots" ? "20px 20px" : "cover",
  };

  if (inCall) return <CallScreen chat={chat} theme={theme} onEnd={() => setInCall(false)} />;

  const renderMsgContent = (msg: Message) => {
    if (msg.type === "deleted_me") return <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Удалено</span>;
    if (msg.type === "deleted_all") return <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>🚫 Сообщение удалено</span>;
    if (msg.type === "voice") return <VoiceMessage duration={msg.duration ?? 5} out={msg.out} accent1={theme.accent1} />;
    if (msg.type === "video") return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="Video" size={18} style={{ color: "#fff" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{msg.fileName}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{msg.fileSize} · Видео 720p</div>
        </div>
      </div>
    );
    if (msg.type === "file") return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="FileText" size={18} style={{ color: "#fff" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{msg.fileName}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{msg.fileSize}</div>
        </div>
      </div>
    );
    return <span>{msg.text}</span>;
  };

  const canDelete = (msg: Message) => msg.type !== "deleted_me" && msg.type !== "deleted_all";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }} onClick={() => setMsgMenu(null)}>
      {wallpaper.id !== "none" && <div style={{ position: "absolute", inset: 0, ...bgStyle, zIndex: 0 }} />}
      {wallpaper.id !== "none" && <div style={{ position: "absolute", inset: 0, background: "rgba(13,15,26,0.6)", zIndex: 1 }} />}

      {/* Header */}
      <div className="q-glass" style={{ position: "relative", zIndex: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--q-text-muted)", display: "flex", padding: 4 }}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div style={{ position: "relative" }}>
          <AvatarComp initials={chat.avatar} size={38} gradient={theme.gradient} />
          {chat.online && <div className="online-dot" style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, border: "2px solid var(--q-bg)" }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{chat.name}</div>
          <div style={{ fontSize: 11, color: chat.online ? "#22d65a" : "var(--q-text-muted)" }}>{chat.online ? "В сети" : "Не в сети"}</div>
        </div>
        <button onClick={() => setInCall(true)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.accent1, display: "flex" }}>
          <Icon name="Phone" size={18} />
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--q-text-muted)", display: "flex" }}>
          <Icon name="MoreVertical" size={18} />
        </button>
      </div>

      {/* Прогресс загрузки */}
      {uploadProgress !== null && (
        <div style={{ position: "relative", zIndex: 11, padding: "6px 16px" }} className="q-glass">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="Upload" size={14} style={{ color: theme.accent1 }} />
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${uploadProgress}%`, background: theme.gradient, transition: "width 0.1s linear", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--q-text-muted)", minWidth: 32 }}>{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Сообщения */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 5 }}>
        {msgs.map((msg, i) => (
          <div key={msg.id}
            data-msgid={msg.id}
            onMouseDown={canDelete(msg) ? e => handleMsgHoldStart(msg.id, e) : undefined}
            onMouseUp={handleMsgHoldEnd}
            onTouchStart={canDelete(msg) ? e => handleMsgHoldStart(msg.id, e) : undefined}
            onTouchEnd={handleMsgHoldEnd}
            className="anim-fade-slide"
            style={{ display: "flex", justifyContent: msg.out ? "flex-end" : "flex-start", animationDelay: `${i * 0.03}s`, opacity: 0, animationFillMode: "forwards", userSelect: "none" }}>
            <div style={{
              maxWidth: "75%",
              background: (msg.type === "deleted_me" || msg.type === "deleted_all") ? "rgba(255,255,255,0.04)" : msg.out ? theme.gradient : "rgba(255,255,255,0.07)",
              backdropFilter: msg.out ? "none" : "blur(10px)",
              borderRadius: msg.out ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "10px 14px", fontSize: 14, lineHeight: 1.5, color: "#fff",
              border: (msg.type === "deleted_me" || msg.type === "deleted_all") ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              {renderMsgContent(msg)}
              {msg.type !== "deleted_me" && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{msg.time}</span>
                  {msg.out && msg.type !== "deleted_all" && <StatusTick status={msg.status} accent1="#fff" />}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Запись голосового */}
      {isRecording && (
        <div className="q-glass" style={{ position: "relative", zIndex: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderRadius: 0, borderLeft: "none", borderRight: "none", borderBottom: "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "pulse-glow 1s infinite" }} />
          <span style={{ flex: 1, fontWeight: 600, color: "#ef4444" }}>Запись... {recordSecs}с</span>
          <button onClick={stopRecord} style={{ background: theme.gradient, border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="Send" size={18} style={{ color: "#fff" }} />
          </button>
          <button onClick={() => { if (recordRef.current) clearInterval(recordRef.current); setIsRecording(false); setRecordSecs(0); }}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--q-text-muted)" }}>
            <Icon name="X" size={18} />
          </button>
        </div>
      )}

      {/* Ввод */}
      {!isRecording && (
        <div className="q-glass" style={{ position: "relative", zIndex: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", borderRadius: 0, borderLeft: "none", borderRight: "none", borderBottom: "none" }}>
          <button onClick={() => fileRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--q-text-muted)", display: "flex" }}>
            <Icon name="Paperclip" size={20} />
          </button>
          <input ref={fileRef} type="file" accept="*/*" style={{ display: "none" }} onChange={handleFile} />
          <div className="q-glass" style={{ flex: 1, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Написать сообщение..."
              style={{ background: "none", border: "none", outline: "none", color: "var(--q-text)", fontSize: 14, flex: 1, fontFamily: "Golos Text, sans-serif" }} />
          </div>
          {input.trim() ? (
            <button onClick={send} style={{ background: theme.gradient, border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Icon name="Send" size={18} style={{ color: "#fff" }} />
            </button>
          ) : (
            <button onMouseDown={startRecord} onTouchStart={startRecord}
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: theme.accent1 }}>
              <Icon name="Mic" size={18} />
            </button>
          )}
        </div>
      )}

      {/* Контекстное меню сообщения */}
      {msgMenu && (() => {
        const msg = msgs.find(m => m.id === msgMenu.msgId);
        return (
          <div className="q-glass anim-scale" style={{ position: "fixed", top: msgMenu.y, left: msgMenu.x, zIndex: 200, borderRadius: 16, overflow: "hidden", minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "10px 16px 6px", fontSize: 11, color: "var(--q-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Сообщение</div>
            <div onClick={() => deleteForMe(msgMenu.msgId)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#e78" }}
              className="q-glass-hover">
              <Icon name="EyeOff" size={15} />
              <span style={{ fontWeight: 500 }}>Удалить у меня</span>
            </div>
            {msg?.out && (
              <div onClick={() => deleteForAll(msgMenu.msgId)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#ef4444" }}
                className="q-glass-hover">
                <Icon name="Trash2" size={15} />
                <span style={{ fontWeight: 500 }}>Удалить у всех</span>
              </div>
            )}
            <div style={{ height: 1, background: "var(--q-border)" }} />
            <div onClick={() => setMsgMenu(null)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "var(--q-text-muted)" }}
              className="q-glass-hover">
              <Icon name="X" size={15} />
              <span style={{ fontWeight: 500 }}>Отмена</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ============================================================
   ЭКРАН ЗВОНКА
   ============================================================ */
function CallScreen({ chat, theme, onEnd }: { chat: Chat; theme: Theme; onEnd: () => void }) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ height: "100%", background: theme.bg, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {/* Фон */}
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-20%", width: "80%", height: "80%", background: `radial-gradient(circle, ${theme.accent1}33 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-20%", width: "80%", height: "80%", background: `radial-gradient(circle, ${theme.accent2}33 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center", gap: 16 }}>
        <div style={{ width: 110, height: 110, borderRadius: "50%", background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800, color: "#fff", boxShadow: `0 0 0 8px ${theme.accent1}22, 0 0 0 16px ${theme.accent1}11`, animation: "pulse-glow 2s infinite" }}>
          {chat.avatar}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{chat.name}</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{fmt(secs)}</div>
        </div>
      </div>
      {/* Кнопки */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 20, padding: "0 0 48px" }}>
        <button onClick={() => setMuted(m => !m)} style={{ background: muted ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: 4 }}>
          <Icon name={muted ? "MicOff" : "Mic"} size={22} style={{ color: "#fff" }} />
        </button>
        <button onClick={onEnd} style={{ background: "#ef4444", border: "none", borderRadius: "50%", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="PhoneOff" size={28} style={{ color: "#fff" }} />
        </button>
        <button onClick={() => setSpeaker(s => !s)} style={{ background: speaker ? `${theme.accent1}44` : "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name={speaker ? "Volume2" : "Volume1"} size={22} style={{ color: "#fff" }} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ВСЕ ЧАТЫ
   ============================================================ */
function ChatsTab({ chats, onOpenChat, theme }: { chats: Chat[]; onOpenChat: (c: Chat) => void; theme: Theme }) {
  const [filter, setFilter] = useState<string | null>(null);
  const allTags = Array.from(new Set(chats.flatMap(c => c.tags)));
  const filtered = filter ? chats.filter(c => c.tags.includes(filter)) : chats;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 20px 12px" }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>Все диалоги</div>
        <div style={{ fontSize: 12, color: "var(--q-text-muted)", marginTop: 2 }}>{chats.length} активных</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 20px 14px", overflowX: "auto" }}>
        <button onClick={() => setFilter(null)} style={{ background: filter === null ? theme.gradient : "var(--q-surface)", border: "1px solid var(--q-border)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: filter === null ? "#fff" : "var(--q-text-muted)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Golos Text, sans-serif" }}>Все</button>
        {allTags.map(tag => (
          <button key={tag} onClick={() => setFilter(tag === filter ? null : tag)} style={{ background: filter === tag ? theme.gradient : TAG_COLORS[tag] || "var(--q-surface)", border: "1px solid var(--q-border)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: filter === tag ? "#fff" : "var(--q-text)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Golos Text, sans-serif" }}>{tag}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        {filtered.map((chat, i) => (
          <div key={chat.id} onClick={() => onOpenChat(chat)} className="q-glass-hover anim-fade-slide" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, cursor: "pointer", marginBottom: 4, animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: "forwards" }}>
            <div style={{ position: "relative" }}>
              <AvatarComp initials={chat.avatar} gradient={theme.gradient} />
              {chat.online && <div className="online-dot" style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, border: "2px solid var(--q-bg)" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{chat.name}</span>
                <span style={{ fontSize: 11, color: "var(--q-text-muted)" }}>{chat.time}</span>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {chat.tags.map(t => (
                  <span key={t} style={{ background: TAG_COLORS[t] || "var(--q-surface)", borderRadius: 8, padding: "2px 8px", fontSize: 11, color: "var(--q-text-muted)" }}>{t}</span>
                ))}
              </div>
            </div>
            {chat.unread > 0 && (
              <div style={{ background: theme.gradient, borderRadius: 12, minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", padding: "0 5px" }}>{chat.unread}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   КОНТАКТЫ
   ============================================================ */
function ContactsTab({ theme }: { theme: Theme }) {
  const [search, setSearch] = useState("");
  const filtered = CONTACTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Контакты</div>
          <div style={{ fontSize: 12, color: "var(--q-text-muted)", marginTop: 2 }}>{CONTACTS.length} человек</div>
        </div>
        <button style={{ background: theme.gradient, border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="UserPlus" size={18} style={{ color: "#fff" }} />
        </button>
      </div>
      <div style={{ padding: "0 20px 12px" }}>
        <div className="q-glass" style={{ borderRadius: 14, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
          <Icon name="Search" size={16} style={{ color: "var(--q-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ background: "none", border: "none", outline: "none", color: "var(--q-text)", fontSize: 14, flex: 1, fontFamily: "Golos Text, sans-serif" }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        {filtered.map((contact, i) => (
          <div key={contact.id} className="q-glass-hover anim-fade-slide" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, cursor: "pointer", marginBottom: 4, animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: "forwards" }}>
            <div style={{ position: "relative" }}>
              <AvatarComp initials={contact.avatar} gradient={theme.gradient} />
              {contact.online && <div className="online-dot" style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, border: "2px solid var(--q-bg)" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{contact.name}</div>
              <div style={{ fontSize: 12, color: "var(--q-text-muted)", marginTop: 1 }}>{contact.tag}</div>
              <div style={{ fontSize: 11, color: contact.online ? "#22d65a" : "var(--q-text-muted)", marginTop: 1 }}>{contact.status}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="q-glass" style={{ border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--q-text-muted)" }}><Icon name="MessageCircle" size={16} /></button>
              <button className="q-glass" style={{ border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--q-text-muted)" }}><Icon name="Phone" size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ЗВОНКИ
   ============================================================ */
function CallsTab({ theme }: { theme: Theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Звонки</div>
          <div style={{ fontSize: 12, color: "var(--q-text-muted)", marginTop: 2 }}>История</div>
        </div>
        <button style={{ background: theme.gradient, border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="PhonePlus" size={18} style={{ color: "#fff" }} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        {CALLS.map((call, i) => {
          const isIn = call.type === "in"; const isMissed = call.type === "missed";
          return (
            <div key={call.id} className="q-glass-hover anim-fade-slide" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, cursor: "pointer", marginBottom: 4, animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: "forwards" }}>
              <AvatarComp initials={call.avatar} gradient={theme.gradient} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: isMissed ? "#ef4444" : "var(--q-text)" }}>{call.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <Icon name={isMissed ? "PhoneMissed" : isIn ? "PhoneIncoming" : "PhoneOutgoing"} size={13} style={{ color: isMissed ? "#ef4444" : isIn ? "#22d65a" : theme.accent1 }} />
                  <span style={{ fontSize: 12, color: "var(--q-text-muted)" }}>{call.time}</span>
                  {call.duration && <span style={{ fontSize: 12, color: "var(--q-text-muted)" }}>· {call.duration}</span>}
                </div>
              </div>
              <button className="q-glass" style={{ border: "none", borderRadius: 11, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="Phone" size={16} style={{ color: theme.accent1 }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   ПРОФИЛЬ
   ============================================================ */
function ProfileTab({ theme, verifyStyle }: { theme: Theme; verifyStyle: VerifyStyle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "32px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", boxShadow: `0 0 0 3px var(--q-bg), 0 0 0 5px ${theme.accent1}` }}>ВС</div>
          <button style={{ position: "absolute", bottom: 0, right: 0, background: theme.gradient, border: "2px solid var(--q-bg)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="Camera" size={13} style={{ color: "#fff" }} />
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            Виктор Самойлов
            <VerifyBadge style={verifyStyle} />
          </div>
          <div style={{ fontSize: 13, color: theme.accent1, marginTop: 2, fontWeight: 600 }}>@v_samoilov</div>
          <div style={{ fontSize: 13, color: "var(--q-text-muted)", marginTop: 6 }}>Разработчик. Кофе. Код. Мемы 🚀</div>
        </div>
        <button style={{ background: theme.gradient, border: "none", borderRadius: 14, padding: "9px 24px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "Golos Text, sans-serif" }}>Редактировать профиль</button>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 20px 20px" }}>
        {[{ label: "Чатов", val: "23" }, { label: "Контактов", val: "147" }, { label: "Медиа", val: "1.2K" }].map(s => (
          <div key={s.label} className="q-glass" style={{ flex: 1, borderRadius: 16, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, background: theme.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--q-text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        {[{ icon: "Bell", label: "Уведомления" }, { icon: "Lock", label: "Приватность" }, { icon: "HardDrive", label: "Хранилище" }, { icon: "HelpCircle", label: "Помощь" }, { icon: "LogOut", label: "Выйти" }].map((item, i) => (
          <div key={item.label} className="q-glass q-glass-hover anim-fade-slide" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, cursor: "pointer", animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}>
            <div style={{ background: `${theme.accent1}22`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={item.icon} size={18} style={{ color: theme.accent1 }} />
            </div>
            <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
            <Icon name="ChevronRight" size={16} style={{ color: "var(--q-text-muted)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   НАСТРОЙКИ
   ============================================================ */
function SettingsTab({ theme, setTheme, wallpaper, setWallpaper, verifyStyle, setVerifyStyle }: {
  theme: Theme; setTheme: (t: Theme) => void;
  wallpaper: Wallpaper; setWallpaper: (w: Wallpaper) => void;
  verifyStyle: VerifyStyle; setVerifyStyle: (s: VerifyStyle) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>Настройки</div>
        <div style={{ fontSize: 12, color: "var(--q-text-muted)", marginTop: 2 }}>Персонализация</div>
      </div>

      {/* Галочка верификации */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--q-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>✅ Галочка Qwik</div>
        <div style={{ display: "flex", gap: 10 }}>
          {([["none", "Нет", "rgba(255,255,255,0.08)"], ["blue", "Синяя", "#0ea5e9"], ["black", "Чёрная", "#444"]] as [VerifyStyle, string, string][]).map(([id, label, bg]) => (
            <div key={id} onClick={() => setVerifyStyle(id)}
              style={{ flex: 1, borderRadius: 14, padding: "12px 8px", textAlign: "center", cursor: "pointer", border: `2px solid ${verifyStyle === id ? theme.accent1 : "rgba(255,255,255,0.06)"}`, background: verifyStyle === id ? `${theme.accent1}15` : "rgba(255,255,255,0.04)", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                {id === "none" ? (
                  <Icon name="X" size={18} style={{ color: "var(--q-text-muted)" }} />
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="Check" size={12} style={{ color: "#fff" }} />
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: verifyStyle === id ? "var(--q-text)" : "var(--q-text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Темы */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--q-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>🎨 Тема</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {THEMES.map(t => (
            <div key={t.id} onClick={() => setTheme(t)} style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `2px solid ${t.id === theme.id ? t.accent1 : "rgba(255,255,255,0.06)"}`, transition: "all 0.2s", transform: t.id === theme.id ? "scale(1.04)" : "scale(1)" }}>
              <div style={{ height: 52, background: t.gradient }} />
              <div style={{ background: t.bg, padding: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#fff", textAlign: "center" }}>{t.name}</div>
                {t.id === theme.id && <div style={{ width: 20, height: 3, background: t.gradient, borderRadius: 2, margin: "4px auto 0" }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Обои */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--q-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>🖼 Обои чата</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {WALLPAPERS.map(w => (
            <div key={w.id} onClick={() => setWallpaper(w)} style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", border: `2px solid ${w.id === wallpaper.id ? theme.accent1 : "rgba(255,255,255,0.06)"}`, transition: "all 0.2s" }}>
              <div style={{ height: 60, background: w.preview, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {w.id === wallpaper.id && <Icon name="Check" size={20} style={{ color: "#fff", filter: "drop-shadow(0 0 4px rgba(0,0,0,0.5))" }} />}
              </div>
              <div style={{ background: "var(--q-surface)", padding: "6px 8px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--q-text)", textAlign: "center" }}>{w.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--q-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px", padding: "0 4px" }}>⚙️ Основные</div>
        {[{ label: "Уведомления", desc: "Звук и вибрация" }, { label: "Язык", desc: "Русский" }, { label: "Шрифт", desc: "Golos Text" }, { label: "Конфиденциальность", desc: "Настройки приватности" }].map(item => (
          <div key={item.label} className="q-glass q-glass-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 14, cursor: "pointer", marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--q-text-muted)", marginTop: 1 }}>{item.desc}</div>
            </div>
            <Icon name="ChevronRight" size={16} style={{ color: "var(--q-text-muted)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ГЛАВНЫЙ КОМПОНЕНТ
   ============================================================ */
type Tab = "home" | "chats" | "contacts" | "profile" | "settings" | "calls";

export default function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [openChat, setOpenChat] = useState<Chat | null>(null);
  const [theme, setThemeState] = useState<Theme>(THEMES[0]);
  const [wallpaper, setWallpaper] = useState<Wallpaper>(WALLPAPERS[1]);
  const [chats, setChats] = useState<Chat[]>(INIT_CHATS);
  const [stories, setStories] = useState<Story[]>(INIT_STORIES);
  const [viewStory, setViewStory] = useState<Story | null>(null);
  const [verifyStyle, setVerifyStyle] = useState<VerifyStyle>("blue");

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.style.setProperty("--q-bg", t.bg);
    document.documentElement.style.setProperty("--q-accent1", t.accent1);
    document.documentElement.style.setProperty("--q-accent2", t.accent2);
    document.documentElement.style.setProperty("--q-accent3", t.accent3);
    document.documentElement.style.setProperty("--q-gradient", t.gradient);
    setThemeState(t);
  }, []);

  const deleteChat = (id: number) => {
    setChats(c => c.filter(ch => ch.id !== id));
    if (openChat?.id === id) setOpenChat(null);
  };

  const handleViewStory = (s: Story) => {
    setStories(st => st.map(x => x.id === s.id ? { ...x, seen: true } : x));
    setViewStory(s);
  };

  const deleteStory = (id: number) => {
    setStories(st => st.filter(s => s.id !== id));
    setViewStory(null);
  };

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: "home", icon: "Home", label: "Главная" },
    { id: "chats", icon: "MessageSquare", label: "Чаты" },
    { id: "contacts", icon: "Users", label: "Контакты" },
    { id: "calls", icon: "Phone", label: "Звонки" },
    { id: "profile", icon: "User", label: "Профиль" },
    { id: "settings", icon: "Settings2", label: "Настройки" },
  ];

  const unreadTotal = chats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div style={{ width: "100vw", height: "100dvh", background: theme.bg, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Golos Text, sans-serif" }}>
      {/* Фоновые блобы */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", background: `radial-gradient(circle, ${theme.accent1}22 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", transition: "background 0.5s ease" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%", background: `radial-gradient(circle, ${theme.accent2}22 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", transition: "background 0.5s ease" }} />
      </div>

      {/* Просмотр статуса */}
      {viewStory && <StoryView story={viewStory} onClose={() => setViewStory(null)} onDelete={deleteStory} theme={theme} />}

      {/* Приложение */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 430, height: "100dvh", maxHeight: 900, display: "flex", flexDirection: "column", background: `${theme.bg}cc`, backdropFilter: "blur(30px)", overflow: "hidden", boxShadow: "0 0 80px rgba(0,0,0,0.6)" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {openChat ? (
            <ChatView chat={openChat} onBack={() => setOpenChat(null)} theme={theme} wallpaper={wallpaper} />
          ) : (
            <div key={tab} className="anim-fade" style={{ height: "100%", overflowY: "auto" }}>
              {tab === "home" && <HomeTab chats={chats} onOpenChat={setOpenChat} onDeleteChat={deleteChat} theme={theme} stories={stories} onViewStory={handleViewStory} verifyStyle={verifyStyle} />}
              {tab === "chats" && <ChatsTab chats={chats} onOpenChat={setOpenChat} theme={theme} />}
              {tab === "contacts" && <ContactsTab theme={theme} />}
              {tab === "calls" && <CallsTab theme={theme} />}
              {tab === "profile" && <ProfileTab theme={theme} verifyStyle={verifyStyle} />}
              {tab === "settings" && <SettingsTab theme={theme} setTheme={applyTheme} wallpaper={wallpaper} setWallpaper={setWallpaper} verifyStyle={verifyStyle} setVerifyStyle={setVerifyStyle} />}
            </div>
          )}
        </div>

        {/* Нижняя навигация */}
        {!openChat && (
          <div style={{ background: "rgba(13,15,26,0.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 4px 12px", display: "flex", justifyContent: "space-around" }}>
            {navItems.map(item => (
              <div key={item.id} className={`q-nav-item${tab === item.id ? " active" : ""}`} onClick={() => setTab(item.id)}>
                <div style={{ position: "relative" }}>
                  <Icon name={item.icon} size={22} style={{ color: tab === item.id ? theme.accent1 : "var(--q-text-muted)", transition: "color 0.2s" }} />
                  {item.id === "home" && unreadTotal > 0 && (
                    <div style={{ position: "absolute", top: -4, right: -6, background: theme.gradient, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>
                      {unreadTotal > 99 ? "99+" : unreadTotal}
                    </div>
                  )}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}