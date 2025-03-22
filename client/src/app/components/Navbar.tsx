"use client";

import Link from "next/link";
import { Snowflake, Menu } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/app/components/ui/button";
import { usePathname } from "next/navigation";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 grid grid-cols-3 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Snowflake className="h-6 w-6 text-gray-800" />
            <span className="text-xl font-semibold text-gray-800">
              Snowball
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex justify-center space-x-6">
          <Link
            href="/platform/explore"
            className={`${
              isLinkActive("/platform/explore")
                ? "text-blue-600 font-medium"
                : "text-gray-600"
            } hover:text-gray-800`}
          >
            Explore
          </Link>
          <Link
            href="/platform/create"
            className={`${
              isLinkActive("/platform/create")
                ? "text-blue-600 font-medium"
                : "text-gray-600"
            } hover:text-gray-800`}
          >
            Start a Project
          </Link>
          <Link
            href="/about"
            className={`${
              isLinkActive("/about")
                ? "text-blue-600 font-medium"
                : "text-gray-600"
            } hover:text-gray-800`}
          >
            About
          </Link>
        </nav>
        <div className="flex items-center justify-end space-x-4">
          <ConnectButton />
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
