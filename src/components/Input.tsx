import React, { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  action?: () => void;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, action, ...props }) => {
  return (
    <div className="mb-4 relative">
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full  p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <label
        htmlFor={props.id}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
      >
        {label}
      </label>
      {action && (
        <button
          type="button"
          onClick={action}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          Action
        </button>
      )}
    </div>
  );
}

export default Input;
