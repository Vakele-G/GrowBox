"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Pill, SectionTitle } from "@/components/ui";
import {
  breakEvenUnitsPerDay,
  calculateCosting,
  dailyProfitCents,
  friendlyPriceCents,
  suggestedPriceCents,
} from "@/lib/domain/costing";
import { evaluatePracticality } from "@/lib/domain/practicality";
import type { Ingredient, Product } from "@/lib/domain/types";
import { saveStage1Plan } from "./actions";

interface RecipeIngredient {
  id: string;
  name: string;
  packSize: number;
  packUnit: string;
  packPriceRands: number;
  qtyPerUnit: number;
}

const DEFAULT_INGREDIENTS: RecipeIngredient[] = [
  {
    id: "ing_flour",
    name: "Cake flour",
    packSize: 10,
    packUnit: "kg",
    packPriceRands: 175,
    qtyPerUnit: 0.08,
  },
  {
    id: "ing_oil",
    name: "Cooking oil",
    packSize: 5,
    packUnit: "L",
    packPriceRands: 260,
    qtyPerUnit: 0.012,
  },
  {
    id: "ing_sugar",
    name: "White sugar",
    packSize: 2.5,
    packUnit: "kg",
    packPriceRands: 52,
    qtyPerUnit: 0.012,
  },
  {
    id: "ing_yeast",
    name: "Instant yeast",
    packSize: 0.5,
    packUnit: "kg",
    packPriceRands: 38,
    qtyPerUnit: 0.004,
  },
  {
    id: "ing_salt",
    name: "Table salt",
    packSize: 1,
    packUnit: "kg",
    packPriceRands: 18,
    qtyPerUnit: 0.002,
  },
  {
    id: "ing_bags",
    name: "Paper bags",
    packSize: 500,
    packUnit: "bags",
    packPriceRands: 65,
    qtyPerUnit: 1,
  },
];

