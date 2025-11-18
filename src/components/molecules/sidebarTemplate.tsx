"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Home,
  Users,
  User,
  Calendar,
  QrCode,
  Building2,
  BookOpen,
  Shield,
} from "lucide-react";
import { Role } from "@/types/auth";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export function SidebarTemplate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(true); // Desktop default open, mobile controlled by component
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);

      // Fetch full user data
      fetch(`/api/users/${decoded.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setCurrentUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              avatar: result.data.avatar,
            });
          }
        })
        .catch((err) => console.error("Error fetching user data:", err));
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("auth_token");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const baseLinks = [
    {
      label: "Home",
      href: "/dashboard",
      icon: (
        <Home className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Anggota",
      href: "/dashboard/members",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Event",
      href: "/dashboard/events",
      icon: (
        <Calendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Absensi",
      href: "/dashboard/attendance",
      icon: (
        <QrCode className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const adminCoreLinks = [
    {
      label: "Admin Panel",
      href: "/dashboard/admin",
      icon: (
        <Shield className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Divisi POWERS",
      href: "/dashboard/powers-divisions",
      icon: (
        <Building2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const profileLinks = [
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handleLogout,
    },
  ];

  const canManageDivisions =
    currentUser?.role === "ADMIN" || currentUser?.role === "CORE";
  const links = [
    ...baseLinks,
    ...(canManageDivisions ? adminCoreLinks : []),
    ...profileLinks,
  ];
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100 dark:bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <UserProfile currentUser={currentUser} />
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 w-full md:w-auto overflow-auto">{children}</main>
    </div>
  );
}

const UserProfile = ({ currentUser }: { currentUser: CurrentUser | null }) => {
  const { open } = useSidebar();
  const router = useRouter();

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-300 animate-pulse" />
        <motion.div
          animate={{
            display: open ? "block" : "none",
            opacity: open ? 1 : 0,
          }}
          className="flex-1 space-y-2"
        >
          <div className="h-3 bg-gray-300 rounded animate-pulse w-24" />
          <div className="h-2 bg-gray-200 rounded animate-pulse w-16" />
        </motion.div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500";
      case "CORE":
        return "bg-blue-500";
      case "COMMITTEE":
        return "bg-purple-500";
      case "RANGERS":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className="flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-700 pt-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg p-2 -m-2 transition-colors"
      onClick={() => router.push("/dashboard/profile")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push("/dashboard/profile");
        }
      }}
    >
      {currentUser.avatar ? (
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative ${getRoleBadgeColor(currentUser.role)}`}
        >
          <span className="text-white text-base font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <motion.div
        animate={{
          display: open ? "block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="flex-1 min-w-0"
      >
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
          {currentUser.name}
        </p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {currentUser.role}
        </p>
      </motion.div>
    </div>
  );
};
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/logo_powers.png"
        alt="logo"
        width={40}
        height={40}
        className="rounded-full"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        POWERS Polnep
      </motion.span>
    </a>
  );
};
