"use client";
import { Box, Flex, Text } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter()

  return pathname === "/get-started" ? null : (
    <Box bg="black" px={4}>
      <Flex h={"fit-content"} alignItems="center" justifyContent="space-between" padding={2}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white">
            Cerberus Vault
          </Text>
        </Box>

        <Flex alignItems="center">
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
            onDisconnect={() => router.replace("/get-started")}
            theme={"light"}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
