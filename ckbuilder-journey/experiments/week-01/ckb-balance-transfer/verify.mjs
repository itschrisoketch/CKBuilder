// One-off verification that the devnet wiring + CCC calls work end to end.
// Mirrors what the dApp does. Not part of the app build; safe to delete.
import { ccc } from "@ckb-ccc/core";

const URL = "http://127.0.0.1:28114";
const SCRIPTS = {
  NervosDao: {
    codeHash:
      "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7",
            index: 2,
          },
          depType: "code",
        },
      },
    ],
  },
  Secp256k1Blake160: {
    codeHash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  AnyoneCanPay: {
    codeHash:
      "0xe09352af0066f3162287763ce4ddba9af6bfaeab198dc7ab37f8c71c9e68bb5b",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7",
            index: 8,
          },
          depType: "code",
        },
      },
    ],
  },
};

const A0_KEY =
  "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6";
const A1_ADDR =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt435c3epyrupszm7khk6weq5lrlyt52lg48ucew";

const client = new ccc.ClientPublicTestnet({ url: URL, scripts: SCRIPTS });
const signer = new ccc.SignerCkbPrivateKey(client, A0_KEY);

const senderAddr = await signer.getRecommendedAddress();
const senderScript = (await ccc.Address.fromString(senderAddr, client)).script;
const recvScript = (await ccc.Address.fromString(A1_ADDR, client)).script;

console.log("sender    :", senderAddr);
console.log(
  "sender bal:",
  ccc.fixedPointToString(await client.getBalance([senderScript])),
  "CKB",
);
console.log(
  "recv bal  :",
  ccc.fixedPointToString(await client.getBalance([recvScript])),
  "CKB",
);

const tx = ccc.Transaction.from({
  outputs: [{ lock: recvScript, capacity: ccc.fixedPointFrom(123) }],
  outputsData: [],
});
console.log("built     :", tx.hash());
await tx.completeInputsByCapacity(signer);
console.log("inputs    :", tx.inputs.length, "->", tx.hash());
await tx.completeFeeBy(signer, 1000);
console.log("fee+change:", tx.outputs.length, "outputs ->", tx.hash());

const txHash = await signer.sendTransaction(tx);
console.log("broadcast :", txHash);

for (let i = 0; i < 30; i++) {
  const res = await client.getTransaction(txHash);
  const status = res?.status ?? "unknown";
  if (status === "committed" || status === "rejected") {
    console.log("FINAL     :", status, "block", res?.blockNumber?.toString());
    break;
  }
  await new Promise((r) => setTimeout(r, 1000));
}

console.log(
  "recv bal  :",
  ccc.fixedPointToString(await client.getBalance([recvScript])),
  "CKB (after)",
);
