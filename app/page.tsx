"use client";
import { useState } from "react";

type Post = {
  id: number;
  pattern: string;
  text: string;
  score: number;
  score_reason: string;
  product_note: string;
  safety_flags: string[];
};

const TOPICS = [
  "不安・心配", "恋愛・片思い", "自己肯定感", "月・星占い",
  "癒し・休息", "人間関係", "直感・第六感", "手放すこと",
];

const FLAG_COLOR: Record<string, string> = {
  "誇大表現": "#ff6b6b",
  "口調逸脱": "#ffa040",
  "類似注意": "#60a0ff",
};

export default function Home() {
  const [topic, setTopic] = useState("不安・心配");
  const [customTopic, setCustomTopic] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [queueView, setQueueView] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const finalTopic = customTopic.trim() || topic;

  async function generate() {
    setLoading(true);
    setError("");
    setPosts([]);
    setSelected({});
    setQueueView(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: finalTopic, memo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
    }
    setLoading(false);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function copyText(id: number, text: string) {
    navigator.clipboard?.writeText(text.replace(/\\n/g, "\n"));
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const queued = posts.filter((p) => selected[p.id]);
  const displayPosts = queueView ? queued : posts;

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
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: "2rem", marginBottom: 6 }}>🌙</div>
        <h1 style={{ fontSize: "1.3rem", color: "#c9b8f0", letterSpacing: "0.1em", marginBottom: 4 }}>
          Serena編集室
        </h1>
        <p style={{ fontSize: "0.72rem", color: "#6a5a8a" }}>
          ライターAI — 占い・癒し・恋愛 投稿案10本生成
        </p>
      </div>

      {/* TOPIC */}
      <div style={{ background: "#16102a", border: "1px solid #3a2a5a", borderRadius: 14, padding: "18px 16px", marginBottom: 12 }}>
        <p style={{ fontSize: "0.72rem", color: "#9b7ee0", marginBottom: 10, fontWeight: 700 }}>今日のテーマ</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {TOPICS.map((t) => (
            <button key={t} onClick={() => { setTopic(t); setCustomTopic(""); }}
              style={{
                padding: "5px 13px", borderRadius: 20,
                border: topic === t && !customTopic ? "1px solid #9b7ee0" : "1px solid #3a2a5a",
                background: topic === t && !customTopic ? "#3a2a6a" : "transparent",
                color: topic === t && !customTopic ? "#c9b8f0" : "#7a6a9a",
                fontSize: "0.7rem", cursor: "pointer",
              }}>
              {t}
            </button>
          ))}
        </div>
        <input
          placeholder="または自由入力（例：新月の夜に感じること）"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          style={{
            width: "100%", background: "#0d0d1a", border: "1px solid #3a2a5a",
            borderRadius: 9, padding: "9px 12px", color: "#e8e0f0",
            fontSize: "0.75rem", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* MEMO */}
      <div style={{ background: "#16102a", border: "1px solid #3a2a5a", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: "0.72rem", color: "#9b7ee0", marginBottom: 8, fontWeight: 700 }}>追加メモ（任意）</p>
        <textarea
          placeholder="例：最近フォロワーから「夜眠れない」というコメントが多い。そこに寄り添いたい。"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          style={{
            width: "100%", background: "#0d0d1a", border: "1px solid #3a2a5a",
            borderRadius: 9, padding: "9px 12px", color: "#e8e0f0",
            fontSize: "0.73rem", resize: "vertical", outline: "none",
            lineHeight: 1.6, boxSizing: "border-box",
          }}
        />
      </div>

      {/* GENERATE BUTTON */}
      <button onClick={generate} disabled={loading}
        style={{
          width: "100%", padding: "13px",
          background: loading ? "#2a1a4a" : "linear-gradient(135deg, #5a3a9a, #7a4ab0)",
          border: "none", borderRadius: 12,
          color: loading ? "#6a5a8a" : "#f0eaff",
          fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "default" : "pointer",
          letterSpacing: "0.05em", marginBottom: 20,
        }}>
        {loading ? "🌙 Serenaが書いています…" : "✨ 投稿案を10本生成する"}
      </button>

      {error && <p style={{ color: "#ff6b6b", fontSize: "0.75rem", textAlign: "center", marginBottom: 16 }}>{error}</p>}

      {/* TABS */}
      {posts.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[`全投稿案（${posts.length}本）`, `✅ キュー（${queued.length}本）`].map((label, i) => (
            <button key={label} onClick={() => setQueueView(i === 1)}
              style={{
                flex: 1, padding: "8px", borderRadius: 9,
                border: queueView === (i === 1) ? "1px solid #9b7ee0" : "1px solid #3a2a5a",
                background: queueView === (i === 1) ? "#3a2a6a" : "transparent",
                color: queueView === (i === 1) ? "#c9b8f0" : "#6a5a8a",
                fontSize: "0.72rem", cursor: "pointer", fontWeight: 700,
              }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* POSTS */}
      {displayPosts.map((post) => (
        <div key={post.id} style={{
          background: selected[post.id] ? "#1e1440" : "#13102a",
          border: selected[post.id] ? "1px solid #7a5acc" : "1px solid #2a1a4a",
          borderRadius: 14, padding: "16px", marginBottom: 10, transition: "all 0.2s",
        }}>
          {/* TOP ROW */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.62rem", padding: "2px 9px", borderRadius: 20, background: "#2a1a50", color: "#9b7ee0", fontWeight: 700 }}>
                {post.pattern}
              </span>
              {(post.safety_flags || []).map((f) => (
                <span key={f} style={{
                  fontSize: "0.6rem", padding: "2px 8px", borderRadius: 20,
                  background: FLAG_COLOR[f] + "22", border: `1px solid ${FLAG_COLOR[f]}66`, color: FLAG_COLOR[f],
                }}>⚠ {f}</span>
              ))}
            </div>
            <span style={{
              fontSize: "0.78rem", fontWeight: 700,
              color: post.score >= 8 ? "#a0f0c0" : post.score >= 7 ? "#f0d480" : "#f09090",
            }}>
              {post.score?.toFixed(1)}点
            </span>
          </div>

          {/* BODY */}
          <p style={{ fontSize: "0.83rem", lineHeight: 1.85, color: "#d8d0ec", marginBottom: 10, whiteSpace: "pre-wrap" }}>
            {(post.text || "").replace(/\\n/g, "\n")}
          </p>

          {post.score_reason && (
            <p style={{ fontSize: "0.67rem", color: "#6a5a8a", marginBottom: 8 }}>💬 {post.score_reason}</p>
          )}

          {post.product_note && (
            <p style={{ fontSize: "0.67rem", color: "#c0a060", background: "#1e1608", padding: "5px 10px", borderRadius: 7, marginBottom: 10 }}>
              🛍 導線：{post.product_note}
            </p>
          )}

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={() => toggleSelect(post.id)}
              style={{
                flex: 2, padding: "7px", borderRadius: 8,
                border: selected[post.id] ? "1px solid #7a5acc" : "1px solid #3a2a5a",
                background: selected[post.id] ? "#4a3a8a" : "transparent",
                color: selected[post.id] ? "#d8c8ff" : "#6a5a8a",
                fontSize: "0.7rem", cursor: "pointer", fontWeight: 700,
              }}>
              {selected[post.id] ? "✅ キュー追加済み" : "+ キューに追加"}
            </button>
            <button onClick={() => copyText(post.id, post.text)}
              style={{
                flex: 1, padding: "7px", borderRadius: 8,
                border: "1px solid #3a2a5a", background: "transparent",
                color: copied === post.id ? "#a0f0c0" : "#7a6a9a",
                fontSize: "0.7rem", cursor: "pointer",
              }}>
              {copied === post.id ? "✓ コピー済み" : "📋 コピー"}
            </button>
          </div>
        </div>
      ))}

      {queueView && queued.length === 0 && (
        <p style={{ textAlign: "center", color: "#4a3a6a", fontSize: "0.78rem", padding: "32px 0" }}>
          まだキューに追加された投稿はありません
        </p>
      )}

      {queued.length > 0 && !queueView && (
        <div style={{ background: "#1a1430", border: "1px solid #5a3a9a", borderRadius: 12, padding: "14px 16px", marginTop: 8, textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", color: "#c9b8f0", fontWeight: 700, marginBottom: 4 }}>
            🌙 {queued.length}本 がキューに入っています
          </p>
          <p style={{ fontSize: "0.68rem", color: "#6a5a8a" }}>「キュー」タブで確認 → X / Threadsに手動投稿</p>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: "0.62rem", color: "#2a1a4a", marginTop: 28, lineHeight: 1.8 }}>
        Serena編集室 · Phase 2 ライターAI<br />
        最終投稿の判断・実行は中村さんが行います
      </p>
    </main>
  );
}
