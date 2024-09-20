import {
    AnchorProvider,
    Program,
    web3,
    Idl,
    setProvider,
  } from "@coral-xyz/anchor";
  import idl from "../contracts/idl.json"
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { PublicKey } from "@solana/web3.js";
  
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );
  const wallet = window.solana;
  
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  setProvider(provider);
  
  const program = new Program(idl as Idl, provider);
  const programId = new PublicKey(idl.address);
  
  export {programId, connection, provider, program };