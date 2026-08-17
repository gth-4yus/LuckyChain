# 🎰 LuckyChain --- Decentralized Lottery Smart Contract

LuckyChain is a beginner-friendly Solidity project that implements a
simple decentralized lottery on the Ethereum blockchain.

The project was created while learning Solidity, smart contracts,
Ethereum transactions, wallets, testnets, and contract deployment.

> **Important:** This project is for learning and testing on the Sepolia
> testnet. It is **not** intended for a real-money lottery or production
> use.

------------------------------------------------------------------------

## 📌 Project Overview

The basic idea is:

1.  A person deploys the `Lottery` smart contract.
2.  The deployer becomes the `admin`.
3.  Players enter the lottery by paying exactly **1 ETH**.
4.  Each player is stored in the `participants` array.
5.  At least **3 participants** are required before a winner can be
    selected.
6.  The admin calls `pickwinner()`.
7.  A pseudo-random index is generated.
8.  The selected participant becomes the `winner`.
9.  The contract balance is transferred to the winner.
10. The participant list is reset for a new round.

### Simple flow

``` text
Admin deploys contract
        ↓
Admin address is stored
        ↓
Player sends exactly 1 ETH
        ↓
Player is added to participants[]
        ↓
At least 3 participants
        ↓
Admin calls pickwinner()
        ↓
Pseudo-random number generated
        ↓
Random index selected
        ↓
Winner selected
        ↓
Contract balance sent to winner
        ↓
Participants array reset
```

------------------------------------------------------------------------

## 🛠️ Technologies Used

-   **Solidity** --- Smart contract programming language
-   **Ethereum / EVM** --- Blockchain environment
-   **Remix IDE** --- Contract compilation and deployment
-   **MetaMask** --- Wallet and transaction signing
-   **Sepolia Testnet** --- Ethereum test network
-   **Git & GitHub** --- Version control and project storage
-   **VS Code** --- Local development

------------------------------------------------------------------------

# 📄 Smart Contract

The main contract is:

``` solidity
// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public admin;
    address payable[] public participants;
    address payable public winner;

    constructor() {
        admin = msg.sender;
    }

    function enrollment() public payable {
        require(
            msg.value == 1 ether,
            "Please pay 1 ether only"
        );

        participants.push(payable(msg.sender));
    }

    function getbalance() public view returns (uint) {
        require(
            admin == msg.sender,
            "You are not the admin"
        );

        return address(this).balance;
    }

    function randomized() internal view returns (uint) {
        return uint(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    participants.length
                )
            )
        );
    }

    function pickwinner() public {
        require(
            admin == msg.sender,
            "You are not the manager"
        );

        require(
            participants.length >= 3,
            "Player are less than 3"
        );

        uint r = randomized();
        uint index = r % participants.length;

        winner = participants[index];

        (bool success, ) = winner.call{
            value: getbalance()
        }("");

        require(success, "Transfer failed");

        participants = new address payable[](0);
    }
}
```

> If your local contract still uses `block.difficulty` or
> `winner.transfer(...)`, see the **Notes About Solidity Version
> Changes** section below.

------------------------------------------------------------------------

# 🔍 Contract Explanation

## 1. License

``` solidity
// SPDX-License-Identifier: GPL-3.0-or-later
```

This identifies the open-source license associated with the contract.

------------------------------------------------------------------------

## 2. Solidity Version

``` solidity
pragma solidity >=0.7.0 <0.9.0;
```

This tells the compiler that the contract is intended to work with
Solidity versions from `0.7.0` up to, but not including, `0.9.0`.

------------------------------------------------------------------------

# 🏗️ Contract Declaration

``` solidity
contract Lottery {
```

This creates the smart contract named `Lottery`.

A smart contract is code stored and executed on the blockchain.

------------------------------------------------------------------------

# 👤 Admin Variable

``` solidity
address public admin;
```

`admin` stores the Ethereum address of the person who deploys the
contract.

