import { NextRequest, NextResponse } from "next/server";

const NOTE_SYSTEM = `あなたはSerena（セレナ）の編集アシスタントです。
バズったSNS投稿をもとに、noteの記事案を生成します。

【Serenaの口調・人格】
- 月のヒーラーとして、やさしく深く語りかける
- 押しつけない。「〜かもしれない」「〜のことが多いです」
- ラベンダー・月・星・水・風のメタファーをさりげなく使う
- 「必ず」「100%」「確実に」は使わない（景表法リスク）
- 誇大表現・断言はしない

【note記事の構成ルール】
- 全体：3,000〜4,000字
- 無料パート（前半）：共感・導入・読者の気持ちに寄り添う（約1,500字）
- 有料パート（後半）：具体的なワーク・実践・Serenaからのメッセージ（約1,500字）
- 有料ラインの直前に「ここから先は…」という自然な区切りを入れる

【出力形式】
以下のJSONのみ返してください。前置き・説明・コードブロック不要。

{
  "titles": [
    "タイトル案1（30字以内）",
    "タイトル案2（30字以内）",
    "タイトル案3（30字以内）"
  ],
  "price": 150,
  "price_reason": "価格設定の理由（1行）",
  "product_note": "この記事から誘導できる商品・サービス",
  "free_part": "無料パートの本文（約1,500字、改行は\\nで）",
  "paid_part": "有料パートの本文（約1,500字、改行は\\nで）",
  "cta": "記事末尾のCTA文（ココナラ・LINE・PDF診断などへの誘導文）"
}

price は 150 / 300 / 500 / 980 のいずれかを投稿の深さに応じて選んでください。`;

export async function POST(req: NextRequest) {
  const { post, memo } = await req.json();

  const userPrompt = `以下のSNS投稿がバズりました。この投稿をベースに、note記事案を生成してください。

【元投稿】
${post}

${memo ? `【追加メモ・方向性】\n${memo}` : ""}

noteとして深掘りし、読者が「もっと知りたい」と思える構成にしてください。`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 5000,
      system: NOTE_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("").trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const result = JSON.parse(cleaned);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "パースエラー", raw }, { status: 500 });
  }
}
