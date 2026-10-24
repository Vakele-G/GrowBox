import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  HealthScore,
  Ingredient,
  Nudge,
  NudgeStatus,
  PlanItem,
  Product,
  StageProgress,
  Transaction,
  TransactionSource,
} from "@/lib/domain/types";

/**
 * Repository layer over Supabase Postgres (RLS scoped to the owner).
 * Clients are injected so screens can pass the browser client for
 * user-scoped reads and the server client for trusted writes.
 */

export interface NewTransaction {
  businessId: string;
  occurredOn: string;
  type: Transaction["type"];
  category: string;
  amountCents: number;
  description: string;
  productId: string | null;
  quantity: number | null;
  source: TransactionSource;
  externalId?: string | null;
  confidence?: number | null;
}

export interface TransactionFilter {
  from: string;
  to: string;
}

export function createTransactionRepository(client: SupabaseClient) {
  return {
    async listByDateRange(businessId: string, filter: TransactionFilter): Promise<Transaction[]> {
      const { data, error } = await client
        .from("transactions")
        .select("*")
        .eq("business_id", businessId)
        .gte("occurred_on", filter.from)
        .lte("occurred_on", filter.to)
        .order("occurred_on", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Transaction[];
    },

    async insert(input: NewTransaction): Promise<Transaction> {
      const { data, error } = await client
        .from("transactions")
        .insert({
          business_id: input.businessId,
          occurred_on: input.occurredOn,
          type: input.type,
          category: input.category,
          amount_cents: input.amountCents,
          description: input.description,
          product_id: input.productId,
          quantity: input.quantity,
          source: input.source,
          external_id: input.externalId ?? null,
          confidence: input.confidence ?? null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Transaction;
    },

    /**
     * Idempotent insert keyed on (business_id, external_id) for FNB imports.
     * Returns the stored row, or null when the external id was already present.
     */
    async insertIfNew(
      input: NewTransaction & { externalId: string },
    ): Promise<{ created: boolean; transaction: Transaction | null }> {
      const { data, error } = await client
        .from("transactions")
        .insert({
          business_id: input.businessId,
          occurred_on: input.occurredOn,
          type: input.type,
          category: input.category,
          amount_cents: input.amountCents,
          description: input.description,
          product_id: input.productId,
          quantity: input.quantity,
          source: input.source,
          external_id: input.externalId,
          confidence: input.confidence ?? null,
        })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          const existing = await client
            .from("transactions")
            .select("*")
            .eq("business_id", input.businessId)
            .eq("external_id", input.externalId)
            .maybeSingle();
          if (existing.error) throw new Error(existing.error.message);
          return { created: false, transaction: (existing.data ?? null) as Transaction | null };
        }
        throw new Error(error.message);
      }
      return { created: true, transaction: data as Transaction };
    },

    async remove(id: string): Promise<void> {
      const { error } = await client.from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}

export function createNudgeRepository(client: SupabaseClient) {
  return {
    async listForBusiness(businessId: string): Promise<Nudge[]> {
      const { data, error } = await client
        .from("nudges")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Nudge[];
    },

    async save(input: {
      businessId: string;
      ruleKey: string;
      severity: Nudge["severity"];
      payload: Nudge["payload"];
      messageEn: string;
      messageZu: string;
      status: NudgeStatus;
    }): Promise<Nudge> {
      const { data, error } = await client
        .from("nudges")
        .insert({
          business_id: input.businessId,
          rule_key: input.ruleKey,
          severity: input.severity,
          payload: input.payload,
          message_en: input.messageEn,
          message_zu: input.messageZu,
          status: input.status,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Nudge;
    },
  };
}

export function createStageProgressRepository(client: SupabaseClient) {
  return {
    async get(businessId: string): Promise<StageProgress | null> {
      const { data, error } = await client
        .from("stage_progress")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as StageProgress | null;
    },

    async save(progress: StageProgress): Promise<StageProgress> {
      const { data, error } = await client
        .from("stage_progress")
        .upsert(progress)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as StageProgress;
    },
  };
}

export function createHealthScoreRepository(client: SupabaseClient) {
  return {
    async get(businessId: string): Promise<HealthScore | null> {
      const { data, error } = await client
        .from("health_scores")
        .select("*")
        .eq("business_id", businessId)
        .order("computed_at", { ascending: false })
        .limit(1);
      if (error) throw new Error(error.message);
      return (data ?? [null])[0] as HealthScore | null;
    },

    async save(score: HealthScore): Promise<HealthScore> {
      const { data, error } = await client
        .from("health_scores")
        .upsert(score)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as HealthScore;
    },
  };
}

export function createProductRepository(client: SupabaseClient) {
  return {
    async listForBusiness(businessId: string): Promise<Product[]> {
      const { data, error } = await client
        .from("products")
        .select("*")
        .eq("business_id", businessId);
      if (error) throw new Error(error.message);
      return (data ?? []) as Product[];
    },
  };
}

export function createIngredientRepository(client: SupabaseClient) {
  return {
    async listForBusiness(businessId: string): Promise<Ingredient[]> {
      const { data, error } = await client
        .from("ingredients")
        .select("*")
        .eq("business_id", businessId);
      if (error) throw new Error(error.message);
      return (data ?? []) as Ingredient[];
    },
  };
}

export function createPlanItemRepository(client: SupabaseClient) {
  return {
    async listForBusiness(businessId: string): Promise<PlanItem[]> {
      const { data, error } = await client
        .from("plan_items")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as PlanItem[];
    },
  };
}
