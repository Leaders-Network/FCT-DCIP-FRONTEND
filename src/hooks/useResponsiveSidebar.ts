"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Options = {
  breakpoint?: number;
  defaultOpenDesktop?: boolean;
  closeOnRouteChangeMobile?: boolean;
};

export const useResponsiveSidebar = (options: Options = {}) => {
  const {
    breakpoint = 768,
    defaultOpenDesktop = true,
    closeOnRouteChangeMobile = true,
  } = options;

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < breakpoint;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(defaultOpenDesktop);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint, defaultOpenDesktop]);

  useEffect(() => {
    if (closeOnRouteChangeMobile && isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, closeOnRouteChangeMobile, isMobile]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  };
};

