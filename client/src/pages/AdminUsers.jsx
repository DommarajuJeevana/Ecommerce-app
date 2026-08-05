import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Eye, X } from "lucide-react";
import api from "../api";
import { StatusBadge } from "../components/UIHelpers";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingOrders, setViewingOrders] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: { search } });
      setUsers(data);
    } catch {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update role");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  const viewOrders = async (user) => {
    setViewingOrders(user);
    try {
      const { data } = await api.get(`/admin/users/${user._id}/orders`);
      setUserOrders(data);
    } catch {
      setUserOrders([]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Users</h1>
        <p className="text-sm text-ink-500">{users.length} registered users</p>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-11" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-soft text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-surface-soft/50">
                <td className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {u.name?.[0]?.toUpperCase()}
                  </span>
                  <span className="font-semibold text-ink-900">{u.name}</span>
                </td>
                <td className="px-5 py-3.5 text-ink-700">{u.email}</td>
                <td className="px-5 py-3.5">
                  <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} className="input-field !w-auto !py-1.5 text-xs">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3.5 text-ink-700">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => viewOrders(u)} className="rounded-lg p-2 hover:bg-surface-soft" aria-label="View orders"><Eye size={15} /></button>
                    <button onClick={() => deleteUser(u._id)} className="rounded-lg p-2 hover:bg-red-50" aria-label="Delete user"><Trash2 size={15} className="text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingOrders && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-pop">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-ink-900">{viewingOrders.name}'s Orders</h3>
              <button onClick={() => setViewingOrders(null)} className="rounded-full p-1.5 hover:bg-surface-soft" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              {userOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between rounded-xl bg-surface-soft px-4 py-3">
                  <span className="text-xs font-semibold text-ink-900">#{o._id.slice(-8).toUpperCase()}</span>
                  <StatusBadge status={o.status} />
                  <span className="text-xs font-bold text-ink-900">${o.total?.toFixed(2)}</span>
                </div>
              ))}
              {userOrders.length === 0 && <p className="text-sm text-ink-500">No orders yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
