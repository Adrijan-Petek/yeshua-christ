import Link from "next/link";

export default function SubNav() {
  return (
    <nav className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm dark:border-stone-800 dark:bg-black">
        <Link
          href="/"
          className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          Home
        </Link>
        <Link
          href="/faith"
          className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          Faith
        </Link>
        <Link
          href="/videos"
          className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          Videos
        </Link>
        <Link
          href="/bible"
          className="rounded-xl px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          Bible
        </Link>
      </div>
    </nav>
  );
}
