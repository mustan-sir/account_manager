import { FormEvent, useEffect, useMemo, useState } from "react";
import { PlaidLinkButton } from "./components/PlaidLinkButton";
import {
  createAccount,
  createCard,
  createRewardRule,
  fetchAccounts,
  fetchCards,
  fetchDueDates,
  fetchRecommendation,
  fetchSummary,
  uploadCsv,
} from "./services/api";
import type { Account, Card, DashboardSummary, DueDateItem, Recommendation } from "./types";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const emptySummary: DashboardSummary = {
  total_cash: 0,
  total_investments: 0,
  total_card_debt: 0,
  upcoming_due_count: 0,
};

type TabId = "overview" | "accounts" | "cards" | "tools";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "accounts", label: "Accounts" },
  { id: "cards", label: "Cards" },
  { id: "tools", label: "Rewards & Import" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [dueDates, setDueDates] = useState<DueDateItem[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    account_type: "checking",
    currency: "USD",
    current_balance: 0,
  });
  const [cardForm, setCardForm] = useState({
    account_id: 0,
    issuer_name: "",
    apr: 0,
    statement_day: 1,
    due_day: 20,
    min_payment_due: 0,
  });
  const [recommendationForm, setRecommendationForm] = useState({
    account_id: 0,
    category: "travel",
    multiplier: 2,
    amount: 100,
  });

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextAccounts, nextCards, nextDueDates] = await Promise.all([
        fetchSummary(),
        fetchAccounts(),
        fetchCards(),
        fetchDueDates(),
      ]);
      setSummary(nextSummary);
      setAccounts(nextAccounts);
      setCards(nextCards);
      setDueDates(nextDueDates);
    } catch (err) {
      setError("Unable to load data. Ensure API is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const creditCardAccounts = useMemo(
    () => accounts.filter((account) => account.account_type === "credit_card"),
    [accounts]
  );

  async function submitAccount(e: FormEvent) {
    e.preventDefault();
    await createAccount(accountForm);
    setAccountForm({ name: "", account_type: "checking", currency: "USD", current_balance: 0 });
    await reload();
  }

  async function submitCard(e: FormEvent) {
    e.preventDefault();
    await createCard(cardForm);
    setCardForm((prev) => ({ ...prev, issuer_name: "", apr: 0 }));
    await reload();
  }

  async function submitRewardRule(e: FormEvent) {
    e.preventDefault();
    await createRewardRule({
      account_id: recommendationForm.account_id,
      category: recommendationForm.category,
      multiplier: recommendationForm.multiplier,
    });
    const rec = await fetchRecommendation(recommendationForm.category, recommendationForm.amount);
    setRecommendation(rec);
  }

  async function handleCsvImport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    const importType = form.get("importType");
    if (!(file instanceof File) || (importType !== "balances" && importType !== "transactions")) return;
    await uploadCsv(file, importType);
    await reload();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
          <img src="/icon.png" alt="" className="h-10 w-10 rounded-xl object-cover shadow-lg" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50">Account Manager</h1>
            <p className="text-xs text-slate-500">Bank, investments, cards & rewards</p>
          </div>
        </header>

        {/* Tabs */}
        <nav className="mb-6 flex gap-1 rounded-xl bg-slate-900/80 p-1 backdrop-blur-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-slate-700/80 text-slate-50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Tab content */}
        <div key={activeTab} className="animate-in">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="panel">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Cash</p>
                  <p className="card-value mt-1">{money(summary.total_cash)}</p>
                </div>
                <div className="panel">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Investments</p>
                  <p className="card-value mt-1">{money(summary.total_investments)}</p>
                </div>
                <div className="panel">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Card Debt</p>
                  <p className="card-value mt-1">{money(summary.total_card_debt)}</p>
                </div>
                <div className="panel">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Due Soon</p>
                  <p className="card-value mt-1">{summary.upcoming_due_count}</p>
                </div>
              </section>
              <section className="panel">
                <h2 className="mb-3 text-sm font-semibold text-slate-300">Upcoming Due Dates</h2>
                <ul className="space-y-2">
                  {dueDates.length === 0 && (
                    <li className="rounded-lg bg-slate-800/40 px-3 py-4 text-center text-sm text-slate-500">
                      No cards added yet
                    </li>
                  )}
                  {dueDates.map((item) => (
                    <li
                      key={item.card_account_id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-800/30 px-3 py-2.5"
                    >
                      <span className="font-medium text-slate-100">{item.card_name}</span>
                      <span className="text-sm text-slate-400">
                        {item.due_date} · {item.days_remaining}d · Min {money(item.min_payment_due)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={submitAccount} className="panel space-y-4">
                  <h2 className="text-sm font-semibold text-slate-200">Add Account</h2>
                  <input
                    className="input-base"
                    placeholder="Account name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                  <select
                    className="input-base"
                    value={accountForm.account_type}
                    onChange={(e) => setAccountForm((s) => ({ ...s, account_type: e.target.value }))}
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="retirement">Retirement</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="Balance"
                    value={accountForm.current_balance}
                    onChange={(e) => setAccountForm((s) => ({ ...s, current_balance: Number(e.target.value) }))}
                    required
                  />
                  <button className="btn-primary w-full bg-emerald-600 text-white" type="submit">
                    Save Account
                  </button>
                </form>
                <PlaidLinkButton onSuccess={reload} />
              </div>
              <section className="panel">
                <h2 className="mb-4 text-sm font-semibold text-slate-200">All Accounts</h2>
                {loading ? (
                  <p className="py-8 text-center text-slate-500">Loading...</p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-800/60">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/40">
                          <th className="px-4 py-3 font-medium text-slate-400">Name</th>
                          <th className="px-4 py-3 font-medium text-slate-400">Type</th>
                          <th className="px-4 py-3 font-medium text-slate-400">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((account) => (
                          <tr
                            key={account.id}
                            className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/20"
                          >
                            <td className="px-4 py-3 font-medium text-slate-100">{account.name}</td>
                            <td className="px-4 py-3 text-slate-400">{account.account_type}</td>
                            <td className="px-4 py-3 font-medium text-slate-100">
                              {money(account.current_balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "cards" && (
            <div className="space-y-6">
              <form onSubmit={submitCard} className="panel max-w-md space-y-4">
                <h2 className="text-sm font-semibold text-slate-200">Add Card Details</h2>
                <select
                  className="input-base"
                  value={cardForm.account_id}
                  onChange={(e) => setCardForm((s) => ({ ...s, account_id: Number(e.target.value) }))}
                  required
                >
                  <option value={0}>Select credit card</option>
                  {creditCardAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <input
                  className="input-base"
                  placeholder="Issuer"
                  value={cardForm.issuer_name}
                  onChange={(e) => setCardForm((s) => ({ ...s, issuer_name: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="input-base"
                    type="number"
                    step="0.001"
                    placeholder="APR"
                    value={cardForm.apr}
                    onChange={(e) => setCardForm((s) => ({ ...s, apr: Number(e.target.value) }))}
                  />
                  <input
                    className="input-base"
                    type="number"
                    placeholder="Due day"
                    value={cardForm.due_day}
                    onChange={(e) => setCardForm((s) => ({ ...s, due_day: Number(e.target.value) }))}
                  />
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="Min"
                    value={cardForm.min_payment_due}
                    onChange={(e) =>
                      setCardForm((s) => ({ ...s, min_payment_due: Number(e.target.value) }))
                    }
                  />
                </div>
                <button className="btn-primary w-full bg-violet-600 text-white" type="submit">
                  Save Card
                </button>
              </form>
              <section className="panel">
                <h2 className="mb-3 text-sm font-semibold text-slate-200">Upcoming Due Dates</h2>
                <ul className="space-y-2">
                  {dueDates.length === 0 && (
                    <li className="rounded-lg bg-slate-800/40 px-3 py-4 text-center text-sm text-slate-500">
                      No cards added yet
                    </li>
                  )}
                  {dueDates.map((item) => (
                    <li
                      key={item.card_account_id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-800/30 px-3 py-2.5"
                    >
                      <span className="font-medium text-slate-100">{item.card_name}</span>
                      <span className="text-sm text-slate-400">
                        Due {item.due_date} · {item.days_remaining}d · Min {money(item.min_payment_due)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={submitRewardRule} className="panel space-y-4">
                  <h2 className="text-sm font-semibold text-slate-200">Best Card Recommendation</h2>
                  <select
                    className="input-base"
                    value={recommendationForm.account_id}
                    onChange={(e) =>
                      setRecommendationForm((s) => ({ ...s, account_id: Number(e.target.value) }))
                    }
                    required
                  >
                    <option value={0}>Select card</option>
                    {creditCardAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className="input-base"
                      placeholder="Category"
                      value={recommendationForm.category}
                      onChange={(e) =>
                        setRecommendationForm((s) => ({ ...s, category: e.target.value }))
                      }
                    />
                    <input
                      className="input-base"
                      type="number"
                      step="0.1"
                      placeholder="Multiplier"
                      value={recommendationForm.multiplier}
                      onChange={(e) =>
                        setRecommendationForm((s) => ({ ...s, multiplier: Number(e.target.value) }))
                      }
                    />
                    <input
                      className="input-base"
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={recommendationForm.amount}
                      onChange={(e) =>
                        setRecommendationForm((s) => ({ ...s, amount: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <button className="btn-primary w-full bg-amber-500 text-slate-950" type="submit">
                    Get Recommendation
                  </button>
                  {recommendation && (
                    <div className="rounded-lg border border-slate-800/60 bg-slate-800/30 p-3">
                      <p className="font-semibold text-slate-100">{recommendation.card_name}</p>
                      <p className="mt-1 text-xs text-emerald-400">
                        Expected: {recommendation.expected_return.toFixed(2)}
                      </p>
                    </div>
                  )}
                </form>
                <form className="panel space-y-4" onSubmit={handleCsvImport}>
                  <h2 className="text-sm font-semibold text-slate-200">CSV Import</h2>
                  <input
                    className="input-base file:mr-2 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-sm file:text-slate-200"
                    name="file"
                    type="file"
                    accept=".csv"
                    required
                  />
                  <select name="importType" className="input-base">
                    <option value="balances">Balances</option>
                    <option value="transactions">Transactions</option>
                  </select>
                  <button className="btn-primary w-full bg-cyan-600 text-white" type="submit">
                    Import
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
