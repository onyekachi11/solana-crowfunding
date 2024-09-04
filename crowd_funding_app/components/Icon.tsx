import Image from "next/image";
import React from "react";
import Info from "../assets/info.png";

const Icon = () => {
  return (
    <div className="w-[20px]">
      <Image alt="info" src={Info} />
    </div>
  );
};

export default Icon;
