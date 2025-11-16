const hre = require("hardhat");

const main = async() =>{

    // get contract
    const MaidFinder = await hre.ethers.getContractFactory("MaidFinder");

    //deploy contract
    const maidfinder = await MaidFinder.deploy();

    //wait for deplyment
    await maidfinder.waitForDeployment();

    console.log("MaidFinder deploy Address:" ,await  maidfinder.getAddress());
}

main().catch((error) =>{
    console.error(error);
    process.exitCode = 1;
});

// MaidFinder deploy Address: 0xfe34aBAc056AE81d0a33Ede4A3E9AF5DC8e338C1
