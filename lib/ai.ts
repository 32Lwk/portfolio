import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(content: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "あなたは技術ブログ記事の要約を生成するアシスタントです。記事の内容を150文字以内で簡潔に要約してください。",
        },
        {
          role: "user",
          content: `以下の記事を要約してください:\n\n${content.substring(0, 2000)}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "";
  }
}

export async function generateMetadataFromContent(
  content: string
): Promise<{ description: string; keywords: string[] }> {
  if (!process.env.OPENAI_API_KEY) {
    return { description: "", keywords: [] };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "あなたはSEOメタデータを生成するアシスタントです。記事の内容から、SEO用の説明文（150文字以内）とキーワード（5つまで）を生成してください。JSON形式で返してください。",
        },
        {
          role: "user",
          content: `以下の記事からメタデータを生成してください:\n\n${content.substring(0, 2000)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.7,
    });

    const result = JSON.parse(
      response.choices[0]?.message?.content || "{}"
    );
    return {
      description: result.description || "",
      keywords: result.keywords || [],
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { description: "", keywords: [] };
  }
}
