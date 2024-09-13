"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";
import { BalanceDisplay } from "./balance";
import Button from "./Button";
import { useCanvasClient } from "@/hooks/useCanvasClient";
import { useCanvasContext } from "@/providers/CanvasClient";

const Navbar = ({ connect, address }: any) => {
  const { isReady } = useCanvasClient();

  return (
    <div className=" rounded-sm px-5 py-5 m-7  glass flex justify-between items-center">
      <p className="font-semibold text-[20px] sm:text-[30px]">Crowd Funder</p>
      <div className="flex items-center gap-2 flex-col">
        <BalanceDisplay />
        {isReady ? (
          <>
            {address ? (
              <p>Connected</p>
            ) : (
              <Button name="Connect Wallet" onClick={() => connect()} />
            )}
          </>
        ) : (
          <WalletMultiButton />
        )}
      </div>
    </div>
  );
};

export default Navbar;
