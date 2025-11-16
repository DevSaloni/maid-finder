//instance of contract

const {ethers} = require("ethers");
const contractABI = require("../../blockchain/artifacts/contracts/MaidFinder.sol/MaidFinder.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY,provider);

const contractAddress = process.env.CONTRACT_ADDRESS;
const maidContract = new ethers.Contract(contractAddress,contractABI.abi,wallet);

module.exports = {maidContract};



