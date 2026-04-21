import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildContextBlock,
  retrieveKnowledgeFromDocs,
} from "@/lib/tiny-agent/retriever";
import {
  PARENT_AGENT_KNOWLEDGE,
  PARENT_AGENT_ROUTES,
} from "@/lib/tiny-agent/parent-knowledge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const USER_MESSAGE_TITLE = "PARENT_AGENT_USER";
const ASSISTANT_MESSAGE_TITLE = "PARENT_AGENT_ASSISTANT";
const META_MESSAGE_TITLE = "PARENT_AGENT_META";
const MAX_PERSISTED_TURNS = 60;
const DEFAULT_CONVERSATION_TITLE = "New Conversation";

const RequestSchema = z.object({
  message: z.string().trim().min(1).max(3000),
  parentId: z.string().trim().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(3000),
      })
    )
    .max(16)
    .optional()
    .default([]),
  currentPath: z.string().optional().default("/parent-dashboard/agent"),
});

const StreamRequestSchema = z.object({
  message: z.string().trim().min(1).max(3000),
  parentId: z.string().trim().min(1),
  currentPath: z.string().optional().default("/parent-dashboard/agent"),
});

const SYSTEM_PROMPT = `You are Parent Agent, an expert parenting assistant inside Tiny Giggle.

Rules:
1. Be helpful, warm, and practical.
2. Use only supplied context documents and parent snapshot context.
3. Never claim to give a final medical diagnosis.
4. For high-risk symptoms, clearly advise urgent professional care.
5. If relevant, recommend Tiny Giggle store products only from provided context.
6. Give structured responses with practical steps.

Output format:
Return valid JSON only with this exact shape:
{
  "answer": "string",
  "routePath": "string or null",
  "routeReason": "string or null",
  "followUps": ["string", "string"],
  "productSuggestions": ["string", "string"],
  "safetyNote": "string or null"
}

Constraints:
- routePath must be one of allowed parent routes or null.
- followUps should have 0 to 2 short items.
- productSuggestions should have 0 to 3 product names that exist in supplied context.
- Keep answers detailed but concise.
`;

const STREAM_SYSTEM_PROMPT = `You are Parent Agent, an expert parenting assistant inside Tiny Giggle.

Rules:
1. Provide practical, warm, detailed guidance.
2. Use only supplied context and Tiny Giggle data.
3. Never claim final medical diagnosis.
4. For warning signs, advise urgent professional care clearly.
5. Mention Tiny Giggle store product options only when relevant.

Write plain text only.`;

function parseModelJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function generateConversationTitle(seedMessage) {
  const normalized = String(seedMessage || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  const stripped = normalized.replace(/^(my|the|a|an|please|can you|could you|help me|i need)\s+/i, "");
  const words = stripped.split(" ").slice(0, 7);
  const title = words
    .join(" ")
    .replace(/[^a-zA-Z0-9\s'-]/g, "")
    .trim();

  if (!title) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  return title.charAt(0).toUpperCase() + title.slice(1);
}

async function getConversationMeta(parentId) {
  if (!parentId) {
    return null;
  }

  return prisma.message.findFirst({
    where: {
      parentId,
      title: META_MESSAGE_TITLE,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      description: true,
    },
  });
}

async function ensureConversationTitle(parentId, seedMessage) {
  if (!parentId) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  const existingMeta = await getConversationMeta(parentId);
  if (existingMeta?.description) {
    const parsed = safeJsonParse(existingMeta.description);
    if (parsed?.conversationTitle) {
      return parsed.conversationTitle;
    }
  }

  const conversationTitle = generateConversationTitle(seedMessage);

  await prisma.message.create({
    data: {
      title: META_MESSAGE_TITLE,
      description: JSON.stringify({ conversationTitle }),
      parentId,
    },
  });

  return conversationTitle;
}

function toUiHistory(messages) {
  return (messages || []).map((msg) => ({
    role: msg.title === USER_MESSAGE_TITLE ? "user" : "assistant",
    content: msg.description || "",
  }));
}

async function loadPersistedHistory(parentId, limit = 16) {
  if (!parentId) {
    return [];
  }

  const rows = await prisma.message.findMany({
    where: {
      parentId,
      title: {
        in: [USER_MESSAGE_TITLE, ASSISTANT_MESSAGE_TITLE],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return toUiHistory(rows.reverse());
}

async function persistTurn({ parentId, role, content }) {
  if (!parentId || !content?.trim()) {
    return;
  }

  await prisma.message.create({
    data: {
      title: role === "user" ? USER_MESSAGE_TITLE : ASSISTANT_MESSAGE_TITLE,
      description: content.trim(),
      parentId,
    },
  });
}

async function trimPersistedHistory(parentId) {
  if (!parentId) {
    return;
  }

  const rows = await prisma.message.findMany({
    where: {
      parentId,
      title: {
        in: [USER_MESSAGE_TITLE, ASSISTANT_MESSAGE_TITLE],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: { id: true },
  });

  if (rows.length <= MAX_PERSISTED_TURNS) {
    return;
  }

  const toDelete = rows.slice(MAX_PERSISTED_TURNS).map((row) => row.id);

  if (toDelete.length) {
    await prisma.message.deleteMany({
      where: {
        id: { in: toDelete },
      },
    });
  }
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter(Boolean);
}

function isHealthIntent(query) {
  const keywords = [
    "fever",
    "temperature",
    "cold",
    "cough",
    "flu",
    "medicine",
    "medication",
    "sick",
    "ill",
    "vomit",
    "diarrhea",
    "rash",
    "pain",
    "doctor",
    "hospital",
    "teething",
    "hydration",
    "health",
  ];

  const normalized = normalize(query);
  return keywords.some((kw) => normalized.includes(kw));
}

function rankProductsForQuery(query, products) {
  const queryTokens = tokenize(query);
  const healthIntent = isHealthIntent(query);

  return (products || [])
    .map((product) => {
      const searchable = `${product.name} ${product.category?.name || ""} ${product.subCategory?.name || ""}`;
      const productTokens = tokenize(searchable);
      const lexical = overlapScore(queryTokens, productTokens);

      const normalizedName = normalize(product.name);
      const normalizedCategory = normalize(product.category?.name || "");
      const normalizedSubCategory = normalize(product.subCategory?.name || "");

      let boost = 0;

      if (healthIntent) {
        const healthCategoryTerms = [
          "health",
          "care",
          "medical",
          "safety",
          "hygiene",
          "thermometer",
          "fever",
          "first aid",
        ];

        const hasHealthCategory = healthCategoryTerms.some(
          (term) =>
            normalizedCategory.includes(term) ||
            normalizedSubCategory.includes(term) ||
            normalizedName.includes(term)
        );

        if (hasHealthCategory) {
          boost += 0.25;
        }
      }

      if (product.quantity > 0) {
        boost += 0.03;
      }

      return {
        ...product,
        rankScore: lexical + boost,
      };
    })
    .filter((product) => product.rankScore > 0)
    .sort((a, b) => b.rankScore - a.rankScore);
}

function overlapScore(queryTokens, contentTokens) {
  if (!queryTokens.length || !contentTokens.length) {
    return 0;
  }

  const contentSet = new Set(contentTokens);
  let score = 0;

  for (const token of queryTokens) {
    if (contentSet.has(token)) {
      score += 1;
    }
  }

  return score / Math.sqrt(queryTokens.length * contentSet.size);
}

function detectRouteIntent(query) {
  const queryTokens = tokenize(query);

  const ranked = PARENT_AGENT_ROUTES.map((route) => {
    const routeTokens = tokenize(
      `${route.title} ${route.description} ${(route.keywords || []).join(" ")}`
    );

    return {
      ...route,
      score: overlapScore(queryTokens, routeTokens),
    };
  })
    .filter((route) => route.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length || ranked[0].score < 0.17) {
    return null;
  }

  return {
    path: ranked[0].path,
    reason: `Best route match for the request: ${ranked[0].title}.`,
  };
}

function getRouteCatalog() {
  return PARENT_AGENT_ROUTES.map((route) => ({
    path: route.path,
    title: route.title,
    description: route.description,
  }));
}

function toAgeSummary(birthday) {
  if (!birthday) {
    return "Age unknown";
  }

  const now = new Date();
  const dob = new Date(birthday);
  const months = Math.max(
    0,
    (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
  );

  if (months < 24) {
    return `${months} months old`;
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return `${years} years ${remMonths} months old`;
}

function buildParentDocs(parent) {
  if (!parent) {
    return [];
  }

  const childDocs = (parent.children || []).map((child) => {
    const totalVaccines = child.vaccinationProgress?.length || 0;
    const takenVaccines = (child.vaccinationProgress || []).filter(
      (entry) => entry.status === "TAKEN"
    ).length;
    const achievedMilestones = (child.milestoneProgress || []).filter(
      (entry) => entry.achieved
    ).length;

    return {
      id: `child-${child.id}`,
      title: `Child Profile: ${child.name}`,
      body:
        `${child.name} is ${toAgeSummary(child.birthday)}. ` +
        `Type: ${child.type}. Height: ${child.height ?? "N/A"}. Weight: ${child.weight ?? "N/A"}. ` +
        `Vaccinations taken ${takenVaccines}/${totalVaccines}. ` +
        `Milestones achieved: ${achievedMilestones}.`,
      tags: ["child", "profile", "health", "growth"],
    };
  });

  return [
    {
      id: `parent-${parent.id}`,
      title: `Parent Context: ${parent.name || "Parent"}`,
      body: `${parent.name || "Parent"} has ${(parent.children || []).length} children linked in Tiny Giggle.`,
      tags: ["parent", "context", "dashboard"],
    },
    ...childDocs,
  ];
}

function buildProductDocs(products) {
  return (products || []).map((product) => ({
    id: `product-${product.id}`,
    title: `Store Product: ${product.name}`,
    body:
      `${product.name} in category ${product.category?.name || "General"} ` +
      `${product.subCategory?.name ? `and subcategory ${product.subCategory.name} ` : ""}` +
      `is available at price ${product.salePrice}. Stock: ${product.quantity}.`,
    tags: [
      "store",
      "product",
      String(product.category?.name || "").toLowerCase(),
      String(product.subCategory?.name || "").toLowerCase(),
    ].filter(Boolean),
    meta: {
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      category: product.category?.name || null,
    },
  }));
}

function toModelMessages({
  message,
  history,
  currentPath,
  routeCatalog,
  contextBlock,
  deterministicRoute,
  systemPrompt = SYSTEM_PROMPT,
}) {
  return [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content:
        `Current path: ${currentPath}\n\n` +
        `Allowed parent routes:\n${JSON.stringify(routeCatalog, null, 2)}\n\n` +
        `Retrieved context:\n${contextBlock}\n\n` +
        `Deterministic route candidate:\n${JSON.stringify(deterministicRoute, null, 2)}`,
    },
    ...history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    { role: "user", content: message },
  ];
}

async function buildAgentRuntime({ message, history, parentId, currentPath }) {
  const [parent, products, persistedHistory] = await Promise.all([
    parentId
      ? prisma.parent.findUnique({
          where: { id: parentId },
          select: {
            id: true,
            name: true,
            children: {
              select: {
                id: true,
                name: true,
                birthday: true,
                type: true,
                height: true,
                weight: true,
                vaccinationProgress: {
                  select: {
                    status: true,
                  },
                },
                milestoneProgress: {
                  select: {
                    achieved: true,
                  },
                },
              },
            },
          },
        })
      : Promise.resolve(null),
    prisma.product.findMany({
      where: {
        isDeleted: false,
        quantity: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        salePrice: true,
        quantity: true,
        category: {
          select: {
            name: true,
          },
        },
        subCategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 80,
    }),
    loadPersistedHistory(parentId, 16),
  ]);

  const rankedProducts = rankProductsForQuery(message, products);
  const boostedProductDocs = buildProductDocs(rankedProducts.slice(0, 30));

  const docs = [
    ...PARENT_AGENT_KNOWLEDGE,
    ...buildParentDocs(parent),
    ...boostedProductDocs,
  ];

  const retrievedDocs = retrieveKnowledgeFromDocs(message, docs, 8);
  const contextBlock = buildContextBlock(retrievedDocs);
  const routeCatalog = getRouteCatalog();
  const deterministicRoute = detectRouteIntent(message);

  const effectiveHistory = (history?.length ? history : persistedHistory).slice(-16);

  const modelMessages = toModelMessages({
    message,
    history: effectiveHistory,
    currentPath,
    routeCatalog,
    contextBlock,
    deterministicRoute,
  });

  return {
    parent,
    products,
    rankedProducts,
    retrievedDocs,
    routeCatalog,
    deterministicRoute,
    modelMessages,
  };
}

function composeResponsePayload({
  rawReply,
  jsonReply,
  routeCatalog,
  deterministicRoute,
  retrievedDocs,
  rankedProducts,
  products,
  conversationTitle = DEFAULT_CONVERSATION_TITLE,
}) {
  const answer =
    typeof jsonReply?.answer === "string" && jsonReply.answer.trim().length > 0
      ? jsonReply.answer.trim()
      : rawReply?.trim() || fallbackAnswer();

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

  const suggestedNames = Array.isArray(jsonReply?.productSuggestions)
    ? jsonReply.productSuggestions
        .filter((item) => typeof item === "string" && item.trim().length > 0)
        .slice(0, 3)
    : [];

  const matchedProducts = products
    .filter((product) =>
      suggestedNames.some(
        (name) => normalize(name) === normalize(product.name) || normalize(product.name).includes(normalize(name))
      )
    )
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.salePrice,
      category: product.category?.name || null,
    }));

  const boostedFallbackProducts = rankedProducts.slice(0, 3).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.salePrice,
    category: product.category?.name || null,
  }));

  const fallbackProductRecommendations = retrievedDocs
    .filter((doc) => String(doc?.id || "").startsWith("product-") && doc?.meta?.name)
    .slice(0, 3)
    .map((doc) => ({
      id: doc.meta.productId,
      name: doc.meta.name,
      price: doc.meta.price,
      category: doc.meta.category,
    }));

  const suggestedProducts = matchedProducts.length
    ? matchedProducts
    : boostedFallbackProducts.length
      ? boostedFallbackProducts
      : fallbackProductRecommendations;

  const safetyNote =
    typeof jsonReply?.safetyNote === "string" && jsonReply.safetyNote.trim().length > 0
      ? jsonReply.safetyNote.trim()
      : null;

  return {
    reply: answer,
    conversationTitle,
    suggestedRoute: chosenPath
      ? {
          path: chosenPath,
          reason: routeReason,
        }
      : null,
    suggestedProducts,
    safetyNote,
    retrievedSources: retrievedDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      score: Number(doc.score.toFixed(3)),
    })),
    followUps,
  };
}

async function requestNonStreamingCompletion(modelMessages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tinygiggle.app",
      "X-Title": "Tiny Giggle - Parent Agent",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: modelMessages,
      temperature: 0.3,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Parent Agent upstream error ${response.status}: ${errorText.slice(0, 500)}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const parentId = url.searchParams.get("parentId")?.trim();

    if (!parentId) {
      return NextResponse.json(
        { error: "parentId is required." },
        { status: 400 }
      );
    }

    const [rows, meta] = await Promise.all([
      prisma.message.findMany({
        where: {
          parentId,
          title: {
            in: [USER_MESSAGE_TITLE, ASSISTANT_MESSAGE_TITLE],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: MAX_PERSISTED_TURNS,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },
      }),
      getConversationMeta(parentId),
    ]);

    const parsedMeta = meta?.description ? safeJsonParse(meta.description) : null;
    const conversationTitle =
      parsedMeta?.conversationTitle ||
      (rows.length > 0
        ? generateConversationTitle(
            rows
              .slice()
              .reverse()
              .find((row) => row.title === USER_MESSAGE_TITLE)?.description || ""
          )
        : DEFAULT_CONVERSATION_TITLE);

    return NextResponse.json({
      conversationTitle,
      messages: rows.reverse().map((row) => ({
        id: row.id,
        role: row.title === USER_MESSAGE_TITLE ? "user" : "assistant",
        content: row.description || "",
        createdAt: row.createdAt,
      })),
    });
  } catch (error) {
    console.error("Parent Agent GET history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const parentId = url.searchParams.get("parentId")?.trim();

    if (!parentId) {
      return NextResponse.json(
        { error: "parentId is required." },
        { status: 400 }
      );
    }

    await prisma.message.deleteMany({
      where: {
        parentId,
        title: {
          in: [USER_MESSAGE_TITLE, ASSISTANT_MESSAGE_TITLE, META_MESSAGE_TITLE],
        },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Parent Agent DELETE history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { parentId, newTitle } = body;

    if (!parentId?.trim()) {
      return NextResponse.json(
        { error: "parentId is required." },
        { status: 400 }
      );
    }

    if (!newTitle?.trim()) {
      return NextResponse.json(
        { error: "newTitle is required." },
        { status: 400 }
      );
    }

    const trimmedTitle = newTitle.trim().substring(0, 100);

    // Update the meta message that stores the title
    const existingMeta = await prisma.message.findFirst({
      where: {
        parentId,
        title: META_MESSAGE_TITLE,
      },
    });

    if (existingMeta) {
      await prisma.message.update({
        where: { id: existingMeta.id },
        data: { content: trimmedTitle },
      });
    } else {
      await prisma.message.create({
        data: {
          parentId,
          role: "system",
          content: trimmedTitle,
          title: META_MESSAGE_TITLE,
        },
      });
    }

    return NextResponse.json({
      success: true,
      newTitle: trimmedTitle,
    });
  } catch (error) {
    console.error("Parent Agent PATCH title error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function fallbackAnswer() {
  return "I can help with baby care guidance, milestone and vaccination context, and relevant Tiny Giggle store suggestions. Tell me your baby concern and I will suggest practical next steps.";
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

    const { message, history, parentId, currentPath } = parsed.data;

    const runtime = await buildAgentRuntime({
      message,
      history,
      parentId,
      currentPath,
    });

    const rawReply = await requestNonStreamingCompletion(runtime.modelMessages);
    const jsonReply = parseModelJson(rawReply);

    const conversationTitle = await ensureConversationTitle(parentId, message);

    const payload = composeResponsePayload({
      rawReply,
      jsonReply,
      routeCatalog: runtime.routeCatalog,
      deterministicRoute: runtime.deterministicRoute,
      retrievedDocs: runtime.retrievedDocs,
      rankedProducts: runtime.rankedProducts,
      products: runtime.products,
      conversationTitle,
    });

    await Promise.all([
      persistTurn({ parentId, role: "user", content: message }),
      persistTurn({ parentId, role: "assistant", content: payload.reply }),
      trimPersistedHistory(parentId),
    ]);

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Parent Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = StreamRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, parentId, currentPath } = parsed.data;

    const runtime = await buildAgentRuntime({
      message,
      history: [],
      parentId,
      currentPath,
    });

    const streamModelMessages = toModelMessages({
      message,
      history: runtime.modelMessages
        .filter((entry) => entry.role === "user" || entry.role === "assistant")
        .slice(0, -1),
      currentPath,
      routeCatalog: runtime.routeCatalog,
      contextBlock: buildContextBlock(runtime.retrievedDocs),
      deterministicRoute: runtime.deterministicRoute,
      systemPrompt: STREAM_SYSTEM_PROMPT,
    });

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tinygiggle.app",
        "X-Title": "Tiny Giggle - Parent Agent",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: streamModelMessages,
        temperature: 0.3,
        max_tokens: 900,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const details = await upstream.text();
      return NextResponse.json(
        {
          error: "Parent Agent streaming upstream error.",
          status: upstream.status,
          details: details.slice(0, 1000),
        },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = "";
    let rawReply = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = upstream.body.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) {
                continue;
              }

              const payload = trimmed.replace(/^data:\s*/, "");
              if (!payload || payload === "[DONE]") {
                continue;
              }

              try {
                const parsedChunk = JSON.parse(payload);
                const token = parsedChunk?.choices?.[0]?.delta?.content || "";
                if (token) {
                  rawReply += token;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                }
              } catch {
                continue;
              }
            }
          }

          const jsonReply = null;
          const conversationTitle = await ensureConversationTitle(parentId, message);

          const finalPayload = composeResponsePayload({
            rawReply,
            jsonReply,
            routeCatalog: runtime.routeCatalog,
            deterministicRoute: runtime.deterministicRoute,
            retrievedDocs: runtime.retrievedDocs,
            rankedProducts: runtime.rankedProducts,
            products: runtime.products,
            conversationTitle,
          });

          await Promise.all([
            persistTurn({ parentId, role: "user", content: message }),
            persistTurn({ parentId, role: "assistant", content: finalPayload.reply }),
            trimPersistedHistory(parentId),
          ]);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, payload: finalPayload })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error("Parent Agent stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Streaming failed. Please try again." })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Parent Agent PUT stream error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
