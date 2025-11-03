"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/context/useAuth";
import {toast} from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function Login() {

   const [currentImage, setCurrentImage] = useState(0)
   const backgroundImages = [
    "/bg-construct-2.webp",
    "/bg-hero-1.jpg",
    "/bg-hero-4.jpg",
    "/bg-hero-5.jpg",
    "/bg-hero-6.jpg",
    "/bg-hero-7.jpg",
    "/bg-hero-8.jpg",
    "/bg-hero-9.jpg",
    "/bg-hero-11.jpg",
]

  useEffect(() => {
    const interval = setInterval(()=> {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    },5000); 
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <div className="w-full md:w-2/3 flex flex-col p-4 md:p-8">
        <Header />
        <div className="w-full h-px bg-gray-300 mb-6"></div>
        <main className="flex flex-col justify-center flex-grow max-w-md mx-auto w-full">
          <LoginTitle />
          <LoginForm />
        </main>
      </div>
      <div className="hidden md:block md:w-1/3 relative">
              {backgroundImages.map((src, index) => (
                <Image 
                key={index}
                src={src}
                alt={`Background ${index + 1}`}
                fill
                priority={index === 0}
                className={`object-cover transition-opacity duraion-[2000ms] ${index === currentImage ? "opacity-100" : "opacity-0"}`}
                />
              ))}
        <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-10 text-white">
            <div className="max-w-md">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 typing-text">
                Welcome Back!
              </h2>
              <p className="text-sm md:text-[1.1rem] leading-relaxed fade-in-text mt-2">
                We’re glad to have you again, log in to continue protecting what matters most.
              </p>
          </div>
        </div>
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
          Don&apos;t have an account?
        </p>
        <Link href="/signup" className="text-black text-sm md:text-base font-bold">
          Register
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
        {/* SVG path data */}
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

function LoginTitle() {
  return (
    <div className="mb-8">
      <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">Log-In</h2>
      <p className="text-black text-sm md:text-base font-semibold">
        Welcome back! Please enter your details.
      </p>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = useCallback(() => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      toast.success("Validation successful! ✅");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as { [key: string]: string });
        setErrors(formattedErrors);
         //Show the first validation error as a red toast
        toast.error(formattedErrors[Object.keys(formattedErrors)[0]]);
      } else {
        toast.error("Something went wrong. Please try again.")
      }
      return false;
    }
  }, [email, password]);

  return (
    <form className="w-full">
      <div className="mb-4 relative">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=" "
          className="peer w-full h-12 md:h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label
          htmlFor="email"
          className="absolute text-xs md:text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 md:top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
        >
          Email
        </label>
        {errors.email && (
        <p 
        className="text-red-500 text-xs md:text-sm mt-1 transition-all duration-300 ease-in-out animate-fadeIn">
          {errors.email}
        </p>
      )}
      </div>

      <div className="mb-4 relative">
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="peer w-full h-12 md:h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label
          htmlFor="password"
          className="absolute text-xs md:text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 md:top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
        >
          Password
        </label>
        {errors.password && 
        (<p 
        className="text-red-500 text-xs md:text-sm mt-1 transition-all duration-300 ease-in-out animate-fadeIn">
          {errors.password}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Link
          href="/reset"
          className="text-black text-sm md:text-base underline font-medium"
        >
          Reset your password?
        </Link>
      </div>

      <LoginButton email={email} password={password} validateForm={validateForm} />
    </form>
  );
}

function LoginButton({ email, password, validateForm }: { email: string; password: string; validateForm: () => boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // First, try to log in as a regular user
      await login(email, password, 'user');
    } catch (userError) {
      try {
        // If user login fails, try to log in as an employee
        await login(email, password, 'employee');
      } catch (employeeError) {
        console.error("Login error:", employeeError);
        const message = employeeError instanceof Error ? employeeError.message : "An unexpected error occurred. please try again.";

        setError(message);
        toast.error(message, {
        description: "Please check your credentials and try again.",
        duration: 3000, // optional: controls how long the toast stays
      });
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p 
              className="text-red-500 text-xs md:text-sm mt-1 transition-all duration-300 ease-in-out animate-fadeIn">
                {error}
        </p>
          </div>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !email || !password}
        className={`w-full md:w-[200px] h-[50px] bg-[#028835] rounded-full text-white text-sm md:text-base font-semibold flex items-center justify-center md:justify-evenly transition-all duration-200 ${isLoading || !email || !password
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : (
          <>
            Continue
            <span className="w-[30px] h-[30px] ml-2 md:ml-5 flex items-center justify-center bg-white rounded-full transition-transform duration-200">
              <MoveRight color="#000000" size={20} />
            </span>
          </>
        )}
      </button>
    </>
  );
}
