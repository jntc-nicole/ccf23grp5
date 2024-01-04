require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      /*accounts: {
        mnemonic: "mercy slogan cave decade goose drill goat height desk various celery whisper"//process.env.SP
      },*/
      chainId: 1337
    }
  }
};
