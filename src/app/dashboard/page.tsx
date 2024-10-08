import React from "react";
import { Bell, Search, Users, Settings } from "lucide-react";

const Dashboard = () => {
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
            Paul Blessing
          </span>
          <div className="w-8 h-8 sm:w-11 sm:h-11 bg-[#028835] rounded-[7px] flex items-center justify-center text-white text-base sm:text-xl font-bold">
            PB
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-40 bg-white pt-8 hidden md:block">
          <nav className="space-y-6">
            <div className="h-[37px] bg-[#028835] rounded-[5px] flex items-center px-4 mx-4">
              <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.42857 0.5C1.04969 0.5 0.686328 0.65051 0.418419 0.918419C0.15051 1.18633 0 1.54969 0 1.92857L0 10.5C0 10.8789 0.15051 11.2422 0.418419 11.5102C0.686328 11.7781 1.04969 11.9286 1.42857 11.9286H7.14286C7.52174 11.9286 7.8851 11.7781 8.15301 11.5102C8.42092 11.2422 8.57143 10.8789 8.57143 10.5V1.92857C8.57143 1.54969 8.42092 1.18633 8.15301 0.918419C7.8851 0.65051 7.52174 0.5 7.14286 0.5H1.42857ZM11.4286 1.92857C11.4286 1.54969 11.5791 1.18633 11.847 0.918419C12.1149 0.65051 12.4783 0.5 12.8571 0.5L18.5714 0.5C18.9503 0.5 19.3137 0.65051 19.5816 0.918419C19.8495 1.18633 20 1.54969 20 1.92857V4.8C20 5.17888 19.8495 5.54224 19.5816 5.81015C19.3137 6.07806 18.9503 6.22857 18.5714 6.22857H12.8571C12.4783 6.22857 12.1149 6.07806 11.847 5.81015C11.5791 5.54224 11.4286 5.17888 11.4286 4.8V1.92857ZM11.4286 10.5C11.4286 10.1211 11.5791 9.75776 11.847 9.48985C12.1149 9.22194 12.4783 9.07143 12.8571 9.07143H18.5714C18.9503 9.07143 19.3137 9.22194 19.5816 9.48985C19.8495 9.75776 20 10.1211 20 10.5V19.0714C20 19.4503 19.8495 19.8137 19.5816 20.0816C19.3137 20.3495 18.9503 20.5 18.5714 20.5H12.8571C12.4783 20.5 12.1149 20.3495 11.847 20.0816C11.5791 19.8137 11.4286 19.4503 11.4286 19.0714V10.5ZM0 16.2C0 15.8211 0.15051 15.4578 0.418419 15.1898C0.686328 14.9219 1.04969 14.7714 1.42857 14.7714H7.14286C7.52174 14.7714 7.8851 14.9219 8.15301 15.1898C8.42092 15.4578 8.57143 15.8211 8.57143 16.2V19.0714C8.57143 19.4503 8.42092 19.8137 8.15301 20.0816C7.8851 20.3495 7.52174 20.5 7.14286 20.5H1.42857C1.04969 20.5 0.686328 20.3495 0.418419 20.0816C0.15051 19.8137 0 19.4503 0 19.0714V16.2Z"
                  fill="black"
                />
              </svg>
              <span className="text-white text-[17px] font-medium">
                Dashboard
              </span>
            </div>
            <div className="flex items-center px-4">
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.55435 20.2583C3.59266 20.2583 4.44219 19.3603 4.44219 18.2628V11.2785C4.44219 10.181 3.59266 9.283 2.55435 9.283C1.51603 9.283 0.666504 10.181 0.666504 11.2785V18.2628C0.666504 19.3603 1.51603 20.2583 2.55435 20.2583ZM10.455 14.7008L11.8425 15.2097C11.9464 15.2496 12.0502 15.2695 12.154 15.2695H18.601C19.6488 15.2695 20.4889 16.1575 20.4983 17.265L13.5227 20.0288C13.1452 20.1785 12.7298 20.1984 12.3428 20.0787L6.33004 18.2827V9.283H7.84032C8.06686 9.283 8.2934 9.32291 8.50106 9.4127L15.0424 11.9969C15.2876 12.0932 15.493 12.2774 15.6227 12.5175C15.7524 12.7575 15.7982 13.0381 15.7521 13.3102C15.706 13.5824 15.571 13.8287 15.3705 14.0063C15.1701 14.1839 14.917 14.2814 14.6554 14.2817H12.1729C12.0597 14.2817 11.9464 14.2618 11.8331 14.2119L10.7759 13.7829C10.5305 13.6831 10.2568 13.8228 10.1718 14.0822C10.0869 14.3316 10.2096 14.611 10.455 14.7008ZM18.7521 4.19444L14.0324 0.632459C13.3717 0.133581 12.4939 0.133581 11.8425 0.632459L7.12294 4.19444C6.62266 4.57359 6.33004 5.17224 6.33004 5.82079V7.28749H7.84976C8.08574 7.28749 8.33116 7.33737 8.54826 7.42717L15.9014 10.5302C16.9586 10.9892 17.6571 12.0667 17.6571 13.274H19.545V5.82079C19.545 5.17224 19.2523 4.57359 18.7521 4.19444ZM11.9936 8.28524C11.7293 8.28524 11.5216 8.06573 11.5216 7.78636C11.5216 7.50699 11.7293 7.28749 11.9936 7.28749C12.2579 7.28749 12.4655 7.50699 12.4655 7.78636C12.4655 8.06573 12.2579 8.28524 11.9936 8.28524ZM11.9936 6.28973C11.7293 6.28973 11.5216 6.07022 11.5216 5.79085C11.5216 5.51148 11.7293 5.29198 11.9936 5.29198C12.2579 5.29198 12.4655 5.51148 12.4655 5.79085C12.4655 6.07022 12.2579 6.28973 11.9936 6.28973ZM13.8814 8.28524C13.6171 8.28524 13.4095 8.06573 13.4095 7.78636C13.4095 7.50699 13.6171 7.28749 13.8814 7.28749C14.1457 7.28749 14.3534 7.50699 14.3534 7.78636C14.3534 8.06573 14.1457 8.28524 13.8814 8.28524ZM13.8814 6.28973C13.6171 6.28973 13.4095 6.07022 13.4095 5.79085C13.4095 5.51148 13.6171 5.29198 13.8814 5.29198C14.1457 5.29198 14.3534 5.51148 14.3534 5.79085C14.3534 6.07022 14.1457 6.28973 13.8814 6.28973Z"
                  fill="#827E7E"
                />
              </svg>

              <span className="text-black text-[15px] font-medium ml-2">
                Insurance
              </span>
            </div>
            <div className="flex items-center px-4">
              <Users className="mr-2" size={20} />
              <span className="text-black text-[15px] font-medium">Users</span>
            </div>
            <div className="flex items-center px-4">
              <Settings className="mr-2" size={20} />
              <span className="text-black text-[15px] font-medium">
                Settings
              </span>
            </div>
          </nav>
        </aside>

        {/* Main Content and Right Sidebar Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Greeting */}
          <h1 className="text-[23px] font-extrabold p-8 pb-4">
            Hello Blessing
          </h1>

          {/* Full-width Banner */}
          <div className="px-4 sm:px-8">
            <div className="w-full h-[133px] sm:h-[160px] md:h-[180px] lg:h-[200px] relative mb-6">
              <div className="w-full h-full absolute">
                <div className="w-full h-full absolute opacity-20 bg-white rounded-xl border border-black" />
                <img
                  className="w-full h-full absolute rounded-xl object-cover"
                  src="/abuja-bg.png"
                  alt="Abuja background"
                />
                <div className="w-full h-full absolute opacity-20 bg-black rounded-xl" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center p-4">
                <div className="text-white text-sm sm:text-base md:text-lg lg:text-[17px] font-bold mb-2">
                  Life is unpredictable, but your home insurance doesn&apos;t
                  have to be.
                </div>
                <div className="text-white text-xs sm:text-sm md:text-base lg:text-[13px] font-medium">
                  Get peace of mind with a policy that covers you against
                  life&apos;s unexpected twists
                </div>
              </div>
              <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4">
                <button className="px-2 sm:px-4 py-1 sm:py-2 bg-white rounded-[40px] text-[#028835] text-sm sm:text-base lg:text-lg font-semibold flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-[#028835] rounded-full mr-1 sm:mr-2"></div>
                  New Property
                </button>
              </div>
            </div>
          </div>

          {/* Main Content and Right Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 px-8 pb-8 overflow-y-auto">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    title: "Active Insurance",
                    count: 20,
                    color: "bg-[#fda5fc]",
                    icon: "👤",
                  },
                  {
                    title: "Expired Insurance",
                    count: 23,
                    color: "bg-[#7be0d4]",
                    icon: "📢",
                  },
                  {
                    title: "Pending Insurance",
                    count: 10,
                    color: "bg-[#fad572]",
                    icon: "👥",
                  },
                  {
                    title: "Collaborators",
                    count: 5,
                    color: "bg-[#8b9fef]",
                    icon: "🚫",
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
                    href="#"
                    className="text-[#f2a3f0] text-[17px] font-medium"
                  >
                    View All
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 font-bold w-5">
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
                          <td className="py-4">
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
                              className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium ${
                                item.status === "Active"
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
    </div>
  );
};

export default Dashboard;
