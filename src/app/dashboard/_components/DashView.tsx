"use client";
import React, { useState } from "react";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import AddNewProperty from "@/components/dashboard/usersComponent/AddNewProperty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const Dashview = () => {
  const [showAddNewProperty, setShowAddNewProperty] = useState(false);
  //get user name from local storage
  const userName = localStorage.getItem("fullname");
  const nameParts = userName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1];
  const initials =
    userName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase() ??
    ""
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  const toggleAddNewProperty = () => {
    setShowAddNewProperty(!showAddNewProperty);
  };
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    window.location.href = "/";
  };
  return (
    <div className="w-full min-h-screen bg-[#f8f8f8] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full h-[75px] bg-white flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="text-xl sm:text-2xl font-black flex items-center">
          <svg
            width="35"
            height="25"
            viewBox="0 0 45 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 sm:w-[45px] sm:h-[32px]"
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
          <span className="hidden sm:inline">FCT- DCIP</span>
        </div>
        <div className="flex-grow max-w-[484px] h-[40px] sm:h-[60px] bg-white border border-[#817e7e]/50 rounded-[5px] flex items-center px-2 sm:px-4 mx-2 sm:mx-4">
          <Search className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search Insurance"
            className="w-full bg-transparent outline-none text-[10px] sm:text-[14px] md:text-[17px]"
          />
        </div>
        <div className="flex items-center">
          <Bell className="mr-2 sm:mr-4 text-[#028835] w-5 h-5 sm:w-6 sm:h-6" />
          <span className="mr-2 text-sm sm:text-lg font-bold hidden md:inline">
            {userName}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 sm:w-11 sm:h-11 bg-[#028835] rounded-[7px] flex items-center justify-center text-white text-base sm:text-xl font-bold">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={onLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-44 bg-white pt-8 hidden md:block">
          <nav className="p-4 flex flex-col gap-6">

            <Link href="/dashboard" className="flex items-center gap-3 bg-[#028835] text-white p-2 rounded hover:bg-[#026d2a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21M3 7V17M21 7V17M6 7H18C19.6569 7 21 5.65685 21 4V3H3V4C3 5.65685 4.34315 7 6 7ZM6 21V7M18 21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/property" className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-black">My Property</span>
            </Link>
            <Link href="/dashboard/insurance" className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-black">Insurance</span>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-black">Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content and Right Sidebar Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Greeting */}
          <h1 className="text-[23px] font-extrabold p-4 sm:p-8 pb-4">
            Hello {lastName}
          </h1>

          {/* Full-width Banner */}
          <div className="px-4 sm:px-8">
            <div className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] relative mb-6">
              <div className="w-full h-full absolute">
                <div className="w-full h-full absolute opacity-20 bg-white rounded-xl border border-black" />
                <Image
                  className="w-full h-full absolute rounded-xl object-cover"
                  src="/abuja-bg.png"
                  alt="Abuja background"
                  width={500}
                  height={500}
                />
                <div className="w-full h-full absolute opacity-20 bg-black rounded-xl" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center p-4">
                <div className="text-white text-sm sm:text-base md:text-lg lg:text-[17px] font-bold mb-2">
                  Life is unpredictable, but your home insurance doesn&apos;t
                  have to be.
                </div>
                <div className="text-white text-xs sm:text-sm md:text-base lg:text-[13px] font-semibold">
                  Get peace of mind with a policy that covers you against
                  life&apos;s unexpected twists
                </div>
              </div>
              <div className="absolute lg:mb-12 right-2 sm:right-4 bottom-2 sm:bottom-4">
                <button
                  onClick={toggleAddNewProperty}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-white rounded-[40px] text-[#028835] text-sm sm:text-base lg:text-lg font-semibold flex items-center"
                >
                  <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-[#028835] rounded-full mr-1 sm:mr-2 flex items-center justify-center">
                    <svg
                      width="12"
                      height="13"
                      viewBox="0 0 12 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 6.62816V5.70509H5.53846V0.166626H6.46154V5.70509H12V6.62816H6.46154V12.1666H5.53846V6.62816H0Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  New Property
                </button>
              </div>
            </div>
          </div>

          {/* Main Content and Right Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    title: "Active Insurance",
                    count: 20,
                    color: "bg-[#fda5fc]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 15 15"
                      >
                        <path
                          fill="white"
                          fill-rule="evenodd"
                          d="M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0M7.5 1.827a5.673 5.673 0 0 0-4.193 9.494A4.97 4.97 0 0 1 7.5 9.025a4.97 4.97 0 0 1 4.193 2.296A5.673 5.673 0 0 0 7.5 1.827m3.482 10.152A4.02 4.02 0 0 0 7.5 9.975a4.02 4.02 0 0 0-3.482 2.004A5.65 5.65 0 0 0 7.5 13.173c1.312 0 2.52-.446 3.482-1.194M5.15 6.505a2.35 2.35 0 1 1 4.7 0a2.35 2.35 0 0 1-4.7 0m2.35-1.4a1.4 1.4 0 1 0 0 2.8a1.4 1.4 0 0 0 0-2.8"
                          clip-rule="evenodd"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Expired Insurance",
                    count: 23,
                    color: "bg-[#7be0d4]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="white"
                          d="M12 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h3l5 4V4zm3 7.6L13 14H4v-4h9l2-1.6zm6.5-3.6c0 1.71-.96 3.26-2.5 4V8c1.53.75 2.5 2.3 2.5 4"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Pending Insurance",
                    count: 10,
                    color: "bg-[#fad572]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 24 24"
                      >
                        <g fill="none" fill-rule="evenodd">
                          <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                          <path
                            fill="white"
                            fill-rule="nonzero"
                            d="M6.72 16.64a1 1 0 0 1 .56 1.92c-.5.146-.86.3-1.091.44c.238.143.614.303 1.136.452C8.48 19.782 10.133 20 12 20s3.52-.218 4.675-.548c.523-.149.898-.309 1.136-.452c-.23-.14-.59-.294-1.09-.44a1 1 0 0 1 .559-1.92c.668.195 1.28.445 1.75.766c.435.299.97.82.97 1.594c0 .783-.548 1.308-.99 1.607c-.478.322-1.103.573-1.786.768C15.846 21.77 14 22 12 22s-3.846-.23-5.224-.625c-.683-.195-1.308-.446-1.786-.768c-.442-.3-.99-.824-.99-1.607c0-.774.535-1.295.97-1.594c.47-.321 1.082-.571 1.75-.766M12 2a7.5 7.5 0 0 1 7.5 7.5c0 2.568-1.4 4.656-2.85 6.14a16.4 16.4 0 0 1-1.853 1.615c-.594.446-1.952 1.282-1.952 1.282a1.71 1.71 0 0 1-1.69 0a21 21 0 0 1-1.952-1.282A16 16 0 0 1 7.35 15.64C5.9 14.156 4.5 12.068 4.5 9.5A7.5 7.5 0 0 1 12 2m0 2a5.5 5.5 0 0 0-5.5 5.5c0 1.816.996 3.428 2.28 4.74c.966.988 2.03 1.74 2.767 2.202l.453.274l.453-.274c.736-.462 1.801-1.214 2.767-2.201c1.284-1.313 2.28-2.924 2.28-4.741A5.5 5.5 0 0 0 12 4m0 2.5a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0 2a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
                          />
                        </g>
                      </svg>
                    ),
                  },
                  {
                    title: "Collaborators",
                    count: 5,
                    color: "bg-[#8b9fef]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.75"
                          d="m3.282 21.782l4.278-4.278M21.782 3.282L17.673 7.39m-3.363 3.363a2.64 2.64 0 0 0-1.063-1.063a2.625 2.625 0 1 0-2.494 4.62m3.557-3.557l-3.557 3.557m3.557-3.557l3.363-3.363m-6.92 6.92L7.56 17.504M17.673 7.39c-.38-.319-.791-.621-1.232-.894C15.2 5.726 13.717 5.19 12 5.19c-4.956 0-7.948 4.459-8.91 6.16c-.11.196-.165.293-.197.446a1.2 1.2 0 0 0 0 .408c.032.152.088.25.198.445c.51.903 1.593 2.582 3.237 3.96c.38.319.791.621 1.232.895m12.18-7.925c.528.694.919 1.328 1.17 1.773c.11.194.165.292.197.444c.023.112.023.296 0 .408c-.032.152-.087.25-.197.444c-.96 1.702-3.95 6.162-8.91 6.162q-.714-.002-1.374-.117"
                        />
                      </svg>
                    ),
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[9px] p-4 flex items-center"
                  >
                    <div
                      className={`w-[53px] h-[58px] ${stat.color} rounded-lg mr-4 flex items-center justify-center text-2xl`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-xl font-bold mb-2">{stat.count}</div>
                      <div className="text-[11px] text-[#817e7e]">
                        {stat.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Table */}
              <div className="w-full bg-white rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Recent</h3>
                  <a
                    href="/dashboard/property"
                    className="text-[#f2a3f0] text-[17px] font-medium"
                  >
                    View All
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 font-bold w-5 px-4">
                          <div className="w-5 h-5 opacity-30 bg-white rounded-[3px] border border-black">
                            <input
                              type="checkbox"
                              className="w-full h-full cursor-pointer opacity-0"
                            />
                          </div>
                        </th>
                        <th className="pb-2 font-bold">Name</th>
                        <th className="pb-2 font-bold">Expiring Date</th>
                        <th className="pb-2 font-bold">Building ID</th>
                        <th className="pb-2 font-bold">Status</th>
                        <th className="pb-2 font-bold w-5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          date: "April 02, 2024",
                          id: "A012D30",
                          status: "Active",
                        },
                        {
                          date: "May 05, 2024",
                          id: "E712D30",
                          status: "Active",
                        },
                        {
                          date: "July 20, 2024",
                          id: "C712V43",
                          status: "Inactive",
                        },
                        {
                          date: "Aug 23, 2024",
                          id: "Y657JB9",
                          status: "Pending",
                        },
                        {
                          date: "Nov 24, 2024",
                          id: "B657B90",
                          status: "Cancelled",
                        },
                      ].map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-4 px-4">
                            <div className="w-5 h-5 opacity-30 bg-white rounded-[3px] border border-black">
                              <input
                                type="checkbox"
                                className="w-full h-full cursor-pointer opacity-0"
                              />
                            </div>
                          </td>
                          <td className="py-4 text-[#1e1e1e] text-[17px] font-medium">
                            Insurance Renewal
                          </td>
                          <td className="py-4 text-[#2a2828] text-base font-medium">
                            {item.date}
                          </td>
                          <td className="py-4 text-[#2a2828] text-base font-medium">
                            {item.id}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium ${item.status === "Active"
                                ? "bg-[#028835]"
                                : item.status === "Inactive"
                                  ? "bg-[#2a2a29]"
                                  : item.status === "Pending"
                                    ? "bg-[#ffc52b]"
                                    : "bg-[#bd2721]"
                                }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-[300px] space-y-6 p-4 hidden lg:block">
              {/* Collaboration */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex border-b pb-2 justify-between items-center mb-4">
                  <h3 className="text-[19px] font-bold">Collaboration</h3>
                  <a href="#" className="text-[#2b172b] text-base">
                    View All
                  </a>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full mr-2">
                      <svg
                        width="29"
                        height="29"
                        viewBox="0 0 29 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.5 2C7.59625 2 2 7.59625 2 14.5C2 21.4037 7.59625 27 14.5 27C21.4037 27 27 21.4037 27 14.5C27 7.59625 21.4037 2 14.5 2Z"
                          stroke="#827E7E"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M4.83789 22.4327C4.83789 22.4327 7.62414 18.8752 14.4991 18.8752C21.3741 18.8752 24.1616 22.4327 24.1616 22.4327M14.4991 14.5002C15.4937 14.5002 16.4475 14.1051 17.1508 13.4018C17.8541 12.6986 18.2491 11.7447 18.2491 10.7502C18.2491 9.75562 17.8541 8.80179 17.1508 8.09853C16.4475 7.39527 15.4937 7.00018 14.4991 7.00018C13.5046 7.00018 12.5508 7.39527 11.8475 8.09853C11.1442 8.80179 10.7491 9.75562 10.7491 10.7502C10.7491 11.7447 11.1442 12.6986 11.8475 13.4018C12.5508 14.1051 13.5046 14.5002 14.4991 14.5002Z"
                          stroke="#827E7E"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[15px] font-bold">Paul Blessing</div>
                      <div className="text-[13px]">pblessing731@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full mr-2">
                      <svg
                        width="29"
                        height="29"
                        viewBox="0 0 29 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.5 2C7.59625 2 2 7.59625 2 14.5C2 21.4037 7.59625 27 14.5 27C21.4037 27 27 21.4037 27 14.5C27 7.59625 21.4037 2 14.5 2Z"
                          stroke="#827E7E"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M4.83789 22.4327C4.83789 22.4327 7.62414 18.8752 14.4991 18.8752C21.3741 18.8752 24.1616 22.4327 24.1616 22.4327M14.4991 14.5002C15.4937 14.5002 16.4475 14.1051 17.1508 13.4018C17.8541 12.6986 18.2491 11.7447 18.2491 10.7502C18.2491 9.75562 17.8541 8.80179 17.1508 8.09853C16.4475 7.39527 15.4937 7.00018 14.4991 7.00018C13.5046 7.00018 12.5508 7.39527 11.8475 8.09853C11.1442 8.80179 10.7491 9.75562 10.7491 10.7502C10.7491 11.7447 11.1442 12.6986 11.8475 13.4018C12.5508 14.1051 13.5046 14.5002 14.4991 14.5002Z"
                          stroke="#827E7E"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[15px] font-bold">
                        Emmanuel Semako
                      </div>
                      <div className="text-[13px]">emmasemako@gmail.com</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-xl p-4 h-full flex flex-col">
                <div className="flex border-b pb-2 justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Notifications</h3>
                  <a href="#" className="text-[#2b172b] text-base">
                    View All
                  </a>
                </div>
                <div className="space-y-4 flex-grow overflow-y-auto">
                  <div className="border-b-2 border-dashed pb-2">
                    <div className="text-[17px] font-bold">
                      Insurance Renewal
                    </div>
                    <div className="text-xs">
                      A building with the ID: A012D30 just made a payment on
                      23rd of sept 2024.
                    </div>
                  </div>
                  <div className="border-b-2 border-dashed pb-2">
                    <div className="text-[17px] font-bold">
                      Expired Insurance
                    </div>
                    <div className="text-xs">
                      A building with the ID: A015D30 just expired 27th of sept
                      2024
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <AddNewProperty
        isOpen={showAddNewProperty}
        onClose={() => setShowAddNewProperty(false)}
      />
    </div>
  );
};

export default Dashview;
