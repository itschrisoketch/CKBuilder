# Week 1 Report

<!--
  TEMPLATE ONLY — the prose below is for YOU to write in your own words.
  The CKBuilder programme rule: do not use AI to generate your reports.
  Fill in each TODO, drop your screenshots into ../screenshots/week-01/,
  then delete these comment blocks.
-->

**Week of:** <!-- TODO: date range, e.g. 23–29 Jun 2026 -->

## What I did this week

<!-- TODO: in your own words. e.g. set up offCKB devnet, learned the Cell Model,
     built a balance + transfer dApp with CCC. -->

## What I learned

<!-- TODO: your key takeaways. Prompts to jog your memory:
     - balance = sum of capacity over live cells (not an account balance)
     - a transfer consumes input cells and creates output cells
     - the tx hash is a commitment to the tx structure (it changes as you build)
     - sendTransaction() returning a hash != committed; you must poll get_transaction
     - CCC needs explicit devnet script wiring; the ccc export omits NervosDao -->

## What I built

- **Experiment:** [CKB Devnet Wallet Lab](../experiments/week-01/ckb-balance-transfer/)
  — view any address' balance and transfer CKB on the devnet, with a live
  transaction-lifecycle view.

<!-- TODO: a sentence or two on the experiment in your own words. -->

## Evidence (screenshots)

<!-- Capture these into ../screenshots/week-01/ and the links below will render. -->

| # | Shot | File |
| --- | --- | --- |
| 1 | `offckb node` running (RPC proxy on :28114) | ![](../screenshots/week-01/01-offckb-node.png) |
| 2 | `offckb accounts` (pre-funded test accounts) | ![](../screenshots/week-01/02-offckb-accounts.png) |
| 3 | dApp — Balance Explorer showing account #0 = 42,000,000 CKB | ![](../screenshots/week-01/03-balance.png) |
| 4 | dApp — Transfer Lab mid-flight (build → inputs → fee → broadcast stages) | ![](../screenshots/week-01/04-transfer-stages.png) |
| 5 | dApp — status `committed` with block number | ![](../screenshots/week-01/05-committed.png) |
| 6 | dApp — recipient balance increased after transfer | ![](../screenshots/week-01/06-balance-after.png) |
| 7 | Terminal — `pnpm build` passing / `node verify.mjs` committed | ![](../screenshots/week-01/07-build-verify.png) |

## Challenges

<!-- TODO: what was tricky. e.g. the NervosDao wiring gotcha, devnet vs proxy port,
     putting a private key in a browser being devnet-only. -->

## Next week

<!-- TODO: what you plan to tackle next. -->
