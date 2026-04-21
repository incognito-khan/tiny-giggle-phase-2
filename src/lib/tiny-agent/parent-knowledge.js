export const PARENT_AGENT_ROUTES = [
  {
    path: "/parent-dashboard",
    title: "Parent Dashboard",
    description: "Overview of daily insights for children and family care.",
    keywords: ["dashboard", "overview", "home"],
  },
  {
    path: "/parent-dashboard/children",
    title: "Children",
    description: "View and manage children profiles.",
    keywords: ["children", "child", "profile", "kid"],
  },
  {
    path: "/parent-dashboard/baby-growth",
    title: "Baby Growth",
    description: "Track height and weight updates over time.",
    keywords: ["growth", "height", "weight", "development"],
  },
  {
    path: "/parent-dashboard/milestones",
    title: "Milestones",
    description: "Track developmental milestones and progress.",
    keywords: ["milestone", "development", "achieved"],
  },
  {
    path: "/parent-dashboard/vaccination",
    title: "Vaccination",
    description: "Review vaccine schedule and status.",
    keywords: ["vaccination", "vaccine", "shots", "immunization"],
  },
  {
    path: "/parent-dashboard/store",
    title: "Store",
    description: "Shop parent and baby products.",
    keywords: ["store", "shop", "products", "buy"],
  },
  {
    path: "/parent-dashboard/orders",
    title: "Orders",
    description: "Check order history and fulfillment status.",
    keywords: ["orders", "purchases", "delivery"],
  },
  {
    path: "/parent-dashboard/agent",
    title: "Agent",
    description: "AI assistant for parenting guidance, dashboard help, and shopping suggestions.",
    keywords: ["agent", "assistant", "ai", "chat", "help"],
  },
];

export const PARENT_AGENT_KNOWLEDGE = [
  {
    id: "safety-first-disclaimer",
    title: "Safety First Guidance",
    body:
      "The assistant can provide educational parenting guidance and practical next steps. It must not provide a final diagnosis. For emergency warning signs such as breathing trouble, seizures, unresponsiveness, dehydration, or very high fever, advise immediate emergency care.",
    tags: ["safety", "emergency", "medical"],
  },
  {
    id: "fever-care-basics",
    title: "Baby Fever Basic Care",
    body:
      "For fever concerns, suggest hydration, light clothing, monitoring temperature, and rest. Include red flags and age-based urgency reminders. Encourage consultation with a pediatric professional for persistent or severe symptoms.",
    tags: ["fever", "temperature", "care", "monitoring"],
  },
  {
    id: "parent-dashboard-context",
    title: "Parent Dashboard Data",
    body:
      "Use available parent dashboard context like children profile details, vaccination progress, and milestone records to personalize advice and practical suggestions.",
    tags: ["dashboard", "children", "vaccination", "milestones"],
  },
  {
    id: "shopping-recommendations",
    title: "Product Recommendation Policy",
    body:
      "When relevant, recommend products from the Tiny Giggle Store context only. Explain why each product may help and suggest browsing the store route for purchase decisions.",
    tags: ["store", "shopping", "products", "recommendations"],
  },
  {
    id: "response-style",
    title: "Answer Style",
    body:
      "Responses should be warm, clear, and actionable. Use concise sections such as immediate steps, monitor signs, when to seek care, and related Tiny Giggle tools.",
    tags: ["style", "clarity", "actionable"],
  },
];
