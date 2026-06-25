import { ccc } from "@ckb-ccc/core";

// ---------------------------------------------------------------------------
// offCKB devnet wiring
// ---------------------------------------------------------------------------
// The devnet runs behind offCKB's CORS-enabled JSON-RPC proxy. Because it is a
// browser dApp, we talk to the proxy (28114), not the raw node (8114).
export const DEVNET_RPC_URL = "http://127.0.0.1:28114";

// CCC ships built-in script wiring for testnet/mainnet, but NOT for a local
// devnet — the genesis out points differ. We supply them explicitly. Generate
// this block yourself with:
//
//     offckb system-scripts --export-style ccc
//
// The out points below are deterministic for offCKB's default devnet genesis.
// If you run `offckb clean` and re-init with a changed genesis, regenerate them.
const DEVNET_SCRIPTS: Record<string, ccc.ScriptInfoLike> = {
  // CCC's transaction completion (input selection + fee/change) enumerates
  // several known scripts, so we provide the lock + DAO wiring it may touch.
  // Note: `offckb system-scripts --export-style ccc` omits NervosDao, but the
  // devnet does deploy it as `dao` — added here by hand.
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
  Secp256k1Multisig: {
    codeHash:
      "0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293",
            index: 1,
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
  OmniLock: {
    codeHash:
      "0x9c6933d977360f115a3e9cd5a2e0e475853681b80d775d93ad0f8969da343e56",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7",
            index: 7,
          },
          depType: "code",
        },
      },
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
  XUdt: {
    codeHash:
      "0x1a1e4fef34f5982906f745b048fe7b1089647e82346074e0f32c2ece26cf6b1e",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7",
            index: 6,
          },
          depType: "code",
        },
      },
    ],
  },
};

// One shared client for the whole app.
export const client = new ccc.ClientPublicTestnet({
  url: DEVNET_RPC_URL,
  // CCC types `scripts` as a full Record of every KnownScript; we only override
  // the devnet ones we actually use, so cast through unknown.
  scripts: DEVNET_SCRIPTS as unknown as Record<
    ccc.KnownScript,
    ccc.ScriptInfoLike
  >,
});

// ---------------------------------------------------------------------------
// Pre-funded devnet test accounts (from `offckb accounts`).
// THESE ARE PUBLIC TEST KEYS FOR THE LOCAL DEVNET ONLY.
// Never reuse them on testnet or mainnet.
// ---------------------------------------------------------------------------
export interface DevnetAccount {
  index: number;
  address: string;
  privateKey: string;
}

export const DEVNET_ACCOUNTS: DevnetAccount[] = [
  {
    index: 0,
    address:
      "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvwg2cen8extgq8s5puft8vf40px3f599cytcyd8",
    privateKey:
      "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6",
  },
  {
    index: 1,
    address:
      "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt435c3epyrupszm7khk6weq5lrlyt52lg48ucew",
    privateKey:
      "0x9f315d5a9618a39fdc487c7a67a8581d40b045bd7a42d83648ca80ef3b2cb4a1",
  },
  {
    index: 2,
    address:
      "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvarm0tahu0qfkq6ktuf3wd8azaas0h24c9myfz6",
    privateKey:
      "0x59ddda57ba06d6e9c5fa9040bdb98b4b098c2fce6520d39f51bc5e825364697a",
  },
];
