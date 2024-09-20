import React from 'react'
import { Link } from 'react-router-dom'
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

function Nav({}) {
  return (
   <>
<div class="fixed z-10 backdrop-blur-sm">
  <section class="relative mx-auto">
      
    <nav class="flex justify-between text-white w-screen px-24">
      <div class="px-5 xl:px-12 py-6 flex w-full items-center">
        <a class="text-3xl font-bold font-heading">
          Ignitus Networks
        </a>
       
        <ul class="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
          <Link className='no-underline text-gray-200' as={Link} to="/">
          <li>Home</li>   </Link>
          <Link className='no-underline text-gray-200' as={Link} to="/all-nft">
          <li>All Buildings</li>   </Link>
          <Link className='no-underline text-gray-200' as={Link} to="/create">
          <li>List Building</li>   </Link>
          <Link className='no-underline text-gray-200' as={Link} to="/listed-buildings">
          <li>My buildings</li>   </Link>
          <Link className='no-underline text-gray-200' as={Link} to="/owned-apartments">
          <li>My owned apartments</li>   </Link>
        </ul>

        <div class="hidden xl:flex items-center space-x-5 items-center">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  </section>
</div>


   </>
  )
}

export default Nav