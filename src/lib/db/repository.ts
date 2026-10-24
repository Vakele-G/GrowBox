import { createBrowserSupabaseClient, createServerSupabaseClient } from "./client";
import { createSeedData } from "./seed";
import type {
  Business,
  HealthScore,
  Ingredient,
  KnowledgeChunk,
  Nudge,
  NudgeStatus,
  PlanItem,
  Product,
  ProductIngredient,
  StageProgress,
  Transaction,
} from "@/lib/domain/types";

export interface Repository {
  // Business
  getBusiness(id: string): Promise<Business | null>;
  getBusinessByOwnerId(ownerId: string): Promise<Business | null>;
  saveBusiness(business: Business): Promise<void>;
  updateBusiness(id: string, updates: Partial<Business>): Promise<Business>;

  // Products
  getProducts(businessId: string): Promise<Product[]>;
  saveProduct(product: Product): Promise<void>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;

  // Ingredients
  getIngredients(businessId: string): Promise<Ingredient[]>;
  saveIngredient(ingredient: Ingredient): Promise<void>;
  updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient>;

  // Product Ingredients (recipes)
  getProductIngredients(businessId: string): Promise<ProductIngredient[]>;
  saveProductIngredients(links: ProductIngredient[]): Promise<void>;

  // Transactions
  getTransactions(
    businessId: string,
    options?: { limit?: number; since?: string; until?: string },
  ): Promise<Transaction[]>;
  saveTransactions(
    transactions: Transaction[],
  ): Promise<{ inserted: number; skipped: number }>;
  deleteTransaction(id: string): Promise<void>;

  // Plan Items
  getPlanItems(businessId: string): Promise<PlanItem[]>;
  savePlanItem(item: PlanItem): Promise<void>;
  updatePlanItem(id: string, updates: Partial<PlanItem>): Promise<PlanItem>;

  // Stage Progress
  getStageProgress(businessId: string): Promise<StageProgress | null>;
  saveStageProgress(progress: StageProgress): Promise<void>;

  // Nudges
  getNudges(businessId: string, status?: NudgeStatus): Promise<Nudge[]>;
  saveNudges(nudges: Nudge[]): Promise<void>;
  updateNudgeStatus(id: string, status: NudgeStatus): Promise<void>;

  // Health Scores
  getLatestHealthScore(businessId: string): Promise<HealthScore | null>;
  saveHealthScore(score: HealthScore): Promise<void>;

  // Knowledge Chunks
  getKnowledgeChunks(topic?: string): Promise<KnowledgeChunk[]>;
}

export class MemoryRepository implements Repository {
  private businesses = new Map<string, Business>();
  private products = new Map<string, Product>();
  private ingredients = new Map<string, Ingredient>();
  private productIngredients: ProductIngredient[] = [];
  private transactions = new Map<string, Transaction>();
  private planItems = new Map<string, PlanItem>();
  private stageProgress = new Map<string, StageProgress>();
  private nudges = new Map<string, Nudge>();
  private healthScores: HealthScore[] = [];
  private knowledgeChunks: KnowledgeChunk[] = [];

  constructor(initialData = createSeedData()) {
    this.load(initialData);
  }

  public reset(data = createSeedData()): void {
    this.businesses.clear();
    this.products.clear();
    this.ingredients.clear();
    this.productIngredients = [];
    this.transactions.clear();
    this.planItems.clear();
    this.stageProgress.clear();
    this.nudges.clear();
    this.healthScores = [];
    this.knowledgeChunks = [];
    this.load(data);
  }

  private load(data: ReturnType<typeof createSeedData>): void {
    data.businesses.forEach((b) => this.businesses.set(b.id, { ...b }));
    data.products.forEach((p) => this.products.set(p.id, { ...p }));
    data.ingredients.forEach((i) => this.ingredients.set(i.id, { ...i }));
    this.productIngredients = data.productIngredients.map((pi) => ({ ...pi }));
    data.transactions.forEach((t) => this.transactions.set(t.id, { ...t }));
    data.planItems.forEach((pi) => this.planItems.set(pi.id, { ...pi }));
    data.stageProgress.forEach((sp) => this.stageProgress.set(sp.businessId, { ...sp }));
    this.knowledgeChunks = data.knowledgeChunks.map((kc) => ({ ...kc }));
  }

