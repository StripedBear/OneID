"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { ChevronDown, Settings, LogOut, User, Trash2 } from "lucide-react";

interface UserMenuProps {
  user: {
    username: string;
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { clearToken } = useAuth();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.display_name) {
      return user.display_name;
    }
    return user.username;
  };

  const handleLogout = () => {
    clearToken();
    router.push("/");
    setIsOpen(false);
  };

  const handleSettings = () => {
    router.push("/settings");
    setIsOpen(false);
  };

  const handleProfile = () => {
    router.push(`/${user.username}`);
    setIsOpen(false);
  };

  const handleDeleteAccount = () => {
    router.push("/settings/delete-account");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Avatar
          src={user.avatar_url || null}
          alt={getDisplayName()}
          size={32}
          clickable={false}
        />
        <span className="text-sm text-slate-300 hidden md:block">
          {getDisplayName()}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar_url || null}
                alt={getDisplayName()}
                size={40}
                clickable={false}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  @{user.username}
                </div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <User size={16} />
              View Profile
            </button>

            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>

            <div className="border-t border-slate-700 my-2"></div>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={16} />
              Delete Account
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
