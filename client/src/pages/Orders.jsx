import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Package, FileText, ChevronDown, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import api, { getImageUrl } from "../api";
import { StatusBadge } from "../components/UIHelpers";
import { EmptyState } from "../components/UIHelpers";
import toast from "react-hot-toast";

const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
const STEP_ICONS = { Pending: Clock, Processing: Package, Shipped: Truck, Delivered: CheckCircle2 };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders/my-orders");
      setOrders(data);
    } catch {
      toast.error("Could not load your orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Could not download invoice");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton mb-4 h-28 rounded-2xl" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState icon={Package} title="No orders yet" subtitle="Your order history will show up here once you make a purchase." action={<Link to="/" className="btn-primary">Start Shopping</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold text-ink-900 sm:text-3xl">Your Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const isOpen = expanded === order._id;
          const isCancelled = order.status === "Cancelled";
          const stepIndex = STEPS.indexOf(order.status);

          return (
            <div key={order._id} className="card overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : order._id)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-ink-500">{new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} • {order.items?.length} item(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-extrabold text-ink-900">${order.total?.toFixed(2)}</span>
                  <ChevronDown size={18} className={`text-ink-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="animate-fadeUp border-t border-surface-border p-5">
                  {/* Tracking */}
                  {!isCancelled ? (
                    <div className="mb-6 flex items-center justify-between">
                      {STEPS.map((step, i) => {
                        const Icon = STEP_ICONS[step];
                        const active = i <= stepIndex;
                        return (
                          <div key={step} className="flex flex-1 flex-col items-center">
                            <div className="flex w-full items-center">
                              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${active ? "bg-brand-500 text-white" : "bg-surface-soft text-ink-300"}`}>
                                <Icon size={15} />
                              </span>
                              {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 ${i < stepIndex ? "bg-brand-500" : "bg-surface-border"}`} />}
                            </div>
                            <span className={`mt-2 text-[11px] font-semibold ${active ? "text-ink-900" : "text-ink-300"}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                      <XCircle size={16} /> This order was cancelled
                    </div>
                  )}

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {order.items?.map((item) => (
                      <div key={item.product?._id || item._id} className="flex items-center gap-3">
                        <img src={getImageUrl(item.product?.images?.[0])} alt="" className="h-14 w-14 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ink-900">{item.product?.name}</p>
                          <p className="text-xs text-ink-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-ink-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button onClick={() => downloadInvoice(order._id)} className="btn-secondary !px-4 !py-2 text-xs">
                      <FileText size={14} /> Download Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
