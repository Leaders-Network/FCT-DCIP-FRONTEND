"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Component for setting new password after reset verification
export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("resetVerifyToken");
    if (!token) {
      router.push("/reset");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password using Zod schema
    try {
      passwordSchema.parse({ password, confirmPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const ApiKey = process.env.NEXT_PUBLIC_API_KEY || "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";
    const token = localStorage.getItem("resetVerifyToken");

    if (!token) {
      setError("Session expired. Please try the reset process again.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 3: Set new password
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fct-dcip-backend-1.onrender.com/api/v1";
      const response = await fetch(
        `${apiBaseUrl}/auth/reset-password`,
        {
          method: "PATCH",
          headers: {
            apiKey: ApiKey,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Use verification token
          },
          body: JSON.stringify({ newpassword: password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Clear all reset-related data after successful password change
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetToken");
      localStorage.removeItem("resetVerifyToken");
      
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Password change error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <div className="w-full md:w-2/3 flex flex-col p-4 md:p-8">
        <Header />
        <div className="w-full h-px bg-gray-300 mb-6"></div>
        <main className="flex flex-col justify-center flex-grow max-w-md mx-auto w-full">
          <ChangePasswordTitle />
          <ChangePasswordForm
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </main>
      </div>
      <div className="hidden md:block md:w-1/3 relative">
        <Image
          width={500}
          height={900}
          className="w-full h-full object-cover"
          src="/abuja-bg.png"
          alt="Abuja background"
        />
        <div className="absolute inset-0 bg-black opacity-20" />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
      <Logo />
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <p className="text-black text-sm md:text-base font-semibold">
          Remember your password?
        </p>
        <Link href="/login" className="text-black text-sm md:text-base font-bold">
          Login
        </Link>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center">
      <svg
        width="45"
        height="32"
        viewBox="0 0 45 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.25807 27.8996H8.21777L8.85317 30.1912L15.3693 31.1403L14.9389 27.1307C12.7278 27.4867 10.498 27.7432 8.25807 27.8996Z"
          fill="#028835"
        />
        <path
          d="M27.9856 24.2085C27.3132 24.3977 26.6407 24.581 25.9884 24.7612L25.585 29.7048L30.4535 31.1434L32.649 22.797C31.1024 23.2865 29.549 23.7641 27.9856 24.2085Z"
          fill="#028835"
        />
        <path
          d="M17.3057 26.7389L17.7428 30.2019L23.7444 29.7003L23.8587 25.3093C21.6956 25.8499 19.5113 26.3264 17.3057 26.7389Z"
          fill="#028835"
        />
        <path
          d="M36.3936 14.4504L41.0301 23.1693L44.9975 15.9131L36.3936 14.4504Z"
          fill="#028835"
        />
        <path
          d="M39.2842 15.3298C36.1741 16.8765 32.8959 18.3331 29.6211 19.6667C25.726 21.267 21.724 22.6512 17.6381 23.8114C15.5938 24.376 13.5261 24.8746 11.4415 25.253C9.3992 25.6636 7.3113 25.8651 5.21797 25.8537C4.73734 25.8404 4.25906 25.788 3.78901 25.6975C3.42092 25.6411 3.0743 25.5038 2.78034 25.2981C2.6989 25.2344 2.64235 25.1492 2.61896 25.0547C2.59188 24.9163 2.60343 24.7739 2.65258 24.6403C2.80399 24.2493 3.03165 23.8853 3.32503 23.5651C3.99598 22.8333 4.75604 22.1705 5.59118 21.5888C5.83326 21.4116 6.08543 21.2465 6.33759 21.0783L6.13922 20.3665C5.77946 20.5467 5.41634 20.7299 5.0633 20.9281C4.0842 21.451 3.17404 22.0706 2.34998 22.7752C1.88396 23.1671 1.50121 23.631 1.22026 24.1448C1.05743 24.4641 0.976997 24.812 0.984907 25.1629C1.00004 25.5598 1.15016 25.9433 1.41527 26.2621C1.87532 26.7724 2.49063 27.1531 3.18717 27.3584C3.76683 27.5451 4.36446 27.6838 4.97253 27.7729C7.248 28.0506 9.5517 28.0939 11.8382 27.902C14.0909 27.7518 16.3167 27.4815 18.5291 27.1362C22.9443 26.4296 27.2997 25.4522 31.5645 24.2108C33.6962 23.6101 35.811 22.9614 37.909 22.2646C39.3313 21.7961 40.7468 21.3095 42.1656 20.787C41.2309 18.9879 40.0508 16.7924 39.2842 15.3298Z"
          fill="#028835"
        />
        <path
          d="M23.9793 20.4699L24.4769 0.932739L15.3652 1.4403L16.8278 22.9807C19.2453 22.2359 21.6224 21.3798 23.9793 20.4699Z"
          fill="#333F4D"
        />
        <path
          d="M34.4531 15.9276L36.3965 8.54537L27.4462 7.02859L26.4375 19.4988C29.1273 18.3845 31.8406 17.1981 34.4531 15.9276Z"
          fill="#333F4D"
        />
        <path
          d="M12.4913 4.42399L6.02236 6.06386L5.82399 3.96146L1.09668 4.6072L2.69038 10.0584L5.7164 9.32252L5.87106 10.9414L3.67552 11.479L7.5085 25.3096L7.8447 25.2465C9.9293 24.8681 12.0004 24.3696 14.0447 23.805L14.5557 23.6578L12.4913 4.42399Z"
          fill="#333F4D"
        />
        <path
          d="M1.43945 13.8079L2.03793 15.8532L3.39628 15.5199L3.21135 13.5676L1.43945 13.8079Z"
          fill="#333F4D"
        />
      </svg>
      <h1 className="ml-4 text-black text-2xl font-bold">FCT- DCIP</h1>
    </div>
  );
}

function ChangePasswordTitle() {
  return (
    <div className="mb-8">
      <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">Change Password</h2>
      <p className="text-black text-sm md:text-base font-normal">
        Enter your new password.
      </p>
    </div>
  );
}

function ChangePasswordForm({ 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  error, 
  isLoading, 
  handleSubmit 
}: { 
  password: string; 
  setPassword: (password: string) => void; 
  confirmPassword: string; 
  setConfirmPassword: (confirmPassword: string) => void; 
  error: string | null; 
  isLoading: boolean; 
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <form className="w-full gap-2" onSubmit={handleSubmit}>
      <div className="mb-4 relative">
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="peer w-full h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label
          htmlFor="password"
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
        >
          New Password
        </label>
      </div>

      <div className="mb-8 relative">
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder=" "
          className="peer w-full h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label
          htmlFor="confirmPassword"
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
        >
          Confirm New Password
        </label>
      </div>

      {error && <p className="text-red-500 text-xs md:text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full md:w-[200px] h-[50px] bg-[#028835] rounded-full text-white text-sm md:text-base font-semibold flex items-center justify-center md:justify-evenly ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Changing..." : "Change Password"}
        {!isLoading && (
          <span className="w-[30px] h-[30px] ml-2 md:ml-5 flex items-center justify-center bg-white rounded-full">
            <MoveRight color="#000000" size={20} />
          </span>
        )}
      </button>
    </form>
  );
}
