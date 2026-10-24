import { describe, expect, it } from "vitest";
import {
  calculateEquipmentAffordability,
  SECOND_FRYER_OPTION,
} from "./affordability";

describe("M08 — Equipment Affordability Domain Logic", () => {
  it("calculates second fryer affordability correctly when cash is insufficient", () => {
    const cashOnHandCents = 255_000; // Nomsa's R2,550
    const calc = calculateEquipmentAffordability(SECOND_FRYER_OPTION, cashOnHandCents);

    expect(calc.costCents).toBe(450_000);
    expect(calc.isAffordable).toBe(false);
    expect(calc.shortfallCents).toBe(195_000); // R1,950 shortfall
    expect(calc.unitProfitCents).toBe(298); // R5.00 - R2.02
    expect(calc.extraProfitPerDayCents).toBe(35 * 298); // R104.30 / day
    expect(calc.paybackDays).toBe(Math.ceil(450_000 / (35 * 298))); // 44 days
    expect(calc.extraUnitsNeededPerDay).toBeGreaterThan(0);
  });

  it("identifies when equipment is affordable from cash on hand", () => {
    const cashOnHandCents = 500_000; // R5,000
    const calc = calculateEquipmentAffordability(SECOND_FRYER_OPTION, cashOnHandCents);

    expect(calc.isAffordable).toBe(true);
    expect(calc.shortfallCents).toBe(0);
    expect(calc.paybackDays).toBe(44);
  });
});
