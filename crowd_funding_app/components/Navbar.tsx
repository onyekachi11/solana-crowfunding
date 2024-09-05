"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import React from "react";
import { BalanceDisplay } from "./balance";

const Navbar = () => {
  return (
    <div className=" rounded-sm px-5 py-5 m-7  glass flex justify-between items-center">
      <p className="font-semibold text-[20px] sm:text-[30px]">Crowd Funder</p>
      <div className="flex items-center gap-2 flex-col">
        {/* <BalanceDisplay /> */}
        <WalletMultiButton />
        {/* <WalletDisconnectButton /> */}
      </div>
    </div>
  );
};

export default Navbar;
