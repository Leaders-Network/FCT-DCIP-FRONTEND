import React from 'react'
import { MoveRight } from "lucide-react";

interface ButtonProps {
  title: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ title, onClick }) => {
  return (
    <button 
      className="w-[200px] h-[50px] bg-[#028835] rounded-full text-white text-base font-semibold flex items-center justify-evenly"
      onClick={onClick}
    >
      {title}
      <span className="w-[30px] h-[30px] ml-5 flex items-center justify-center bg-white rounded-full">
        <MoveRight color="#000000" size={20} />
      </span>
    </button>
  )
}

export default Button
