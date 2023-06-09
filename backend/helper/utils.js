const FS = require('fs')

const infoDeploymentFilePath = './abis/contracts-deployment-info.json'
const infoDeploymentFileName = 'contracts-deployment-info.json'

const { run, ethers } = require('hardhat')

const saveBackendFiles = async (name, addressesObject = {}) => {
  const fs = require('fs')
  // eslint-disable-next-line node/no-path-concat
  const contractsDir = './abis'

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }
  if (Object.keys(addressesObject).length === 0) {
    const ContractArtifact = artifacts.readArtifactSync(name)
    const fileName = name.includes(':') ? name.split(':')[1] : name
    fs.writeFileSync(
      contractsDir + '/' + fileName + '.json',
      JSON.stringify(ContractArtifact.abi, null, 2)
    )
  } else {
    fs.writeFileSync(
      contractsDir + '/' + infoDeploymentFileName,
      JSON.stringify(addressesObject, undefined, 2)
    )
  }
}

const publishAndVerifyOnEtherscan = async function () {
  const PROVIDER = ethers.provider
  const jsonRawData = FS.readFileSync(infoDeploymentFilePath)
  const dataDeployment = JSON.parse(jsonRawData)
  // loop for each in JSON file where there are the address and arguments for each contract deployed
  for (const x of Object.keys(dataDeployment)) {
    await PROVIDER.waitForTransaction(
      dataDeployment[x].txHash,
      process.env.POLYGONSCAN_VERIFY_CONFIRMATIONS, process.env.TX_TIMEOUT
    )
    try {
      await run('verify:verify', {
        contract: dataDeployment[x].label,
        address: dataDeployment[x].address,
        constructorArguments: dataDeployment[x].arguments
      })
      console.log('Contract is already verified!')
    } catch (error) {
      if (error.message.toLowerCase().includes('already verified')) {
        console.log('Contract is already verified!')
      } else {
        throw error
      }
    }
  }
}


module.exports = {
  saveBackendFiles,
  publishAndVerifyOnEtherscan
}
