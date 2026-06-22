"use client";
import { useState } from "react";
import Link from "next/link";

type NoteResult = {
  titles: string[];
  price: number;
  price_reason: string;
  product_note: string;
  free_part: string;
  paid_part: string;
  cta: string;
};

const PRICE_COLOR: Record<number, string> = {
  150: "#a0d0a0",
  300: "#a0c0f0",
  500: "#c0a0f0",
  980: "#f0c060",
};

export default function NotePage() {
  const [post, setPost] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NoteResult | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [tab, setTab] = useState<"free" | "paid" | "cta">("free");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    if (!post.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setTab("free");
    setSelectedTitle(0);
    try {
      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post, memo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
    }
    setLoading(false);
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text.replace(/\\n/g, "\n"));
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const tabContent = result
    ? tab === "free" ? result.free_part
    : tab === "paid" ? result.paid_part
    : result.cta
    : "";

  return (
    <main style={{
      background: "#0d0d1a",
      minHeight: "100vh",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', sans-serif",
      color: "#e8e0f0",
      padding: "28px 16px",
      maxWidth: 680,
      margin: "0 auto",
    }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>📝</div>
        <h1 style={{ fontSize: "1.2rem", color: "#c9b8f0", letterSpacing: "0.08em", marginBottom: 4 }}>
          Serena編集室 — note化AI
        </h1>
        <p style={{ fontSize: "0.72rem", color: "#6a5a8a" }}>
          バズった投稿 → note記事（3,000〜4,000字）に展開
        </p>
      </div>

      {/* NAV */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Link href="/" style={{
          flex: 1, textAlign: "center", padding: "7px",
          borderRadius: 9, border: "1px solid #3a2a5a",
          color: "#6a5a8a", fontSize: "0.7rem", textDecoration: "none",
        }}>
          ✨ ライターAI
        </Link>
        <div style={{
          flex: 1, textAlign: "center", padding: "7px",
          borderRadius: 9, border: "1px solid #7a5acc",
          background: "#2a1a4a", color: "#c9b8f0", fontSize: "0.7rem",
        }}>
          📝 note化AI
        </div>
      </div>

      {/* INPUT: 元投稿 */}
      <div style={{ background: "#16102a", border: "1px solid #3a2a5a", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
        <p style={{ fontSize: "0.72rem", color: "#9b7ee0", marginBottom: 8, fontWeight: 700 }}>
          バズった投稿を貼る
        </p>
        <textarea
          placeholder="例：眠れない夜、頭の中でぐるぐると同じことを考え続けてしまう。&#10;そういうこと、ありませんか？&#10;&#10;それは弱さじゃないと思うんです。…"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          rows={6}
          style={{
            width: "100%", background: "#0d0d1a", border: "1px solid #3a2a5a",
            borderRadius: 9, padding: "10px 12px", color: "#e8e0f0",
            fontSize: "0.78rem", resize: "vertical", outline: "none",
            lineHeight: 1.7, boxSizing: "border-box",
          }}
        />
        <p style={{ fontSize: "0.63rem", color: "#4a3a6a", marginTop: 6 }}>
          {post.length}字 入力中
        </p>
      </div>

      {/* INPUT: メモ */}
      <div style={{ background: "#16102a", border: "1px solid #3a2a5a", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: "0.72rem", color: "#9b7ee0", marginBottom: 8, fontWeight: 700 }}>
          方向性メモ（任意）
        </p>
        <textarea
          placeholder="例：ここからPDF診断「夜の感情タイプ診断」への導線を入れたい。ワークも1つ入れてほしい。"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          style={{
            width: "100%", background: "#0d0d1a", border: "1px solid #3a2a5a",
            borderRadius: 9, padding: "9px 12px", color: "#e8e0f0",
            fontSize: "0.73rem", resize: "vertical", outline: "none",
            lineHeight: 1.6, boxSizing: "border-box",
          }}
        />
      </div>

      {/* GENERATE */}
      <button onClick={generate} disabled={loading || !post.trim()}
        style={{
          width: "100%", padding: "13px",
          background: loading || !post.trim() ? "#2a1a4a" : "linear-gradient(135deg, #5a3a9a, #7a4ab0)",
          border: "none", borderRadius: 12,
          color: loading || !post.trim() ? "#6a5a8a" : "#f0eaff",
          fontSize: "0.9rem", fontWeight: 700,
          cursor: loading || !post.trim() ? "default" : "pointer",
          letterSpacing: "0.05em", marginBottom: 20,
        }}>
        {loading ? "🌙 note記事を生成中…" : "📝 note記事案を生成する"}
      </button>

      {error && <p style={{ color: "#ff6b6b", fontSize: "0.75rem", textAlign: "center", marginBottom: 16 }}>{error}</p>}

      {/* RESULT */}
      {result && (
        <>
          {/* TITLES */}
          <div style={{ background: "#16102a", border: "1px solid #3a2a5a", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
            <p style={{ fontSize: "0.72rem", color: "#9b7ee0", marginBottom: 10, fontWeight: 700 }}>
              タイトル案（タップして選択）
            </p>
            {result.titles.map((title, i) => (
              <div key={i} onClick={() => setSelectedTitle(i)}
                style={{
                  padding: "10px 14px", borderRadius: 9, marginBottom: 7, cursor: "pointer",
                  border: selectedTitle === i ? "1px solid #9b7ee0" : "1px solid #2a1a4a",
                  background: selectedTitle === i ? "#2a1a50" : "#0d0d1a",
                  fontSize: "0.82rem", color: selectedTitle === i ? "#e0d0ff" : "#9a8ab0",
                  transition: "all 0.15s",
                }}>
                {selectedTitle === i && <span style={{ color: "#9b7ee0", marginRight: 6 }}>✓</span>}
                {title}
              </div>
            ))}
            <button onClick={() => copy(result.titles[selectedTitle], "title")}
              style={{
                width: "100%", marginTop: 4, padding: "7px",
                borderRadius: 8, border: "1px solid #3a2a5a", background: "transparent",
                color: copied === "title" ? "#a0f0c0" : "#7a6a9a",
                fontSize: "0.7rem", cursor: "pointer",
              }}>
              {copied === "title" ? "✓ コピー済み" : "📋 選択中タイトルをコピー"}
            </button>
          </div>

          {/* PRICE & PRODUCT */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{
              flex: 1, background: "#16102a", border: "1px solid #3a2a5a",
              borderRadius: 12, padding: "12px 14px",
            }}>
              <p style={{ fontSize: "0.65rem", color: "#6a5a8a", marginBottom: 4 }}>推奨価格</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: PRICE_COLOR[result.price] || "#c9b8f0" }}>
                ¥{result.price}
              </p>
              <p style={{ fontSize: "0.63rem", color: "#6a5a8a", marginTop: 4 }}>{result.price_reason}</p>
            </div>
            <div style={{
              flex: 2, background: "#16102a", border: "1px solid #3a2a5a",
              borderRadius: 12, padding: "12px 14px",
            }}>
              <p style={{ fontSize: "0.65rem", color: "#6a5a8a", marginBottom: 4 }}>商品導線</p>
              <p style={{ fontSize: "0.75rem", color: "#c0a060", lineHeight: 1.6 }}>🛍 {result.product_note}</p>
            </div>
          </div>

          {/* CONTENT TABS */}
          <div style={{ background: "#16102a", border: "1px solid #3a2a5a", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {([
                { key: "free", label: "無料パート（前半）" },
                { key: "paid", label: "有料パート（後半）" },
                { key: "cta", label: "CTA" },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{
                    flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: "0.63rem",
                    border: tab === key ? "1px solid #9b7ee0" : "1px solid #2a1a4a",
                    background: tab === key ? "#3a2a6a" : "transparent",
                    color: tab === key ? "#c9b8f0" : "#5a4a7a",
                    cursor: "pointer", fontWeight: tab === key ? 700 : 400,
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "paid" && (
              <div style={{
                background: "#1e1608", border: "1px solid #6a4e1e",
                borderRadius: 8, padding: "8px 12px", marginBottom: 10,
                fontSize: "0.68rem", color: "#c0a060",
              }}>
                🔒 この部分がnoteの有料ゾーン（¥{result.price}）になります
              </div>
            )}

            <pre style={{
              fontSize: "0.78rem", lineHeight: 1.85, color: "#d0c8e8",
              whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit",
              maxHeight: 400, overflowY: "auto",
            }}>
              {tabContent.replace(/\\n/g, "\n")}
            </pre>

            <button onClick={() => copy(tabContent, tab)}
              style={{
                width: "100%", marginTop: 12, padding: "8px",
                borderRadius: 8, border: "1px solid #3a2a5a", background: "transparent",
                color: copied === tab ? "#a0f0c0" : "#7a6a9a",
                fontSize: "0.72rem", cursor: "pointer",
              }}>
              {copied === tab ? "✓ コピー済み" : "📋 このパートをコピー"}
            </button>
          </div>

          {/* FULL COPY */}
          <button onClick={() => copy(
            `${result.titles[selectedTitle]}\n\n${result.free_part}\n\n---\nここから先は有料（¥${result.price}）---\n\n${result.paid_part}\n\n${result.cta}`,
            "all"
          )}
            style={{
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg, #3a2a6a, #5a3a8a)",
              border: "1px solid #7a5acc", borderRadius: 12,
              color: copied === "all" ? "#a0f0c0" : "#e0d0ff",
              fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
              marginBottom: 20,
            }}>
            {copied === "all" ? "✓ 全文コピー済み！" : "📋 全文まとめてコピー（note貼り付け用）"}
          </button>
        </>
      )}

      <p style={{
        textAlign: "center", fontSize: "0.62rem", color: "#2a1a4a",
        marginTop: 16, lineHeight: 1.8,
      }}>
        Serena編集室 · Phase 5 note化AI<br />
        最終確認・投稿はSerenaアカウントから中村さんが行います
      </p>
    </main>
  );
}
