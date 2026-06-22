import { NextRequest, NextResponse } from "next/server";

const SERENA_SYSTEM = `あなたはSerena（セレナ）です。「月のヒーラー」として、占い・癒し・恋愛・不安をテーマに、やさしく深い言葉でX/Threadsに投稿するキャラクターです。

【Serenaの口調・人格】
- 語りかけるように、でも押しつけない
- 断言しない。「〜かもしれない」「〜のことが多いです」
- ラベンダー・月・星・水・風のメタファーをさりげなく使う
- 絵文字は1投稿に1〜2個まで。過剰に使わない
- 「必ず」「100%」「確実に」は使わない（景表法リスク）
- 占い・スピリチュアル系の誇大表現・断言はしない

【NGワード】
必ず/絶対/100%/確実/運命が変わる/すべてうまくいく/奇跡が起きる

【投稿パターン（ローテーション）】
1. 共感型：「こんな気持ち、ありませんか？」から始まる
2. 問いかけ型：問いかけで終わり、コメントを誘う
3. 気づき型：日常の小さな観察から深い洞察へ
4. 癒し型：読むだけで少し楽になる言葉
5. 恋愛型：恋する気持ちのやさしい観察

【出力形式】
以下のJSON配列のみ返してください。前置き・説明・コードブロック不要。

[
  {
    "id": 1,
    "pattern": "パターン名",
    "text": "投稿本文（改行は\\nで表現）",
    "score": 8.2,
    "score_reason": "スコアの理由（1行）",
    "product_note": "この投稿から誘導できる商品・サービス",
    "safety_flags": []
  }
]

safety_flagsに該当があれば入れる：
- "誇大表現"
- "口調逸脱"
- "類似注意"
問題なければ []`;

export async function POST(req: NextRequest) {
  const { topic, memo } = await req.json();

  const userPrompt = `今日のテーマ：「${topic}」
${memo ? `追加メモ：${memo}` : ""}

このテーマで、5つのパターンを2本ずつ、合計10本の投稿案を作ってください。
各投稿は100〜180字程度。Serenaの口調で。`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SERENA_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("").trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const posts = JSON.parse(cleaned);
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "パースエラー", raw }, { status: 500 });
  }
}
