"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  as?: "p" | "div" | "span";
}

const PRESETS = [
  { label: "Shorten", instruction: "Make this shorter and punchier" },
  { label: "Expand", instruction: "Expand this with a bit more detail" },
  { label: "Casual", instruction: "Make this sound more casual and conversational" },
  { label: "Formal", instruction: "Make this sound more formal and professional" },
  { label: "Fix grammar", instruction: "Fix any grammar or spelling mistakes, keep the meaning the same" },
];

const TOOLBAR_MARGIN = 12; // min gap from screen edges, px

async function rewriteWithAI(selectedText: string, instruction: string) {
  const res = await fetch("/api/edit-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: selectedText, instruction }),
  });
  if (!res.ok) throw new Error("Request failed");
  const data = await res.json();
  return (data.result ?? selectedText).trim();
}

// Converts a DOM Range inside `el` into plain-text character offsets,
// so we can compute replacements as string slices instead of touching the DOM.
function getTextOffsets(el: HTMLElement, range: Range) {
  const preRange = document.createRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;
  const end = start + range.toString().length;
  return { start, end };
}

export default function EditableText({
  value = "",
  onChange = () => {},
  className = "",
  as: Tag = "p",
}: EditableTextProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const offsetsRef = useRef<{ start: number; end: number } | null>(null);

  // True while the user's finger/mouse is down on the toolbar itself.
  // While true we must NOT let a selectionchange-triggered collapse hide it —
  // that's exactly what mobile browsers do the instant you touch a button
  // outside the selected text, before the click/tap can register.
  const interactingWithToolbarRef = useRef(false);

  const [rawPos, setRawPos] = useState<{ top: number; left: number } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleSelectionChange() {
      // Ignore selection collapses caused by the user touching/clicking the
      // toolbar — that's not a real "selection cleared", it's just how touch
      // devices report a tap outside the selected range.
      if (interactingWithToolbarRef.current) return;

      const sel = window.getSelection();

      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setRawPos(null);
        setToolbarPos(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const el = elRef.current;
      if (!el || !el.contains(range.commonAncestorContainer)) return;

      const text = sel.toString().trim();
      if (!text) return;

      offsetsRef.current = getTextOffsets(el, range);
      const rect = range.getBoundingClientRect();
      setRawPos({ top: rect.top - 46, left: rect.left + rect.width / 2 });
      setError(null);
      setShowCustom(false);
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // Clamp the toolbar inside the viewport once we know its real width/height
  // (we can't know that until it's rendered at least once).
  useEffect(() => {
    if (!rawPos) {
      setToolbarPos(null);
      return;
    }

    const el = toolbarRef.current;
    const width = el?.offsetWidth ?? 220;
    const height = el?.offsetHeight ?? 40;

    const left = Math.min(
      Math.max(rawPos.left, width / 2 + TOOLBAR_MARGIN),
      window.innerWidth - width / 2 - TOOLBAR_MARGIN,
    );
    const top = Math.max(rawPos.top, height + TOOLBAR_MARGIN);

    setToolbarPos({ top, left });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPos]);

  // Keep the contenteditable DOM in sync with `value`.
  // React does NOT re-render text inside a contentEditable element on prop
  // changes (it hands DOM ownership to the browser after mount), so without
  // this, the DOM and `value` drift apart after the first AI edit — later
  // selections then produce wrong offsets and edits silently misfire.
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  function closeToolbar() {
    setRawPos(null);
    setToolbarPos(null);
    setShowCustom(false);
    setCustomText("");
    setError(null);
    offsetsRef.current = null;
  }

  function handleBlur() {
    setTimeout(() => {
      const next = elRef.current?.innerText ?? "";
      if (next !== value) onChange(next);
    }, 0);
  }

  async function handleAction(instruction: string) {
    const offsets = offsetsRef.current;
    if (!offsets) return;

    const selectedText = value.slice(offsets.start, offsets.end);
    if (!selectedText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const rewritten = await rewriteWithAI(selectedText, instruction);
      const newValue = value.slice(0, offsets.start) + rewritten + value.slice(offsets.end);

      window.getSelection()?.removeAllRanges();
      onChange(newValue);
      closeToolbar();
    } catch {
      setError("Couldn't reach AI — try again");
      setLoading(false);
    }
  }

  // Fired on both mouse and touch: marks "don't dismiss me" for the whole
  // duration of the interaction, until touchend/mouseup releases it.
  function guardToolbar() {
    interactingWithToolbarRef.current = true;
  }
  function releaseToolbarGuard() {
    // Small delay so the click/tap event on the button still fires and reads
    // offsetsRef before we start reacting to selectionchange again.
    setTimeout(() => {
      interactingWithToolbarRef.current = false;
    }, 50);
  }

  return (
    <>
      <Tag
        ref={elRef as any}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        className={`-mx-1 cursor-text whitespace-pre-line rounded-md border-b border-dashed border-black/15 px-1 outline-none transition hover:border-black/35 hover:bg-black/[0.03] focus:border-transparent focus:bg-[#F5C518]/10 focus:ring-1 focus:ring-[#F5C518] ${className}`}
      >
        {value}
      </Tag>

      {toolbarPos && (
        <div
          ref={toolbarRef}
          onMouseDown={guardToolbar}
          onMouseUp={releaseToolbarGuard}
          onTouchStart={guardToolbar}
          onTouchEnd={releaseToolbarGuard}
          style={{ top: toolbarPos.top, left: toolbarPos.left, transform: "translate(-50%, 0)" }}
          className="fixed z-50 w-max max-w-[calc(100vw-24px)] rounded-lg border border-black/10 bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-2 py-2 text-sm text-black/60">
              <Loader2 size={14} className="animate-spin" />
              Rewriting...
            </div>
          ) : showCustom ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customText.trim()) handleAction(customText.trim());
                  if (e.key === "Escape") closeToolbar();
                }}
                placeholder="Tell AI what to change..."
                className="w-52 rounded-md border border-black/10 px-2 py-2 text-sm outline-none focus:border-[#F5C518]"
              />
              <button
                onClick={() => customText.trim() && handleAction(customText.trim())}
                className="min-h-[36px] rounded-md bg-[#F5C518] px-3 py-2 text-sm font-medium text-black active:brightness-90"
              >
                Go
              </button>
              <button onClick={closeToolbar} className="flex h-9 w-9 items-center justify-center rounded-md text-black/40 active:bg-black/5">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <span className="flex items-center gap-1 px-1.5 text-black/40">
                <Sparkles size={12} />
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleAction(p.instruction)}
                  className="min-h-[36px] whitespace-nowrap rounded-md px-2.5 py-2 text-sm text-black/80 active:bg-black/10"
                >
                  {p.label}
                </button>
              ))}
              <div className="mx-0.5 h-4 w-px bg-black/10" />
              <button
                onClick={() => setShowCustom(true)}
                className="min-h-[36px] whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-[#8a6d00] active:bg-[#F5C518]/30"
              >
                Custom...
              </button>
              <button onClick={closeToolbar} className="flex h-9 w-9 items-center justify-center rounded-md text-black/40 active:bg-black/5">
                <X size={16} />
              </button>
            </div>
          )}
          {error && <div className="px-2 pb-1 text-xs text-red-500">{error}</div>}
        </div>
      )}
    </>
  );
}