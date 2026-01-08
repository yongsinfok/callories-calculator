import { NextRequest, NextResponse } from "next/server";

interface ConfidenceValue {
  value: number;
  confidence: number;
}

interface GLMFoodItem {
  food_name: string;
  confidence: number;
  estimated_weight_g: number | ConfidenceValue;
  calories: number | ConfidenceValue;
  protein_g: number | ConfidenceValue;
  carbs_g: number | ConfidenceValue;
  fat_g: number | ConfidenceValue;
}

interface GLMResponse {
  foods: GLMFoodItem[];
  total_calories: number;
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
4. 为每个食物和每个营养值提供置信度分数（0-100）

返回格式（严格遵守）:
{
  "foods": [
    {
      "food_name": "食物名称",
      "confidence": 整体置信度(0-100),
      "estimated_weight_g": {"value": 估算重量, "confidence": 置信度(0-100)},
      "calories": {"value": 热量(大卡), "confidence": 置信度(0-100)},
      "protein_g": {"value": 蛋白质(克), "confidence": 置信度(0-100)},
      "carbs_g": {"value": 碳水化合物(克), "confidence": 置信度(0-100)},
      "fat_g": {"value": 脂肪(克), "confidence": 置信度(0-100)}
    }
  ],
  "total_calories": 总热量
}

置信度评估标准:
- 90-100: 非常确定，食物清晰可见
- 70-89: 较为确定，基本正确但可能有小误差
- 50-69: 中等确定，建议用户确认
- 0-49: 不确定，强烈建议用户检查

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
        max_tokens: 4096,
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
    console.log("GLM API full response:", JSON.stringify(data, null, 2));
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("GLM API returned empty content. Full response:", JSON.stringify(data, null, 2));
      // Check if there's an error in the response
      if (data.error) {
        return NextResponse.json(
          { error: `API错误: ${data.error.message || data.error}` },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "AI返回结果为空，请检查API密钥或稍后重试" },
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
      // Check if response might be truncated
      if (jsonStr.length > 500 && !jsonStr.trim().endsWith("}")) {
        return NextResponse.json(
          { error: "AI响应被截断，请减少食物种类后重试" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "AI返回格式错误，请重试" },
        { status: 500 }
      );
    }

    // Check if it's an error response
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    // Normalize response to ensure all values have confidence info
    // Handle both old format (plain numbers) and new format (with confidence)
    const normalizedFoods = result.foods.map(food => {
      const normalizeValue = (val: number | ConfidenceValue, defaultConfidence = 75): ConfidenceValue => {
        if (typeof val === 'number') {
          return { value: val, confidence: defaultConfidence };
        }
        return val;
      };

      const overallConfidence = food.confidence ?? 75;

      return {
        food_name: food.food_name,
        confidence: overallConfidence,
        estimated_weight_g: normalizeValue(food.estimated_weight_g, overallConfidence),
        calories: normalizeValue(food.calories, overallConfidence),
        protein_g: normalizeValue(food.protein_g, overallConfidence),
        carbs_g: normalizeValue(food.carbs_g, overallConfidence),
        fat_g: normalizeValue(food.fat_g, overallConfidence),
      };
    });

    return NextResponse.json({
      foods: normalizedFoods,
      total_calories: result.total_calories,
    });
  } catch (error) {
    console.error("Recognize food error:", error);
    const errorMessage = error instanceof Error ? error.message : "识别失败，请重试";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
