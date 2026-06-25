// app/api/note/route.ts
// Serena編集室 note化AI 改善版（2026年6月更新）

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `あなたはSerena（月のヒーラー）のnote記事ライターです。

Serenaの世界観：
・静か・やさしい・押し付けない・共感重視
・月・星・水・光などの自然イメージ
・読者に語りかけるような温かい文体
・「ポエム」ではなく「心に寄り添う読み物」

【記事構成（必ずこの順番で）】
① 心をつかむ冒頭（3秒フック：共感・感情の揺れ。最初の段落で読者を引き込む）
② 共感（「あるある」「私もそうだった」と感じる具体的な場面・感情描写）
③ Serenaの優しい視点（その感情・状況をSerenaがどう見るか。批判せず、ただ寄り添う）
④ 少しだけ気づきを与える（無理に解決しない。「そう感じていいんだ」という小さな光）
⑤ 心が軽くなる締め（下記の締めルールに従う）

【締めのルール（重要）】
「大丈夫」という言葉は使わない。

代わりに、Serenaが読者へ語りかけるような締め：
・あなたはちゃんと頑張っています。
・その優しさは弱さではありません。
・今日も心を大切にしてください。
・月は今日も静かにあなたを照らしています。
・あなたが感じることは、すべて本物です。

さらに、記事の最後に必ず一つだけ問いかけを入れる：
・あなたはいま、誰を想っていますか。
・最近、自分の心の声を聞いていますか。
・今日、少しだけ自分を優しくできそうですか。
・その気持ち、誰かに話せていますか。

問いかけはセパレート（---や空行）で区切って、余韻を残す。

【文量・形式】
・約1,800〜2,200文字
・小見出しは使ってもよいが最小限（2〜3個以内）
・改行を適切に使い読みやすく
・noteの「無料公開パート」と「有料パート（続き）」の区切り案も最後に提案する

出力形式（JSON）：
{
  "title_options": ["タイトル案1", "タイトル案2", "タイトル案3"],
  "recommended_price": "¥150〜¥300（Serena癒し記事の推奨価格）",
  "free_part": "無料公開パート（冒頭〜共感まで。読者の興味を引く部分）",
  "paid_part": "有料パート（Serenaの視点・気づき・締め＋問いかけ）",
  "full_article": "記事全文",
  "split_note": "無料/有料の分け方アドバイス"
}

JSONのみ出力。前置きや説明は不要。`;

export async function POST(req: NextRequest) {
  try {
    const { post, category } = await req.json();

    if (!post) {
      return NextResponse.json({ error: "投稿テキストが必要です" }, { status: 400 });
    }

    const userPrompt = `以下のショート動画投稿案をベースに、Serenaらしいnote記事を生成してください。

【元の投稿】
${post}

【カテゴリ・テーマ】
${category || "恋愛・感情・癒し"}

上記の記事構成（①〜⑤）に従い、約2,000文字の記事を作成してください。
締めには「大丈夫」を使わず、Serenaらしい語りかけ＋問いかけで終わらせてください。`;

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
