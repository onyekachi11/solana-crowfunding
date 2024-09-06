"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import React from "react";
import { BalanceDisplay } from "./balance";
import Button from "./Button";

const Navbar = ({ connect }: any) => {
  // Inside your Home component
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    setVisible(true);
  };
  return (
    <div className=" rounded-sm px-5 py-5 m-7  glass flex justify-between items-center">
      <p className="font-semibold text-[20px] sm:text-[30px]">Crowd Funder</p>
      <div className="flex items-center gap-2 flex-col">
        <BalanceDisplay />
        {/* <WalletMultiButton /> */}
        {/* <WalletDisconnectButton /> */}
        <Button name="Connect wallet" onClick={() => connect()} />
      </div>
    </div>
  );
};

export default Navbar;
