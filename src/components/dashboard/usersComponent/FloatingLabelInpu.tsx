import React, { useState } from "react";

interface FloatingLabelInputProps {
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="block w-full px-4 py-2 text-black bg-transparent border border-gray-300 rounded appearance-none focus:outline-none focus:ring-0 focus:border-[#028835] peer"
        placeholder=" "
        required={required}
      />
      <label
        htmlFor={name}
        className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 ${
          isFocused || value ? "text-[#028835]" : "text-gray-500"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelInput;