  async getBusiness(id: string): Promise<Business | null> {
    return this.businesses.get(id) ?? null;
  }

  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    for (const b of this.businesses.values()) {
      if (b.ownerId === ownerId) return b;
    }
    return null;
  }

  async saveBusiness(business: Business): Promise<void> {
    this.businesses.set(business.id, { ...business });
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    const existing = this.businesses.get(id);
    if (!existing) throw new Error(`Business not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.businesses.set(id, updated);
    return updated;
  }

  async getProducts(businessId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.businessId === businessId);
  }

  async saveProduct(product: Product): Promise<void> {
    this.products.set(product.id, { ...product });
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error(`Product not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async getIngredients(businessId: string): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values()).filter((i) => i.businessId === businessId);
  }

  async saveIngredient(ingredient: Ingredient): Promise<void> {
    this.ingredients.set(ingredient.id, { ...ingredient });
  }

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    const existing = this.ingredients.get(id);
    if (!existing) throw new Error(`Ingredient not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.ingredients.set(id, updated);
    return updated;
  }

  async getProductIngredients(businessId: string): Promise<ProductIngredient[]> {
    const products = await this.getProducts(businessId);
    const productIds = new Set(products.map((p) => p.id));
    return this.productIngredients.filter((pi) => productIds.has(pi.productId));
  }

  async saveProductIngredients(links: ProductIngredient[]): Promise<void> {
    for (const link of links) {
      const idx = this.productIngredients.findIndex(
        (pi) => pi.productId === link.productId && pi.ingredientId === link.ingredientId,
      );
      if (idx >= 0) {
        this.productIngredients[idx] = { ...link };
      } else {
        this.productIngredients.push({ ...link });
      }
    }
  }

  async getTransactions(
    businessId: string,
    options?: { limit?: number; since?: string; until?: string },
  ): Promise<Transaction[]> {
    let list = Array.from(this.transactions.values()).filter(
      (t) => t.businessId === businessId,
    );

    if (options?.since) {
      list = list.filter((t) => t.occurredOn >= options.since!);
    }
    if (options?.until) {
      list = list.filter((t) => t.occurredOn <= options.until!);
    }

    list.sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));

    if (options?.limit && options.limit > 0) {
      list = list.slice(0, options.limit);
    }

    return list;
  }

  async saveTransactions(
    transactions: Transaction[],
  ): Promise<{ inserted: number; skipped: number }> {
    let inserted = 0;
    let skipped = 0;

    for (const tx of transactions) {
      // Check unique (business_id, external_id)
      if (tx.externalId) {
        const duplicate = Array.from(this.transactions.values()).find(
          (existing) =>
            existing.businessId === tx.businessId &&
            existing.externalId === tx.externalId,
        );
        if (duplicate) {
          skipped += 1;
          continue;
        }
      }

      this.transactions.set(tx.id, { ...tx });
      inserted += 1;
    }

    return { inserted, skipped };
  }

  async deleteTransaction(id: string): Promise<void> {
    this.transactions.delete(id);
  }

  async getPlanItems(businessId: string): Promise<PlanItem[]> {
    return Array.from(this.planItems.values())
      .filter((pi) => pi.businessId === businessId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async savePlanItem(item: PlanItem): Promise<void> {
    this.planItems.set(item.id, { ...item });
  }

  async updatePlanItem(id: string, updates: Partial<PlanItem>): Promise<PlanItem> {
    const existing = this.planItems.get(id);
    if (!existing) throw new Error(`PlanItem not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.planItems.set(id, updated);
    return updated;
  }

  async getStageProgress(businessId: string): Promise<StageProgress | null> {
    return this.stageProgress.get(businessId) ?? null;
  }

  async saveStageProgress(progress: StageProgress): Promise<void> {
    this.stageProgress.set(progress.businessId, { ...progress });
  }

  async getNudges(businessId: string, status?: NudgeStatus): Promise<Nudge[]> {
    return Array.from(this.nudges.values())
      .filter((n) => n.businessId === businessId && (!status || n.status === status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async saveNudges(nudges: Nudge[]): Promise<void> {
    for (const nudge of nudges) {
      this.nudges.set(nudge.id, { ...nudge });
    }
  }

  async updateNudgeStatus(id: string, status: NudgeStatus): Promise<void> {
    const existing = this.nudges.get(id);
    if (existing) {
      this.nudges.set(id, { ...existing, status });
    }
  }

  async getLatestHealthScore(businessId: string): Promise<HealthScore | null> {
    const scores = this.healthScores
      .filter((h) => h.businessId === businessId)
      .sort((a, b) => b.computedAt.localeCompare(a.computedAt));
    return scores[0] ?? null;
  }

  async saveHealthScore(score: HealthScore): Promise<void> {
    this.healthScores.push({ ...score });
  }

  async getKnowledgeChunks(topic?: string): Promise<KnowledgeChunk[]> {
    if (!topic) return this.knowledgeChunks;
    return this.knowledgeChunks.filter(
      (kc) => kc.topic.toLowerCase() === topic.toLowerCase(),
    );
  }
}

export class SupabaseRepository implements Repository {
  private client =
    typeof window === "undefined"
      ? createServerSupabaseClient()
      : createBrowserSupabaseClient();

  async getBusiness(id: string): Promise<Business | null> {
    const { data, error } = await this.client
      .from("businesses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      stage: data.stage,
      municipality: data.municipality,
      language: data.language,
      monthlyBudgetCents: Number(data.monthly_budget_cents),
      onboarding: data.onboarding ?? {},
      createdAt: data.created_at,
    };
  }

  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const { data, error } = await this.client
      .from("businesses")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      stage: data.stage,
      municipality: data.municipality,
      language: data.language,
      monthlyBudgetCents: Number(data.monthly_budget_cents),
      onboarding: data.onboarding ?? {},
      createdAt: data.created_at,
    };
  }

  async saveBusiness(business: Business): Promise<void> {
    const { error } = await this.client.from("businesses").upsert({
      id: business.id,
      owner_id: business.ownerId,
      name: business.name,
      stage: business.stage,
      municipality: business.municipality,
      language: business.language,
      monthly_budget_cents: business.monthlyBudgetCents,
      onboarding: business.onboarding,
      created_at: business.createdAt,
    });
    if (error) throw new Error(error.message);
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    const mapped: Record<string, unknown> = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.stage !== undefined) mapped.stage = updates.stage;
    if (updates.municipality !== undefined) mapped.municipality = updates.municipality;
    if (updates.language !== undefined) mapped.language = updates.language;
    if (updates.monthlyBudgetCents !== undefined)
      mapped.monthly_budget_cents = updates.monthlyBudgetCents;
    if (updates.onboarding !== undefined) mapped.onboarding = updates.onboarding;

    const { data, error } = await this.client
      .from("businesses")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Update failed");
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      stage: data.stage,
      municipality: data.municipality,
      language: data.language,
      monthlyBudgetCents: Number(data.monthly_budget_cents),
      onboarding: data.onboarding ?? {},
      createdAt: data.created_at,
    };
  }

  async getProducts(businessId: string): Promise<Product[]> {
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("business_id", businessId);

    if (error || !data) return [];
    return data.map((p) => ({
      id: p.id,
      businessId: p.business_id,
      name: p.name,
      unitLabel: p.unit_label,
      sellingPriceCents: Number(p.selling_price_cents),
      batchYield: p.batch_yield,
      isActive: p.is_active,
    }));
  }

  async saveProduct(product: Product): Promise<void> {
    const { error } = await this.client.from("products").upsert({
      id: product.id,
      business_id: product.businessId,
      name: product.name,
      unit_label: product.unitLabel,
      selling_price_cents: product.sellingPriceCents,
      batch_yield: product.batchYield,
      is_active: product.isActive,
    });
    if (error) throw new Error(error.message);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const mapped: Record<string, unknown> = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.unitLabel !== undefined) mapped.unit_label = updates.unitLabel;
    if (updates.sellingPriceCents !== undefined)
      mapped.selling_price_cents = updates.sellingPriceCents;
    if (updates.batchYield !== undefined) mapped.batch_yield = updates.batchYield;
    if (updates.isActive !== undefined) mapped.is_active = updates.isActive;

    const { data, error } = await this.client
      .from("products")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Product update failed");
    return {
      id: data.id,
      businessId: data.business_id,
      name: data.name,
      unitLabel: data.unit_label,
      sellingPriceCents: Number(data.selling_price_cents),
      batchYield: data.batch_yield,
      isActive: data.is_active,
    };
  }

  async getIngredients(businessId: string): Promise<Ingredient[]> {
    const { data, error } = await this.client
      .from("ingredients")
      .select("*")
      .eq("business_id", businessId);

    if (error || !data) return [];
    return data.map((i) => ({
      id: i.id,
      businessId: i.business_id,
      name: i.name,
      packSize: Number(i.pack_size),
      packUnit: i.pack_unit,
      packPriceCents: Number(i.pack_price_cents),
      lastPriceChangeAt: i.last_price_change_at,
    }));
  }

  async saveIngredient(ingredient: Ingredient): Promise<void> {
    const { error } = await this.client.from("ingredients").upsert({
      id: ingredient.id,
      business_id: ingredient.businessId,
      name: ingredient.name,
      pack_size: ingredient.packSize,
      pack_unit: ingredient.packUnit,
      pack_price_cents: ingredient.packPriceCents,
      last_price_change_at: ingredient.lastPriceChangeAt,
    });
    if (error) throw new Error(error.message);
  }

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    const mapped: Record<string, unknown> = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.packSize !== undefined) mapped.pack_size = updates.packSize;
    if (updates.packUnit !== undefined) mapped.pack_unit = updates.packUnit;
    if (updates.packPriceCents !== undefined)
      mapped.pack_price_cents = updates.packPriceCents;
    if (updates.lastPriceChangeAt !== undefined)
      mapped.last_price_change_at = updates.lastPriceChangeAt;

    const { data, error } = await this.client
      .from("ingredients")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "Ingredient update failed");
    return {
      id: data.id,
      businessId: data.business_id,
      name: data.name,
      packSize: Number(data.pack_size),
      packUnit: data.pack_unit,
      packPriceCents: Number(data.pack_price_cents),
      lastPriceChangeAt: data.last_price_change_at,
    };
  }

  async getProductIngredients(businessId: string): Promise<ProductIngredient[]> {
    const { data, error } = await this.client
      .from("product_ingredients")
      .select("product_id, ingredient_id, qty_per_unit, products!inner(business_id)")
      .eq("products.business_id", businessId);

    if (error || !data) return [];
    return data.map((pi: Record<string, unknown>) => ({
      productId: pi.product_id as string,
      ingredientId: pi.ingredient_id as string,
      qtyPerUnit: Number(pi.qty_per_unit),
    }));
  }

  async saveProductIngredients(links: ProductIngredient[]): Promise<void> {
    const mapped = links.map((link) => ({
      product_id: link.productId,
      ingredient_id: link.ingredientId,
      qty_per_unit: link.qtyPerUnit,
    }));
    const { error } = await this.client.from("product_ingredients").upsert(mapped);
    if (error) throw new Error(error.message);
  }

  async getTransactions(
    businessId: string,
    options?: { limit?: number; since?: string; until?: string },
  ): Promise<Transaction[]> {
    let query = this.client
      .from("transactions")
      .select("*")
      .eq("business_id", businessId)
      .order("occurred_on", { ascending: false });

    if (options?.since) query = query.gte("occurred_on", options.since);
    if (options?.until) query = query.lte("occurred_on", options.until);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((t) => ({
      id: t.id,
      businessId: t.business_id,
      occurredOn: t.occurred_on,
      type: t.type,
      category: t.category,
      amountCents: Number(t.amount_cents),
      description: t.description,
      productId: t.product_id,
      quantity: t.quantity != null ? Number(t.quantity) : null,
      source: t.source,
      externalId: t.external_id,
      confidence: t.confidence != null ? Number(t.confidence) : null,
      createdAt: t.created_at,
    }));
  }

  async saveTransactions(
    transactions: Transaction[],
  ): Promise<{ inserted: number; skipped: number }> {
    let inserted = 0;
    let skipped = 0;

    for (const tx of transactions) {
      const { error } = await this.client.from("transactions").insert({
        id: tx.id,
        business_id: tx.businessId,
        occurred_on: tx.occurredOn,
        type: tx.type,
        category: tx.category,
        amount_cents: tx.amountCents,
        description: tx.description,
        product_id: tx.productId,
        quantity: tx.quantity,
        source: tx.source,
        external_id: tx.externalId,
        confidence: tx.confidence,
        created_at: tx.createdAt,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique violation (business_id, external_id)
          skipped += 1;
        } else {
          throw new Error(error.message);
        }
      } else {
        inserted += 1;
      }
    }

    return { inserted, skipped };
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.client.from("transactions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getPlanItems(businessId: string): Promise<PlanItem[]> {
    const { data, error } = await this.client
      .from("plan_items")
      .select("*")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data.map((pi) => ({
      id: pi.id,
      businessId: pi.business_id,
      kind: pi.kind,
      label: pi.label,
      estCostCents: Number(pi.est_cost_cents),
      status: pi.status,
      sortOrder: pi.sort_order,
    }));
  }

  async savePlanItem(item: PlanItem): Promise<void> {
    const { error } = await this.client.from("plan_items").upsert({
      id: item.id,
      business_id: item.businessId,
      kind: item.kind,
      label: item.label,
      est_cost_cents: item.estCostCents,
      status: item.status,
      sort_order: item.sortOrder,
    });
    if (error) throw new Error(error.message);
  }

  async updatePlanItem(id: string, updates: Partial<PlanItem>): Promise<PlanItem> {
    const mapped: Record<string, unknown> = {};
    if (updates.label !== undefined) mapped.label = updates.label;
    if (updates.estCostCents !== undefined) mapped.est_cost_cents = updates.estCostCents;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.sortOrder !== undefined) mapped.sort_order = updates.sortOrder;

    const { data, error } = await this.client
      .from("plan_items")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? "PlanItem update failed");
    return {
      id: data.id,
      businessId: data.business_id,
      kind: data.kind,
      label: data.label,
      estCostCents: Number(data.est_cost_cents),
      status: data.status,
      sortOrder: data.sort_order,
    };
  }

  async getStageProgress(businessId: string): Promise<StageProgress | null> {
    const { data, error } = await this.client
      .from("stage_progress")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      businessId: data.business_id,
      stage: data.stage,
      stageStartedAt: data.stage_started_at,
      completedChecks: data.completed_checks ?? [],
      updatedAt: data.updated_at,
    };
  }

  async saveStageProgress(progress: StageProgress): Promise<void> {
    const { error } = await this.client.from("stage_progress").upsert({
      business_id: progress.businessId,
      stage: progress.stage,
      stage_started_at: progress.stageStartedAt,
      completed_checks: progress.completedChecks,
      updated_at: progress.updatedAt,
    });
    if (error) throw new Error(error.message);
  }

  async getNudges(businessId: string, status?: NudgeStatus): Promise<Nudge[]> {
    let query = this.client
      .from("nudges")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((n) => ({
      id: n.id,
      businessId: n.business_id,
      ruleKey: n.rule_key,
      severity: n.severity,
      payload: n.payload ?? {},
      messageEn: n.message_en,
      messageZu: n.message_zu,
      status: n.status,
      createdAt: n.created_at,
    }));
  }

  async saveNudges(nudges: Nudge[]): Promise<void> {
    const mapped = nudges.map((n) => ({
      id: n.id,
      business_id: n.businessId,
      rule_key: n.ruleKey,
      severity: n.severity,
      payload: n.payload,
      message_en: n.messageEn,
      message_zu: n.messageZu,
      status: n.status,
      created_at: n.createdAt,
    }));
    const { error } = await this.client.from("nudges").upsert(mapped);
    if (error) throw new Error(error.message);
  }

  async updateNudgeStatus(id: string, status: NudgeStatus): Promise<void> {
    const { error } = await this.client
      .from("nudges")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getLatestHealthScore(businessId: string): Promise<HealthScore | null> {
    const { data, error } = await this.client
      .from("health_scores")
      .select("*")
      .eq("business_id", businessId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    const score = Number(data.score);
    return {
      id: data.id,
      businessId: data.business_id,
      score,
      components: data.components ?? {},
      band:
        score >= 80
          ? "ready"
          : score >= 60
            ? "bankable"
            : score >= 40
              ? "emerging"
              : "building",
      computedAt: data.computed_at,
    };
  }

  async saveHealthScore(score: HealthScore): Promise<void> {
    const { error } = await this.client.from("health_scores").insert({
      id: score.id,
      business_id: score.businessId,
      score: score.score,
      components: score.components,
      computed_at: score.computedAt,
    });
    if (error) throw new Error(error.message);
  }

  async getKnowledgeChunks(topic?: string): Promise<KnowledgeChunk[]> {
    let query = this.client.from("knowledge_chunks").select("*");
    if (topic) query = query.ilike("topic", topic);
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((kc) => ({
      id: kc.id,
      jurisdiction: kc.jurisdiction,
      topic: kc.topic,
      title: kc.title,
      requirement: kc.requirement,
      sourceUrl: kc.source_url,
      lastVerified: kc.last_verified,
      disclaimer: kc.disclaimer,
    }));
  }
}

// Global singleton repository
let activeRepository: Repository | null = null;

export function createMemoryRepository(initialData?: ReturnType<typeof createSeedData>): MemoryRepository {
  return new MemoryRepository(initialData);
}

export function getRepository(): Repository {
  if (activeRepository) return activeRepository;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes("your-project.supabase.co") ||
    process.env.NODE_ENV === "test" ||
    process.env.VITEST === "true";

  if (isPlaceholder) {
    const seedMode = process.env.SEED_MODE === "full" ? "full" : "minimal";
    activeRepository = new MemoryRepository(createSeedData(undefined, seedMode));
  } else {
    activeRepository = new SupabaseRepository();
  }

  return activeRepository;
}
