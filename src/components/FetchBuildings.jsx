
import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react'
import {programId, connection, provider, program } from 'src/utils/AnchorProvider';
import { getProvider } from 'src/utils/DetectProvider';
import Cards from './Cards';

const FetchBuildings = () => {
    const [buildings, setBuildings] = useState([]);
    const [items, setItems] = useState([])

    // Helper function to get all buildings
    const getAllBuildings = async () => {
        // Fetch all Building accounts
        const buildingAccounts = await program.account.building.all();
        return buildingAccounts.map(building => ({
        buildingId: building.account.buildingId.toString(),
        lister: building.account.lister.toString(),
        apartmentsCount: building.account.apartmentsCount.toNumber(),
        remainingApartments: building.account.remainingApartments.toNumber(),
        apartmentPrice: building.account.apartmentPrice.toNumber(),
        ipfsHash: building.account.ipfsHash,
        soldOut: building.account.soldOut
        }));
    };

    const loadItems = async() => {
        let displayItems = [];
        const items = await getAllBuildings();
        console.log(items);
        const itemCount = items.length;
        console.log(itemCount)
        for (let i = 0; i < itemCount; i++) {
            const item = items[i]
            console.log("item: ", item);
            const remainingApartments = Number(item.remainingApartments)
            const apartmentCount = Number(item.apartmentCount)
            if (!item.soldOut) {
              // console.log();
              const uri = `https://gateway.pinata.cloud/ipfs/${item.ipfsHash}`;
                console.log(uri);
              const response = await fetch(uri)
              console.log(response)
              const metadata = await response.json()
              console.log(metadata)
              metadata.apartmentsOwned = apartmentCount-remainingApartments;
              metadata.apartmentsAvailable = remainingApartments;
              metadata.buildingId = item.buildingId
              console.log("metadata: ", metadata);
              displayItems.push(metadata)
            }
          }
          setItems(displayItems)
          console.log(items)
    }
  
    useEffect(() => {
      const fetchBuildings = async () => {
        // Fetch and display all buildings
        // const allBuildings = await getAllBuildings();
        await loadItems();
        // console.log(allBuildings)
        // setBuildings(allBuildings);
      };
  
      fetchBuildings();
    }, [connection]);

    const buyMarketItem = async() => {
        console.log("pay to buy")
    }


  return (
    <div className='flex flex-wrap gradient-bg-welcome   gap-10 justify-center pt-24 pb-5 px-16'>
      {
        (items.length > 0 ?
          items.map((item, idx) => (
            <Cards item={item} buyMarketItem={buyMarketItem} />
          ))
          : (
            <main style={{ padding: "1rem 0" }}>
              <h2 className='text-white'>No listed assets</h2>
            </main>
          ))}
    </div>
  )
}

export default FetchBuildings
