import { FormEvent, useEffect, useMemo, useState } from "react";
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

export default function App() {
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
      setError("Unable to load data. Ensure API containers are running.");
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
    if (!(file instanceof File) || (importType !== "balances" && importType !== "transactions")) {
      return;
    }
    await uploadCsv(file, importType);
    await reload();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-6">
        <header className="panel">
          <h1 className="text-2xl font-semibold">Account Manager</h1>
          <p className="mt-1 text-sm text-slate-400">
            Local-first dashboard for bank, investment, credit cards, due dates, and reward optimization.
          </p>
        </header>

        {error && <div className="rounded border border-red-700 bg-red-900/40 p-3 text-red-100">{error}</div>}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="panel">
            <p className="text-sm text-slate-400">Total Cash</p>
            <p className="text-xl font-semibold">{money(summary.total_cash)}</p>
          </div>
          <div className="panel">
            <p className="text-sm text-slate-400">Total Investments</p>
            <p className="text-xl font-semibold">{money(summary.total_investments)}</p>
          </div>
          <div className="panel">
            <p className="text-sm text-slate-400">Card Debt</p>
            <p className="text-xl font-semibold">{money(summary.total_card_debt)}</p>
          </div>
          <div className="panel">
            <p className="text-sm text-slate-400">Upcoming Due Dates</p>
            <p className="text-xl font-semibold">{summary.upcoming_due_count}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form onSubmit={submitAccount} className="panel space-y-3">
            <h2 className="text-lg font-medium">Add Account</h2>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 p-2"
              placeholder="Account name"
              value={accountForm.name}
              onChange={(e) => setAccountForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <select
              className="w-full rounded border border-slate-700 bg-slate-950 p-2"
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
              className="w-full rounded border border-slate-700 bg-slate-950 p-2"
              type="number"
              step="0.01"
              placeholder="Current balance"
              value={accountForm.current_balance}
              onChange={(e) => setAccountForm((s) => ({ ...s, current_balance: Number(e.target.value) }))}
              required
            />
            <button className="rounded bg-emerald-500 px-4 py-2 font-medium text-slate-950" type="submit">
              Save Account
            </button>
          </form>

          <form onSubmit={submitCard} className="panel space-y-3">
            <h2 className="text-lg font-medium">Add Card Details</h2>
            <select
              className="w-full rounded border border-slate-700 bg-slate-950 p-2"
              value={cardForm.account_id}
              onChange={(e) => setCardForm((s) => ({ ...s, account_id: Number(e.target.value) }))}
              required
            >
              <option value={0}>Select credit card account</option>
              {creditCardAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 p-2"
              placeholder="Issuer"
              value={cardForm.issuer_name}
              onChange={(e) => setCardForm((s) => ({ ...s, issuer_name: e.target.value }))}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                className="rounded border border-slate-700 bg-slate-950 p-2"
                type="number"
                step="0.001"
                placeholder="APR"
                value={cardForm.apr}
                onChange={(e) => setCardForm((s) => ({ ...s, apr: Number(e.target.value) }))}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 p-2"
                type="number"
                placeholder="Due day"
                value={cardForm.due_day}
                onChange={(e) => setCardForm((s) => ({ ...s, due_day: Number(e.target.value) }))}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 p-2"
                type="number"
                step="0.01"
                placeholder="Min payment"
                value={cardForm.min_payment_due}
                onChange={(e) => setCardForm((s) => ({ ...s, min_payment_due: Number(e.target.value) }))}
              />
            </div>
            <button className="rounded bg-indigo-400 px-4 py-2 font-medium text-slate-950" type="submit">
              Save Card
            </button>
          </form>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form className="panel space-y-3" onSubmit={handleCsvImport}>
            <h2 className="text-lg font-medium">CSV Import</h2>
            <input className="w-full" name="file" type="file" accept=".csv" required />
            <select name="importType" className="w-full rounded border border-slate-700 bg-slate-950 p-2">
              <option value="balances">Balances CSV</option>
              <option value="transactions">Transactions CSV</option>
            </select>
            <button className="rounded bg-cyan-400 px-4 py-2 font-medium text-slate-950" type="submit">
              Import File
            </button>
          </form>

          <div className="panel">
            <h2 className="mb-2 text-lg font-medium">Upcoming Due Dates</h2>
            <ul className="space-y-2">
              {dueDates.length === 0 && <li className="text-slate-400">No cards added yet.</li>}
              {dueDates.map((item) => (
                <li key={item.card_account_id} className="rounded border border-slate-800 p-2">
                  <p className="font-medium">{item.card_name}</p>
                  <p className="text-sm text-slate-300">
                    Due {item.due_date} ({item.days_remaining} days), minimum {money(item.min_payment_due)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form onSubmit={submitRewardRule} className="panel space-y-3">
            <h2 className="text-lg font-medium">Best Card Recommendation</h2>
            <select
              className="w-full rounded border border-slate-700 bg-slate-950 p-2"
              value={recommendationForm.account_id}
              onChange={(e) => setRecommendationForm((s) => ({ ...s, account_id: Number(e.target.value) }))}
              required
            >
              <option value={0}>Select card account for reward rule</option>
              {creditCardAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <input
                className="rounded border border-slate-700 bg-slate-950 p-2"
                placeholder="Category"
                value={recommendationForm.category}
                onChange={(e) => setRecommendationForm((s) => ({ ...s, category: e.target.value }))}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 p-2"
                type="number"
                step="0.1"
                placeholder="Multiplier"
                value={recommendationForm.multiplier}
                onChange={(e) => setRecommendationForm((s) => ({ ...s, multiplier: Number(e.target.value) }))}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 p-2"
                type="number"
                step="0.01"
                placeholder="Amount"
                value={recommendationForm.amount}
                onChange={(e) => setRecommendationForm((s) => ({ ...s, amount: Number(e.target.value) }))}
              />
            </div>
            <button className="rounded bg-amber-400 px-4 py-2 font-medium text-slate-950" type="submit">
              Save Rule + Recommend
            </button>
          </form>

          <div className="panel">
            <h2 className="mb-2 text-lg font-medium">Recommendation Result</h2>
            {recommendation ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold">{recommendation.card_name}</p>
                <p className="text-slate-300">Category: {recommendation.category}</p>
                <p className="text-slate-300">Expected return: {recommendation.expected_return.toFixed(2)}</p>
                <p className="text-sm text-slate-400">{recommendation.rationale}</p>
              </div>
            ) : (
              <p className="text-slate-400">Create a reward rule to get your best card.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="mb-2 text-lg font-medium">Accounts Snapshot</h2>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-t border-slate-800">
                    <td className="py-2">{account.name}</td>
                    <td>{account.account_type}</td>
                    <td>{money(account.current_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
