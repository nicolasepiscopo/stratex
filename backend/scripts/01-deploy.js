// npx hardhat run scripts/deploy.js --network localhost

const CONTRACT_SPECS = require('./contractSpecs.js')
const { saveBackendFiles, publishAndVerifyOnEtherscan } = require('../helper/utils')

async function main () {
  // First seven accounts from 'elephant worth speed width loan shield vital attract bachelor boil benefit dog'

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying the contracts with the account: ${await deployer.getAddress()}\n\n`)

  const contractAddresses = {}

  let count = 0
  let overrides
  for (const x of Object.keys(CONTRACT_SPECS)) {
    if (CONTRACT_SPECS[x].contractLabel === undefined) {
      continue
    }
    console.log(`Contract ${CONTRACT_SPECS[x].contractLabel} deploying...`)
    const CONTRACT = await ethers.getContractFactory(CONTRACT_SPECS[x].contractLabel)
    let deployedContract = []

    if (network.name === 'mumbai') {
      const nonce = await deployer.getTransactionCount()
      overrides = { nonce: nonce }
    } else {
      overrides = {}
    }
    const args = CONTRACT_SPECS[x].arguments
    if (args) {
      deployedContract = await CONTRACT.deploy(...args, overrides)
    } else {
      deployedContract = await CONTRACT.deploy(overrides)
    }

    await deployedContract.deployed()

    console.log(`Contract ${CONTRACT_SPECS[x].contractLabel} deployed at ${deployedContract.address}`)

    let fileName = CONTRACT_SPECS[x].contractLabel.includes(':') ? CONTRACT_SPECS[x].contractLabel.split(':')[1] : CONTRACT_SPECS[x].contractLabel
    await saveBackendFiles(CONTRACT_SPECS[x].contractLabel)
    console.log(`ABI generated in build (/abis) folder: ${fileName}.json\n`)
    const content = {}
    if (typeof contractAddresses[fileName] !== 'undefined') {
      fileName = fileName + count
    }
    content.address = deployedContract.address
    content.arguments = args
    content.label = CONTRACT_SPECS[x].contractLabel
    content.txHash = deployedContract.deployTransaction.hash
    contractAddresses[fileName] = content
    count++
  }
  await saveBackendFiles(null, contractAddresses)
  console.log('\n\nFile with contract address, arguments and tx hash generated for each smart contract inside build (/abis) folder')
  console.log(`Deployment to network ${network.name} was successful`)

  if (network.name === 'mumbai') {
    console.log('Verifying on Etherscan all the deployed contracts')
    await publishAndVerifyOnEtherscan()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
