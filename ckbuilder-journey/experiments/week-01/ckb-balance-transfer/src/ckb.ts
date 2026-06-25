import { ccc } from "@ckb-ccc/core";
import { client, DEVNET_RPC_URL } from "./devnet";

// 1 CKB = 10^8 Shannons. CCC works in Shannons (bigint); we format for display.
export function formatCkb(shannons: bigint): string {
  return ccc.fixedPointToString(shannons, 8);
}

/**
 * Live balance of any address, summed over its cells. Returns Shannons.
 * Throws if the string is not a valid CKB address for this network.
 */
export async function getBalance(address: string): Promise<bigint> {
  const addr = await ccc.Address.fromString(address.trim(), client);
  return client.getBalance([addr.script]);
}

// The transfer is built in clear stages so the UI can show how a CKB
// transaction is assembled, not just the final hash.
export interface TransferStage {
  step: string;
  detail: string;
  txHash: string;
}

export interface TransferParams {
  privateKey: string;
  to: string;
  amountCkb: string;
  onStage: (stage: TransferStage) => void;
}

/**
 * Build, sign and broadcast a simple CKB transfer on the devnet.
 * Returns the final transaction hash. The hash alone does NOT prove the tx is
 * on-chain — use waitForCommit() to confirm finality.
 */
export async function transfer({
  privateKey,
  to,
  amountCkb,
  onStage,
}: TransferParams): Promise<string> {
  const signer = new ccc.SignerCkbPrivateKey(client, privateKey.trim());
  const toAddr = await ccc.Address.fromString(to.trim(), client);

  // Stage 1 — a bare output with the recipient lock and requested capacity.
  const tx = ccc.Transaction.from({
    outputs: [
      {
        lock: toAddr.script,
        capacity: ccc.fixedPointFrom(amountCkb),
      },
    ],
    outputsData: [],
  });
  onStage({
    step: "Built outputs",
    detail: `1 output · ${amountCkb} CKB to recipient`,
    txHash: tx.hash(),
  });

  // Stage 2 — pick input cells from the sender to cover the capacity.
  await tx.completeInputsByCapacity(signer);
  onStage({
    step: "Selected inputs",
    detail: `${tx.inputs.length} input cell(s) chosen to cover capacity`,
    txHash: tx.hash(),
  });

  // Stage 3 — add the fee and a change output back to the sender.
  await tx.completeFeeBy(signer, 1000); // 1000 shannons / 1000 bytes
  onStage({
    step: "Completed fee + change",
    detail: `${tx.inputs.length} input(s) · ${tx.outputs.length} output(s) · ${tx.cellDeps.length} cell dep(s)`,
    txHash: tx.hash(),
  });

  // Stage 4 — sign and broadcast. The returned hash is the committed-to tx hash.
  const txHash = await signer.sendTransaction(tx);
  onStage({
    step: "Signed & broadcast",
    detail: "Transaction sent to the devnet mempool",
    txHash,
  });

  return txHash;
}

/**
 * Poll the node until the transaction is committed or rejected.
 * This is the lesson the tx hash can't teach: sendTransaction() returning a
 * hash only means "accepted into the pool", not "mined into a block".
 */
export async function waitForCommit(
  txHash: string,
  onStatus: (status: string, blockNumber?: bigint) => void,
  timeoutMs = 60_000,
): Promise<string> {
  const start = Date.now();
  for (;;) {
    const res = await client.getTransaction(txHash);
    const status = res?.status ?? "unknown";
    onStatus(status, res?.blockNumber ?? undefined);

    if (status === "committed" || status === "rejected") {
      return status;
    }
    if (Date.now() - start > timeoutMs) {
      return `timed out (last status: ${status})`;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

/** Current tip block number, via a direct JSON-RPC call (also proves the proxy/CORS works). */
export async function getTipBlock(): Promise<number> {
  const res = await fetch(DEVNET_RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "get_tip_block_number",
      params: [],
    }),
  });
  const json = await res.json();
  return Number(json.result);
}
