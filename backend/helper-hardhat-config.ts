import { BigNumber } from "ethers"

type NetworkConfigItem = {
    name: string
    wmaticToken: string
}

type NetworkConfigMap = {
    [chainId: string]: NetworkConfigItem
}

export const networkConfig: NetworkConfigMap = {
    80001 : {
        name: "mumbai",
        wmaticToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    },
}

export const developmentChains: string[] = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6
