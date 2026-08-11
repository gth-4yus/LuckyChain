import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const [owner, player1, player2, player3] =
    await viem.getWalletClients();

  const lottery = await viem.deployContract("Lottery");

  console.log("Lottery:", lottery.address);

  await lottery.write.enrollment({
    account: player1.account,
    value: 1000000000000000000n
  });

  console.log("Player 1 enrolled");

  await lottery.write.enrollment({
    account: player2.account,
    value: 1000000000000000000n
  });

  console.log("Player 2 enrolled");

  await lottery.write.enrollment({
    account: player3.account,
    value: 1000000000000000000n
  });

  console.log("Player 3 enrolled");

  const publicClient = await viem.getPublicClient();

const balance = await publicClient.getBalance({
  address: lottery.address,
});
console.log("Lottery balance:", balance.toString());
  await lottery.write.pickwinner({
    account: owner.account,
  });

  const winner = await lottery.read.winner();

  console.log("Winner:", winner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

