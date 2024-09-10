// "use client";
// import {
//   WalletDisconnectButton,
//   WalletMultiButton,
//   useWalletModal,
// } from "@solana/wallet-adapter-react-ui";
// import React from "react";
// import { BalanceDisplay } from "./balance";
// import Button from "./Button";

// const Navbar = () => {
//   // Inside your Home component

//   return (
//     <div className=" rounded-sm px-5 py-5 m-7  glass flex justify-between items-center">
//       <p className="font-semibold text-[20px] sm:text-[30px]">Crowd Funder</p>
//       <div className="flex items-center gap-2 flex-col">
//         <BalanceDisplay />
//         <WalletMultiButton />

//         {/* {isReady ? (
//           <>
//             <Button name="Connect wallet" onClick={() => connect()} />
//             <WalletMultiButton />
//           </>
//         ) : (
//           <WalletMultiButton />
//         )} */}
//         {/* <WalletDisconnectButton /> */}
//       </div>
//     </div>
//   );
// };

// export default Navbar;

"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import React from "react";
import { BalanceDisplay } from "./balance";
import Button from "./Button";
import { useCanvasClient } from "@/hooks/useCanvasClient";
import { SOLANA_DEVNET_CHAIN } from "@solana/wallet-standard";

// import { CanvasInterface, CanvasClient } from "@dscvr-one/canvas-client-sdk";
const Navbar = ({ connect }: any) => {
  // Inside your Home component

  const { isReady } = useCanvasClient();

  return (
    <div className=" rounded-sm px-5 py-5 m-7  glass flex justify-between items-center">
      <p className="font-semibold text-[20px] sm:text-[30px]">Crowd Funder</p>
      <div className="flex items-center gap-2 flex-col">
        <BalanceDisplay />

        {!isReady ? (
          <>
            {/* <Button name="Connect wallet" onClick={() => connect()} /> */}
            <WalletMultiButton />
          </>
        ) : (
          <WalletMultiButton />
        )}
        {/* <WalletDisconnectButton /> */}
      </div>
    </div>
  );
};

export default Navbar;
