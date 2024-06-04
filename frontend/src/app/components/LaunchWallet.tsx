"use client"
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function LaunchWallet() {
  const router = useRouter()

  return (
    <Container
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={"2"}
    >
      <div className="text-black text-2xl font-bold">Get Started</div>
      <h3 className="text-black mb-5">
        Connect your wallet to create a new wallet
      </h3>

      <ConnectButton
        client={client}
        appMetadata={{
          name: "Cerberus Vault",
        }}
        chain={{
          id: 11155111,
          name: "Sepolia",
          rpc: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
          testnet: true,
        }}
        onConnect={() => router.push("/")}
      />
    </Container>
  );
};
