"use client";

import { useMemo } from "react";
import { buildWarpcastComposeUrl, tryComposeCast } from "@/lib/farcasterShare";

type Props = {
  shareUrl: string;
};

export default function YeshuaNameCard({ shareUrl }: Props) {
  const shareEmbeds = useMemo(() => (shareUrl ? [shareUrl] : []), [shareUrl]);

  const shareText = useMemo(
    () =>
      [
        "Yeshua: The Name of Jesus and Its Meaning",
        "",
        "Yeshua (יֵשׁוּעַ) comes from the Hebrew root ישע (yasha): to save, rescue, deliver.",
        "A shortened form of Yehoshua (Joshua): “The LORD saves.”",
        "",
        "Matthew 1:21 — “You shall call His name Jesus, for He will save His people from their sins.”",
        "",
        "#YeshuaChrist",
      ].join("\n"),
    [],
  );

  const shareHref = useMemo(
    () => buildWarpcastComposeUrl({ text: shareText, embeds: shareEmbeds }),
    [shareEmbeds, shareText],
  );

  const onShareClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const ok = await tryComposeCast({ text: shareText, embeds: shareEmbeds });
    if (!ok) window.open(shareHref, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-lg backdrop-blur dark:border-stone-800 dark:bg-stone-950/60">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80 dark:bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 dark:bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/70" />
          </div>
          <p className="text-xs font-medium text-stone-600 dark:text-stone-300">Teaching</p>
        </div>

        <div className="text-left">
          <h3 className="text-lg font-semibold text-stone-950 dark:text-amber-300">
            Yeshua: The Name of Jesus and Its Meaning
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
            The name Yeshua (יֵשׁוּעַ) is the original Hebrew–Aramaic name of the one we know as Jesus.
            Understanding this name deepens our appreciation of who He is and what His mission means for
            our faith.
          </p>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-auto pr-2 text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              The Meaning of the Name
            </h4>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              Yeshua comes from the Hebrew root ישע (yasha), meaning to save, rescue, or deliver. It is
              a shortened form of the biblical name Yehoshua (Joshua), which means:{" "}
              <span className="font-medium text-stone-900 dark:text-stone-100">“The LORD saves.”</span>
            </p>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              This meaning is echoed directly in Scripture:
            </p>
            <blockquote className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm italic text-stone-800 shadow-sm dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-100">
              “You shall call His name Jesus, for He will save His people from their sins.”
              <span className="ml-2 not-italic font-medium text-stone-700 dark:text-stone-300">
                — Matthew 1:21
              </span>
            </blockquote>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              From the beginning, His very name proclaimed God’s plan of salvation.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              A Common Name with a Divine Purpose
            </h4>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              During the time of the Second Temple, Yeshua was a common Jewish name. Archaeological
              finds, including burial inscriptions, confirm that many men bore this name. Yet while the
              name was common, the life and mission of Jesus were anything but ordinary.
            </p>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              God chose a familiar name to reveal an eternal truth: salvation was coming not through
              power or status, but through humility, obedience, and love.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              From Yeshua to Jesus
            </h4>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              As the message of the Messiah spread beyond Israel, His name was rendered into Greek as
              Iēsous, then into Latin as Iesus, and finally into English as Jesus. Though the
              pronunciation changed across languages, the meaning never changed:
            </p>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">God saves.</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Why Yeshua Matters for Believers Today
            </h4>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              Calling Jesus by His Hebrew name, Yeshua, reminds us that:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700 dark:text-stone-200">
              <li>He is rooted in the promises of the Hebrew Scriptures</li>
              <li>He fulfills God’s plan of salvation revealed to Israel</li>
              <li>His mission is deliverance—spiritual, eternal, and personal</li>
            </ul>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              Whether we say Jesus or Yeshua, we are calling upon the same Savior, whose name declares
              hope, rescue, and redemption.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Conclusion</h4>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              The name Yeshua is more than a historical detail—it is a declaration of faith. It
              proclaims that God did not abandon humanity, but came near, entered history, and saved
              us.
            </p>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              Yeshua — “The LORD saves.”
            </p>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              That truth remains at the heart of the Christian faith.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <a
            href={shareHref}
            onClick={onShareClick}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          >
            Recast: Yeshua meaning
          </a>
        </div>
      </div>
    </div>
  );
}

