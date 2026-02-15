import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { exchangePlaidToken, fetchPlaidLinkToken, plaidStatus, syncPlaidAccounts } from "../services/api";

type Props = {
  onSuccess: () => void;
};

export function PlaidLinkButton({ onSuccess }: Props) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: useCallback(
      async (publicToken: string) => {
        setLoading(true);
        try {
          await exchangePlaidToken(publicToken);
          setLinkToken(null);
          onSuccess();
        } catch (err) {
          console.error("Plaid exchange failed:", err);
        } finally {
          setLoading(false);
        }
      },
      [onSuccess]
    ),
    onExit: useCallback(() => setLinkToken(null), []),
  });

  useEffect(() => {
    plaidStatus().then(({ enabled: e }) => setEnabled(e));
  }, []);

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  async function handleLinkClick() {
    if (!enabled) return;
    setLoading(true);
    try {
      const token = await fetchPlaidLinkToken();
      setLinkToken(token);
    } catch (err) {
      console.error("Failed to get link token:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncClick() {
    if (!enabled) return;
    setSyncing(true);
    try {
      await syncPlaidAccounts();
      onSuccess();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  if (!enabled) {
    return (
      <div className="panel space-y-3">
        <h2 className="text-base font-semibold text-slate-200">Link Bank (Plaid)</h2>
        <p className="text-sm text-slate-500">
          Set PLAID_CLIENT_ID and PLAID_SECRET in apps/api/.env to enable.
        </p>
      </div>
    );
  }

  return (
    <div className="panel space-y-4">
      <h2 className="text-base font-semibold text-slate-200">Link Bank Account</h2>
      <p className="text-sm text-slate-400">
        Connect your bank via Plaid to import accounts and balances automatically.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleLinkClick}
          disabled={loading}
          className="btn-primary flex-1 bg-violet-600 text-white disabled:opacity-50"
        >
          {loading ? "Opening..." : "Link new account"}
        </button>
        <button
          type="button"
          onClick={handleSyncClick}
          disabled={syncing}
          className="btn-primary flex-1 border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync balances"}
        </button>
      </div>
    </div>
  );
}
