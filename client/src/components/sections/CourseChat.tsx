import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, Copy, MessageCircle, QrCode, ReceiptText, RotateCcw, SendHorizontal, Smartphone, X } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { API_URL } from '@/lib/api';
import { qrSvgPath } from '@/lib/qr';
import { coursePrice, formatRupees, type Course } from '@/data/courses';

type Copy = Record<string, string>;
type Step = 'name' | 'course' | 'utr' | 'phone' | 'saving' | 'done' | 'failed' | 'nopay';
type Picked = { id: string; title: string; price: number };
type Msg =
  | { id: number; from: 'bot' | 'user'; type: 'text'; text: string }
  | { id: number; from: 'bot'; type: 'qr'; amount: number; course: string; ref?: string }
  | { id: number; from: 'bot'; type: 'whatsapp'; href: string };
type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never;
type NewMsg = WithoutId<Msg>;
type Saved = { v: 2; at: number; step: Step; msgs: Msg[]; name: string; course: Picked | null; utr: string; phone: string; session?: string; orderRef?: string };

// The chat survives a reload or the phone switching to the UPI app and back (mobile browsers often reload the tab).
const STORE_KEY = 'clyx_course_chat_v2';
const STORE_TTL_MS = 12 * 60 * 60 * 1000;

function loadSaved(): Saved | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null') as Saved | null;
    return saved?.v === 2 && Date.now() - saved.at < STORE_TTL_MS && Array.isArray(saved.msgs) ? saved : null;
  } catch {
    return null;
  }
}

function store(saved: Omit<Saved, 'v' | 'at'>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ v: 2, at: Date.now(), ...saved }));
  } catch {
    // storage unavailable: the chat just starts over after a reload
  }
}

/** One finished purchase in this browser, listed under "Your purchases" (the order ID is never shown). */
type Purchase = { title: string; amount: number; utr: string; status: 'saved' | 'pending' };
/** A finished chat (paid, failed to save, or no payment set up), kept so the buyer can scroll back through it. */
type Session = { id: string; at: number; msgs: Msg[]; purchase?: Purchase };
type History = { v: 1; name: string; sessions: Session[] };

// Past chats and purchases stay much longer than the in-progress chat above.
const HISTORY_KEY = 'clyx_course_history_v1';
const HISTORY_TTL_MS = 365 * 24 * 60 * 60 * 1000;
const HISTORY_MAX = 20;
const emptyHistory = (): History => ({ v: 1, name: '', sessions: [] });

function loadHistory(): History {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || 'null') as History | null;
    if (saved?.v !== 1 || !Array.isArray(saved.sessions)) return emptyHistory();
    return { ...saved, sessions: saved.sessions.filter((x) => x && Array.isArray(x.msgs) && Date.now() - x.at < HISTORY_TTL_MS) };
  } catch {
    return emptyHistory();
  }
}

function storeHistory(history: History) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // storage full or blocked: history just is not kept
  }
}

