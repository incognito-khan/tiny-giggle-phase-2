import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildContextBlock,
  detectRouteIntent,
  getRouteCatalog,
  retrieveKnowledge,
} from "@/lib/tiny-agent/retriever";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const RequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .max(12)
    .optional()
    .default([]),
  currentPath: z.string().optional().default("/"),
});

const SYSTEM_PROMPT = `You are Tiny Agent, the official AI assistant for Tiny Giggle.

Rules:
1. Be accurate, warm, and concise.
2. Only provide information grounded in the supplied Tiny Giggle context.
3. If confidence is low, state that clearly and suggest the closest valid route.
4. If the user asks where to go, suggest a route from the allowed route catalog.
5. Do not invent non-existent Tiny Giggle pages.

Output format:
Return valid JSON only with this exact shape:
{
  "answer": "string",
  "routePath": "string or null",
  "routeReason": "string or null",
  "followUps": ["string", "string"]
}

Constraints:
- routePath must be one of the allowed routes, otherwise null.
- followUps should have 0 to 2 short prompts.
- Keep answer under 140 words when possible.
`;

function parseModelJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, history, currentPath } = parsed.data;

    const retrievedDocs = retrieveKnowledge(message, 4);
    const contextBlock = buildContextBlock(retrievedDocs);
    const routeCatalog = getRouteCatalog();
    const deterministicRoute = detectRouteIntent(message);

    const modelMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Current path: ${currentPath}\n\nAllowed route catalog:\n${JSON.stringify(
          routeCatalog,
          null,
          2
        )}\n\nRetrieved Tiny Giggle context:\n${contextBlock}\n\nDeterministic route candidate:\n${JSON.stringify(
          deterministicRoute,
          null,
          2
        )}`,
      },
      ...history.map((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tinygiggle.app",
        "X-Title": "Tiny Giggle - Tiny Agent",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: modelMessages,
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: "Tiny Agent upstream error.",
          status: response.status,
          details: errorText.slice(0, 1000),
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawReply = data?.choices?.[0]?.message?.content || "";
    const jsonReply = parseModelJson(rawReply);

    const fallbackAnswer =
      "I can help with Tiny Giggle features, pages, and parenting workflows. Ask me where to find milestones, pricing, or dashboard tools.";

    const answer =
      typeof jsonReply?.answer === "string" && jsonReply.answer.trim().length > 0
        ? jsonReply.answer.trim()
        : rawReply?.trim() || fallbackAnswer;

    const allowedPathSet = new Set(routeCatalog.map((route) => route.path));
    const modelPath =
      typeof jsonReply?.routePath === "string" ? jsonReply.routePath.trim() : null;

    const chosenPath =
      modelPath && allowedPathSet.has(modelPath)
        ? modelPath
        : deterministicRoute?.path || null;

    const routeReason =
      typeof jsonReply?.routeReason === "string" && jsonReply.routeReason.trim()
        ? jsonReply.routeReason.trim()
        : deterministicRoute?.reason || null;

    const followUps = Array.isArray(jsonReply?.followUps)
      ? jsonReply.followUps
          .filter((item) => typeof item === "string" && item.trim().length > 0)
          .slice(0, 2)
      : [];

    return NextResponse.json({
      reply: answer,
      suggestedRoute: chosenPath
        ? {
            path: chosenPath,
            reason: routeReason,
          }
        : null,
      retrievedSources: retrievedDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        score: Number(doc.score.toFixed(3)),
      })),
      followUps,
    });
  } catch (error) {
    console.error("Tiny Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}