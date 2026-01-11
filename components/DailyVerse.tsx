"use client";

import { useEffect, useState } from "react";

interface Verse {
  reference: string;
  text: string;
  translation_name: string;
}

export default function DailyVerse() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        // For daily verse, using John 3:16 as example. In production, could randomize or use date-based reference.
        const response = await fetch("https://dailybible.ca/api/John+3:16");
        if (!response.ok) throw new Error("Failed to fetch verse");
        const data = await response.json();
        setVerse({
          reference: data.reference,
          text: data.text,
          translation_name: data.translation_name,
        });
      } catch (err) {
        setError("Could not load daily verse");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVerse();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-sm text-stone-600 dark:text-stone-400">Loading daily verse...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold text-stone-950 dark:text-amber-300">Daily Verse</h2>
      {verse && (
        <div className="space-y-2">
          <p className="text-lg italic text-stone-800 dark:text-stone-200">"{verse.text}"</p>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{verse.reference}</p>
          <p className="text-xs text-stone-600 dark:text-stone-400">{verse.translation_name}</p>
        </div>
      )}
    </div>
  );
}