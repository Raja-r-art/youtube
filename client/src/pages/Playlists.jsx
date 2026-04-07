import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function Playlists() {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!user) return;
    api.get(`/playlists/user/${user._id}`).then(({ data }) => {
      setPlaylists(data);
      setLoading(false);
    });
  }, [user]);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data } = await api.post("/playlists", { name: newName });
    setPlaylists([data, ...playlists]);
    setNewName("");
    setCreating(false);
    toast.success("Playlist created");
  };

  const deletePlaylist = async (id) => {
    await api.delete(`/playlists/${id}`);
    setPlaylists(playlists.filter((p) => p._id !== id));
    toast.success("Playlist deleted");
  };

  if (loading) return <div className="animate-pulse space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📋 Playlists</h1>
        <button
          onClick={() => setCreating(!creating)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={16} /> New Playlist
        </button>
      </div>

      {creating && (
        <form onSubmit={createPlaylist} className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Playlist name"
            autoFocus
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-blue-500 text-sm"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Create</button>
          <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">No playlists yet. Create one!</div>
      ) : (
        <div className="space-y-3">
          {playlists.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
              <div className="w-24 aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                {p.videos?.[0]?.thumbnail ? (
                  <img src={p.videos[0].thumbnail} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No videos</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/playlist/${p._id}`} className="font-semibold hover:text-blue-500 transition-colors">{p.name}</Link>
                <p className="text-sm text-zinc-500">{p.videos?.length || 0} videos · {p.visibility}</p>
              </div>
              <button onClick={() => deletePlaylist(p._id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
