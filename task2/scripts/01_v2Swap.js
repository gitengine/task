// Swap 1 WETH for USDT
// The source code and most of the implementation are from:
// Use Mainnet Fork to Swap Tokens on Uniswap with Code | Ethereum, EthersJS, Hardhat
// https://www.youtube.com/watch?v=mp758KKrCgc
// https://gist.github.com/BlockmanCodes/422c37960fe8f331f524a2d51549f9d4
// Added logBalances() before swapping ETH with WETH

const ethers = require("ethers");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json"); // IUniswapV2Router02.json, https://unpkg.com/browse/@uniswap/v2-periphery@1.1.0-beta.0/build/
const erc20Abi = require("../erc20.json"); //Solidity JSON ABI is used instead of Human-Readable ABI
const wethArtifact = require("../weth.json");

WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // https://www.alchemy.com/smart-contracts/weth9
USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02
PAIR_ADDRESS = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; // Unused pool

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/"); // Initialize provider RPC nodes
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
); // Initialize wallet
const signer = wallet.connect(provider); // Connect wallet to signer

// Initialize
const router = new ethers.Contract(
  ROUTER_ADDRESS,
  routerArtifact.abi,
  provider
); // Only ABI
const usdt = new ethers.Contract(USDT_ADDRESS, erc20Abi, provider);
const weth = new ethers.Contract(WETH_ADDRESS, wethArtifact.abi, provider); // Only ABI

// Get balance function
const logBalances = async () => {
  const ethBalance = await provider.getBalance(signer.address);
  const usdtBalance = await usdt.balanceOf(signer.address);
  const wethBalance = await weth.balanceOf(signer.address);
  console.log("--------------------");
  console.log("ETH Balance:", ethers.formatUnits(ethBalance, 18)); // Display in Ether
  console.log("WETH Balance:", ethers.formatUnits(wethBalance, 18));
  console.log("USDT Balance:", ethers.formatUnits(usdtBalance, 6));
  console.log("--------------------");
};

const main = async () => {
  logBalances();

  // Swapping 5 ETH for 5 WETH
  await signer.sendTransaction({
    to: WETH_ADDRESS,
    value: ethers.parseUnits("5", 18),
  }); // Value in wei
  logBalances();

  // Create variable for 1 WETH and approve the WETH ERC20 token for transaction
  const amountIn = ethers.parseUnits("1", 18); // Value in wei
  const tx1 = await weth.connect(signer).approve(router.target, amountIn); //.connect is ethers, .approve is weth abi,
  tx1.wait(); // original code line missing await

  // Swapping 1 WETH for USDT
  const tx2 = await router
    .connect(signer)
    .swapExactTokensForTokens(
      amountIn,
      0,
      [WETH_ADDRESS, USDT_ADDRESS],
      signer.address,
      Math.floor(Date.now() / 1000) + 60 * 10,
      {
        gasLimit: 1000000,
      }
    ); // .swapExactTokensForTokens, https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02, gasLimit is not supposed to be here?
  await tx2.wait();

  logBalances();
};
main();

/*
node scripts/01_v2Swap.js
*/
