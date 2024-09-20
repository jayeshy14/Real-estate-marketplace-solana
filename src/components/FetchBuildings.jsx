
import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react'
import {programId, connection, provider, program } from 'src/utils/AnchorProvider';
import { getProvider } from 'src/utils/DetectProvider';
import { deserializeUnchecked } from 'borsh';
// import { sha256 } from '@coral-xyz/anchor/dist/cjs/utils';

const FetchBuildings = () => {
    useEffect(() => {
        const fetch = async() => {
            // fetchBuildings()
        }
        fetch()
    }, [])
  return (
    <div>
      
    </div>
  )
}

export default FetchBuildings





class Building {
    constructor(properties) {
        Object.assign(this, properties);
    }
}
// Define the schema for deserialization
const BuildingSchema = new Map([
    [
        Building, 
        {
            kind: 'struct',
            fields: [
                ['building_id', [32]], // Pubkey is 32 bytes
                ['lister', [32]], // Pubkey is 32 bytes
                ['apartments_count', 'u64'],
                ['remaining_apartments', 'u64'],
                ['apartment_price', 'u64'],
                ['apartment_owners', [[32]]], // Vector of Pubkeys
                ['ipfs_hash', 'string'],
                ['sold_out', 'u8'], // Boolean represented as a byte
            ],
        },
    ],
]);



//    export const  fetchBuildings = async() => {
//     const buildingDiscriminator = getAccountDiscriminator('Building');

//     const accounts = await connection.getProgramAccounts(new PublicKey(programId), {
//         filters: [
//             {
//                 memcmp: {
//                     offset: 0, // The discriminator is at the very beginning of the account data
//                     bytes: buildingDiscriminator.toString('base64'),
//                 },
//             },
//         ],
//     });
//     console.log(accounts)

//     return accounts.map(({ pubkey, account }) => {
//         // Deserialization may be needed depending on your structure
//         return {
//             pubkey, // Public key of the building account
//             accountData: account.data, // Raw account data (needs deserialization)
//         };
//     });
// }

// // Helper function to get the account discriminator
// function getAccountDiscriminator(accountName) {
//     const hash = sha256.digest(`account:${accountName}`);
//     const buffer = Buffer.from(hash)
//     return buffer.subarray(0, 8)
// }

