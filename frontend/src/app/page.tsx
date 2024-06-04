"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { ConnectionStatus } from "thirdweb/wallets";

export default function Home() {
  const status: ConnectionStatus = useActiveWalletConnectionStatus();
  const router = useRouter();

  useEffect(() => {
    if (status === "disconnected") {
      router.replace("/get-started");
    }
  }, [status, router]);

  return (
    <main className="flex flex-row">
      <div></div>
    </main>
  );
}
