import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const lottery = await viem.deployContract("Lottery");

  console.log("Lottery deployed to:", lottery.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});