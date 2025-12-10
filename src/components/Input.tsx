import React, { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  handleChange: (value: string) => void;
  action?: () => void;
}

const Input: React.FC<InputProps> = ({ label, value, handleChange, action, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4 relative">
      <input
        {...props}
        type={inputType}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder=" "
        className="peer w-full p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
      />
      <label
        htmlFor={props.id}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-1/2 top-1/2 left-4 z-10 origin-[0] 
                   peer-focus:text-xs peer-focus:top-2 peer-focus:translate-y-0
                   peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0
                   pointer-events-none"
      >
        {label}
      </label>

      {/* Password visibility toggle */}
      {isPasswordField && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}

      {/* Custom action button (for non-password fields) */}
      {action && !isPasswordField && (
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
