import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import MiniPlayer from "@/components/video/MiniPlayer";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Watch from "@/pages/Watch";
import Upload from "@/pages/Upload";
import Search from "@/pages/Search";
import Channel from "@/pages/Channel";
import Trending from "@/pages/Trending";
import Subscriptions from "@/pages/Subscriptions";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import Playlists from "@/pages/Playlists";
import Shorts from "@/pages/Shorts";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, fetchMe } = useAuthStore();
  const { darkMode, sidebarCollapsed } = useUIStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? "#27272a" : "#fff",
            color: darkMode ? "#f4f4f5" : "#09090b",
            border: `1px solid ${darkMode ? "#3f3f46" : "#e4e4e7"}`,
            borderRadius: "12px",
          },
        }}
      />
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14 min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-200`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="text-8xl font-black text-zinc-200 dark:text-zinc-800">404</p>
                <p className="text-xl font-bold mt-2">Page not found</p>
                <p className="text-zinc-500 text-sm mt-1">The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
      <MiniPlayer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