Because it is `public`, Solidity automatically provides a getter
function that allows anyone to read the stored address.

------------------------------------------------------------------------

# 👥 Participants Array

``` solidity
address payable[] public participants;
```

This is a dynamic array that stores the wallet addresses of players who
enter the lottery.

The addresses are `payable` because the contract needs to be able to
send ETH to the selected winner.

For example:

``` text
participants[0] → Player A
participants[1] → Player B
participants[2] → Player C
```

------------------------------------------------------------------------

# 🏆 Winner Variable

``` solidity
address payable public winner;
```

This stores the address of the participant selected as the winner.

It is also `payable` because ETH will be sent to this address.

------------------------------------------------------------------------

# 🚀 Constructor

``` solidity
constructor() {
    admin = msg.sender;
}
```

The constructor runs **only once**, when the contract is deployed.

`msg.sender` means:

> The address that is currently calling the contract.

During deployment, that address is the deployer's wallet.

Therefore:

``` text
Deployer's MetaMask address
          ↓
       msg.sender
          ↓
       admin
```

The deployer becomes the administrator.

------------------------------------------------------------------------

# 🎟️ `enrollment()`

``` solidity
function enrollment() public payable {
```

This function allows a user to enter the lottery.

### Why is it `payable`?

A function must be `payable` if it needs to receive ETH.

Without `payable`, the function cannot accept ETH.

------------------------------------------------------------------------

## Step 1 --- Check the payment

``` solidity
require(
    msg.value == 1 ether,
    "Please pay 1 ether only"
);
```

`msg.value` is the amount of ETH sent with the transaction.

The contract requires exactly:

``` text
1 ETH
```

If the user sends:

-   `0.5 ETH` → rejected
-   `2 ETH` → rejected
-   `1 ETH` → accepted

If the requirement fails, the transaction is reverted.

------------------------------------------------------------------------

## Step 2 --- Add the player

``` solidity
participants.push(payable(msg.sender));
```

The sender's wallet address is added to the participants array.

Example:

``` text
Player A enters
      ↓
msg.sender = Player A's address
      ↓
participants.push(...)
      ↓
participants[0] = Player A
```

If three players enter:

``` text
participants[0] = Player A
participants[1] = Player B
participants[2] = Player C
```

------------------------------------------------------------------------

# 💰 `getbalance()`

``` solidity
function getbalance() public view returns (uint)
```

This function returns the ETH balance currently held by the contract.

### `view`

`view` means the function only reads blockchain state and does not
modify it.

Therefore, calling this function does not require a transaction or gas
payment when called normally from a wallet interface.

------------------------------------------------------------------------

## Admin check

``` solidity
require(
    admin == msg.sender,
    "You are not the admin"
);
```

Only the admin can call this function.

If another address calls it, the transaction/call is rejected.

------------------------------------------------------------------------

## Getting the balance

``` solidity
return address(this).balance;
```

`address(this)` represents the current smart contract.

`.balance` gives the amount of ETH held by the contract.

------------------------------------------------------------------------

# 🎲 `randomized()`

``` solidity
function randomized() internal view returns (uint)
```

This function generates a pseudo-random number that is later used to
select a participant.

It is `internal`, meaning it is intended to be called from inside the
contract rather than directly by an external account.

The calculation uses:

``` solidity
block.prevrandao
block.timestamp
participants.length
```

These values are packed together:

``` solidity
abi.encodePacked(...)
```

Then they are hashed:

``` solidity
keccak256(...)
```

Finally, the resulting bytes32 hash is converted to a `uint`.

Conceptually:

``` text
Blockchain values
      ↓
abi.encodePacked(...)
      ↓
keccak256(...)
      ↓
large hash value
      ↓
uint
      ↓
randomized number
```

### ⚠️ Security warning

This is **not secure randomness for a real-money lottery**.

Blockchain-derived values such as timestamps and other block information
should not be treated as cryptographically secure randomness for a
production lottery.

