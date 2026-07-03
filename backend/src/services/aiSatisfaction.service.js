import OpenAI from "openai";

const ALLOWED_TEAMS = [
  "Support Team",
  "RMA Team",
  "Product / Hardware Team",
  "Firmware / Software Team",
  "Customer Feedback",
  "Unclear",
];

const ALLOWED_SENTIMENTS = ["Positive", "Negative", "Neutral", "Mixed"];

let openaiClient = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
}

function cleanText(value, maxLength = 6000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function validateInput({ ticketId, rating, comment, reason }) {
  const cleanComment = cleanText(comment);
  const cleanReason = cleanText(reason);

  if (!cleanComment && !cleanReason) {
    const error = new Error("No comment or reason notes available for AI analysis.");
    error.statusCode = 400;
    throw error;
  }

  return {
    ticketId: cleanText(ticketId, 200) || "Unknown",
    rating: cleanText(rating, 100) || "Unknown",
    comment: cleanComment || "No comment provided.",
    reason: cleanReason || "No reason notes provided.",
  };
}

function normalizeResult(result) {
  return {
    team: ALLOWED_TEAMS.includes(result?.team) ? result.team : "Unclear",
    summary: cleanText(result?.summary, 800) || "No summary was returned.",
    sentiment: ALLOWED_SENTIMENTS.includes(result?.sentiment)
      ? result.sentiment
      : "Neutral",
    confidence: Math.max(0, Math.min(1, Number(result?.confidence) || 0)),
    explanation:
      cleanText(result?.explanation, 1200) || "No explanation was returned.",
    recommendedAction:
      cleanText(result?.recommendedAction, 800) ||
      "Review this satisfaction response manually.",
    evidence: Array.isArray(result?.evidence)
      ? result.evidence.map((x) => cleanText(x, 300)).filter(Boolean).slice(0, 5)
      : [],
  };
}

export async function analyzeSatisfactionWithAI(input) {
  const data = validateInput(input);
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    instructions: `
You analyze customer satisfaction feedback for Atomos technical support operations.

Classify which team should primarily review or own the feedback.

Allowed team values:
- Support Team
- RMA Team
- Product / Hardware Team
- Firmware / Software Team
- Customer Feedback
- Unclear

Guidance:
- Support Team: communication, response speed, troubleshooting, follow-up, service quality.
- RMA Team: warranty, replacement, returns, defective-unit replacement process, RMA delays.
- Product / Hardware Team: hardware defects, camera monitors, recorders, accessories, physical device behavior.
- Firmware / Software Team: firmware, activation, software, app, licensing, compatibility or system issues.
- Customer Feedback: general praise or dissatisfaction without clear operational owner.
- Unclear: insufficient evidence.

Do not invent facts.
Summary must be concise and operational.
Confidence must be 0 to 1.
    `.trim(),
    input: `
Ticket ID: ${data.ticketId}
Rating: ${data.rating}

Customer comment:
${data.comment}

Reason notes:
${data.reason}
    `.trim(),
    text: {
      format: {
        type: "json_schema",
        name: "atomos_satisfaction_ai_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            team: { type: "string", enum: ALLOWED_TEAMS },
            summary: { type: "string" },
            sentiment: { type: "string", enum: ALLOWED_SENTIMENTS },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            explanation: { type: "string" },
            recommendedAction: { type: "string" },
            evidence: {
              type: "array",
              items: { type: "string" },
              maxItems: 5,
            },
          },
          required: [
            "team",
            "summary",
            "sentiment",
            "confidence",
            "explanation",
            "recommendedAction",
            "evidence",
          ],
        },
      },
    },
  });

  if (!response.output_text) {
    const error = new Error("AI returned an empty response.");
    error.statusCode = 502;
    throw error;
  }

  return {
    ...normalizeResult(JSON.parse(response.output_text)),
    model,
    responseId: response.id,
    analyzedAt: new Date().toISOString(),
  };
}