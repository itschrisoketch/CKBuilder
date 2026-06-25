# CKB Devnet Wallet Lab

A small React dApp that does two things against a local **offCKB devnet**:

1. **Balance Explorer** — read the live capacity (balance) of any CKB address.
2. **Transfer Lab** — sign a CKB transfer with a devnet test key, then watch the
   transaction move through its construction stages and finally reach a block.

Built with the [CCC SDK](https://docs.nervos.org/docs/sdk-and-devtool/ccc),
following the official [Transfer CKB](https://docs.nervos.org/docs/dapp/transfer-ckb)
guide — but extended with a live chain indicator and a transaction-lifecycle view.

## Why this is more than "send some coins"

On CKB there is no account balance sitting in a contract. A "balance" is just the
sum of capacity across the **live cells** locked by your address, and a transfer is
really *consume some input cells → create new output cells* (the Cell Model). This
app makes that visible:

- The balance is computed by summing cells for the address' lock script.
- The transfer is shown in **stages** — build outputs → select inputs → add
  fee + change → sign & broadcast — and the transaction hash is printed at each
  stage so you can see it is a commitment to the *current* transaction structure
  (it changes as the structure changes).
- After broadcasting, it **polls the node until the tx is committed**. This is the
  key lesson: `sendTransaction()` returning a hash only means "accepted into the
  pool", not "mined". Finality comes from `get_transaction` showing `committed`.

## Prerequisites

- A running devnet: `offckb node` (RPC proxy at `http://127.0.0.1:28114`).
- Node + pnpm.

## Run it

```bash
pnpm install
pnpm dev        # open http://localhost:5173
```

Other scripts:

```bash
pnpm build      # typecheck + production build
pnpm typecheck  # types only
node verify.mjs # headless smoke test: real balance read + transfer on the devnet
```

## How the devnet wiring works

CCC ships built-in script wiring for testnet/mainnet, but **not** for a local
devnet — the genesis out points are different. So `src/devnet.ts` supplies them
explicitly to `ClientPublicTestnet({ url, scripts })`. Regenerate the block with:

```bash
offckb system-scripts --export-style ccc
```

One gotcha worth recording: that export omits **NervosDao**, but CCC's fee/change
completion needs it, so it is added by hand in `src/devnet.ts`. Without it,
`completeFeeBy` throws `No script information was found for NervosDao`.

## Files

| File | Purpose |
| --- | --- |
| `src/devnet.ts` | Devnet client + system-script wiring + test accounts |
| `src/ckb.ts` | `getBalance`, staged `transfer`, `waitForCommit`, tip query |
| `src/App.tsx` | UI: chain status, Balance Explorer, Transfer Lab |
| `src/styles.css` | Self-contained dark theme |
| `verify.mjs` | Headless end-to-end check (handy for evidence) |

## Safety

The pre-filled keys are offCKB's **public devnet test keys**. They are funded only
on the local devnet. **Never** use them — or a real private key in browser code —
on testnet or mainnet.
