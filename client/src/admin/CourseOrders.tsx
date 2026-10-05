import { useEffect, useState } from 'react';
import { Copy, GraduationCap, Loader2, MessageCircle, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Empty } from './ui';

type Status = 'submitted' | 'verified' | 'link_sent' | 'rejected';
type Order = {
  id: string;
  ref: string;
  name: string;
  phone: string;
  courseTitle: string;
  amount: string;
  paymentRef: string;
  status: Status;
  adminNote: string;
  createdAt: string | Date;
};
type OrdersPage = { orders: Order[]; hasMore: boolean; counts: Record<Status, number> };

const STATUS_LABELS: Record<Status, string> = {
  submitted: 'To verify',
  verified: 'Paid · verified',
  link_sent: 'Link sent',
  rejected: 'Rejected',
};
const TABS: (Status | 'all')[] = ['submitted', 'verified', 'link_sent', 'rejected', 'all'];

const when = (d: string | Date) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const rupees = (amount: string) => `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
// Indian numbers are usually typed without the country code.
const waNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
};

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error('Could not copy — select it manually.');
  }
}

function NoteInput({ order, onSave }: { order: Order; onSave: (note: string) => void }) {
  const [value, setValue] = useState(order.adminNote);
  useEffect(() => setValue(order.adminNote), [order.adminNote]);
  return (
    <input
      className="adm-input adm-order-note"
      value={value}
      placeholder="Team note (e.g. link sent by Riya)"
      maxLength={1000}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => value.trim() !== order.adminNote && onSave(value.trim())}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  );
}

/**
 * Orders from the Courses page purchase chat. The team checks each UTR / transaction ID in the UPI app, marks the
 * order verified, sends the class link on WhatsApp (one click opens the buyer's chat) and marks it "Link sent".
 */
export default function CourseOrders() {
  const [status, setStatus] = useState<Status | 'all'>('submitted');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => setPage(0), [status, search]);

  const list = trpc.admin.courseOrders.useQuery({ status, search, page }, { refetchOnWindowFocus: true, refetchInterval: 60_000, placeholderData: (prev: unknown) => prev });
  const update = trpc.admin.updateCourseOrder.useMutation();
  const data = list.data as OrdersPage | undefined;
  const orders = data?.orders ?? [];
  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;

  const save = async (order: Order, patch: { status?: Status; adminNote?: string }) => {
    try {
      await update.mutateAsync({ id: order.id, ...patch });
      if (patch.status) toast.success(`${order.ref} → ${STATUS_LABELS[patch.status]}`);
      await list.refetch();
    } catch (err) {
      toast.error(`Could not save: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <div className="adm-hero-glow" aria-hidden="true" />
        <div className="adm-hero-main">
          <span className="adm-hero-icon">
            <GraduationCap size={22} />
          </span>
          <div>
            <p className="adm-eyebrow">Sales</p>
            <h1>Course orders</h1>
            <p className="adm-hero-text">
              Buyers from the Courses page chat. Check each UTR in your UPI app, then send the class link on WhatsApp and mark the order “Link sent”.
            </p>
          </div>
        </div>
        <div className="adm-hero-side">
          <button type="button" className="adm-btn is-light" onClick={() => list.refetch()} disabled={list.isFetching}>
            {list.isFetching ? <Loader2 size={15} className="adm-spin" /> : <RefreshCw size={15} />} Refresh
          </button>
        </div>
      </header>

      <div className="adm-toolbar">
        <nav className="adm-tabs" aria-label="Order status">
          {TABS.map((tab) => (
            <button key={tab} type="button" className={status === tab ? 'is-active' : ''} onClick={() => setStatus(tab)}>
              {tab === 'all' ? 'All' : STATUS_LABELS[tab]}
              <span className="adm-count">{tab === 'all' ? total : (data?.counts[tab] ?? 0)}</span>
            </button>
          ))}
        </nav>
        <div className="adm-toolbar-actions">
          <label className="adm-search">
            <Search size={14} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, phone, order ID or UTR…" />
          </label>
        </div>
      </div>

      {list.isLoading ? (
        <div className="adm-orders">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="adm-order is-skeleton" />
          ))}
        </div>
      ) : list.isError ? (
        <Empty
          icon={<GraduationCap size={22} />}
          title="Orders could not be loaded"
          text="If this is the first time, the backend may still need the latest update (it creates the orders table on start)."
        />
      ) : orders.length === 0 ? (
        <Empty icon={<GraduationCap size={22} />} title="No orders here" text={search ? 'Nothing matches that search.' : 'New purchases from the Courses page will show up here.'} />
      ) : (
        <div className="adm-orders">
          {orders.map((order) => {
            const wa = `https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(
              `Hi ${order.name}! Thanks for joining ${order.courseTitle}. Your payment is confirmed ✅\n\nHere is your class link: `,
            )}`;
            return (
              <article key={order.id} className={`adm-order is-${order.status}`}>
                <div className="adm-order-main">
                  <div className="adm-order-top">
                    <strong className="adm-order-ref">{order.ref}</strong>
                    <span className={`adm-order-status is-${order.status}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
                    <small>{when(order.createdAt)}</small>
                  </div>
                  <h3>{order.name}</h3>
                  <p className="adm-order-course">
                    {order.courseTitle} · <strong>{rupees(order.amount)}</strong>
                  </p>
                  <div className="adm-order-facts">
                    <button type="button" onClick={() => copy(order.paymentRef, 'UTR')} title="Copy UTR">
                      UTR <strong>{order.paymentRef}</strong> <Copy size={12} />
                    </button>
                    <button type="button" onClick={() => copy(order.phone, 'Phone')} title="Copy phone">
                      Phone <strong>{order.phone}</strong> <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="adm-order-side">
                  <select
                    className="adm-input"
                    value={order.status}
                    onChange={(e) => save(order, { status: e.target.value as Status })}
                    aria-label={`Status of ${order.ref}`}
                  >
                    {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <a className="adm-btn is-primary adm-order-wa" href={wa} target="_blank" rel="noreferrer">
                    <MessageCircle size={15} /> WhatsApp buyer
                  </a>
                  <NoteInput order={order} onSave={(note) => save(order, { adminNote: note })} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(page > 0 || data?.hasMore) && (
        <div className="adm-orders-pager">
          <button type="button" className="adm-btn is-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Newer
          </button>
          <span>Page {page + 1}</span>
          <button type="button" className="adm-btn is-ghost" disabled={!data?.hasMore} onClick={() => setPage((p) => p + 1)}>
            Older
          </button>
        </div>
      )}
    </div>
  );
}
