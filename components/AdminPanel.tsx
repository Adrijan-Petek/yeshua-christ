"use client";

import { useEffect, useMemo, useState } from "react";

type AdminPanelProps = {
  onClose: () => void;
};

const STORAGE_KEY_RULES = "yc_admin_rules";
const VIDEO_TABS = ["Worship Music", "Teaching Videos"] as const;
type VideoTab = (typeof VIDEO_TABS)[number];

type AdminTab = "Community Rules" | "Videos" | "Security";

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const canLogin = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);
  const [showLogin, setShowLogin] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoTab, setVideoTab] = useState<VideoTab>("Worship Music");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const [activeTab, setActiveTab] = useState<AdminTab>("Community Rules");

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
          setShowLogin(false);
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
    setNotice("Rules saved.");
    window.setTimeout(() => setNotice(null), 2000);
  };

  const login = async () => {
    setAuthError(null);
    setNotice(null);
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
      setShowLogin(false);
      setNotice("Logged in.");
      window.setTimeout(() => setNotice(null), 2000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed.";
      setAuthError(message);
    }
  };

  const logout = async () => {
    setAuthError(null);
    setNotice(null);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setIsAdmin(false);
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowLogin(false);
      setNotice("Logged out.");
      window.setTimeout(() => setNotice(null), 2000);
    }
  };

  const addVideo = async () => {
    setAuthError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: videoUrl.trim(), tab: videoTab }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setVideoUrl("");
      setNotice("Video added.");
      window.setTimeout(() => setNotice(null), 2000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add video.";
      setAuthError(message);
    }
  };

  const changePassword = async () => {
    setAuthError(null);
    setNotice(null);
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
      setNotice("Password updated.");
      window.setTimeout(() => setNotice(null), 2000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to change password.";
      setAuthError(message);
    }
  };

  const createAdmin = async () => {
    setAuthError(null);
    setNotice(null);
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
      setNotice("Admin user created.");
      window.setTimeout(() => setNotice(null), 2000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create admin user.";
      setAuthError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-black">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-100">Admin Panel</h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {authChecked ? (isAdmin ? "Signed in" : "Read-only until you sign in") : "Checking session…"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-stone-100"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-stone-200 px-6 py-3 dark:border-stone-800">
          <div className="flex flex-wrap gap-2">
            {(["Community Rules", "Videos", "Security"] as const).map((tab) => {
              const selected = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "border-stone-300 bg-stone-100 text-stone-950 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-black dark:text-stone-400 dark:hover:bg-stone-950"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[calc(85vh-120px)] overflow-y-auto px-6 py-5 space-y-5">
          {!authChecked && (
            <p className="text-sm text-stone-600 dark:text-stone-400">Checking admin session…</p>
          )}

          {notice && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200">
              {notice}
            </div>
          )}

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {authError}
            </div>
          )}

          {authChecked && !isAdmin && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Sign in to edit</h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    You can view settings, but changes require admin login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogin((v) => !v)}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50 dark:border-stone-800 dark:bg-black dark:text-stone-200 dark:hover:bg-stone-900"
                >
                  {showLogin ? "Hide" : "Sign in"}
                </button>
              </div>

              {showLogin && (
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                  />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                  />
                  <button
                    onClick={login}
                    disabled={!canLogin}
                    className="sm:col-span-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          )}

          {authChecked && isAdmin && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">Admin access enabled.</p>
              <button
                onClick={logout}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-black dark:hover:bg-stone-900"
              >
                Sign out
              </button>
            </div>
          )}

          {activeTab === "Community Rules" && (
            <section className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-stone-950 dark:text-stone-100">Community Rules</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Displayed on the Faith &amp; Testimony page.
                </p>
              </div>

              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                placeholder="Enter rules..."
              />

              <div className="flex items-center justify-end">
                <button
                  onClick={saveRules}
                  disabled={!isAdmin}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  Save Rules
                </button>
              </div>
            </section>
          )}

          {activeTab === "Videos" && (
            <section className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-stone-950 dark:text-stone-100">Videos</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Add YouTube links to Worship Music or Teaching Videos.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_180px]">
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube video or playlist link"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                  disabled={!isAdmin}
                />
                <select
                  value={videoTab}
                  onChange={(e) => setVideoTab(e.target.value as VideoTab)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                  disabled={!isAdmin}
                >
                  {VIDEO_TABS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={addVideo}
                  disabled={!isAdmin || videoUrl.trim().length === 0}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                >
                  Add Video
                </button>
              </div>
            </section>
          )}

          {activeTab === "Security" && (
            <section className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-stone-950 dark:text-stone-100">Security</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Manage your admin password and other admin users.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Change Password</h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current"
                    type="password"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                    disabled={!isAdmin}
                  />
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New"
                    type="password"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                    disabled={!isAdmin}
                  />
                  <input
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm"
                    type="password"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={changePassword}
                    disabled={!isAdmin || !currentPassword || !newPassword || !confirmNewPassword}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Create Admin User</h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                    disabled={!isAdmin}
                  />
                  <input
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-black dark:focus:ring-stone-700"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={createAdmin}
                    disabled={!isAdmin || !newAdminEmail.trim() || !newAdminPassword}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                  >
                    Create Admin
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
