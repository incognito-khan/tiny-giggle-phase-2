"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function Chatbot() {
  const pathname = usePathname();

  // Do not render the chatbot on chat pages
  if (pathname?.includes("/chat")) {
    return null;
  }

  return (
    <>
      <Script id="chatbase-config" strategy="afterInteractive">
        {`window.CHATBASE_CONFIG = { chatbotId: "Z67_v1T1hcgnEU8tLZW1G" };`}
      </Script>
      <Script
        src="https://www.chatbase.co/embed.min.js"
        id="Z67_v1T1hcgnEU8tLZW1G"
        strategy="afterInteractive"
        defer
      />
    </>
  );
}
