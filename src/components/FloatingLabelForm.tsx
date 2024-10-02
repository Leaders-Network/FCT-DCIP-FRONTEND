import React from "react";

interface FloatingLabelInputProps {
  id: string;
  type: string;
  label: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FloatingLabelInput({
  id,
  type,
  label,
  className = "",
  inputClassName = "",
  labelClassName = "",
  value,
  onChange,
}: FloatingLabelInputProps) {
  return (
    <div className={`mb-8 relative ${className}`}>
      <input
        type={type}
        id={id}
        placeholder=" "
        className={` ${inputClassName}`}
        value={value}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500 ${labelClassName}`}
      >
        {label}
      </label>
    </div>
  );
}

// Example usage:
// <FloatingLabelInput id="name" type="text" label="Full Name" value={name} onChange={handleNameChange} inputClassName="custom-input" labelClassName="custom-label" />
// <FloatingLabelInput id="email" type="email" label="Email Address" value={email} onChange={handleEmailChange} inputClassName="custom-input" labelClassName="custom-label" />
// <FloatingLabelInput id="password" type="password" label="Password" value={password} onChange={handlePasswordChange} inputClassName="custom-input" labelClassName="custom-label" />
