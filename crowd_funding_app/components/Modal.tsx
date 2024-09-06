import React, { ReactNode } from "react";

interface ConnectWalletProps {
  children: ReactNode;
}

const Modal: React.FC<ConnectWalletProps> = ({ children }) => {
  return (
    <div className="absolute top-14 left-0 flex items-cente justify-center w-full h-full  backdrop-blur-sm  z-50">
      <div>
        <div className="glass">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
