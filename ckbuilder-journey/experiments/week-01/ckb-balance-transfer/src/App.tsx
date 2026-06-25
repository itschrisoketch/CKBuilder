import { useCallback, useEffect, useState } from "react";
import {
  DEVNET_ACCOUNTS,
  DEVNET_RPC_URL,
  type DevnetAccount,
} from "./devnet";
import {
  formatCkb,
  getBalance,
  getTipBlock,
  transfer,
  waitForCommit,
  type TransferStage,
} from "./ckb";

function short(s: string, head = 10, tail = 8): string {
  return s.length <= head + tail ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;
}

// ---------------------------------------------------------------------------
// Connection indicator — also a tiny live view of the chain growing.
// ---------------------------------------------------------------------------
function ChainStatus() {
  const [tip, setTip] = useState<number | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const n = await getTipBlock();
        if (!alive) return;
        setTip(n);
        setOnline(true);
      } catch {
        if (!alive) return;
        setOnline(false);
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="chain-status">
      <span className={`dot ${online ? "ok" : online === false ? "down" : ""}`} />
      <span className="chain-text">
        {online === null
          ? "connecting…"
          : online
            ? `devnet · block ${tip?.toLocaleString() ?? "—"}`
            : "devnet offline"}
      </span>
      <code className="rpc">{DEVNET_RPC_URL}</code>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Balance explorer — look up any address.
// ---------------------------------------------------------------------------
function BalanceExplorer() {
  const [address, setAddress] = useState(DEVNET_ACCOUNTS[0].address);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    setBalance(null);
    try {
      setBalance(await getBalance(addr));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="card">
      <header className="card-head">
        <h2>Balance Explorer</h2>
        <p>Read the live capacity held by any devnet address.</p>
      </header>

      <label className="field">
        <span>CKB address</span>
        <textarea
          value={address}
          rows={2}
          spellCheck={false}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ckt1…"
        />
      </label>

      <div className="account-chips">
        {DEVNET_ACCOUNTS.map((a) => (
          <button
            key={a.index}
            className="chip"
            onClick={() => {
              setAddress(a.address);
              lookup(a.address);
            }}
          >
            account #{a.index}
          </button>
        ))}
      </div>

      <button
        className="btn primary"
        disabled={loading || !address.trim()}
        onClick={() => lookup(address)}
      >
        {loading ? "Checking…" : "Check balance"}
      </button>

      {balance !== null && (
        <div className="balance-readout">
          <span className="amount">{formatCkb(balance)}</span>
          <span className="unit">CKB</span>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Transfer lab — build, send, and watch a transfer reach finality.
// ---------------------------------------------------------------------------
function TransferLab() {
  const [from, setFrom] = useState<DevnetAccount>(DEVNET_ACCOUNTS[0]);
  const [to, setTo] = useState(DEVNET_ACCOUNTS[1].address);
  const [amount, setAmount] = useState("100");
  const [stages, setStages] = useState<TransferStage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [block, setBlock] = useState<bigint | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStages([]);
    setStatus(null);
    setBlock(null);
    try {
      const txHash = await transfer({
        privateKey: from.privateKey,
        to,
        amountCkb: amount,
        onStage: (s) => setStages((prev) => [...prev, s]),
      });
      setStatus("pending");
      const final = await waitForCommit(txHash, (st, bn) => {
        setStatus(st);
        if (bn !== undefined) setBlock(bn);
      });
      setStatus(final);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [from, to, amount]);

  return (
    <section className="card">
      <header className="card-head">
        <h2>Transfer Lab</h2>
        <p>Sign with a devnet test key and watch the transaction reach a block.</p>
      </header>

      <label className="field">
        <span>From (sender)</span>
        <select
          value={from.index}
          onChange={(e) =>
            setFrom(
              DEVNET_ACCOUNTS.find((a) => a.index === Number(e.target.value))!,
            )
          }
        >
          {DEVNET_ACCOUNTS.map((a) => (
            <option key={a.index} value={a.index}>
              account #{a.index} · {short(a.address)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>To (recipient)</span>
        <textarea
          value={to}
          rows={2}
          spellCheck={false}
          onChange={(e) => setTo(e.target.value)}
          placeholder="ckt1…"
        />
      </label>

      <label className="field">
        <span>Amount (CKB · min 61 for a new cell)</span>
        <input
          type="number"
          min="61"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <button
        className="btn primary"
        disabled={busy || !to.trim() || !amount}
        onClick={send}
      >
        {busy ? "Working…" : `Send ${amount || "0"} CKB`}
      </button>

      {stages.length > 0 && (
        <ol className="stages">
          {stages.map((s, i) => (
            <li key={i}>
              <div className="stage-head">
                <span className="stage-step">{s.step}</span>
                <code className="stage-hash">{short(s.txHash, 8, 6)}</code>
              </div>
              <span className="stage-detail">{s.detail}</span>
            </li>
          ))}
        </ol>
      )}

      {status && (
        <div className={`tx-status ${status}`}>
          <strong>{status}</strong>
          {block !== null && <span> · block {block.toString()}</span>}
          {status === "committed" && <span> ✓ on-chain</span>}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export function App() {
  return (
    <div className="app">
      <header className="masthead">
        <div>
          <h1>
            CKB <span className="accent">Devnet Wallet Lab</span>
          </h1>
          <p className="tagline">
            View balances and move CKB on a local Cell-model chain — built with
            the CCC SDK.
          </p>
        </div>
        <ChainStatus />
      </header>

      <main className="grid">
        <BalanceExplorer />
        <TransferLab />
      </main>

      <footer className="footer">
        <p>
          Devnet test keys only — never use these on testnet or mainnet. Built
          for the CKBuilder journey. Docs:{" "}
          <a
            href="https://docs.nervos.org/docs/dapp/transfer-ckb"
            target="_blank"
            rel="noreferrer"
          >
            Transfer CKB
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
