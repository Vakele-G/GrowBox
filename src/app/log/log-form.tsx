"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Pill, SectionTitle } from "@/components/ui";
import type { ParsedEntry, TransactionType } from "@/lib/domain/types";
import { confirmAndSaveTransactions, parseLogAction } from "./actions";

export function LogForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"text" | "manual">("text");

  // Natural Language Tab
  const [inputText, setInputText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual Entry Tab
  const [manualType, setManualType] = useState<TransactionType>("sale");
  const [manualCategory, setManualCategory] = useState("sales");
  const [manualAmountRands, setManualAmountRands] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualQty, setManualQty] = useState("");

  const sampleChips = [
    "I sold 40 gwinyas and bought oil for R180",
    "Sold 15 slap chips small",
    "Bought cake flour 10kg for R175",
    "Taxi to wholesaler R40",
  ];

  async function handleParse() {
    if (!inputText.trim()) return;
    setIsParsing(true);
    setSuccessMessage(null);
    try {
      const entries = await parseLogAction(inputText);
      setParsedEntries(entries);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirmSave() {
    if (!parsedEntries || parsedEntries.length === 0) return;
    setIsSaving(true);
    try {
      const res = await confirmAndSaveTransactions(parsedEntries, "text");
      if (res.success) {
        setSuccessMessage(`✓ Successfully saved ${res.inserted} transactions to ledger!`);
        setParsedEntries(null);
        setInputText("");
        setTimeout(() => {
          router.push("/ledger");
          router.refresh();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  function handleUpdateParsed(idx: number, updates: Partial<ParsedEntry>) {
    if (!parsedEntries) return;
    setParsedEntries(
      parsedEntries.map((entry, i) => (i === idx ? { ...entry, ...updates } : entry)),
    );
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(manualAmountRands) * 100);
    if (isNaN(cents) || cents <= 0) return;

    setIsSaving(true);
    try {
      const entry: ParsedEntry = {
        type: manualType,
        category: manualCategory,
        amountCents: cents,
        description: manualDesc.trim() || (manualType === "sale" ? "Daily sales" : "Expense"),
        productId: null,
        quantity: manualQty ? parseInt(manualQty, 10) : null,
        confidence: 1,
      };

      await confirmAndSaveTransactions([entry], "manual");
      setSuccessMessage("✓ Transaction saved to ledger!");
      setManualAmountRands("");
      setManualDesc("");
      setManualQty("");
      setTimeout(() => {
        router.push("/ledger");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox Logging</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Log Trading Day</h1>
        <p className="mt-1 text-sm text-muted">
          Type naturally in plain language or use the quick manual form.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex rounded-xl bg-paper p-1 border border-line">
        <button
          type="button"
          onClick={() => setTab("text")}
          className={`flex-1 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
            tab === "text" ? "bg-forest text-white" : "text-muted hover:text-ink"
          }`}
        >
          Quick Natural Language
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`flex-1 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
            tab === "manual" ? "bg-forest text-white" : "text-muted hover:text-ink"
          }`}
        >
          Manual Entry Form
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-mint p-3 text-center text-sm font-bold text-forest">
          {successMessage}
        </div>
      )}

      {/* Natural Language Tab */}
      {tab === "text" && (
        <Card className="p-4 space-y-4">
          <SectionTitle title="15-Second Typing Log" />
          <p className="text-xs text-muted">
            Tell GrowBox what happened today. We will parse it for your confirmation before saving.
          </p>

          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I sold 40 gwinyas and bought oil for R180"
              className="field min-h-[90px] text-sm"
            />
          </div>

          {/* Quick Demo Chips */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase mb-1.5">
              Tap to fill demo examples:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(chip)}
                  className="rounded-full border border-line bg-cream px-2.5 py-1 text-xs text-ink hover:border-leaf"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={isParsing || !inputText.trim()}
            className="btn-primary w-full"
          >
            {isParsing ? "Understanding your log..." : "Parse Transactions →"}
          </button>

          {/* MANDATORY CONFIRMATION STEP */}
          {parsedEntries && (
            <div className="mt-4 border-t border-line pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">
                  Confirm Parsed Entries ({parsedEntries.length})
                </p>
                <Pill tone="amber">Requires Confirmation</Pill>
              </div>
              <p className="text-xs text-muted">
                Review below. You can adjust amounts before they are recorded to your ledger.
              </p>

              <div className="space-y-2">
                {parsedEntries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-line bg-paper p-3 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Pill tone={entry.type === "sale" ? "green" : "red"}>
                        {entry.type.toUpperCase()} · {entry.category}
                      </Pill>
                      <button
                        type="button"
                        onClick={() =>
                          setParsedEntries(parsedEntries.filter((_, i) => i !== idx))
                        }
                        className="text-xs text-danger font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted">Description</span>
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) =>
                            handleUpdateParsed(idx, { description: e.target.value })
                          }
                          className="field h-8 text-xs py-1"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted">Amount (Rands)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={(entry.amountCents / 100).toFixed(2)}
                          onChange={(e) =>
                            handleUpdateParsed(idx, {
                              amountCents: Math.round(parseFloat(e.target.value || "0") * 100),
                            })
                          }
                          className="field h-8 text-xs py-1 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving || parsedEntries.length === 0}
                  className="btn-primary flex-1 font-bold"
                >
                  {isSaving ? "Saving..." : "✓ Confirm & Save to Ledger"}
                </button>
                <button
                  type="button"
                  onClick={() => setParsedEntries(null)}
                  className="btn-secondary"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Manual Entry Form */}
      {tab === "manual" && (
        <Card className="p-4">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <SectionTitle title="Quick Manual Entry" />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setManualType("sale");
                  setManualCategory("sales");
                }}
                className={`flex-1 min-h-[44px] rounded-xl font-bold text-sm ${
                  manualType === "sale"
                    ? "bg-forest text-white"
                    : "border border-line bg-paper text-muted"
                }`}
              >
                + Sale
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualType("expense");
                  setManualCategory("stock");
                }}
                className={`flex-1 min-h-[44px] rounded-xl font-bold text-sm ${
                  manualType === "expense"
                    ? "bg-danger text-white"
                    : "border border-line bg-paper text-muted"
                }`}
              >
                - Expense
              </button>
            </div>

            <div>
              <label className="label" htmlFor="amount">Amount in Rands</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-base font-semibold text-muted">
                  R
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.5"
                  required
                  placeholder="0.00"
                  value={manualAmountRands}
                  onChange={(e) => setManualAmountRands(e.target.value)}
                  className="field pl-8 font-bold text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label" htmlFor="cat">Category</label>
                <select
                  id="cat"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="field text-sm"
                >
                  {manualType === "sale" ? (
                    <option value="sales">Sales</option>
                  ) : (
                    <>
                      <option value="stock">Stock & Ingredients</option>
                      <option value="utilities">Utilities (Gas/Water)</option>
                      <option value="transport">Transport</option>
                      <option value="rent">Stall Fee / Rent</option>
                      <option value="owner-draw">Owner Withdrawal</option>
                      <option value="other">Other Expense</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="qty">Quantity (optional)</label>
                <input
                  id="qty"
                  type="number"
                  placeholder="e.g. 40"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  className="field text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="desc">Description</label>
              <input
                id="desc"
                type="text"
                placeholder={manualType === "sale" ? "e.g. Amagwinya x40" : "e.g. Cooking oil 5L"}
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                className="field text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !manualAmountRands}
              className="btn-primary w-full"
            >
              {isSaving ? "Saving..." : "Save Transaction"}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
