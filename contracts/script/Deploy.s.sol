// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/VigilSlash.sol";

contract DeployVigilSlash is Script {
    // USDC on Arc testnet
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying VigilSlash...");
        console.log("Deployer:", deployer);
        console.log("USDC:", USDC);

        vm.startBroadcast(deployerPrivateKey);

        VigilSlash vigil = new VigilSlash(
            USDC,
            deployer // oracle is deployer for now, will update later
        );

        vm.stopBroadcast();

        console.log("VigilSlash deployed at:", address(vigil));
    }
}