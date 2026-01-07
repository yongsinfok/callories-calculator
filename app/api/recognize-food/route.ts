import { NextRequest, NextResponse } from "next/server";

interface GLMFoodItem {
  food_name: string;
  estimated_weight_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface GLMResponse {
  foods: GLMFoodItem[];
  total_calories: number;
  confidence: "high" | "medium" | "low";
}

interface GLMErrorResponse {
  error: string;
  suggestion?: string;
}

const PROMPT = `你是一个专业的营养分析助手。请分析这张图片中的食物，返回 JSON 格式。

要求:
1. 识别所有可见的食物
2. 估算每种食物的重量（克）
3. 计算热量和营养成分
4. 如果是多食物，返回数组

返回格式（严格遵守）:
{
  "foods": [
    {
      "food_name": "食物名称",
      "estimated_weight_g": 估算重量,
      "calories": 热量(大卡),
      "protein_g": 蛋白质(克),
      "carbs_g": 碳水化合物(克),
      "fat_g": 脂肪(克)
    }
  ],
  "total_calories": 总热量,
  "confidence": "high" | "medium" | "low"
}

如果图片模糊或无法识别，返回:
{
  "error": "无法识别，请重新拍照",
  "suggestion": "建议: 靠近一些，确保光线充足"
}`;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "请提供图片" },
        { status: 400 }
      );
    }

    // Validate image format (should be base64 or URL)
    if (!image.startsWith("data:image") && !image.startsWith("http")) {
      return NextResponse.json(
        { error: "图片格式不正确" },
        { status: 400 }
      );
    }

    console.log("Image received, length:", image.length);

    // Call GLM-4.6V API
    const glmApiUrl = process.env.GLM_API_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    const apiKey = process.env.GLM_API_KEY;

    if (!apiKey) {
      console.error("GLM_API_KEY not configured");
      return NextResponse.json(
        { error: "API密钥未配置" },
        { status: 500 }
      );
    }

    console.log("Calling GLM API with model: glm-4.6v-flash");

    const response = await fetch(glmApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4.6v-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
              {
                type: "text",
                text: PROMPT,
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("GLM API error:", errorData);
      let errorMessage = "AI识别服务暂时不可用";
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorJson.error || errorMessage;
      } catch {
        // If not JSON, use the raw error text
        if (errorData) errorMessage = `API错误: ${errorData}`;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("GLM API response status:", response.status);
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("GLM API returned empty content");
      return NextResponse.json(
        { error: "AI返回结果为空" },
        { status: 500 }
      );
    }

    console.log("GLM API content length:", content.length);

    // Parse JSON from content (remove markdown code blocks if present)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json\n?|\n?```/g, "");
    }

    let result: GLMResponse | GLMErrorResponse;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse GLM response:", jsonStr);
      return NextResponse.json(
        { error: "AI返回格式错误" },
        { status: 500 }
      );
    }

    // Check if it's an error response
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recognize food error:", error);
    const errorMessage = error instanceof Error ? error.message : "识别失败，请重试";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
