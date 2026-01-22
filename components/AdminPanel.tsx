"use client";

import { useEffect, useMemo, useState } from "react";

type AdminPanelProps = {
  onClose: () => void;
};

const STORAGE_KEY_RULES = "yc_admin_rules";
const VIDEO_TABS = ["Worship Music", "Teaching Videos"] as const;
type VideoTab = (typeof VIDEO_TABS)[number];

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const canLogin = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoTab, setVideoTab] = useState<VideoTab>("Worship Music");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const [rules, setRules] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RULES);
    return saved || "Christ-centered content only\nNo politics\nNo financial promotion";
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/admin", { cache: "no-store" });
        const json = (await res.json()) as { isAdmin?: unknown };
        if (!cancelled) {
          setIsAdmin(json.isAdmin === true);
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) setAuthChecked(true);
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveRules = () => {
    localStorage.setItem(STORAGE_KEY_RULES, rules);
    alert("Rules saved!");
  };

  const login = async () => {
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setIsAdmin(true);
      setPassword("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed.";
      setAuthError(message);
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setIsAdmin(false);
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const addVideo = async () => {
    setAuthError(null);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: videoUrl.trim(), tab: videoTab }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setVideoUrl("");
      alert("Video added!");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add video.";
      setAuthError(message);
    }
  };

  const changePassword = async () => {
    setAuthError(null);
    if (newPassword !== confirmNewPassword) {
      setAuthError("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      alert("Password updated!");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to change password.";
      setAuthError(message);
    }
  };

  const createAdmin = async () => {
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail.trim(), password: newAdminPassword }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setNewAdminEmail("");
      setNewAdminPassword("");
      alert("Admin user created!");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create admin user.";
      setAuthError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {!authChecked && (
            <p className="text-sm text-stone-600 dark:text-stone-400">Checking admin session…</p>
          )}

          {authChecked && !isAdmin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Admin Login</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <button
                onClick={login}
                disabled={!canLogin}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
              >
                Login
              </button>
            </div>
          )}

          {authError && (
            <p className="text-xs text-red-700 dark:text-red-400">{authError}</p>
          )}

          {authChecked && isAdmin && (
            <button
              onClick={logout}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-black dark:hover:bg-stone-900"
            >
              Logout
            </button>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Community Rules</label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              placeholder="Enter rules..."
            />
            <button
              onClick={saveRules}
              disabled={!isAdmin}
              className="mt-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              Save Rules
            </button>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Add Video</label>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube video or playlist link"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <select
                value={videoTab}
                onChange={(e) => setVideoTab(e.target.value as VideoTab)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              >
                {VIDEO_TABS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                onClick={addVideo}
                disabled={videoUrl.trim().length === 0}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
              >
                Add Video
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Change Password</label>
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                type="password"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                type="password"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <input
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                type="password"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <button
                onClick={changePassword}
                disabled={!currentPassword || !newPassword || !confirmNewPassword}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
              >
                Change Password
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Create Admin User</label>
              <input
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <input
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-700"
              />
              <button
                onClick={createAdmin}
                disabled={!newAdminEmail.trim() || !newAdminPassword}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
              >
                Create Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
