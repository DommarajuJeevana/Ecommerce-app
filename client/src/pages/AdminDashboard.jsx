import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Users, Package, DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api";
import { StatusBadge } from "../components/UIHelpers";

function StatCard({ icon: Icon, label, value, trend, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            <TrendingUp size={13} className={trend < 0 ? "rotate-180" : ""} /> {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/dashboard");
      setStats(data.stats);
      setSalesData(data.salesGraph || []);
      setRecentOrders(data.recentOrders || []);
      setLowStock(data.lowStock || []);
      setTopProducts(data.topProducts || []);
    } catch {
      /* graceful */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-ink-500">Overview of your store's performance</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Link to="/admin/products" className="btn-secondary !py-2 text-xs">Manage Products</Link>
          <Link to="/admin/orders" className="btn-primary !py-2 text-xs">Manage Orders</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={loading ? "—" : stats?.totalUsers ?? 0} trend={stats?.userTrend} color="bg-brand-50 text-brand-600" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={loading ? "—" : stats?.totalOrders ?? 0} trend={stats?.orderTrend} color="bg-purple-50 text-purple-600" />
        <StatCard icon={DollarSign} label="Revenue" value={loading ? "—" : `$${(stats?.totalRevenue ?? 0).toLocaleString()}`} trend={stats?.revenueTrend} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Package} label="Total Products" value={loading ? "—" : stats?.totalProducts ?? 0} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Sales graph */}
      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-base font-bold text-ink-900">Sales Overview</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0067c5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0067c5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9aa1ac" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9aa1ac" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e7ec", fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#0067c5" strokeWidth={2.5} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-bold text-ink-900">Recent Orders</h2>
          <div className="flex flex-col divide-y divide-surface-border">
            {recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-ink-500">{o.user?.name}</p>
                </div>
                <StatusBadge status={o.status} />
                <span className="text-sm font-bold text-ink-900">${o.total?.toFixed(2)}</span>
              </div>
            ))}
            {recentOrders.length === 0 && !loading && <p className="py-6 text-center text-sm text-ink-500">No recent orders</p>}
          </div>
        </div>

        {/* Low stock */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
            <AlertTriangle size={16} className="text-amber-500" /> Low Stock
          </h2>
          <div className="flex flex-col gap-3">
            {lowStock.map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <img src={p.images?.[0] || "/placeholder.png"} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-ink-900">{p.name}</p>
                  <p className="text-[11px] font-bold text-red-600">{p.stock} left</p>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && !loading && <p className="text-sm text-ink-500">All stocked up</p>}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-base font-bold text-ink-900">Top Products</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {topProducts.map((p) => (
            <div key={p._id} className="flex items-center gap-3 rounded-xl bg-surface-soft p-3">
              <img src={p.images?.[0] || "/placeholder.png"} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div>
                <p className="line-clamp-1 text-xs font-semibold text-ink-900">{p.name}</p>
                <p className="text-[11px] text-ink-500">{p.unitsSold} sold</p>
              </div>
            </div>
          ))}
          {topProducts.length === 0 && !loading && <p className="text-sm text-ink-500">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
