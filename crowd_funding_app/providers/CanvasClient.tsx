/* eslint-disable react-hooks/rules-of-hooks */
"use client";
// import React, {
//   createContext,
//   useState,
//   useEffect,
//   useRef,
//   useContext,
//   ReactNode,
// } from "react";
// import { CanvasClient, CanvasInterface } from "@dscvr-one/canvas-client-sdk";
// import { useCanvasClient } from "@/hooks/useCanvasClient";

// type CanvasState = {
//   client: CanvasClient | undefined;
//   user: CanvasInterface.Lifecycle.User | undefined;
//   content: CanvasInterface.Lifecycle.Content | undefined;
//   isReady: boolean;
// };

// // // Create a Context with an initial default value
// const CanvasContext = createContext<CanvasState>({
//   client: undefined,
//   user: undefined,
//   content: undefined,
//   isReady: false,
// });

// // Custom hook to use the Canvas context
// export function useCanvas() {
//   const context = useContext(CanvasContext);
//   if (!context) {
//     throw new Error("useCanvas must be used within a CanvasProvider");
//   }
//   return context;
// }

// // CanvasProvider component
// export function CanvasProvider({ children }: { children: ReactNode }) {
//   const [state, setState] = useState<CanvasState>({
//     client: undefined,
//     user: undefined,
//     content: undefined,
//     isReady: false,
//   });
//   const initializationStartedRef = useRef(false);

//   // const { client, user, content, isReady } = useCanvasClient();
//   // console.log("very new client", client);

//   async function validateHostMessage(
//     response: CanvasInterface.Lifecycle.InitResponse
//   ) {
//     // Implement your validation logic here
//     return true; // Placeholder return
//   }

//   useEffect(() => {
//     if (initializationStartedRef.current) return;

//     initializationStartedRef.current = true;

//     async function initializeCanvas() {
//       const client = new CanvasClient();

//       try {
//         const response = await client.ready();

//         const isValidResponse = await validateHostMessage(response);

//         if (isValidResponse) {
//           console.log("Client initialized:", client);
//           setState({
//             client,
//             user: response.untrusted.user,
//             content: response.untrusted.content,
//             isReady: true,
//           });
//         }
//       } catch (error) {
//         console.error("Error initializing CanvasClient:", error);
//         setState((prev) => ({ ...prev, isReady: true }));
//       }
//     }

//     initializeCanvas();
//   }, []);

//   return (
//     <CanvasContext.Provider value={state}>{children}</CanvasContext.Provider>
//   );
// }

import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useRef,
} from "react";
import {
  CanvasClient,
  isIframeContext,
  type CanvasInterface,
} from "@dscvr-one/canvas-client-sdk";
import { registerCanvasWallet } from "@dscvr-one/canvas-wallet-adapter";
import { useCanvasClient } from "@/hooks/useCanvasClient";
// import { validateHostMessage } from "@/api/dscvr";

type CanvasContextType = {
  client?: CanvasClient;
  user?: CanvasInterface.Lifecycle.User;
  content?: CanvasInterface.Lifecycle.Content;
  isReady?: boolean;
};

const CanvasContext = createContext<CanvasContextType>({});

let canvasClient: CanvasClient | undefined = undefined;

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [canvasContext, setCanvasContext] = useState<CanvasContextType>({
    client: undefined,
    user: undefined,
    content: undefined,
    isReady: false,
  });
  const resizeObserverRef = useRef<ResizeObserver>();

  async function validateHostMessage(
    response: CanvasInterface.Lifecycle.InitResponse
  ) {
    // Implement your validation logic here
    return true; // Placeholder return
  }

  const initialize = async (canvasClient: CanvasClient) => {
    registerCanvasWallet(canvasClient);
    try {
      const response = await canvasClient.ready();
      const isValidResponse = await validateHostMessage(response);
      if (isValidResponse) {
        setCanvasContext({
          client: canvasClient,
          user: response.untrusted.user,
          content: response.untrusted.content,
          isReady: true,
        });
      }
    } catch (error) {
      console.error("Failed to initialize canvas", error);
    }
  };

  console.log("canvas context", canvasContext);

  useEffect(() => {
    if (canvasClient) return;
    // canvasClient = new CanvasClient();
    canvasClient = isIframeContext() ? new CanvasClient() : undefined;
    setCanvasContext({ client: canvasClient });

    if (!canvasClient) return;
    initialize(canvasClient);
  }, []);

  // useEffect(() => {
  //   if (!canvasContext.client?.isReady) {
  //     const { client, isReady } = useCanvasClient();
  //     console.log(client);
  //   }
  // }, []);

  console.log(canvasClient);

  useEffect(() => {
    if (canvasContext.client) {
      resizeObserverRef.current = new ResizeObserver(() =>
        canvasContext.client?.resize()
      );
      resizeObserverRef.current.observe(document.body);

      return () => {
        resizeObserverRef.current?.disconnect();
      };
    }
  }, [canvasContext.client]);

  return (
    <CanvasContext.Provider value={{ ...canvasContext }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error(
      "useCanvasClientContext must be used within a CanvasClientProvider"
    );
  }
  return context;
};

export default CanvasContext;
