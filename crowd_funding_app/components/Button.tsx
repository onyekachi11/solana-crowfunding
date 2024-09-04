import React from "react";

interface ButtonComponent {
  name: string;
  onClick?: () => void;
}

const Button = ({ name, onClick }: ButtonComponent) => {
  return (
    <div
      className="bg-[#512DA8] p-6 py-3 rounded-md font-medium cursor-pointer text-center"
      onClick={onClick}
    >
      <p>{name}</p>
    </div>
  );
};

export default Button;
