import { useState, useEffect, useRef } from "react";
import {
  CanvasClient,
  CanvasInterface,
  isIframeContext,
} from "@dscvr-one/canvas-client-sdk";
// import { validateHostMessage } from "../lib/dscvr";

type CanvasState = {
  client: CanvasClient | undefined;
  user: CanvasInterface.Lifecycle.User | undefined;
  content: CanvasInterface.Lifecycle.Content | undefined;
  isReady: boolean;
};

export function useCanvasClient() {
  const [state, setState] = useState<CanvasState>({
    client: undefined,
    user: undefined,
    content: undefined,
    isReady: false,
  });
  const initializationStartedRef = useRef(false);

  async function validateHostMessage(
    response: CanvasInterface.Lifecycle.InitResponse
  ) {
    // Implement your validation logic here
    return true; // Placeholder return
  }

  useEffect(() => {
    if (initializationStartedRef.current) return;

    initializationStartedRef.current = true;

    async function initializeCanvas() {
      const client = isIframeContext() ? new CanvasClient() : undefined;
      // canvasClient = isIframeContext() ? new CanvasClient() : undefined;

      try {
        const response = await client?.ready();
        const isValidResponse =
          response && (await validateHostMessage(response));
        if (isValidResponse) {
          setState({
            client,
            user: response?.untrusted.user,
            content: response?.untrusted.content,
            isReady: true,
          });
        }
      } catch (error) {
        setState((prev) => ({ ...prev, isReady: true }));
      }
    }

    initializeCanvas();

    // return () => {
    //   if (state.client) {
    //     state.client.destroy();
    //   }
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
