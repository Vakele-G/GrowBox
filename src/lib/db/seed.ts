import { addDays, parseDateString, today } from "@/lib/domain/dates";
import type {
  Business,
  Ingredient,
  KnowledgeChunk,
  PlanItem,
  Product,
  ProductIngredient,
  StageProgress,
  Transaction,
} from "@/lib/domain/types";

export const DEMO_BUSINESS_ID = "biz_nomsa_kitchen";
export const DEMO_OWNER_ID = "owner_demo_nomsa";

const DAY_MS = 86_400_000;

function weekdayIndex(date: string): number {
  const label = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "short",
  }).format(parseDateString(date));
  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Math.max(0, order.indexOf(label));
}

function dayFactor(index: number): number {
  return [1.05, 0.8, 0.85, 0.9, 1.0, 1.3, 1.35][index] ?? 1;
}

function jitter(offset: number): number {
  return ((offset * 7 + 3) % 5) - 1;
}

export interface SeedData {
  businesses: Business[];
  products: Product[];
  ingredients: Ingredient[];
  productIngredients: ProductIngredient[];
  transactions: Transaction[];
  planItems: PlanItem[];
  stageProgress: StageProgress[];
  knowledgeChunks: KnowledgeChunk[];
  seededAt: string;
  seedVersion: number;
}

