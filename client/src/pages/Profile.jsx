import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "", phone: user?.phone || "",
    street: user?.address?.street || "", city: user?.address?.city || "",
    state: user?.address?.state || "", zip: user?.address?.zip || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.post("/users/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      await updateProfile({
        name: form.name, phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zip: form.zip },
      });
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold text-ink-900 sm:text-3xl">My Profile</h1>

      <form onSubmit={handleSave} className="card p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-5">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-brand-500 text-white shadow-card hover:bg-brand-600">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="text-base font-bold text-ink-900">{form.name}</p>
            <p className="text-sm text-ink-500">{form.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Email</label>
            <input value={form.email} disabled className="input-field opacity-60" />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>

          <div className="col-span-2 mt-2 border-t border-surface-border pt-4">
            <h3 className="mb-3 text-sm font-bold text-ink-900">Address</h3>
          </div>
          <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Street" className="input-field col-span-2" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input-field" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="input-field" />
          <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="ZIP code" className="input-field col-span-2" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary mt-6"><Save size={15} /> {saving ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
}
