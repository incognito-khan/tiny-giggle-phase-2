"use client";

import { Globe, Users, Lock } from "lucide-react";

function PrivacyBadge({ privacy }) {
  const config = {
    PUBLIC: { icon: Globe, cls: "text-green-400" },
    FRIENDS: { icon: Users, cls: "text-blue-400" },
    PRIVATE: { icon: Lock, cls: "text-red-400" },
  };
  const { icon: Icon, cls } = config[privacy] || config.PUBLIC;
  const label =
    privacy === "FRIENDS"
      ? "Friends"
      : privacy?.charAt(0).toUpperCase() + privacy?.slice(1);
  return (
    <span
      className={`flex items-center gap-1 text-[11px] font-semibold tracking-wide ${cls}`}
    >
      <Icon size={11} /> {label}
    </span>
  );
}

export default PrivacyBadge;
