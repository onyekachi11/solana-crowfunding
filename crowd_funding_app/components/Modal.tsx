import React, { ReactNode } from "react";

interface ConnectWalletProps {
  children: ReactNode;
}

const Modal: React.FC<ConnectWalletProps> = ({ children }) => {
  return (
    <div className="absolute  top-0 left-0 flex items-cente justify-center w-full h-full  backdrop-blur-sm  z-50">
      <div className="mt-20">
        <div className="glass">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
