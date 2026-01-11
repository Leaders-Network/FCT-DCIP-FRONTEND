"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, User, Home, FileText, Shield, Settings, Plus, X, MessageSquare, Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationProvider } from "@/context/NotificationContext"
import NotificationBell from "@/components/shared/NotificationBell"
import GlobalSearch from "@/components/shared/GlobalSearch"
import { useAuth } from "@/context/useAuth"
import { getCookie } from "@/utils/cookies"
import { removeAuthToken, clearAuthTokens } from "@/utils/auth"

interface UserLayoutProps {
  children: React.ReactNode
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Handle responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On desktop, sidebar is open by default
      if (!mobile) {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Get user from AuthContext or cookies
  const { user, logout } = useAuth();
  const getUserName = () => {
    if (user) {
      return (user as any).fullname || (user as any).firstname || "User";
    }
    const storedUser = typeof window !== 'undefined' ? getCookie('user') : null;
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.fullname || userData.firstname || "User";
      } catch (e) {
        return "User";
      }
    }
    return "User";
  };
  const displayName = getUserName();
  const nameParts = displayName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1] || displayName;

  // Get user initials
  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onLogout = () => {
    clearAuthTokens();
    logout();
  };

  // Navigation items for user dashboard
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-6 h-6" />,
    },
    {
      name: "Insurance",
      path: "/dashboard/insurance",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      name: "My Policies",
      path: "/dashboard/policies",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Contacts",
      path: "/dashboard/contacts",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "My Inquiries",
      path: "/dashboard/inquiries",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      name: "Notifications",
      path: "/dashboard/notifications",
      icon: <Bell className="w-6 h-6" />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings className="w-6 h-6" />,
    },
  ]

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`bg-white h-full transition-all duration-300 ease-in-out border-r border-gray-200 z-30
          ${isMobile
              ? `fixed ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64`
              : `relative ${sidebarOpen ? "w-64" : "w-20"}`
            }`}
        >
          {/* Logo & Close Button */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center cursor-pointer" onClick={() => !isMobile && toggleSidebar()}>
              <svg
                width="35"
                height="25"
                viewBox="0 0 45 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 flex-shrink-0"
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
              {(sidebarOpen || isMobile) && <span className="font-bold text-lg truncate">Builders-Liability</span>}
            </div>
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname === item.path ? "bg-[#028835] text-white" : "text-gray-700 hover:bg-gray-100"
                      } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
                  >
                    {item.icon}
                    {(sidebarOpen || isMobile) && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Request Survey Button - hidden for now, will be handled by dashboard content */}
          {/* This functionality is available in the individual dashboard components */}

          {/* Logout Button */}
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className={`flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
            >
              <LogOut className="w-5 h-5" />
              {(sidebarOpen || isMobile) && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile && sidebarOpen ? "md:ml-0" : !isMobile ? "md:ml-0" : ""}`}>
          {/* Header */}
          <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-10">
            <div className="flex items-center flex-1 gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
                onClick={toggleSidebar}
              >
                <Menu size={22} />
              </button>
              {/* Desktop collapse button */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hidden md:block"
                onClick={toggleSidebar}
              >
                <Menu size={22} />
              </button>
              <GlobalSearch
                userType="user"
                className="flex-1 max-w-[300px] sm:max-w-[400px] md:max-w-[500px]"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium hidden lg:inline truncate max-w-[150px]">
                  {displayName}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 sm:w-9 sm:h-9 bg-[#028835] rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      {initials}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
          <main className="flex-1 overflow-auto bg-[#f8f8f8] p-3 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  )
}

export default UserLayout