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



//   export const fetchAllBuildings = async() =>  {
//     const buildings = await connection.getProgramAccounts(new PublicKey(programId), {
//     });
//     console.log("buildings: ",buildings)
//     return buildings.map(({ pubkey, account }) => {
//         return {
//             pubkey, // Public key of the building account
//             accountData: account.data, // Raw account data (needs deserialization)
//         };
//     });
// }

// class Building {
//     constructor(properties) {
//         Object.assign(this, properties);
//     }
// }

// // Define the Building schema (adjust the fields as per your actual struct)
// const BuildingSchema = new Map([
//     [
//         Building,
//         {
//             kind: 'struct',
//             fields: [
//                 ['building_id', [32]], // PublicKey
//                 ['lister', [32]], // PublicKey
//                 ['apartments_count', 'u64'],
//                 ['remaining_apartments', 'u64'],
//                 ['apartment_price', 'u64'],
//                 ['apartment_owners', [[32]]], // Vector of Pubkey byte arrays
//                 ['ipfs_hash', 'string'], // IPFS hash for the building's metadata
//                 ['sold_out', 'u8'], // Boolean field indicating if all apartments are sold
//             ],
//         },
//     ],
// ]);

// const buildings = await fetchAllBuildings()
// console.log(buildings)
// const accountData =  buildings[0].accountData;
// console.log(accountData)
// // Function to deserialize the building account data
// function deserializeBuilding(accountData) {
//     return deserializeUnchecked(BuildingSchema, Building, accountData);
// }

// // Usage
// const deserializedBuilding = deserializeBuilding(accountData);
// console.log('Deserialized building:', deserializedBuilding);


// class Building {
//     constructor(properties) {
//         Object.assign(this, properties);
//     }
// }
// // Define the schema for deserialization
// const BuildingSchema = new Map([
//     [
//         Building, 
//         {
//             kind: 'struct',
//             fields: [
//                 ['building_id', [32]], // Pubkey is 32 bytes
//                 ['lister', [32]], // Pubkey is 32 bytes
//                 ['apartments_count', 'u64'],
//                 ['remaining_apartments', 'u64'],
//                 ['apartment_price', 'u64'],
//                 ['apartment_owners', [[32]]], // Vector of Pubkeys
//                 ['ipfs_hash', 'string'],
//                 ['sold_out', 'u8'], // Boolean represented as a byte
//             ],
//         },
//     ],
// ]);

// export const  fetchAllBuildings = async() => {
//     // Fetch all accounts associated with the programId
//     const accounts = await connection.getProgramAccounts(new PublicKey(programId));
//     console.log(accounts)
//     // Deserialize each account into Building objects
//     const buildings = accounts.map(({ pubkey, account }) => {
//         try {
//             const building = deserializeUnchecked(
//                 BuildingSchema,       // Schema for deserialization
//                 Building,             // Class to deserialize into
//                 account.data          // Raw data fetched from the account
//             );
//             return {
//                 pubkey,               // Public key of the building account
//                 accountData: building, // Deserialized Building data
//             };
//         } catch (err) {
//             console.error('Error deserializing account:', err);
//             return null; // Return null if deserialization fails
//         }
//     }).filter(building => building !== null); // Remove null entries

//     return buildings;
// }

// export const fetchBuildingsMintedByUser = async() => {
//     const provider = getProvider();
//     console.log(provider.publicKey.toString());
    
//     const bytes = provider.publicKey.toString()
//     const buildings = await connection.getProgramAccounts(new PublicKey(programId), {
//         filters: [
//             // Filter based on the lister public key
//             {
//                 memcmp: {
//                     offset: 8, // Offset to skip the account discriminator (first 8 bytes)
//                     bytes: bytes, 
//                 },
//             },
//         ],
//     });

//     console.log("buildings", buildings)

//     return buildings.map(({ pubkey, account }) => {
//         try {
//             // Deserialize account data using the schema
//             const building = deserializeUnchecked(
//                 BuildingSchema,
//                 Building,
//                 account.data
//             );
//             return {
//                 pubkey,
//                 accountData: building,
//             };
//         } catch (err) {
//             console.error('Deserialization error:', err);
//             return null;
//         }
//     }).filter(building => building !== null); // Filter out null entries
// }


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

