"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, LogOut, Menu, ChevronDown, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AdminLayoutProps {
  children: React.ReactNode
  user?: {
    firstname?: string
    lastname?: string
    email?: string
    role?: string
  }
}

import { useAuth } from "@/context/useAuth";

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user }) => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const pathname = usePathname()

  // Get user name and role
  const userName = user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "Paul Blessing"
  const userRole = user?.role || "Super Admin"

  // Get user initials
  const initials = (userName || '')
    .split(" ")
    .map((word) => word?.[0] || '')
    .join("")
    .toUpperCase()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const onLogout = () => {
    logout();
  };

  // Check if the current path is in the properties section
  useEffect(() => {
    if (pathname?.startsWith("/properties")) {
      setPropertiesOpen(true)
    }
  }, [pathname])

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Policy Management",
      path: "/admin/dashboard/policies",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Surveyors",
      path: "/admin/dashboard/surveyors",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          ></path>
        </svg>
      ),
    },
    {
      name: "Assignments",
      path: "/admin/dashboard/assignments",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Properties",
      path: "/admin/dashboard/property",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          ></path>
        </svg>
      )
    },
    {
      name: "Administrators",
      path: "/admin/dashboard/administrators",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Users",
      path: "/admin/dashboard/users",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Settings",
      path: "/admin/dashboard/settings",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white h-full transition-all duration-300 ease-in-out fixed md:relative z-30 border-gray-200 ${sidebarOpen ? "w-64" : "w-20"
          }`}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center justify-center border-gray-200 cursor-pointer"
          onClick={toggleSidebar}
        >
          <div className="flex items-center">
            <svg
              width="35"
              height="25"
              viewBox="0 0 45 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
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
              <path d="M36.3936 14.4504L41.0301 23.1693L44.9975 15.9131L36.3936 14.4504Z" fill="#028835" />
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
            {sidebarOpen && <span className="font-bold text-lg">FCT-DCIP</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {(navItems || []).map((item) => (
              <li key={item?.name}>
                {'subItems' in item && item.subItems ? (
                  <div>
                    <div className="flex items-center">
                      <Link
                        href={item.path}
                        className={`flex items-center flex-grow px-4 py-3 rounded-lg transition-colors ${pathname === item.path ? "bg-[#028835] text-white" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {item.icon}
                        {sidebarOpen && <span className="ml-3 flex-1 whitespace-nowrap">{item.name}</span>}
                      </Link>
                      {/* {sidebarOpen && (
                        <button
                          onClick={() => setPropertiesOpen(!propertiesOpen)}
                          className="p-2 ml-1 text-gray-500 hover:text-gray-700"
                          aria-label="Toggle dropdown"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${propertiesOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      )} */}
                    </div>
                    {sidebarOpen && propertiesOpen && (
                      <ul className="pl-10 mt-1 space-y-1">
                        {('subItems' in item && Array.isArray(item.subItems) ? item.subItems : []).map((subItem: { name: string; href: string; icon?: React.ComponentType }) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.path}
                              className={`block px-3 py-2 rounded-md ${pathname === subItem.path ? "bg-gray-100 font-medium" : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname === item.path ? "bg-[#028835] text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="">
            <button className="md:hidden mr-4 text-gray-500" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="flex-1 w-[500px] h-[40px] bg-white border border-[#817e7e]/50 rounded-[5px] flex items-center px-2 sm:px-4">
              <Search className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search Insurance available"
                className="w-full bg-transparent outline-none text-[10px] sm:text-[14px] md:text-[17px]"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Bell className="mr-2 sm:mr-4 text-[#028835] w-5 h-5 sm:w-6 sm:h-6" />
            <div className="flex items-center">
              <div className="mr-2 text-right hidden md:block">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-gray-500">{userRole}</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-[#028835] rounded-[7px] flex items-center justify-center text-white text-base sm:text-xl font-bold">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#f8f8f8] p-6">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