This implementation is being used here as a **learning example**.

For a production application, a secure verifiable randomness system such
as Chainlink VRF would be a much more appropriate design.

------------------------------------------------------------------------

# 🏆 `pickwinner()`

This function selects the winner and sends the contract balance to them.

``` solidity
function pickwinner() public {
```

------------------------------------------------------------------------

## Step 1 --- Check the admin

``` solidity
require(
    admin == msg.sender,
    "You are not the manager"
);
```

Only the admin can select the winner.

If another account tries to call the function, it fails.

------------------------------------------------------------------------

## Step 2 --- Require at least 3 players

``` solidity
require(
    participants.length >= 3,
    "Player are less than 3"
);
```

The lottery cannot select a winner until at least three participants
have entered.

For example:

``` text
0 players → rejected
1 player  → rejected
2 players → rejected
3 players → accepted
4 players → accepted
```

------------------------------------------------------------------------

## Step 3 --- Generate a number

``` solidity
uint r = randomized();
```

The `randomized()` function is called and its result is stored in `r`.

------------------------------------------------------------------------

## Step 4 --- Convert the number into a valid array index

``` solidity
uint index = r % participants.length;
```

The modulo operator `%` gives the remainder.

Suppose:

``` text
r = 928374928
participants.length = 3
```

Then:

``` text
928374928 % 3
```

produces a value between:

``` text
0 and 2
```

That is important because the valid array indexes are:

``` text
participants[0]
participants[1]
participants[2]
```

So the calculation turns a very large number into a valid participant
index.

------------------------------------------------------------------------

## Step 5 --- Select the winner

``` solidity
winner = participants[index];
```

The participant at the calculated index becomes the winner.

For example:

``` text
participants[0] = Alice
participants[1] = Bob
participants[2] = Charlie

index = 1

winner = Bob
```

------------------------------------------------------------------------

# 💸 Sending the Prize

``` solidity
(bool success, ) = winner.call{
    value: getbalance()
}("");
```

This sends the contract's ETH balance to the selected winner.

`getbalance()` returns the current contract balance.

`call` is used to transfer the ETH.

The result is stored in:

``` solidity
success
```

If the transfer fails:

``` solidity
require(success, "Transfer failed");
```

causes the transaction to revert.

------------------------------------------------------------------------

# 🔄 Resetting the Lottery

After successfully paying the winner:

``` solidity
participants = new address payable[](0);
```

This creates a new empty participants array.

So the old participants are removed from the active lottery round.

The next round can then begin.

------------------------------------------------------------------------

# 🔁 Complete Example

Suppose three players enter.

### Player 1

``` text
Player A → sends 1 ETH
```

Array:

``` text
[A]
```

Contract balance:

``` text
1 ETH
```

### Player 2

``` text
Player B → sends 1 ETH
```

Array:

``` text
[A, B]
```

Contract balance:

``` text
2 ETH
```

### Player 3

``` text
Player C → sends 1 ETH
```

Array:

``` text
[A, B, C]
```

Contract balance:

``` text
3 ETH
```

### Admin calls `pickwinner()`

Suppose the calculated index is:

``` text
1
```

Then:

``` text
participants[1] = B
```

Therefore:

``` text
winner = B
```

The contract sends its balance:

``` text
3 ETH → Player B
```

Then:

``` text
participants = []
```

The lottery is ready for another round.

------------------------------------------------------------------------

# 🚀 Deployment

## Method 1 --- Attempted VS Code Deployment

Initially, the project was also explored as a local VS Code deployment
project.

This approach can require additional development tooling and
configuration, depending on the framework used. During this
experimentation, additional files and configuration were created for the
local deployment setup.

These extra files are present because of the **attempt to deploy and
manage the contract from VS Code**. They are not all part of the actual
lottery logic.

Examples of files that may be created by a local development/deployment
setup include configuration, dependency, script, test, and build-related
files.

