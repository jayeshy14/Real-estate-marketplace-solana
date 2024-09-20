import React, { useEffect, useState } from 'react'
import { ethers } from "ethers"
import axios from 'axios'
import { toast } from 'react-toastify'
import {programId ,program, connection, provider} from "../utils/AnchorProvider"
import { useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { getProvider } from 'src/utils/DetectProvider'
import { Buffer } from 'buffer'
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} from '@solana/spl-token'
import { SystemProgram } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'

function Create({  }) {
  // const [loading, setLoading] = useState(true)
  const [nftimage, setNFTImage] = useState();
  const [forminfo, setFormInfo] = useState({
    title: "",
    description: "",
    apartments: 0,
    price: 0
  });

  const [uri, setUri] = useState("");
  const [counterInitialized, setCounterInitialized] = useState(false);
  const [currentProvider, setCurrentProvider] = useState("");
  const [counterAccount , setCounterAccount] = useState("");
  const [counter, setCounter] = useState("");

    const fetchCounterValue = async () => {
      try {
          const [counterPda] = findProgramAddressSync(
              [Buffer.from('counter')],
              programId
          );
          const counterAccount = await program.account.counter.fetch(counterPda);
          setCounter(counterAccount.buildingCount.toNumber());  // Set counter to state
          return counterAccount.buildingCount.toNumber();  // Return counter value for use
      } catch (err) {
          console.error('Failed to fetch counter:', err);
      }
  };

  // Derive the Building PDA using the counter value
  const deriveBuildingPDA = (counterValue, publicKey) => {
    const counterBytes = new Uint8Array(8);
    // Use DataView to set the full 64-bit integer (u64) in little-endian format
    new DataView(counterBytes.buffer).setBigUint64(0, BigInt(counterValue), true);  
      console.log("public key buffer: ", publicKey.toBuffer());
      console.log("public key : ", publicKey);
      console.log("counter value: ", counterValue.toString())
      console.log("counter bytes: ", counterBytes)
      const [buildingPda] = findProgramAddressSync(
          [Buffer.from('building'), publicKey.toBuffer(), counterBytes],
          programId
      );
      return buildingPda;
  };

  const deriveFractionalMintPDA = (counterValue, publicKey) => {
    const counterBytes = new Uint8Array(8);
    // Use DataView to set the full 64-bit integer (u64) in little-endian format
    new DataView(counterBytes.buffer).setBigUint64(0, BigInt(counterValue), true);  

    const [buildingPda] = findProgramAddressSync(
        [Buffer.from('fractional_mint'), publicKey.toBuffer(), counterBytes],
        programId
    );
    return buildingPda;
  };

  const deriveBuildingMintPDA = (counterValue, publicKey) => {
    const counterBytes = new Uint8Array(8);
    // Use DataView to set the full 64-bit integer (u64) in little-endian format
    new DataView(counterBytes.buffer).setBigUint64(0, BigInt(counterValue), true);  

    const [buildingPda] = findProgramAddressSync(
        [Buffer.from('building_mint'), publicKey.toBuffer(), counterBytes],
        programId
    );
    return buildingPda;
  };
    // Utility function to get the Counter PDA
  const getCounterPDA = () => {
      const [counterPda] = findProgramAddressSync([Buffer.from('counter')], programId);
      return counterPda;
  };

  const initializeCounter = async () => {
    if (!provider) return alert('Wallet not connected');

    try {
      const counter = getCounterPDA();
        const tx = await program.methods
            .initializeCounter()
            .accounts({
                signer: provider.wallet.publicKey,
                counter: new web3.PublicKey(counter),
                systemProgram:  web3.SystemProgram.programId,
            })
            .rpc();

        console.log('Transaction signature', tx);
    } catch (err) {
        console.error('Transaction failed', err);
    }
};

  useEffect(() => {
    const checkInitialization = async () => {
      try {
        // const [stateAccountPublicKey] = web3.PublicKey.findProgramAddressSync(
        //   [Buffer.from("state")],
        //   program.programId
        // );
        // console.log("state account: ", stateAccountPublicKey.toString());
        const counter = getCounterPDA()

        const counterAccountPublicKey = new web3.PublicKey(counter);
        console.log(counterAccountPublicKey);

        const counterAccount = await provider.connection.getAccountInfo(
          counterAccountPublicKey
        );
        console.log(counterAccount);
        if (counterAccount) {
          setCounterInitialized(true);
        }
      } catch (error) {
        console.error("Error checking initialization:", error);
      }
    };

    checkInitialization();
  }, []);

  useEffect(() => {
    document.title = "Create"
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const changeHandler = (event) => {
    setNFTImage(event.target.files[0]);
  };

  const handleEvent = async (e) => {

    e.preventDefault();
    
    if (!counterInitialized) {
      toast.info("State is not initialized. Initializing the state first.", {
        position: "top-center",
      });
      await initializeCounter();
      return;
    }
    if(forminfo.apartments < 1) {
      toast.info("Building must have atleast 1 apartment", {
        position: "top-center"
      })
      return
    }
    if(forminfo.price <= 0) {
      toast.info("Enter a valid price for the apartments", {
        position: "top-center"
      })
      return
    }
    console.log(nftimage);
    console.log(forminfo);

    const formData = new FormData();
    const jsonformData = new FormData();

    formData.append('file', nftimage);

    const metadata = JSON.stringify({
        name: forminfo.title,
        description: forminfo.description
    });
    jsonformData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
        cidVersion: 0,
    })
    jsonformData.append('pinataOptions', options);

    try{

        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
              pinata_api_key: `0a13ef76fb9e01561e05`,
              pinata_secret_api_key: `f0a2d096004e4f0483a64d06236ddc252b8d8acf612cde6465bc78f013a08ab0`,
              "Content-Type": "multipart/form-data",
            },
          });

        console.log(resFile.data);

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        const uri = resFile.data.IpfsHash
        setUri(uri)
        console.log("uri is set to: ", uri)
        const info ={
            name: forminfo.title,
            description: forminfo.description,
            image: ImgHash,
            price: forminfo.price,
            // price: ethers.utils.parseEther(forminfo.price),
            apartments: forminfo.apartments
        }

        async function pinJSONToPinata(info) {
            const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
            const headers = {
                'Content-Type': 'application/json',
                'pinata_api_key': `0a13ef76fb9e01561e05`,
                'pinata_secret_api_key': `f0a2d096004e4f0483a64d06236ddc252b8d8acf612cde6465bc78f013a08ab0`
            };

            try {
                const res = await axios.post(url, info, { headers });
                const meta = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
                console.log("uri is: ", uri);
                mintThenList(uri);
            } catch (error) {
                console.error(error);
            }

        }
    
     pinJSONToPinata(info)
    
      } catch (error) {
        console.log(error);
      }
    
  };


  const mintThenList = async (uri) => { 
    try {
      const provider = getProvider();
      console.log(provider);
      const publicKey = provider.publicKey;
      setCurrentProvider(provider._publicKey.toString());
      console.log(currentProvider)
      console.log("calling get counter function");

      // Fetch the current counter value
      const counterValue = await fetchCounterValue();
      console.log("counter value: ", counterValue)

      // Derive PDAs for building, mints, and associated accounts
      const counterPda = getCounterPDA()
      console.log(publicKey.toBuffer())
      const buildingPda = deriveBuildingPDA(counterValue, publicKey);
      console.log("Building pda", buildingPda.toBase58())

      const buildingMintPda = deriveBuildingMintPDA(counterValue, publicKey);
      console.log("building mint pda: ", buildingMintPda)

      const ata = await getAssociatedTokenAddress(
        buildingMintPda,
        new web3.PublicKey(provider._publicKey.toString()),
        false
      );
      console.log("building token account pda: ", ata.toBase58())
      const fractionalMintPda = deriveFractionalMintPDA(counterValue, publicKey);

      console.log("fraction mint pda: ", fractionalMintPda)

      const price  = new BN(forminfo.price)
      const apartments = new BN(forminfo.apartments)
      console.log("final uri:", uri)
      const tx = await program.methods
      .listBuilding(apartments, price, uri)
      .accounts({
          signer: publicKey,
          counter: counterPda,
          building_mint: buildingMintPda.toBase58(),
          building_token_account: ata.toBase58(),
          fractional_mint: fractionalMintPda.toBase58(),
          system_program: SystemProgram.programId,
          token_program: TOKEN_PROGRAM_ID,
          rent:  web3.SYSVAR_RENT_PUBKEY,
          associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
          building: buildingPda.toBase58(),

      })
      .rpc();

  console.log('Building listed with transaction signature:', tx);


    } catch (error) {
      toast.error("Error adding NFT to Marketplace")
      console.error(error);
    }

  }


  return (
    <div className='h-screen pt-24'>
      <div className="container-fluid mt-5 text-left">
        <div className="content mx-auto">
          <form class="max-w-sm mx-auto">

            <div className='max-w-lg mx-auto'>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="user_avatar">Upload Image</label>
              <input onChange={changeHandler} name="file" class="block w-full mb-4 h-8 text-m  text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" />
            </div>


            <div class="mb-4">
              <label for="title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Building Name</label>
              <input onChange={handleChange} type="text" id="title" name='title' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="Enter Building name" required />
            </div>

            <div class="mb-4">
              <label for="apartments" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Number of Apartments <span className='text-sx'></span></label>
              <input onChange={handleChange} type="number" min={1} id="apartments" name='apartments' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="10" />
            </div>

            <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
            <textarea onChange={handleChange} name="description" id="description" rows="4" class="block p-2.5 w-full text-sm  mb-4 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Describe the building"></textarea>
            <div class="mb-4">
              <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price (in tBNB)</label>
              <input onChange={handleChange} type="number" name='price' id="price" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder=' 0.001 tBNB' required />
            </div>
            <div className='text-center'>


              {/* <button onClick={(e) => {e.preventDefault();console.log(forminfo)}} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" >
                  Mint SBT
                </button> */}
              {<button onClick={handleEvent} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" >
                Mint Building
              </button>}
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Create