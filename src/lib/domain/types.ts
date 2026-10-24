export type Stage = "idea" | "launch" | "stable" | "grow" | "enterprise";
export type Language = "en" | "zu";
export type TransactionType = "sale" | "expense";
export type TransactionSource = "manual" | "text" | "fnb";
export type PlanItemKind = "equipment" | "ingredient" | "task";
export type NudgeStatus = "new" | "seen" | "done" | "dismissed";
export type NudgeSeverity = "info" | "warning" | "critical";

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  stage: Stage;
  municipality: string;
  language: Language;
  monthlyBudgetCents: number;
  onboarding: OnboardingData;
  createdAt: string;
}

export interface OnboardingData {
  completed: boolean;
  completedAt?: string;
  location?: string;
  budgetCents?: number;
  equipment?: string[];
  customers?: string;
  stockUnitsOnHand?: number;
  separatedMoney?: boolean;
  launchDate?: string;
  practicality?: {
    viable: boolean;
    notes: string[];
  };
  costing?: {
    productId?: string;
    costPerUnitCents?: number;
    suggestedPriceCents?: number;
    marginPct?: number;
    breakEvenUnitsPerDay?: number;
  };
  launchPlan?: string[];
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  unitLabel: string;
  sellingPriceCents: number;
  batchYield: number;
  isActive: boolean;
}

export interface Ingredient {
  id: string;
  businessId: string;
  name: string;
  packSize: number;
  packUnit: string;
  packPriceCents: number;
  lastPriceChangeAt: string | null;
}

export interface ProductIngredient {
  productId: string;
  ingredientId: string;
  qtyPerUnit: number;
}

export interface Transaction {
  id: string;
  businessId: string;
  occurredOn: string;
  type: TransactionType;
  category: string;
  amountCents: number;
  description: string;
  productId: string | null;
  quantity: number | null;
  source: TransactionSource;
  externalId: string | null;
  confidence: number | null;
  createdAt: string;
}

export interface PlanItem {
  id: string;
  businessId: string;
  kind: PlanItemKind;
  label: string;
  estCostCents: number;
  status: "todo" | "done";
  sortOrder: number;
}

export interface StageProgress {
  businessId: string;
  stage: Stage;
  stageStartedAt: string;
  completedChecks: string[];
  updatedAt: string;
}

export interface Nudge {
  id: string;
  businessId: string;
  ruleKey: string;
  severity: NudgeSeverity;
  payload: Record<string, string | number | boolean | null>;
  messageEn: string;
  messageZu: string;
  status: NudgeStatus;
  createdAt: string;
}

export interface HealthScoreComponents {
  profitability: number;
  cashBuffer: number;
  recordConsistency: number;
  marginStability: number;
  savingsDiscipline: number;
  complianceProgress: number;
}

export interface HealthScore {
  id: string;
  businessId: string;
  score: number;
  components: HealthScoreComponents;
  band: HealthBand;
  computedAt: string;
}

export type HealthBand = "building" | "emerging" | "bankable" | "ready";

export interface KnowledgeChunk {
  id: string;
  jurisdiction: string;
  topic: string;
  title: string;
  requirement: string;
  sourceUrl: string;
  lastVerified: string;
  disclaimer: string;
}

export interface ParsedEntry {
  type: TransactionType;
  category: string;
  amountCents: number;
  description: string;
  quantity: number | null;
  productId: string | null;
  confidence: number;
}

export interface DailyTotal {
  date: string;
  salesCents: number;
  expensesCents: number;
  profitCents: number;
  transactionCount: number;
}

export interface BusinessMetrics {
  cashOnHandCents: number;
  totalSalesCents: number;
  totalExpensesCents: number;
  ownerWithdrawalsCents: number;
  last14SalesCents: number;
  last14ExpensesCents: number;
  last14ProfitCents: number;
  fourWeekSalesCents: number;
  fourWeekExpensesCents: number;
  fourWeekMarginPct: number;
  previousWeekMarginPct: number;
  weeklyMarginPct: number;
  averageDailyExpenseCents: number;
  averageDailySalesCents: number;
  cashRunwayDays: number | null;
  stockDaysCover: number | null;
  savingsBufferWeeks: number;
  nextRestockCostCents: number;
  restockShortfallCents: number;
  tradingDaysLast30: number;
  loggedDaysLast30: number;
  daysSinceLastTransaction: number;
  daysSinceStageStart: number;
}
