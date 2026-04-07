import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { timeAgo, avatarFallback } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CommentsSection({ videoId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/videos/${videoId}/comments`).then(({ data }) => {
      setComments(data.comments);
      setTotal(data.total);
      setLoading(false);
    });
  }, [videoId]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/videos/${videoId}/comments`, { text });
      setComments([data, ...comments]);
      setTotal(total + 1);
      setText("");
    } catch { toast.error("Failed to post comment"); }
  };

  const postReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      const { data } = await api.post(`/videos/${videoId}/comments`, { text: replyText, parent: parentId });
      setReplies((p) => ({ ...p, [parentId]: [...(p[parentId] || []), data] }));
      setReplyTo(null);
      setReplyText("");
    } catch { toast.error("Failed to post reply"); }
  };

  const loadReplies = async (id) => {
    if (replies[id]) { setReplies((p) => { const n = { ...p }; delete n[id]; return n; }); return; }
    const { data } = await api.get(`/videos/${videoId}/comments/${id}/replies`);
    setReplies((p) => ({ ...p, [id]: data }));
  };

  const deleteComment = async (id) => {
    await api.delete(`/videos/${videoId}/comments/${id}`);
    setComments(comments.filter((c) => c._id !== id));
    setTotal(total - 1);
    toast.success("Deleted");
  };

  const saveEdit = async (id) => {
    const { data } = await api.put(`/videos/${videoId}/comments/${id}`, { text: editText });
    setComments(comments.map((c) => (c._id === id ? data : c)));
    setEditId(null);
  };

  const Avatar = ({ user: u, size = "w-9 h-9" }) => (
    <div className={`${size} rounded-full bg-zinc-500 text-white flex items-center justify-center shrink-0 text-sm font-semibold overflow-hidden`}>
      {u?.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : avatarFallback(u?.name)}
    </div>
  );

  if (loading) return <div className="animate-pulse h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl mt-6" />;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">{total} Comments</h3>

      {user && (
        <form onSubmit={postComment} className="flex gap-3 mb-6">
          <Avatar user={user} />
          <div className="flex-1">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border-b border-zinc-300 dark:border-zinc-700 bg-transparent pb-1 outline-none text-sm focus:border-blue-500 transition-colors"
            />
            {text && (
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setText("")} className="text-sm px-3 py-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                <button type="submit" className="text-sm px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700">Comment</button>
              </div>
            )}
          </div>
        </form>
      )}

      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3">
            <Avatar user={c.user} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{c.user?.name}</span>
                <span className="text-xs text-zinc-500">{timeAgo(c.createdAt)}</span>
              </div>

              {editId === c._id ? (
                <div className="mt-1">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full border-b border-zinc-300 dark:border-zinc-700 bg-transparent outline-none text-sm pb-1" />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setEditId(null)} className="text-xs px-2 py-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                    <button onClick={() => saveEdit(c._id)} className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm mt-0.5 break-words">{c.text}</p>
              )}

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {user && (
                  <button onClick={() => { setReplyTo(replyTo === c._id ? null : c._id); setReplyText(""); }} className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                    Reply
                  </button>
                )}
                {user?._id === c.user?._id && (
                  <>
                    <button onClick={() => { setEditId(c._id); setEditText(c.text); }} className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Edit</button>
                    <button onClick={() => deleteComment(c._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  </>
                )}
                <button onClick={() => loadReplies(c._id)} className="text-xs text-blue-500 hover:underline">
                  {replies[c._id] ? "Hide replies" : "View replies"}
                </button>
              </div>

              {replyTo === c._id && (
                <div className="flex gap-2 mt-2">
                  <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Add a reply..." className="flex-1 border-b border-zinc-300 dark:border-zinc-700 bg-transparent outline-none text-sm pb-1" />
                  <button onClick={() => postReply(c._id)} className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white shrink-0">Reply</button>
                </div>
              )}

              {replies[c._id]?.map((r) => (
                <div key={r._id} className="flex gap-2 mt-3 ml-2">
                  <Avatar user={r.user} size="w-7 h-7" />
                  <div>
                    <span className="text-xs font-semibold">{r.user?.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">{timeAgo(r.createdAt)}</span>
                    <p className="text-sm">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
