import { Container, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import LaunchWallet from "@/app/components/LaunchWallet";
import hero from "@/assets/hero-cerberus-vault.jpeg";

export async function GetStarted() {

  return (
    <div className="flex flex-row">
      <Container
        minWidth={"50vw"}
        minHeight={"100vh"}
        bgColor={"black"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        padding={"12"}
        gap={"3"}
        margin={0}
      >
        <Heading color={"white"}>Cerberus Vault</Heading>
        <Text color={"white"}>
          Cerberus Vault is a multi signature crypto wallet that will secure
          your assets
        </Text>

        <Image
          alt="Cerberus Vault Logo"
          src={hero}
          width={300}
          height={300}
          priority={true}
          className="my-9"
        />
      </Container>

      <LaunchWallet  />
    </div>
  );
}

export default GetStarted;