export function WizardForm() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // Step 1: Location & Customers
  const [location, setLocation] = useState("Soweto, Johannesburg");
  const [customers, setCustomers] = useState(
    "Taxi commuters in the morning and learners after school",
  );

  // Step 2: Budget
  const [budgetRands, setBudgetRands] = useState(1500);

  // Step 3: Equipment Owned
  const [ownedStove, setOwnedStove] = useState(true);
  const [ownedPot, setOwnedPot] = useState(true);
  const [ownedCylinder, setOwnedCylinder] = useState(true);
  const [ownedTable, setOwnedTable] = useState(false);

  // Step 4: Recipe & Unit Economics
  const [productName, setProductName] = useState("Amagwinya");
  const [batchYield, setBatchYield] = useState(30);
  const [sellingPriceRands, setSellingPriceRands] = useState(5);
  const [expectedDailySales, setExpectedDailySales] = useState(60);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(DEFAULT_INGREDIENTS);

  // Domain Calculations
  const domainProduct: Product = useMemo(
    () => ({
      id: "prod_amagwinya",
      businessId: "biz_nomsa_kitchen",
      name: productName,
      unitLabel: "gwinya",
      sellingPriceCents: Math.round(sellingPriceRands * 100),
      batchYield,
      isActive: true,
    }),
    [productName, sellingPriceRands, batchYield],
  );

  const domainIngredients: Ingredient[] = useMemo(
    () =>
      ingredients.map((ing) => ({
        id: ing.id,
        businessId: "biz_nomsa_kitchen",
        name: ing.name,
        packSize: ing.packSize,
        packUnit: ing.packUnit,
        packPriceCents: Math.round(ing.packPriceRands * 100),
        lastPriceChangeAt: null,
      })),
    [ingredients],
  );

  const costing = useMemo(() => {
    return calculateCosting(
      domainProduct,
      domainIngredients,
      ingredients.map((ing) => ({
        productId: domainProduct.id,
        ingredientId: ing.id,
        qtyPerUnit: ing.qtyPerUnit,
      })),
    );
  }, [domainProduct, domainIngredients, ingredients]);

  const suggested = useMemo(() => {
    return suggestedPriceCents(costing.unitCostCents, 60);
  }, [costing.unitCostCents]);

  const breakEven = useMemo(() => {
    // R50 fixed costs per day (market stall fee / transport)
    return breakEvenUnitsPerDay(5_000, domainProduct.sellingPriceCents, costing.unitCostCents) ?? 0;
  }, [domainProduct.sellingPriceCents, costing.unitCostCents]);

  const projectedDailyProfit = useMemo(() => {
    return dailyProfitCents(
      expectedDailySales,
      domainProduct.sellingPriceCents,
      costing.unitCostCents,
      5_000,
    );
  }, [expectedDailySales, domainProduct.sellingPriceCents, costing.unitCostCents]);

  // Practicality check
  const equipmentOwnedList = useMemo(() => {
    const list: string[] = [];
    if (ownedStove) list.push("Gas stove");
    if (ownedPot) list.push("Pot");
    if (ownedCylinder) list.push("Gas cylinder");
    if (ownedTable) list.push("Display table");
    return list;
  }, [ownedStove, ownedPot, ownedCylinder, ownedTable]);

  const ingredientStockCents = useMemo(() => {
    return ingredients.reduce((sum, item) => sum + Math.round(item.packPriceRands * 100), 0);
  }, [ingredients]);

  const practicality = useMemo(() => {
    return evaluatePracticality({
      budgetCents: Math.round(budgetRands * 100),
      equipmentOwned: equipmentOwnedList,
      equipmentNeeded: [
        { name: "Gas stove", costCents: 65_000 },
        { name: "Pot", costCents: 18_000 },
        { name: "Gas cylinder", costCents: 45_000 },
        { name: "Display table", costCents: 20_000 },
      ],
      ingredientPackCostsCents: ingredientStockCents,
      expectedDailyUnits: expectedDailySales,
      sellingPriceCents: domainProduct.sellingPriceCents,
      unitCostCents: costing.unitCostCents,
    });
  }, [
    budgetRands,
    equipmentOwnedList,
    ingredientStockCents,
    expectedDailySales,
    domainProduct.sellingPriceCents,
    costing.unitCostCents,
  ]);

  function handlePackPriceChange(id: string, price: number) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, packPriceRands: price } : ing)),
    );
  }

  async function handleSavePlan() {
    setSaving(true);
    try {
      await saveStage1Plan({
        location,
        customers,
        budgetCents: Math.round(budgetRands * 100),
        equipmentOwned: equipmentOwnedList,
        productName,
        batchYield,
        sellingPriceCents: domainProduct.sellingPriceCents,
        unitCostCents: costing.unitCostCents,
        grossMarginPct: costing.grossMarginPct,
        breakEvenUnitsPerDay: breakEven,
        totalStartupCostCents: practicality.totalStartupCostCents,
        viable: practicality.viable,
        notes: practicality.notes,
        launchPlan: practicality.launchPlan,
        ingredients: ingredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          packSize: ing.packSize,
          packUnit: ing.packUnit,
          packPriceCents: Math.round(ing.packPriceRands * 100),
          qtyPerUnit: ing.qtyPerUnit,
        })),
      });
      setSaved(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="space-y-3 border-b border-line pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Stage 1: Idea</p>
            <h1 className="text-xl font-bold text-ink">Launch & Costing Wizard</h1>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Step {step}/5
          </span>
        </div>
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-label="Wizard progress"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={5}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full ${
                n < step
                  ? "bg-gradient-to-r from-accent to-brand"
                  : n === step
                    ? "bg-accent"
                    : "bg-sky/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Location & Target Market */}
      {step === 1 && (
        <Card className="p-5 space-y-4">
          <SectionTitle title="1. Trading Location & Community" />
          <p className="text-sm text-muted">
            Where will you trade, and who are your daily customers?
          </p>

          <div>
            <label className="label" htmlFor="location">Trading Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="field"
              placeholder="e.g. Soweto, Johannesburg"
            />
          </div>

          <div>
            <label className="label" htmlFor="customers">Target Customers</label>
            <textarea
              id="customers"
              value={customers}
              onChange={(e) => setCustomers(e.target.value)}
              className="field min-h-[80px]"
              placeholder="e.g. Taxi commuters in the morning, learners at 2pm"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-primary w-full sm:w-auto"
            >
              Next: Startup Budget →
            </button>
          </div>
        </Card>
      )}

      {/* Step 2: Budget */}
      {step === 2 && (
        <Card className="p-5 space-y-4">
          <SectionTitle title="2. Available Startup Budget" />
          <p className="text-sm text-muted">
            How much cash do you currently have saved to start this business?
          </p>

          <div>
            <label className="label" htmlFor="budget">Savings / Available Cash (ZAR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-semibold text-muted">R</span>
              <input
                id="budget"
                type="number"
                min="100"
                step="50"
                value={budgetRands}
                onChange={(e) => setBudgetRands(Number(e.target.value))}
                className="field pl-8 font-semibold text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Nomsa has R1,500 saved from household allowances and odd jobs.
            </p>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-primary"
            >
              Next: Equipment Check →
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Equipment Checklist */}
      {step === 3 && (
        <Card className="p-5 space-y-4">
          <SectionTitle title="3. Equipment Checklist" />
          <p className="text-sm text-muted">
            Check the equipment you already have. Everything unchecked will be added to your startup budget.
          </p>

          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                ownedStove
                  ? "border-accent bg-mist ring-1 ring-accent/40"
                  : "border-line hover:bg-canvas/40"
              }`}
            >
              <input
                type="checkbox"
                checked={ownedStove}
                onChange={(e) => setOwnedStove(e.target.checked)}
                className="h-5 w-5 rounded accent-accent"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Gas Stove / Burner</p>
                <p className="text-xs text-muted">Estimated new: R650</p>
              </div>
              <Pill tone={ownedStove ? "brand" : "gray"}>
                {ownedStove ? "Owned" : "Needed"}
              </Pill>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                ownedPot
                  ? "border-accent bg-mist ring-1 ring-accent/40"
                  : "border-line hover:bg-canvas/40"
              }`}
            >
              <input
                type="checkbox"
                checked={ownedPot}
                onChange={(e) => setOwnedPot(e.target.checked)}
                className="h-5 w-5 rounded accent-accent"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Large Deep Frying Pot</p>
                <p className="text-xs text-muted">Estimated new: R180</p>
              </div>
              <Pill tone={ownedPot ? "brand" : "gray"}>
                {ownedPot ? "Owned" : "Needed"}
              </Pill>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                ownedCylinder
                  ? "border-accent bg-mist ring-1 ring-accent/40"
                  : "border-line hover:bg-canvas/40"
              }`}
            >
              <input
                type="checkbox"
                checked={ownedCylinder}
                onChange={(e) => setOwnedCylinder(e.target.checked)}
                className="h-5 w-5 rounded accent-accent"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Gas Cylinder (9kg)</p>
                <p className="text-xs text-muted">Estimated initial bottle & gas: R450</p>
              </div>
              <Pill tone={ownedCylinder ? "brand" : "gray"}>
                {ownedCylinder ? "Owned" : "Needed"}
              </Pill>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                ownedTable
                  ? "border-accent bg-mist ring-1 ring-accent/40"
                  : "border-line hover:bg-canvas/40"
              }`}
            >
              <input
                type="checkbox"
                checked={ownedTable}
                onChange={(e) => setOwnedTable(e.target.checked)}
                className="h-5 w-5 rounded accent-accent"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Display Table & Cover</p>
                <p className="text-xs text-muted">Estimated new: R200</p>
              </div>
              <Pill tone={ownedTable ? "brand" : "gray"}>
                {ownedTable ? "Owned" : "Needed"}
              </Pill>
            </label>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-secondary"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-primary"
            >
              Next: Costing Calculator →
            </button>
          </div>
        </Card>
      )}

      {/* Step 4: Hero Costing & Pricing Calculator */}
      {step === 4 && (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <SectionTitle title="4. Costing & Pricing Calculator" />
            <p className="text-sm text-muted">
              Live unit economics calculated from actual ingredient pack prices and batch yields.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="prodName">Product</label>
                <input
                  id="prodName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="batchYield">Batch Yield (units)</label>
                <input
                  id="batchYield"
                  type="number"
                  min="1"
                  value={batchYield}
                  onChange={(e) => setBatchYield(Math.max(1, Number(e.target.value)))}
                  className="field"
                />
              </div>
            </div>

            {/* Live Hero KPI Cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-canvas p-3 text-center">
                <p className="text-xs font-semibold text-muted uppercase">Unit Cost</p>
                <p className="text-lg font-bold text-brand">
                  R{(costing.unitCostCents / 100).toFixed(2)}
                </p>
                <p className="text-[10px] text-muted">per gwinya</p>
              </div>

              <div className="rounded-xl bg-canvas p-3 text-center">
                <p className="text-xs font-semibold text-muted uppercase">Batch Cost</p>
                <p className="text-lg font-bold text-ink">
                  R{(costing.batchCostCents / 100).toFixed(2)}
                </p>
                <p className="text-[10px] text-muted">for {batchYield} units</p>
              </div>

              <div className="rounded-xl bg-canvas p-3 text-center">
                <p className="text-xs font-semibold text-muted uppercase">Gross Margin</p>
                <p className={`text-lg font-bold ${costing.grossMarginPct >= 50 ? "text-brand" : "text-amber-ink"}`}>
                  {costing.grossMarginPct.toFixed(1)}%
                </p>
                <p className="text-[10px] text-muted">profit share</p>
              </div>

              <div className="rounded-xl bg-canvas p-3 text-center">
                <p className="text-xs font-semibold text-muted uppercase">Break-Even</p>
                <p className="text-lg font-bold text-ink">{breakEven}</p>
                <p className="text-[10px] text-muted">units/day</p>
              </div>
            </div>

            {/* Selling Price Adjustment */}
            <div className="rounded-xl border border-line bg-mist/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="label text-brand" htmlFor="sellingPrice">Your Selling Price</label>
                  <p className="text-xs text-muted">
                    Market-friendly suggested price:{" "}
                    <strong className="text-brand">R{(suggested / 100).toFixed(2)}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold text-brand">R</span>
                  <input
                    id="sellingPrice"
                    type="number"
                    step="0.5"
                    min="1"
                    value={sellingPriceRands}
                    onChange={(e) => setSellingPriceRands(Number(e.target.value))}
                    className="field w-24 text-right font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Ingredient Pack Prices */}
            <div>
              <p className="label">Wholesaler Pack Prices (Edit to see margin shift)</p>
              <div className="space-y-2">
                {ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between rounded-lg border border-line p-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-ink">{ing.name}</p>
                      <p className="text-muted">
                        Pack: {ing.packSize} {ing.packUnit} ({ing.qtyPerUnit} {ing.packUnit}/unit)
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-muted">R</span>
                      <input
                        type="number"
                        min="1"
                        value={ing.packPriceRands}
                        onChange={(e) => handlePackPriceChange(ing.id, Number(e.target.value))}
                        className="field h-8 w-20 py-1 text-right text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-secondary"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="btn-primary"
              >
                Next: Practicality & Launch Plan →
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 5: Practicality Check & Launch Plan */}
      {step === 5 && (
        <div className="space-y-4">
          <Card className="card-lift p-5 space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle title="5. Practicality Check" />
              <Pill tone={practicality.viable ? "brand" : "red"}>
                {practicality.viable ? "Viable to Launch" : "Budget Shortfall"}
              </Pill>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Your Startup Budget</span>
                <span className="font-bold text-ink">R{budgetRands.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Equipment Needed</span>
                <span className="font-semibold text-ink">
                  R{(practicality.equipmentCostCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">First Ingredient Packs</span>
                <span className="font-semibold text-ink">
                  R{(practicality.initialStockCostCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-line pt-2 flex justify-between text-sm font-bold">
                <span className="text-brand">Remaining Cash Buffer</span>
                <span className={practicality.surplusCents >= 0 ? "text-brand" : "text-danger"}>
                  R{(practicality.surplusCents / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Advice Notes */}
            <div className="space-y-2">
              <p className="label">GrowBox Mentor Feedback</p>
              {practicality.notes.map((note, index) => (
                <div key={index} className="flex gap-2 text-xs text-ink/90">
                  <span className="text-brand font-bold">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Projected Daily Profit */}
            <div className="rounded-xl bg-mist/50 p-3">
              <p className="text-xs font-semibold text-brand uppercase">Projected Daily Profit</p>
              <p className="text-xl font-bold text-brand">
                R{(projectedDailyProfit / 100).toFixed(2)} / day
              </p>
              <p className="text-[11px] text-muted">
                Based on selling {expectedDailySales} {productName} per day minus R50 fixed stall costs.
              </p>
            </div>

            {/* Actionable Launch Plan */}
            <div className="space-y-2">
              <p className="label">Your Step-by-Step Launch Plan</p>
              <div className="space-y-2">
                {practicality.launchPlan.map((stepItem, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-line bg-paper p-3 text-xs"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist text-[11px] font-bold text-brand">
                      {index + 1}
                    </span>
                    <span className="font-medium text-ink">{stepItem}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3">
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={saving || saved}
                className="btn-primary w-full py-3 text-base"
              >
                {saving
                  ? "Saving Launch Plan..."
                  : saved
                    ? "✓ Plan Saved! Redirecting..."
                    : "Save Launch Plan & Start Stage 2"}
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-secondary w-full"
              >
                ← Back to Costing
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