### Important

The core smart contract is:

``` text
lottery.sol
```

The additional deployment-related files should not be confused with the
actual lottery logic.

------------------------------------------------------------------------

# 🌐 Method 2 --- Remix + MetaMask + Sepolia

For this beginner project, the contract was successfully deployed using
a simpler approach:

``` text
Solidity contract
       ↓
Remix IDE
       ↓
Compile
       ↓
MetaMask
       ↓
Sepolia Testnet
       ↓
Deploy
       ↓
Contract on Ethereum Sepolia
```

This method avoids having to configure a complete local deployment
framework just to deploy a simple learning contract.

------------------------------------------------------------------------

# 🦊 Setting Up MetaMask

MetaMask is a crypto wallet that can sign blockchain transactions.

For this project:

1.  Install MetaMask.
2.  Create or import a wallet.
3.  Switch to the **Sepolia test network**.
4.  Use a Sepolia test account.
5.  Obtain Sepolia test ETH from a faucet.
6.  Make sure the test ETH is visible in MetaMask.

> Never share your MetaMask seed phrase or private key with anyone.

------------------------------------------------------------------------

# 🧪 Sepolia Testnet

Sepolia is an Ethereum test network.

The purpose is to allow developers to test smart contracts without using
real Ethereum mainnet funds.

The ETH used on Sepolia is test ETH and is intended for
development/testing.

The project was deployed to Sepolia using the MetaMask account
containing Sepolia test ETH.

------------------------------------------------------------------------

# 🖥️ Deploying Through Remix

## 1. Open Remix

Open the Remix IDE and load:

``` text
lottery.sol
```

## 2. Compile

Open:

``` text
Solidity Compiler
```

Select a compatible Solidity compiler version and compile the contract.

## 3. Open Deploy & Run Transactions

Open the deployment panel.

## 4. Select the wallet environment

Choose:

``` text
Sepolia Testnet - MetaMask
```

This connects Remix to the MetaMask wallet and Sepolia network.

## 5. Select the contract

Choose:

``` text
Lottery
```

The constructor has no parameters, so nothing needs to be entered.

## 6. Click Deploy

MetaMask opens and asks for confirmation.

Check:

``` text
Network → Sepolia
Account → Correct MetaMask account
Gas → Paid using Sepolia test ETH
```

Then confirm the transaction.

## 7. Wait for confirmation

After the transaction is confirmed, Remix displays the deployed
contract.

The deployment transaction is recorded on the Sepolia blockchain.

------------------------------------------------------------------------

# 🔗 Verifying the Deployment

After deployment, Remix provides an option such as:

``` text
View on Etherscan
```

This opens the transaction on Sepolia Etherscan.

The deployment transaction contains information such as:

-   Transaction hash
-   Block number
-   Deployer address
-   Contract address
-   Gas used
-   Transaction status

A successful deployment transaction has a confirmed/success status and a
contract creation destination.

------------------------------------------------------------------------

# 🧪 Testing the Contract

After deployment, Remix shows the deployed contract under:

``` text
Deployed Contracts
```

The available functions include:

``` text
admin
participants
winner
enrollment
getbalance
pickwinner
```

## Test `admin`

Click:

``` text
admin
```

The returned address should be the wallet address that deployed the
contract.

------------------------------------------------------------------------

## Test `enrollment()`

The contract requires:

``` text
1 ETH
```

Therefore, before calling `enrollment()`, set the transaction value in
Remix to:

``` text
1 ether
```

Then click:

``` text
enrollment
```

MetaMask will ask for transaction confirmation.

Once confirmed, the enrollment transaction is included in a Sepolia
block.

The participant can then be checked through:

``` text
participants(0)
```

------------------------------------------------------------------------

## Testing the Lottery

The contract requires at least three participants:

``` solidity
require(participants.length >= 3, "Player are less than 3");
```

Therefore, three successful enrollments are required before:

``` text
pickwinner()
```

