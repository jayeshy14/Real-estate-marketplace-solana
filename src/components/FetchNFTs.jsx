import React, { useEffect, useState } from 'react'
import Cards from './Cards'
import { toast } from 'react-toastify';
import { provider, program } from "../utils/AnchorProvider"
import { web3 } from "@coral-xyz/anchor";
import { encode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/bs58";
import axios from "axios";
import contractData from '../contracts/contractData.json'
 
function FetchNFTs({ }) {
  const [nftData, setNftData] = useState([]);
  const [nftsLoaded, setNftsLoaded] = useState(false)
  const [currNft, setCurrNft] = useState(null);
  const [player, setPlayer] = useState(false);
  const [videoSrc, setVideoSrc] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    const getNftDetails = async () => {
      try {
        const nftOwnersResponse = await program.methods
          .getOwners()
          .accounts({
            state: new web3.PublicKey(contractData.STATE),
            signer: provider.publicKey,
          })
          .view();
        console.log(nftOwnersResponse);

        const nftStatesResponse = await program.methods
          .getNftStates()
          .accounts({
            state: new web3.PublicKey(contractData.STATE),
            signer: provider.publicKey,
          })
          .view();
        console.log(nftStatesResponse)



        const nftMetadataUriResponse = await program.methods
          .getMetadatauri()
          .accounts({
            state: new web3.PublicKey(contractData.STATE),
            signer: provider.publicKey,
          })
          .view();

        console.log("Metadata URI Response:", nftMetadataUriResponse);
        const formattedUris = nftMetadataUriResponse.map((uri) => (uri).toString());
        console.log("Formatted URIs:", formattedUris);

        const finalnfts = formattedUris.filter((uri) => uri.length !== 0);


        const nftDataPromises = formattedUris.map(async (uri) => {
          // const nftDataPromises = finalnfts.map(async (uri) => {
          try {
            const response = await axios.get(`https://${contractData.PINATA_URL}/ipfs/${uri}`);
            console.log("res.data: ", response.data);

            return response.data;
          } catch (error) {
            console.error(error)
          }
        })

        console.log(nftDataPromises)
        const fetchedNftData = await Promise.all(nftDataPromises);

        const data = nftMetadataUriResponse.map(
          (_uri, index) => ({
            data: fetchedNftData[index],
            owner: encode(nftOwnersResponse[index]),
            state: nftStatesResponse[index],
          })
        );
        console.log('data: ', data);

        setNftData(data);
        console.log(nftData)
        console.log(setNftsLoaded(true));
        setError(false)

      } catch (error) {
        console.error("Error fetching NFT data:", error);
        setNftsLoaded(true)
        setError(true)
      }
    };

    getNftDetails();
  }, []);
  return (
    <>
    </>
  )
}

export default FetchNFTs;