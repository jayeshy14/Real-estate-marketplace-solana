import './App.css';
import Nav from './components/Nav.jsx';
import { ToastContainer} from 'react-toastify';
import Home from './components/Home.jsx';
import NFTs from './components/NFTs.jsx';
import Create from './components/Create.jsx';
import 'react-toastify/dist/ReactToastify.css';
import Info from './components/Info.jsx';
import ChangeNetwork from './components/ChangeNetwork.jsx';
import MyBuildings from './components/MyBuildings.jsx';
import OwnedApartments from './components/OwnedApartments.jsx';
import "./App.css";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  BrowserRouter,
} from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import React from "react";
import FetchNFTs from './components/FetchNFTs';
import FetchBuildings from './components/FetchBuildings';


 const App: FC = () => {
    return (
      <Context>
        <Content />
      </Context>
    );
  };
  
  export default App;
  const Context: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
    const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);
  
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  };
  
  const Content: FC = () => {
    const [nftitem, setNftitem] = useState(null);
    return (
      <div className="App">
        <BrowserRouter>
          <div className="App min-h-screen">
            <div className="gradient-bg-welcome h-screen w-screen">
              <Nav />
              <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route
                  path="/all-nft"
                  element={<FetchBuildings />}
                ></Route>
                <Route path="/create" element={<Create />}></Route>
                <Route path="/info" element={<Info nftitem={nftitem} />}></Route>
                <Route path='/listed-buildings' element={<MyBuildings/>}></Route>
                <Route path='/owned-apartments' element={<OwnedApartments/>}></Route>

              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  };
