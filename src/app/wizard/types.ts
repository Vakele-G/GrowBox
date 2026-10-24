export interface Stage1Submission {
  location: string;
  customers: string;
  budgetCents: number;
  equipmentOwned: string[];
  productName: string;
  batchYield: number;
  sellingPriceCents: number;
  unitCostCents: number;
  grossMarginPct: number;
  breakEvenUnitsPerDay: number;
  totalStartupCostCents: number;
  viable: boolean;
  notes: string[];
  launchPlan: string[];
  ingredients: {
    id: string;
    name: string;
    packSize: number;
    packUnit: string;
    packPriceCents: number;
    qtyPerUnit: number;
  }[];
}
