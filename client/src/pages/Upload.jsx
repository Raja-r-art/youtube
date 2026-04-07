import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  FiUploadCloud, FiX, FiFilm, FiImage, FiFileText, 
  FiTag, FiList, FiEye, FiZap, FiCheckCircle 
} from "react-icons/fi";

const CATEGORIES = ["Music", "Gaming", "Education", "Sports", "News", "Entertainment", "Technology", "Other"];

export default function Upload() {
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const [form, setForm] = useState({ title: "", description: "", tags: "", category: "Other", visibility: "public", isShort: false });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleVideoFile = (file) => {
    if (!file?.type.startsWith("video/")) return toast.error("Please select a valid video file");
    setVideoFile(file);
    if (!form.title) {
        // Auto-fill title from filename
        setForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
    }
  };

  const handleThumbFile = (file) => {
    if (!file?.type.startsWith("image/")) return toast.error("Please select an image file");
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return toast.error("Please select a video file");
    if (!form.title.trim()) return toast.error("Title is required");

    const fd = new FormData();
    fd.append("video", videoFile);
    if (thumbFile) fd.append("thumbnail", thumbFile);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    fd.append("category", form.category);
    fd.append("visibility", form.visibility);
    fd.append("isShort", form.isShort);

    setUploading(true);
    try {
      const { data } = await api.post("/videos", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      toast.success("Video uploaded successfully!");
      if (data.isShort) {
        navigate(`/shorts`);
      } else {
        navigate(`/watch/${data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto relative z-10">
        
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">
          <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-zinc-800/50">
            <div>
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight">
                Studio Space
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Upload and publish your next masterpiece.</p>
            </div>
            
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                <FiUploadCloud size={24} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
              {/* Left Column: Media Uploads */}
              <div className="lg:col-span-2 space-y-6">
                 {/* Video Upload Area */}
                 {!videoFile ? (
                    <div className="relative group h-64">
                         <div className={`absolute -inset-1 rounded-2xl blur-md opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${dragging ? 'bg-gradient-to-r from-blue-600 to-purple-600 opacity-100 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}></div>
                         <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => videoInputRef.current?.click()}
                            className={`relative h-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 bg-white/50 dark:bg-zinc-900/80 backdrop-blur-sm ${
                                dragging 
                                ? "border-transparent scale-[1.02] shadow-xl" 
                                : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-zinc-800/80"
                            }`}
                         >
                            <div className={`p-4 rounded-full mb-4 transition-transform duration-500 ${dragging ? 'scale-110 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-500'}`}>
                                <FiUploadCloud size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-200">Drag & drop video</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 px-6">MP4, WebM, or OGG <br/> (Max 500MB)</p>
                            <span className="mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 shadow-lg">Browse Files</span>
                            
                            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(e.target.files[0])} />
                         </div>
                    </div>
                ) : (
                    <div className="relative group overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:shadow-md">
                         <div className="absolute top-0 left-0 w-1 flex flex-col h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                         <div className="p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                <FiFilm size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{videoFile.name}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB • Ready
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setVideoFile(null)} 
                                className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
                            >
                                <FiX size={16} />
                            </button>
                         </div>
                    </div>
                )}

                {/* Thumbnail Upload Area */}
                <div className="bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800/50 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-zinc-700 dark:text-zinc-300">
                        <FiImage size={18} className="text-purple-500" />
                        <h3 className="font-semibold text-sm">Custom Thumbnail</h3>
                    </div>
                    
                    {!thumbPreview ? (
                        <div 
                            onClick={() => thumbInputRef.current?.click()}
                            className="h-40 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group bg-white/50 dark:bg-zinc-900/50"
                        >
                            <FiUploadCloud size={24} className="text-zinc-400 group-hover:text-purple-500 mb-2 transition-colors" />
                            <span className="text-xs font-medium text-zinc-500 group-hover:text-purple-500 transition-colors">Upload Image</span>
                            <span className="text-[10px] text-zinc-400 mt-1">1280x720 recommended</span>
                        </div>
                    ) : (
                        <div className="relative h-40 rounded-xl group overflow-hidden shadow-sm">
                            <img src={thumbPreview} alt="Thumbnail preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <button
                                    type="button"
                                    onClick={() => { setThumbFile(null); setThumbPreview(null); }}
                                    className="px-4 py-2 bg-red-500/90 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-300"
                                >
                                    <FiX size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    )}
                    <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleThumbFile(e.target.files[0])} />
                </div>
              </div>

              {/* Right Column: Details Form */}
              <div className="lg:col-span-3 space-y-5 flex flex-col">
                  {/* Title */}
                  <div className="relative group">
                     {/* Floating icon */}
                     <div className="absolute top-3 left-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                        <FiFileText size={18} />
                     </div>
                     <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Video Title (required)"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-zinc-900 placeholder:text-zinc-400 dark:text-zinc-200"
                      />
                  </div>

                  {/* Description */}
                  <div className="relative group flex-1 flex flex-col">
                     <div className="absolute top-3 left-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                        <FiList size={18} />
                     </div>
                     <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={7}
                        placeholder="Describe your video to viewers..."
                        className="w-full flex-1 pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all shadow-sm resize-none group-hover:bg-white dark:group-hover:bg-zinc-900 placeholder:text-zinc-400 dark:text-zinc-200"
                      />
                  </div>
                  
                  {/* Tags */}
                  <div className="relative group">
                     <div className="absolute top-3 left-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                        <FiTag size={18} />
                     </div>
                     <input
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="Tags e.g., gaming, setup, tutorial"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-zinc-900 placeholder:text-zinc-400 dark:text-zinc-200"
                      />
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="relative group">
                        <div className="absolute top-3 left-4 text-zinc-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                            <FiZap size={18} />
                        </div>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-sm font-medium transition-all appearance-none cursor-pointer group-hover:bg-white dark:group-hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
                        >
                            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-white dark:bg-zinc-900">{c}</option>)}
                        </select>
                        <div className="absolute top-3.5 right-4 pointer-events-none text-zinc-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                     </div>

                     <div className="relative group">
                        <div className="absolute top-3 left-4 text-zinc-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                            <FiEye size={18} />
                        </div>
                        <select
                            name="visibility"
                            value={form.visibility}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-sm font-medium transition-all appearance-none cursor-pointer group-hover:bg-white dark:group-hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
                        >
                            <option value="public" className="bg-white dark:bg-zinc-900">Public visibility</option>
                            <option value="unlisted" className="bg-white dark:bg-zinc-900">Unlisted</option>
                            <option value="private" className="bg-white dark:bg-zinc-900">Private</option>
                        </select>
                        <div className="absolute top-3.5 right-4 pointer-events-none text-zinc-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                     </div>
                  </div>

                  {/* isShort toggle */}
                  <label className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-800/20 dark:to-zinc-900/40 cursor-pointer group hover:border-blue-300 dark:hover:border-blue-900 transition-colors shadow-sm">
                     <div className="relative flex items-center">
                         <input
                            type="checkbox"
                            name="isShort"
                            checked={form.isShort}
                            onChange={handleChange}
                            className="sr-only peer"
                         />
                         <div className="w-12 h-6 bg-zinc-300 peer-focus:outline-none ring-4 ring-transparent peer-focus:ring-blue-300/50 dark:peer-focus:ring-blue-800/50 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600 shadow-inner"></div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Publish as YouTube Short</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">For vertical videos under 60 seconds</span>
                     </div>
                  </label>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
                {uploading ? (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl flex items-center gap-5 border border-zinc-200 dark:border-zinc-700/50 shadow-sm">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-full w-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="absolute text-xs font-bold text-zinc-700 dark:text-zinc-300">{progress}%</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Processing & Uploading</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Please avoid closing this window</p>
                                </div>
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full shadow-inner">{progress}% Complete</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700/80 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out relative" style={{ width: `${progress}%` }}>
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        type="submit"
                        disabled={!videoFile || !form.title.trim()}
                        className="w-full group relative py-4 rounded-2xl font-bold text-white shadow-xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 transition-all duration-500 ease-out group-hover:bg-[length:200%_auto] bg-[length:100%_auto] group-hover:bg-[right_center]"></div>
                        <div className="absolute inset-0 w-full h-full bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                        <div className="relative flex items-center justify-center gap-2">
                            <FiUploadCloud size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
                            <span className="text-lg">Publish Video</span>
                        </div>
                    </button>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
