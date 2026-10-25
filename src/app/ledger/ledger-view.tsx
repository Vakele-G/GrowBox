"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroBand } from "@/components/hero-band";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { formatDateZA } from "@/lib/domain/dates";
import type { DailyTotal, Transaction } from "@/lib/domain/types";
import { deleteTransactionAction } from "@/app/log/actions";

interface LedgerViewProps {
  initialTransactions: Transaction[];
  dailyTotals: DailyTotal[];
}

export function LedgerView({
  initialTransactions,
  dailyTotals,
}: LedgerViewProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "sale" | "expense">("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, categoryFilter]);

  // Overall totals
  const totalSalesCents = useMemo(() => {
    return transactions
      .filter((t) => t.type === "sale")
      .reduce((sum, t) => sum + t.amountCents, 0);
  }, [transactions]);

  const totalExpensesCents = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amountCents, 0);
  }, [transactions]);

  const netProfitCents = totalSalesCents - totalExpensesCents;

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    setIsDeleting(id);
    try {
      await deleteTransactionAction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(null);
    }
  }

  // Group filtered transactions by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filteredTransactions) {
      const list = map.get(tx.occurredOn) ?? [];
      list.push(tx);
      map.set(tx.occurredOn, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  return (
    <div className="space-y-5">
      <div className="motion-safe:animate-rise">
        <HeroBand
          eyebrow="Financial Records"
          title="Trading Ledger"
          subtitle="Your complete paper trail of sales, expenses, and daily cash summaries."
        />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Card className="p-3">
          <p className="text-[10px] uppercase font-bold text-muted">Total Sales</p>
          <p className="mt-1 text-base font-bold text-brand">
            R{(totalSalesCents / 100).toFixed(0)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase font-bold text-muted">Expenses</p>
          <p className="mt-1 text-base font-bold text-danger">
            R{(totalExpensesCents / 100).toFixed(0)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase font-bold text-muted">Net Profit</p>
          <p
            className={`mt-1 text-base font-bold ${
              netProfitCents >= 0 ? "text-brand" : "text-danger"
            }`}
          >
            R{(netProfitCents / 100).toFixed(0)}
          </p>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 text-xs">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | "sale" | "expense")}
          className="field h-9 text-xs"
        >
          <option value="all">All Types</option>
          <option value="sale">Sales Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="field h-9 text-xs"
        >
          <option value="all">All Categories</option>
          <option value="sales">Sales</option>
          <option value="stock">Stock & Ingredients</option>
          <option value="utilities">Utilities</option>
          <option value="transport">Transport</option>
          <option value="rent">Stall Fee</option>
          <option value="owner-draw">Owner Withdrawal</option>
        </select>
      </div>

      {/* Transactions Grouped by Day */}
      <div className="space-y-4">
        {groupedByDate.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted">
            <span
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-mist text-xl"
              aria-hidden
            >
              🧾
            </span>
            No transactions found for the selected filter.
          </Card>
        ) : (
          groupedByDate.map(([date, txs]) => {
            const dayTotal = dailyTotals.find((d) => d.date === date);
            const daySales =
              dayTotal?.salesCents ??
              txs.filter((t) => t.type === "sale").reduce((s, t) => s + t.amountCents, 0);
            const dayExpenses =
              dayTotal?.expensesCents ??
              txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amountCents, 0);
            const dayProfit = daySales - dayExpenses;

            return (
              <Card key={date} className="motion-safe:animate-rise p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-brand">{formatDateZA(date)}</h3>
                    <p className="text-[11px] text-muted">{txs.length} entries</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-brand">
                      +R{(daySales / 100).toFixed(0)}
                    </span>{" "}
                    /{" "}
                    <span className="font-bold text-danger">
                      -R{(dayExpenses / 100).toFixed(0)}
                    </span>
                    <p
                      className={`text-[10px] font-semibold ${
                        dayProfit >= 0 ? "text-brand" : "text-danger"
                      }`}
                    >
                      Day net: R{(dayProfit / 100).toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-line">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className="py-2.5 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-ink">{tx.description}</span>
                          <Pill
                            tone={
                              tx.source === "fnb"
                                ? "sky"
                                : tx.source === "text"
                                  ? "amber"
                                  : "gray"
                            }
                          >
                            {tx.source === "fnb"
                              ? "Simulated FNB"
                              : tx.source === "text"
                                ? "Typed Log"
                                : "Manual"}
                          </Pill>
                        </div>
                        <p className="text-[10px] text-muted uppercase">
                          {tx.category} {tx.quantity ? `· ${tx.quantity} units` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`font-bold text-sm ${
                            tx.type === "sale" ? "text-brand" : "text-danger"
                          }`}
                        >
                          {tx.type === "sale" ? "+" : "-"}R
                          {(tx.amountCents / 100).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          disabled={isDeleting === tx.id}
                          className="text-muted hover:text-danger p-1"
                          title="Delete entry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
