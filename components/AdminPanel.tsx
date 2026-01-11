"use client";

import { useEffect, useState } from "react";

type AdminPanelProps = {
  onClose: () => void;
};

const STORAGE_KEY_RULES = "yc_admin_rules";

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [rules, setRules] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RULES);
    if (saved) setRules(saved);
    else setRules("Christ-centered content only\nNo politics\nNo financial promotion");
  }, []);

  const saveRules = () => {
    localStorage.setItem(STORAGE_KEY_RULES, rules);
    alert("Rules saved!");
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
              className="mt-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              Save Rules
            </button>
          </div>

          <div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Other settings can be added here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}