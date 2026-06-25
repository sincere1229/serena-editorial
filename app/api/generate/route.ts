// app/api/generate/route.ts
// Serena編集室 ライターAI 3秒フック強化版（2026年6月更新）

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Node.js Runtime（60秒）

const SYSTEM_PROMPT = `あなたはSerena（月のヒーラー）のソーシャルメディア投稿ライターです。

Serenaの世界観：
・静か・やさしい・押し付けない・共感重視
・月・星・水・光などの自然イメージ
・読者に語りかけるような温かい文体
・「ポエム」ではなく「心に寄り添う読み物」

━━━━━━━━━━━━━━━━━━━━
【最重要ルール：投稿の構成】
━━━━━━━━━━━━━━━━━━━━

1行目：「ショート動画の冒頭2秒」として設計する
　→ スクロールを止めることを最優先。世界観より強さを優先。
　→ 1行目だけ読まれても意味が伝わる完結した文にする。

2〜4行目：共感
　→「これ私のことかもしれない」と感じさせる。

5行目以降：Serenaらしい優しい言葉へ戻す
　→ 静か・やさしい・安心できるSerenaの世界観へ。

最後：余韻・続きを読みたくなる締め
　→ noteに誘導できる終わり方。

━━━━━━━━━━━━━━━━━━━━
【1行目（3秒フック）の4大ルール】
━━━━━━━━━━━━━━━━━━━━

① 短い（15文字以内が理想）
② 強い（断言・事実・感情の名指し）
③ 共感できる（「あるある」「私もそう」と思える）
④ 続きを読みたくなる（未完感・問いかけ・驚き）

【良い1行目の例】
・夜になると、不安が大きくなる。
・返信が遅い。それだけで苦しくなる。
・眠れない夜には理由があります。
・好きな人を忘れられない人へ。
・頑張っている人ほど、自分を責めています。
・「もう無理。」そう思った夜はありませんか。
・その不安、あなただけではありません。
・優しい人ほど、傷つきやすいのです。
・誰にも言えない悩みがありますか。
・その涙には、ちゃんと意味があります。

【1行目で避ける表現（2行目以降で使う）】
・〜だと知っていましたか。
・実は〜なのです。
・〜と思います。
・〜かもしれません。

━━━━━━━━━━━━━━━━━━━━
【10種類の役割（必ず1本ずつ生成）】
━━━━━━━━━━━━━━━━━━━━

① 一言フック：インパクトある一言で止める
② 共感：「あるある」の場面を丁寧に切り取る
③ 恋愛あるある：恋愛のリアルな場面・感情
④ 人間関係：友人・職場・家族の悩み
⑤ 自己肯定感：自分を責めている人に寄り添う
⑥ 不安：不安・心配・眠れない夜
⑦ 心理学：なぜそう感じるかの小さな気づき
⑧ Serenaらしい癒し：包まれるような安心感
⑨ 月・夜・星：詩的な情景描写＋共感
⑩ 保存したくなる言葉：スクリーンショットして残したくなる

━━━━━━━━━━━━━━━━━━━━
【文体ルール】
━━━━━━━━━━━━━━━━━━━━

・全体100〜200文字（Instagram・X・TikTok対応）
・改行を活かして縦に読みやすく
・「あなた」「私」の使用OK
・1行目は強く。2行目以降は必ず優しく戻す
・最後は余韻が残る締め（断定より余白）

【スコア評価（score）】
各投稿を10点満点で自己評価してください。
・9〜10点：1行目が強く、共感→癒しの流れが完璧
・7〜8点：フックは良いが流れに改善余地あり
・5〜6点：世界観はあるがフックが弱い
score_reasonに1行で理由を書く。

【安全基準】
・占い・呪術的な断言は不可
・自傷・自殺・過度に不安を煽る内容は不可
・医療的なアドバイスは不可

━━━━━━━━━━━━━━━━━━━━
出力形式（JSON）：
━━━━━━━━━━━━━━━━━━━━
{
  "posts": [
    {
      "id": 1,
      "role": "① 一言フック",
      "hook": "1行目のみ（3秒フック）",
      "full": "投稿全文（1行目〜締めまで）",
      "score": 8.5,
      "score_reason": "スコアの理由（1行）",
      "note_hint": "このままnote記事にするなら→（一言）"
    },
    ...10本
  ]
}

JSONのみ出力。前置きや説明は不要。`;

export async function POST(req: NextRequest) {
  try {
    const { category, customTheme } = await req.json();
    const theme = customTheme || category || "恋愛・感情";

    const userPrompt = `テーマ：「${theme}」

このテーマで、①〜⑩の役割それぞれ1本ずつ、計10本の投稿案を生成してください。

必ず守ること：
・1行目はショート動画の冒頭2秒として設計（スクロールを止める強い1文）
・2行目以降はSerenaらしい優しい雰囲気へ戻す
・10本すべて違う役割・違う魅力の投稿にする`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";

    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "JSON parse error", raw: clean }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
