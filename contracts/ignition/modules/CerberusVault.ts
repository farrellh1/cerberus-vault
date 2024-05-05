import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CerberusVault = buildModule("CerberusVault", (m) => {
  const cerberusVault = m.contract("CerberusVault");

  return { cerberusVault };
});

export default CerberusVault;