// No 0/O or 1/I, same as the backend, so an order ID read out over the phone is never misheard.
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** A new order ID such as "CLX-7KQ2M9". Made before the QR is shown so it can travel in the UPI payment note. */
function newOrderRef() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `CLX-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('')}`;
}
const newSessionId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const when = (at: number) =>
  new Date(at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/**
 * The order ID lives only in the database and the admin panel. Older saved copy still mentions it ("Order ID: {ref}"),
 * so that part, and any other line with {ref}, is taken out before a message is shown or sent to WhatsApp.
 */
function withoutOrderId(template: string) {
  return template
    .split('\n')
    .flatMap((line) => {
      if (!line.includes('{ref}')) return [line];
      const rest = line.replace(/[ \t]*order\s*id\s*:?\s*\{ref\}\.?/gi, '');
      // A line that held only the order ID goes away entirely, so no blank line is left behind.
      return rest.trim() && !rest.includes('{ref}') ? [rest.trimEnd()] : [];
    })
    .join('\n')
    .trim();
}

/** Fills {name}, {course}… in a message. Lines whose placeholder has no value are dropped (e.g. no UTR yet). */
function fill(template: string, values: Record<string, string>) {
  return template
    .split('\n')
    .filter((line) => !Array.from(line.matchAll(/\{(\w+)\}/g)).some(([, key]) => key in values && !values[key]))
    .map((line) => line.replace(/\{(\w+)\}/g, (all, key) => (key in values ? values[key] : all)))
    .join('\n');
}

/**
 * The UPI payment request behind the QR and the "Pay with UPI app" button. The order ID goes in the payment note
 * (`tn`), which the receiving UPI app shows next to the payment, so the team can match it to the order in the admin.
 * (`tr` is left out on purpose: several UPI apps refuse it for personal, non-merchant UPI IDs.)
 */
function upiLink(upiId: string, payee: string, amount: number, ref?: string) {
  const q = (v: string) => encodeURIComponent(v).replace(/%40/g, '@');
  const note = ref ? `${ref} CLYX Course` : 'CLYX Course';
  return `upi://pay?pa=${q(upiId)}&pn=${q(payee || 'CLYX Media')}&am=${amount.toFixed(2)}&cu=INR&tn=${q(note)}`;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type SaveResult = { ok: true } | { ok: false; status: number; error?: string };

/** Saves the order, retrying network failures and server errors (a sleeping free backend can take ~50s to wake). */
async function postOrder(body: Record<string, unknown>): Promise<SaveResult> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const timeout = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(attempt === 0 ? 60_000 : 25_000) : undefined;
      const res = await fetch(`${API_URL}/api/public/course-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: timeout,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { ok: true };
      if (res.status >= 400 && res.status < 500 && res.status !== 429) return { ok: false, status: res.status, error: data.error };
    } catch {
      // network error or timeout: retry
    }
    if (attempt < 2) await wait(1500 * (attempt + 1));
  }
  return { ok: false, status: 0 };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="cc-copy"
      onClick={async () => {
        if (await copyText(value)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      <span className="cc-copy-state">{done ? 'Copied' : <Copy size={12} />}</span>
    </button>
  );
}

/** The payment card: QR with the exact amount (or the uploaded QR image), the UPI ID, and a pay button on phones. */
function QrCard({ msg, c }: { msg: Extract<Msg, { type: 'qr' }>; c: Copy }) {
  const upiId = (c.upiId || '').trim();
  const link = upiId ? upiLink(upiId, c.upiName, msg.amount, msg.ref) : '';
  const qr = useMemo(() => (link ? qrSvgPath(link, 3) : null), [link]);
  return (
    <div className="cc-qr">
      <div className="cc-qr-code">
        {qr ? (
          <svg viewBox={`0 0 ${qr.size} ${qr.size}`} role="img" aria-label={`UPI QR code to pay ${formatRupees(msg.amount)}`} shapeRendering="crispEdges">
            <rect width={qr.size} height={qr.size} fill="#fff" />
            <path d={qr.path} fill="#050505" />
          </svg>
        ) : (
          c.qrImage && <img src={c.qrImage} alt="UPI QR code" />
        )}
      </div>
      <p className="cc-qr-amount">{formatRupees(msg.amount)}</p>
      <p className="cc-qr-course">{msg.course}</p>
      <div className="cc-qr-rows">
        {upiId && <CopyChip label="UPI ID" value={upiId} />}
      </div>
      {link && (
        <a href={link} className="cc-qr-pay">
          <Smartphone size={16} /> {c.chatPayButton}
        </a>
      )}
      {c.chatPayMobile && <p className="cc-qr-hint">{c.chatPayMobile}</p>}
    </div>
  );
}

/** "Your purchases": every course bought from this browser, newest first. */
function PurchaseList({ sessions, c }: { sessions: Session[]; c: Copy }) {
  const bought = sessions.filter((x) => x.purchase).reverse();
  if (!bought.length) return null;
  return (
    <section className="cc-history" aria-label={c.chatHistoryTitle}>
      <p className="cc-history-title"><ReceiptText size={14} aria-hidden="true" />{c.chatHistoryTitle}</p>
      <ul>
        {bought.map(({ id, at, purchase }) => (
          <li key={id}>
            <span className="cc-history-text">
              <strong>{purchase!.title}</strong>
              <small>{fill(c.chatHistoryMeta, { utr: purchase!.utr, date: when(at) })}</small>
            </span>
            <span className="cc-history-side">
              <b>{formatRupees(purchase!.amount)}</b>
              <em className={purchase!.status === 'saved' ? 'is-saved' : 'is-pending'}>{purchase!.status === 'saved' ? c.chatHistorySaved : c.chatHistoryPending}</em>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Divider({ label }: { label: string }) {
  return <p className="cc-divider"><span>{label}</span></p>;
}

const typingDelay = (msg: NewMsg) => (msg.type === 'text' ? Math.min(1100, 380 + msg.text.length * 10) : 700);

/**
 * Checkout chat for the Courses page. It slides in from the right, asks the buyer's name, lets them pick a course,
 * shows a UPI QR for the exact price, takes the UTR / transaction ID and WhatsApp number, saves the order, and hands
 * the buyer over to the team on WhatsApp with everything prefilled. No payment gateway or paid service is involved.
 */
export default function CourseChat({ open, onClose, courses, preferredId, content: c, logo }: { open: boolean; onClose: () => void; courses: Course[]; preferredId?: string; content: Copy; logo?: string }) {
  const reduce = useReducedMotion();
  const [saved] = useState(loadSaved);
  const [msgs, setMsgs] = useState<Msg[]>(saved?.msgs ?? []);
  const [step, setStep] = useState<Step>(saved?.step ?? 'name');
  const [name, setName] = useState(saved?.name ?? '');
  const [course, setCourse] = useState<Picked | null>(saved?.course ?? null);
  const [utr, setUtr] = useState(saved?.utr ?? '');
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [orderRef, setOrderRef] = useState(saved?.orderRef ?? '');
  const [session, setSession] = useState(() => saved?.session ?? newSessionId());
  const [history, setHistory] = useState(loadHistory);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const nextId = useRef(msgs.reduce((max, m) => Math.max(max, m.id), 0) + 1);
  const timers = useRef<number[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const started = useRef(msgs.length > 0);
  const warmed = useRef(false);

  const whatsappNumber = (c.whatsappNumber || '').replace(/\D/g, '');
  const hasPayment = !!((c.upiId || '').trim() || c.qrImage);

  useEffect(() => store({ step: step === 'saving' ? 'phone' : step, msgs, name, course, utr, phone, session, orderRef }), [step, msgs, name, course, utr, phone, session, orderRef]);
  useEffect(() => storeHistory(history), [history]);

  // A finished chat (and its purchase) goes into the history, so "Buy another course" never loses it. Re-running for
  // the same chat (a retry that then saves) just updates its entry.
  useEffect(() => {
    if (typing || !msgs.length || (step !== 'done' && step !== 'failed' && step !== 'nopay')) return;
    const purchase: Purchase | undefined =
      course && utr && step !== 'nopay' ? { title: course.title, amount: course.price, utr, status: step === 'done' ? 'saved' : 'pending' } : undefined;
    setHistory((h) => {
      const entry: Session = { id: session, at: h.sessions.find((x) => x.id === session)?.at ?? Date.now(), msgs, purchase };
      const sessions = [...h.sessions.filter((x) => x.id !== session), entry].slice(-HISTORY_MAX);
      return { v: 1, name: name || h.name, sessions };
    });
  }, [step, typing, msgs, course, utr, name, session]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const add = useCallback((msg: NewMsg) => setMsgs((list) => [...list, { ...msg, id: nextId.current++ } as Msg]), []);

  /** Bot messages appear one after another with a typing indicator, then the chat moves to `next`. */
  const say = useCallback(
    (items: NewMsg[], next: Step) => {
      setTyping(true);
      let at = 0;
      items.forEach((item, i) => {
        at += reduce ? 120 : i === 0 ? 450 : typingDelay(item);
        timers.current.push(
          window.setTimeout(() => {
            add(item);
            if (i === items.length - 1) {
              setTyping(false);
              setStep(next);
            }
          }, at),
        );
      });
    },
    [add, reduce],
  );

  const text = (t: string): NewMsg => ({ from: 'bot', type: 'text', text: t });
  const whatsapp = (values: Record<string, string>): NewMsg => ({
    from: 'bot',
    type: 'whatsapp',
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fill(withoutOrderId(c.chatWhatsappMessage), values))}`,
  });

  const begin = useCallback(
    (knownName: string) => {
      // The chat that just ended is already in the history (shown above), so the new one starts empty.
      setMsgs([]);
      setSession(newSessionId());
      setOrderRef('');
      setCourse(null);
      setUtr('');
      setPhone('');
      if (knownName) say([text(fill(c.chatWelcomeBack, { name: knownName })), text(c.chatAskCourse)], 'course');
      else say([text(c.chatHello), text(c.chatAskName)], 'name');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say, c],
  );

  // First open: greet, and wake the backend early (a free instance sleeps) so saving the order later is quick.
  useEffect(() => {
    if (!open) return;
    if (!warmed.current) {
      warmed.current = true;
      fetch(`${API_URL}/health`).catch(() => {});
    }
    if (!started.current) {
      started.current = true;
      begin(history.name);
      if (history.name) setName(history.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, begin]);

  // Esc closes; the page behind does not scroll while the chat is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = before;
    };
  }, [open, onClose]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [msgs, typing, step, reduce]);

  const needsInput = step === 'name' || step === 'utr' || step === 'phone';
  useEffect(() => {
    if (open && needsInput && !typing) inputRef.current?.focus({ preventScroll: true });
  }, [open, needsInput, typing]);

  const amountText = course ? formatRupees(course.price) : '';

  const submit = useCallback(
    async (order: { name: string; course: Picked; utr: string; phone: string; ref: string }) => {
      setStep('saving');
      setTyping(true);
      const result = await postOrder({
        name: order.name,
        phone: order.phone,
        courseId: order.course.id,
        courseTitle: order.course.title,
        amount: order.course.price,
        paymentRef: order.utr,
        ref: order.ref || undefined,
      });
      setTyping(false);
      const values = { name: order.name, course: order.course.title, amount: formatRupees(order.course.price), utr: order.utr };
      if (result.ok) {
        say([text(fill(withoutOrderId(c.chatSaved), values)), text(c.chatDone), whatsapp(values)], 'done');
      } else if (result.status === 409) {
        say([text(c.chatDuplicate)], 'utr');
      } else if (result.status === 400) {
        say([text(result.error || c.chatBadUtrLength), text(c.chatAskUtr)], 'utr');
      } else {
        say([text(c.chatSaveError), whatsapp(values)], 'failed');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say, c, whatsappNumber],
  );

  const pick = (item: Course) => {
    if (typing || step !== 'course') return;
    const picked = { id: item.id, title: item.title, price: coursePrice(item) };
    add({ from: 'user', type: 'text', text: `${item.title} · ${formatRupees(picked.price)}` });
    setCourse(picked);
    // One order ID per purchase; changing the course keeps it. It rides along in the QR's payment note.
    const ref = orderRef || newOrderRef();
    setOrderRef(ref);
    if (!hasPayment) {
      say([text(c.chatNoPayment), whatsapp({ name, course: picked.title, amount: formatRupees(picked.price), utr: '' })], 'nopay');
      return;
    }
    say(
      [
        { from: 'bot', type: 'qr', amount: picked.price, course: picked.title, ref },
        text(fill(c.chatPay, { amount: formatRupees(picked.price), course: picked.title })),
        text(c.chatAskUtr),
      ],
      'utr',
    );
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || typing || !needsInput) return;
    setDraft('');
    add({ from: 'user', type: 'text', text: value });
    if (step === 'name') {
      const clean = value.replace(/\s+/g, ' ').slice(0, 60);
      // At least two letters (Latin or Devanagari), so "a" or "123" is asked again.
      if (clean.replace(/[^A-Za-zÀ-ɏऀ-ॿ]/g, '').length < 2) return say([text(c.chatBadName)], 'name');
      setName(clean);
      say([text(fill(c.chatWelcome, { name: clean })), text(c.chatAskCourse)], 'course');
    } else if (step === 'utr') {
      // The UTR / UPI Ref No is always 12 digits; spaces and dashes copied along with it are fine.
      const id = value.replace(/[\s-]+/g, '');
      if (!/^\d{12}$/.test(id)) return say([text(c.chatBadUtrLength)], 'utr');
      setUtr(id);
      say([text(c.chatAskPhone)], 'phone');
    } else if (step === 'phone') {
      const number = value.replace(/[\s()-]/g, '');
      if (!/^\+?\d{10,15}$/.test(number)) return say([text(c.chatBadPhone)], 'phone');
      setPhone(number);
      if (course) void submit({ name, course, utr, phone: number, ref: orderRef });
    }
  };

  // A reload while saving: send the same order again (the backend treats a repeat as the same order).
  const resumed = useRef(false);
  useEffect(() => {
    if (!open || resumed.current) return;
    resumed.current = true;
    if (saved?.step === 'phone' && saved.phone && saved.course && saved.utr) {
      void submit({ name: saved.name, course: saved.course, utr: saved.utr, phone: saved.phone, ref: saved.orderRef ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The course the visitor clicked "Purchase" on is offered first.
  const options = useMemo(() => {
    const list = courses.filter((item) => item.title);
    const i = list.findIndex((item) => item.id === preferredId);
    return i > 0 ? [list[i], ...list.slice(0, i), ...list.slice(i + 1)] : list;
  }, [courses, preferredId]);

  const placeholder = step === 'name' ? c.chatNamePlaceholder : step === 'utr' ? c.chatUtrPlaceholder : step === 'phone' ? c.chatPhonePlaceholder : step === 'course' ? c.chatPickHint : '';
  const chips: { label: string; icon: typeof RotateCcw; run: () => void }[] = [];
  if (!typing && (step === 'utr' || step === 'phone') && course) chips.push({ label: c.chatChange, icon: ArrowLeftRight, run: () => say([text(c.chatAskCourse)], 'course') });
  if (!typing && step === 'failed' && course) chips.push({ label: c.chatRetry, icon: RotateCcw, run: () => void submit({ name, course, utr, phone, ref: orderRef }) });
  if (!typing && (step === 'done' || step === 'failed' || step === 'nopay')) chips.push({ label: c.chatRestart, icon: RotateCcw, run: () => begin(name) });

  const bubble = reduce ? {} : { initial: { opacity: 0, y: 10, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const } };

  // Earlier chats from this browser, oldest first. The current chat is drawn live below them, not from the history.
  const past = history.sessions.filter((x) => x.id !== session);

  /** One message. In an old chat the QR becomes a one-line note, so nobody pays for an old order by mistake. */
  const renderMsg = (m: Msg, key: string, old: boolean) =>
    m.type === 'qr' ? (
      old ? (
        <div key={key} className="cc-row is-bot">
          <p className="cc-bubble cc-qr-note"><QrCode size={14} aria-hidden="true" /> {fill(c.chatQrNote, { amount: formatRupees(m.amount), course: m.course })}</p>
        </div>
      ) : (
        <motion.div key={key} className="cc-row is-bot" {...bubble}>
          <QrCard msg={m} c={c} />
        </motion.div>
      )
    ) : m.type === 'whatsapp' ? (
      <motion.div key={key} className="cc-row is-bot" {...(old ? {} : bubble)}>
        <a href={m.href} target="_blank" rel="noreferrer" className="cc-wa">
          <MessageCircle size={18} /> {c.chatWhatsappButton}
        </a>
      </motion.div>
    ) : (
      <motion.div key={key} className={`cc-row ${m.from === 'bot' ? 'is-bot' : 'is-user'}`} {...(old ? {} : bubble)}>
        <p className="cc-bubble">{m.text}</p>
      </motion.div>
    );

  // Portalled to <body>: the page content sits in a transformed reveal wrapper, which would trap a fixed panel.
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="cc-root">
          <motion.div className="cc-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
          <motion.aside
            className="cc-panel"
            role="dialog"
            aria-modal="true"
            aria-label={c.chatTitle}
            initial={reduce ? { opacity: 0 } : { x: '104%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '104%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }}
          >
            <header className="cc-head">
              <span className="cc-avatar">
                <BrandLogo size={40} src={logo} />
                <span className="cc-online" aria-hidden="true" />
              </span>
              <div className="cc-head-text">
                <strong>{c.chatTitle}</strong>
                <small>{typing ? c.chatTyping || 'typing…' : c.chatStatus}</small>
              </div>
              <button type="button" className="cc-close" onClick={onClose} aria-label="Close chat">
                <X size={18} />
              </button>
            </header>

            <div ref={bodyRef} className="cc-body" aria-live="polite">
              <PurchaseList sessions={history.sessions} c={c} />
              {past.map((x) => (
                <div key={x.id} className="cc-past">
                  <Divider label={fill(c.chatEarlier, { date: when(x.at) })} />
                  {x.msgs.map((m) => renderMsg(m, `${x.id}-${m.id}`, true))}
                </div>
              ))}
              {past.length > 0 && msgs.length > 0 && <Divider label={c.chatNewChat} />}
              {msgs.map((m) => renderMsg(m, String(m.id), false))}
              {step === 'course' && !typing && (
                <motion.div className="cc-options" {...bubble}>
                  {options.map((item) => (
                    <button key={item.id} type="button" className="cc-option" onClick={() => pick(item)}>
                      <span className="cc-option-text">
                        <strong>{item.title}</strong>
                        {item.id === preferredId && options.length > 1 && <small>{c.chatPicked}</small>}
                      </span>
                      <span className="cc-option-price">{formatRupees(coursePrice(item))}</span>
                    </button>
                  ))}
                </motion.div>
              )}
              {typing && (
                <div className="cc-row is-bot">
                  <p className="cc-bubble cc-typing" aria-label={step === 'saving' ? c.chatSaving : 'typing'}>
                    <span />
                    <span />
                    <span />
                  </p>
                </div>
              )}
            </div>

            <footer className="cc-foot">
              {chips.length > 0 && (
                <div className="cc-chips">
                  {chips.map(({ label, icon: Icon, run }) => (
                    <button key={label} type="button" className="cc-chip" onClick={run}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              )}
              <form className="cc-form" onSubmit={send}>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={placeholder || (step === 'saving' ? c.chatSaving : '')}
                  disabled={!needsInput || typing}
                  maxLength={60}
                  inputMode={step === 'phone' ? 'tel' : step === 'utr' ? 'numeric' : 'text'}
                  autoComplete={step === 'name' ? 'name' : step === 'phone' ? 'tel' : 'off'}
                  autoCapitalize={step === 'name' ? 'words' : 'off'}
                  aria-label={placeholder || 'Message'}
                />
                <button type="submit" className="cc-send" disabled={!needsInput || typing || !draft.trim()} aria-label="Send">
                  <SendHorizontal size={18} />
                </button>
              </form>
              {amountText && step !== 'done' && step !== 'nopay' && course && <p className="cc-summary">{course.title} · {amountText}</p>}
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