can succeed.

For realistic testing, different test accounts can be used.

------------------------------------------------------------------------

# ⛓️ Understanding Blocks and Transactions

When you click `enrollment()` or `pickwinner()`, you are not simply
running a local function.

You are creating a blockchain transaction.

The basic flow is:

``` text
Click function
      ↓
Remix creates transaction
      ↓
MetaMask asks for approval
      ↓
Wallet signs transaction
      ↓
Transaction is broadcast
      ↓
Sepolia validators process it
      ↓
Transaction is included in a block
      ↓
Blockchain state changes
```

This is why Remix can show information such as:

``` text
block: 11502441
txIndex: ...
from: 0x...
to: Lottery.enrollment
```

A `view` function such as `admin()` or `getbalance()` normally reads
blockchain state without creating a state-changing transaction.

------------------------------------------------------------------------

# ⚠️ Important Limitations

This project is intentionally simple and educational.

## 1. Randomness is not secure

The current pseudo-randomness approach is not suitable for a production
lottery involving real money.

## 2. Fixed entry price

Every participant must send exactly 1 ETH.

## 3. Admin-controlled winner selection

Only the admin can call `pickwinner()`.

## 4. No frontend

The current project primarily uses Remix/contract interactions rather
than a full web frontend.

## 5. Testnet only

The project should be treated as a learning project and tested on
Sepolia.

------------------------------------------------------------------------

# ⚠️ Notes About Solidity Version Changes

During compilation, Remix may warn about older Solidity patterns.

### `block.difficulty`

Older examples often use:

``` solidity
block.difficulty
```

On modern Ethereum networks, `block.prevrandao` is used instead in
contexts where the older difficulty-based value was used.

### `transfer`

Older Solidity examples often use:

``` solidity
winner.transfer(amount);
```

Modern Solidity development generally favors a checked low-level call
pattern:

``` solidity
(bool success, ) = winner.call{value: amount}("");
require(success, "Transfer failed");
```

These changes are particularly relevant when following older Solidity
tutorials.

------------------------------------------------------------------------

# 📁 Repository Structure

The repository can contain both the actual project and files created
during deployment experiments.

The most important contract file is:

``` text
lottery.sol
```

Other files may exist because the project was initially explored using
VS Code and local deployment tooling.

Those files are useful for development experiments, configuration,
testing, or deployment, but they should not be mistaken for the lottery
contract itself.

------------------------------------------------------------------------

# 🎯 Learning Objectives

This project helped explore:

-   Solidity syntax
-   Smart contracts
-   Ethereum addresses
-   `msg.sender`
-   `msg.value`
-   `payable`
-   Arrays
-   Constructors
-   `require()`
-   `view` functions
-   Contract balances
-   ETH transfers
-   Hashing with `keccak256`
-   Blockchain block data
-   Transactions
-   Blocks
-   MetaMask
-   Sepolia testnet
-   Remix deployment
-   Git and GitHub
-   Smart contract interaction

------------------------------------------------------------------------

# 👨‍💻 Author

**Aditya Purty**

Cybersecurity Enthusiast \| Python Developer \| Learning Ethical Hacking

GitHub:

https://github.com/gth-4yus

------------------------------------------------------------------------

# 📜 License

This project is created for learning and educational purposes.

It should not be considered production-ready financial software.

------------------------------------------------------------------------

## ⭐ Final Note

This project started as a learning exercise to understand how a Solidity
smart contract works and how it can be deployed to a blockchain.

The VS Code deployment attempt was useful for understanding the
additional tooling involved in professional Solidity development.
However, for this beginner project, **Remix + MetaMask + Sepolia**
provided a much simpler way to compile, deploy, and test the contract.

The project can later be extended with:

-   A secure randomness solution such as Chainlink VRF
-   A web frontend
-   Multiple lottery rounds
-   Better access control
-   Events
-   Automated winner selection
-   Automated testing
-   A production-oriented deployment framework
