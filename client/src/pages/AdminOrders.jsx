import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";
import { StatusBadge } from "../components/UIHelpers";
import toast from "react-hot-toast";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders", { params: { page, limit, search, status: statusFilter } });
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Orders</h1>
        <p className="text-sm text-ink-500">{total} total orders</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order ID or customer..." className="input-field pl-11" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-soft text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3.5">Order ID</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Total</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-surface-soft/50">
                <td className="px-5 py-3.5 font-semibold text-ink-900">#{o._id.slice(-8).toUpperCase()}</td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-ink-900">{o.user?.name}</p>
                  <p className="text-xs text-ink-500">{o.user?.email}</p>
                </td>
                <td className="px-5 py-3.5 text-ink-700">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3.5 font-semibold text-ink-900">${o.total?.toFixed(2)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3.5">
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} className="input-field !w-auto !py-1.5 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-500">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-ink-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-3 !py-2 disabled:opacity-40"><ChevronLeft size={15} /></button>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-3 !py-2 disabled:opacity-40"><ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
  );
}
