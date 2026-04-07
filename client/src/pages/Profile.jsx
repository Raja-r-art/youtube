import { useState, useRef } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { avatarFallback } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiCamera } from "react-icons/fi";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", channelName: user?.channelName || "" });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("bio", form.bio);
      fd.append("channelName", form.channelName);
      if (avatarFile) fd.append("avatar", avatarFile);

      const { data } = await api.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : avatarFallback(user?.name)}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
            >
              <FiCamera size={14} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
        </div>

        {[
          { name: "name", label: "Display Name", placeholder: "Your name" },
          { name: "channelName", label: "Channel Name", placeholder: "Unique channel handle" },
        ].map(({ name, label, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-blue-500 text-sm transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell people about yourself..."
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-blue-500 text-sm resize-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
