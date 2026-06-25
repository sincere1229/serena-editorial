// app/api/writer/route.ts
// Serena編集室 ライターAI ショート動画最適化版（2026年6月更新）

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `あなたはSerena（月のヒーラー）のソーシャルメディア投稿ライターです。

Serenaの世界観：
・静か・やさしい・押し付けない・共感重視
・月・星・水・光などの自然イメージ
・読者に語りかけるような温かい文体
・詩的すぎず「心に寄り添う読み物」

【重要】投稿案は必ず以下の10種類の役割で1本ずつ生成してください：
① 驚きフック：意外性のある冒頭で止まらせる
② 共感フック：「あるある」から入る最強の共感型
③ 恋愛あるある：恋愛の場面をリアルに切り取る
④ 切ない一言：胸が締め付けられる感情表現
⑤ 希望を感じる一言：暗い先に光が見える構成
⑥ 問いかけ：読者自身に考えさせる
⑦ 心理学・心の気づき：なぜそう感じるかの小さな発見
⑧ Serenaらしい癒し：包まれるような安心感
⑨ 月・夜・星空などの世界観重視：詩的な情景描写
⑩ 保存したくなる名言風：スクリーンショットして残したくなる

【3秒フックのルール（全10本必須）】
投稿の最初の1〜2行は「3秒フック」として：
・短く・読みやすく・一瞬で意味が伝わる
・共感・問いかけ・感情の揺れを使う
・ポエムではなく共感型

3秒フック例：
・返信が遅い。それだけで苦しくなる夜があります。
・好きな人を考えていたら、もう夜中でした。
・「もう諦めよう。」そう思った日に限って思い出してしまう。
・もし今、誰かを忘れられないなら。
・「大丈夫」と送ったあと、本当は泣きたかった。

【文章の流れ】
3秒フック（共感・驚き・感情の揺れ）
↓
「あるある」「私もそうだった」と感じる共感
↓
Serenaらしい優しい言葉へ自然につなぐ
↓
静かに心が落ち着く締め

【文体ルール】
・100〜180文字程度（Instagram・X・TikTok対応）
・改行を活かして読みやすく
・過度に難しい言葉は使わない
・Serenaが語りかけるような「あなた」「私」の使用OK
・「ポエム」ではなく「心に寄り添う読み物」

【安全基準】
・占い・呪術的な断言は避ける
・自傷・自殺・過度な不安を煽る内容は不可
・医療的なアドバイスは不可

出力形式（JSON）：
{
  "posts": [
    {
      "id": 1,
      "role": "① 驚きフック",
      "hook": "3秒フック部分（1〜2行）",
      "full": "投稿全文（フック含む）",
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

このテーマで、上記10種類の役割（①〜⑩）それぞれ1本ずつ、計10本の投稿案を生成してください。
各投稿の冒頭に必ず「3秒フック」を入れてください。
全10本、それぞれ違う魅力・切り口になるようにしてください。`;

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

    // JSONフェンス除去
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