export function createSeedData(now: string = today()): SeedData {
  const ownerId = DEMO_OWNER_ID;
  const businessId = DEMO_BUSINESS_ID;
  const createdAt = addDays(now, -45);

  const business: Business = {
    id: businessId,
    ownerId,
    name: "Nomsa's Kitchen",
    stage: "stable",
    municipality: "Soweto, City of Johannesburg",
    language: "en",
    monthlyBudgetCents: 150_000,
    createdAt,
    onboarding: {
      completed: true,
      completedAt: createdAt,
      location: "Soweto, Johannesburg",
      budgetCents: 150_000,
      equipment: ["Gas stove", "Pot", "Gas cylinder", "Display table"],
      customers: "Taxi commuters in the morning and learners after school",
      launchDate: addDays(now, -40),
      stockUnitsOnHand: 120,
      separatedMoney: false,
      practicality: {
        viable: true,
        notes: [
          "Morning commuters and after-school learners give you two reliable peaks.",
          "Your startup budget covers the first ingredient pack and gas.",
        ],
      },
      launchPlan: [
        "Buy the first flour, oil and potato pack from your nearest wholesaler.",
        "Confirm a trading spot with the stall owner or municipality.",
        "Complete a food-handling course and keep the certificate.",
        "Keep a daily cash book from day one and log every sale.",
      ],
    },
  };

  const products: Product[] = [
    {
      id: "prod_amagwinya",
      businessId,
      name: "Amagwinya",
      unitLabel: "gwinya",
      sellingPriceCents: 500,
      batchYield: 30,
      isActive: true,
    },
    {
      id: "prod_chips_small",
      businessId,
      name: "Slap chips small",
      unitLabel: "portion",
      sellingPriceCents: 2_000,
      batchYield: 10,
      isActive: true,
    },
    {
      id: "prod_chips_large",
      businessId,
      name: "Slap chips large",
      unitLabel: "portion",
      sellingPriceCents: 3_000,
      batchYield: 8,
      isActive: true,
    },
  ];

  const priceChangeAt = addDays(now, -7);
  const ingredients: Ingredient[] = [
    {
      id: "ing_flour",
      businessId,
      name: "Cake flour",
      packSize: 10,
      packUnit: "kg",
      packPriceCents: 17_500,
      lastPriceChangeAt: priceChangeAt,
    },
    {
      id: "ing_sugar",
      businessId,
      name: "Sugar",
      packSize: 2.5,
      packUnit: "kg",
      packPriceCents: 5_200,
      lastPriceChangeAt: null,
    },
    {
      id: "ing_yeast",
      businessId,
      name: "Instant yeast",
      packSize: 0.5,
      packUnit: "kg",
      packPriceCents: 3_800,
      lastPriceChangeAt: null,
    },
    {
      id: "ing_oil",
      businessId,
      name: "Cooking oil",
      packSize: 5,
      packUnit: "L",
      packPriceCents: 26_000,
      lastPriceChangeAt: priceChangeAt,
    },
    {
      id: "ing_potato",
      businessId,
      name: "Potatoes",
      packSize: 10,
      packUnit: "kg",
      packPriceCents: 12_000,
      lastPriceChangeAt: priceChangeAt,
    },
    {
      id: "ing_salt",
      businessId,
      name: "Salt",
      packSize: 1,
      packUnit: "kg",
      packPriceCents: 1_800,
      lastPriceChangeAt: null,
    },
    {
      id: "ing_bags",
      businessId,
      name: "Paper bags",
      packSize: 500,
      packUnit: "bags",
      packPriceCents: 6_500,
      lastPriceChangeAt: null,
    },
  ];

  const productIngredients: ProductIngredient[] = [
    { productId: "prod_amagwinya", ingredientId: "ing_flour", qtyPerUnit: 0.08 },
    { productId: "prod_amagwinya", ingredientId: "ing_sugar", qtyPerUnit: 0.012 },
    { productId: "prod_amagwinya", ingredientId: "ing_yeast", qtyPerUnit: 0.004 },
    { productId: "prod_amagwinya", ingredientId: "ing_oil", qtyPerUnit: 0.012 },
    { productId: "prod_amagwinya", ingredientId: "ing_salt", qtyPerUnit: 0.002 },
    { productId: "prod_amagwinya", ingredientId: "ing_bags", qtyPerUnit: 1 },
    { productId: "prod_chips_small", ingredientId: "ing_potato", qtyPerUnit: 0.25 },
    { productId: "prod_chips_small", ingredientId: "ing_oil", qtyPerUnit: 0.08 },
    { productId: "prod_chips_small", ingredientId: "ing_salt", qtyPerUnit: 0.003 },
    { productId: "prod_chips_small", ingredientId: "ing_bags", qtyPerUnit: 1 },
    { productId: "prod_chips_large", ingredientId: "ing_potato", qtyPerUnit: 0.4 },
    { productId: "prod_chips_large", ingredientId: "ing_oil", qtyPerUnit: 0.12 },
    { productId: "prod_chips_large", ingredientId: "ing_salt", qtyPerUnit: 0.004 },
    { productId: "prod_chips_large", ingredientId: "ing_bags", qtyPerUnit: 1 },
  ];

  const transactions: Transaction[] = [];
  let sequence = 0;
  const push = (
    entry: Omit<Transaction, "id" | "businessId" | "externalId" | "confidence" | "createdAt">,
  ) => {
    sequence += 1;
    transactions.push({
      ...entry,
      id: `tx_seed_${String(sequence).padStart(4, "0")}`,
      businessId,
      externalId: null,
      confidence: null,
      createdAt: `${entry.occurredOn}T18:00:00+02:00`,
    });
  };

  const oldPrice = {
    flour: 14_500,
    potato: 9_500,
    oil: 15_500,
  };
  const newPrice = {
    flour: 17_500,
    potato: 12_000,
    oil: 26_000,
  };

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = addDays(now, -offset);
    const factor = dayFactor(weekdayIndex(date));
    const gwinyaQty = Math.max(20, Math.round(65 * factor) + jitter(offset));
    const smallQty = Math.max(3, Math.round(12 * factor) + jitter(offset + 2));
    const largeQty = Math.max(2, Math.round(7 * factor) + jitter(offset + 4));
    const source = offset % 3 === 0 ? "text" : "manual";

    push({
      occurredOn: date,
      type: "sale",
      category: "sales",
      amountCents: gwinyaQty * 500,
      description: `Amagwinya x${gwinyaQty}`,
      productId: "prod_amagwinya",
      quantity: gwinyaQty,
      source,
    });
    push({
      occurredOn: date,
      type: "sale",
      category: "sales",
      amountCents: smallQty * 2_000,
      description: `Slap chips small x${smallQty}`,
      productId: "prod_chips_small",
      quantity: smallQty,
      source,
    });
    push({
      occurredOn: date,
      type: "sale",
      category: "sales",
      amountCents: largeQty * 3_000,
      description: `Slap chips large x${largeQty}`,
      productId: "prod_chips_large",
      quantity: largeQty,
      source,
    });

    const price = offset < 7 ? newPrice : oldPrice;
    if (offset % 2 === 0) {
      push({
        occurredOn: date,
        type: "expense",
        category: "stock",
        amountCents: price.flour,
        description: "Cake flour 10kg",
        productId: null,
        quantity: null,
        source: "manual",
      });
    } else {
      push({
        occurredOn: date,
        type: "expense",
        category: "stock",
        amountCents: price.potato,
        description: "Potatoes 10kg",
        productId: null,
        quantity: null,
        source: "manual",
      });
    }

    if (offset % 3 === 0) {
      push({
        occurredOn: date,
        type: "expense",
        category: "stock",
        amountCents: price.oil,
        description: "Cooking oil 5L",
        productId: null,
        quantity: null,
        source: "manual",
      });
    }

    if (offset % 3 === 1) {
      push({
        occurredOn: date,
        type: "expense",
        category: "stock",
        amountCents: 17_300,
        description: "Sugar, yeast, salt and bags",
        productId: null,
        quantity: null,
        source: "manual",
      });
    }

    if (offset % 7 === 0) {
      push({
        occurredOn: date,
        type: "expense",
        category: "rent",
        amountCents: 25_000,
        description: "Weekly stall fee",
        productId: null,
        quantity: null,
        source: "manual",
      });
    }

    if (offset % 7 === 3 || offset % 7 === 5) {
      push({
        occurredOn: date,
        type: "expense",
        category: "transport",
        amountCents: 4_000,
        description: "Taxi to the wholesaler",
        productId: null,
        quantity: null,
        source: "text",
      });
    }

    if (offset % 14 === 0) {
      push({
        occurredOn: date,
        type: "expense",
        category: "utilities",
        amountCents: 45_000,
        description: "Gas cylinder refill",
        productId: null,
        quantity: null,
        source: "manual",
      });
    }
  }

  const cashBeforeDraw = transactions.reduce(
    (total, tx) => total + (tx.type === "sale" ? tx.amountCents : -tx.amountCents),
    0,
  );
  const targetCash = 255_000;
  if (cashBeforeDraw > targetCash) {
    push({
      occurredOn: addDays(now, -1),
      type: "expense",
      category: "owner-draw",
      amountCents: cashBeforeDraw - targetCash,
      description: "Owner withdrawal to personal wallet",
      productId: null,
      quantity: null,
      source: "manual",
    });
  }

  const planItems: PlanItem[] = [
    {
      id: "plan_stove",
      businessId,
      kind: "equipment",
      label: "Gas stove (already owned)",
      estCostCents: 65_000,
      status: "done",
      sortOrder: 1,
    },
    {
      id: "plan_pot",
      businessId,
      kind: "equipment",
      label: "Large cooking pot (already owned)",
      estCostCents: 18_000,
      status: "done",
      sortOrder: 2,
    },
    {
      id: "plan_cylinder",
      businessId,
      kind: "equipment",
      label: "Gas cylinder (already owned)",
      estCostCents: 45_000,
      status: "done",
      sortOrder: 3,
    },
    {
      id: "plan_flour",
      businessId,
      kind: "ingredient",
      label: "Cake flour 10kg",
      estCostCents: 17_500,
      status: "todo",
      sortOrder: 4,
    },
    {
      id: "plan_oil",
      businessId,
      kind: "ingredient",
      label: "Cooking oil 5L",
      estCostCents: 26_000,
      status: "todo",
      sortOrder: 5,
    },
    {
      id: "plan_potato",
      businessId,
      kind: "ingredient",
      label: "Potatoes 10kg",
      estCostCents: 12_000,
      status: "todo",
      sortOrder: 6,
    },
    {
      id: "plan_permit",
      businessId,
      kind: "task",
      label: "Apply for a municipal trading permit",
      estCostCents: 25_000,
      status: "todo",
      sortOrder: 7,
    },
    {
      id: "plan_food",
      businessId,
      kind: "task",
      label: "Complete a food-handling course",
      estCostCents: 0,
      status: "todo",
      sortOrder: 8,
    },
  ];

  const stageProgress: StageProgress[] = [
    {
      businessId,
      stage: "stable",
      stageStartedAt: addDays(now, -35),
      completedChecks: [
        "food_handling",
        "trading_spot",
        "supplier_list",
        "recordkeeping",
      ],
      updatedAt: now,
    },
  ];

  const disclaimer = "Verify with your municipality before you trade.";
  const knowledgeChunks: KnowledgeChunk[] = [
    {
      id: "kc_trading_permit",
      jurisdiction: "City of Johannesburg",
      topic: "Trading permit",
      title: "Apply for a trading permit",
      requirement:
        "Street traders need a permit or written permission for the trading spot. Apply at the local customer service centre and carry the permit when trading.",
      sourceUrl: "https://www.joburg.org.za/services_/Pages/trading-permits.aspx",
      lastVerified: "2026-08-15",
      disclaimer,
    },
    {
      id: "kc_food_handling",
      jurisdiction: "South Africa",
      topic: "Food safety",
      title: "Food-handling certificate",
      requirement:
        "Anyone handling food for sale should complete a food-handling course and keep the certificate available for inspection. Cover clean hands, safe storage temperatures and pest control.",
      sourceUrl: "https://www.health.gov.za/food-control/",
      lastVerified: "2026-08-15",
      disclaimer,
    },
    {
      id: "kc_environmental_health",
      jurisdiction: "City of Johannesburg",
      topic: "Health inspection",
      title: "Environmental health inspection",
      requirement:
        "Environmental health officers can inspect your stall or kitchen. Keep surfaces clean, separate raw and cooked food, and store waste in a closed bin.",
      sourceUrl: "https://www.joburg.org.za/departments_/Pages/health.aspx",
      lastVerified: "2026-08-15",
      disclaimer,
    },
    {
      id: "kc_sars_registration",
      jurisdiction: "South Africa",
      topic: "Tax",
      title: "When to register with SARS",
      requirement:
        "Register as a taxpayer once your turnover requires it, and keep sales records. Informal traders can ask SARS for help with the correct registration category.",
      sourceUrl: "https://www.sars.gov.za/individuals/",
      lastVerified: "2026-08-15",
      disclaimer,
    },
    {
      id: "kc_cipc",
      jurisdiction: "South Africa",
      topic: "Business registration",
      title: "Registering a company",
      requirement:
        "Registering a company with the CIPC separates the business legally from you. It is not required on day one, but it helps when opening a business bank account or applying for funding.",
      sourceUrl: "https://www.cipc.co.za/",
      lastVerified: "2026-08-15",
      disclaimer,
    },
    {
      id: "kc_recordkeeping",
      jurisdiction: "South Africa",
      topic: "Recordkeeping",
      title: "Keep a daily cash book",
      requirement:
        "Record every sale and expense on the day it happens. Keep slips in a separate envelope per month. A consistent record is the strongest evidence of trading when applying for credit.",
      sourceUrl: "https://www.sars.gov.za/businesses-and-employers/",
      lastVerified: "2026-08-15",
      disclaimer,
    },
  ];

  return {
    businesses: [business],
    products,
    ingredients,
    productIngredients,
    transactions,
    planItems,
    stageProgress,
    knowledgeChunks,
    seededAt: now,
    seedVersion: 1,
  };
}

export function daysBetweenUtc(from: string, to: string): number {
  return Math.round(
    (parseDateString(to).getTime() - parseDateString(from).getTime()) / DAY_MS,
  );
}
