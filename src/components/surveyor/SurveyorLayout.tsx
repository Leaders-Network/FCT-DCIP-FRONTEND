import React from "react";
import Image from "next/image";

interface SurveyorLayoutProps {
  children: React.ReactNode;
//   title: string;
//   subtitle: string;
}

const AuthLayout: React.FC<SurveyorLayoutProps> = ({
  children,
//   title,
//   subtitle,
}) => {
  return (
    <div
      className="items-center justify-center bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url(/abuja-bg.png)" }}
    >
      <div className="w-full px-8 flex items-center justify-start">
        <Image src="/logo.png" alt="Logo" width={180} height={180} />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <main className="grid xl:grid-cols-2 grid-cols-1 items-center justify-center xl:space-x-10 p-5 md:p-0">
          <div className="text-center xl:text-left">
            <h2 className="text-white text-2xl md:text-5xl max-w-xl font-bold mb-4">
              Surveyor Operations Portal
            </h2>
            <h3 className="text-white text-base md:text-xl font-medium mb-8">
             Supporting the Defense and Growth of Critical Infrastructure
            </h3>
          </div>
          <div className="w-full max-w-3xl xl:max-w-lg 2xl:max-w-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
