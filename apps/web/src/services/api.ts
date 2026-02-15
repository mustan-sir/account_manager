import axios from "axios";
import type { Account, Card, DashboardSummary, DueDateItem, Recommendation } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

export async function fetchSummary(): Promise<DashboardSummary> {
  const { data } = await api.get("/dashboard/summary");
  return data;
}

export async function fetchAccounts(): Promise<Account[]> {
  const { data } = await api.get("/accounts");
  return data;
}

export async function createAccount(payload: {
  name: string;
  account_type: string;
  currency: string;
  current_balance: number;
}): Promise<Account> {
  const { data } = await api.post("/accounts", payload);
  return data;
}

export async function fetchCards(): Promise<Card[]> {
  const { data } = await api.get("/cards");
  return data;
}

export async function createCard(payload: {
  account_id: number;
  issuer_name: string;
  apr: number;
  statement_day: number;
  due_day: number;
  min_payment_due: number;
}): Promise<Card> {
  const { data } = await api.post("/cards", payload);
  return data;
}

export async function fetchDueDates(): Promise<DueDateItem[]> {
  const { data } = await api.get("/due-dates/upcoming");
  return data;
}

export async function uploadCsv(file: File, importType: "balances" | "transactions"): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  form.append("import_type", importType);
  form.append("source_name", file.name);
  await api.post("/imports/csv", form);
}

export async function createRewardRule(payload: { account_id: number; category: string; multiplier: number }) {
  await api.post("/rewards/rules", payload);
}

export async function fetchRecommendation(category: string, amount: number): Promise<Recommendation> {
  const { data } = await api.get("/recommendations/best-card", {
    params: { category, amount },
  });
  return data;
}
