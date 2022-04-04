import Web3ProviderEngine from 'web3-provider-engine';
import Wallet from 'ethereumjs-wallet';
import { TestSubprovider } from '@rarible/test-provider';
import { EthersEthereum } from '@rarible/ethers-ethereum';
import { ethers } from 'ethers';
import { EthereumWallet } from '@rarible/sdk-wallet';
import { createRaribleSdk } from '@rarible/sdk';
// @ts-ignore
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import FormData from "form-data";
import fetch from "node-fetch"

// Setup
//@ts-ignore
global.FormData = FormData
//@ts-ignore
global["window"] = { fetch: fetch, dispatchEvent: () => {} }
//@ts-ignore
global.CustomEvent = function CustomEvent() { return }

const provider = new Web3ProviderEngine({ pollingInterval: 100 })
// @ts-ignore
const wallet = new Wallet(Buffer.from(process.env['ETH_PK'].substring(2), 'hex')); // Wallet private key from ENV variable "ETH_PK"
provider.addProvider(new TestSubprovider(wallet, { networkId: 4, chainId: 4 })); // Rinkeby Network (id 4)
provider.addProvider(new RpcSubprovider({ rpcUrl: process.env['ETH_RPC_ENDPOINT'] })); // RPC http endpoint from ENV variable "ETH_RPC_ENDPOINT"
provider.start();
//@ts-ignore
const raribleEthers = new ethers.providers.Web3Provider(provider);

//@ts-ignore
const raribleProvider = new EthersEthereum(new ethers.Wallet(process.env['ETH_PK'], raribleEthers));
const raribleSdkWallet = new EthereumWallet(raribleProvider);
//@ts-ignore
const raribleSdk = createRaribleSdk(raribleSdkWallet, 'staging', { fetchApi: fetch });

// Buy function
async function buy(item: string): Promise<any> {
    // item is token_address:token_id
    const order = (await raribleSdk.apis.item.getItemById({ itemId: 'ETHEREUM:' + item })).bestSellOrder;
    if (order) {
        try {
            const request = await raribleSdk.order.buy({ orderId: order.id });
            return await request.submit({ amount: 1 });
        } catch (e) {
            console.log('Error', e);
        }
    }
}

// Buying 1 item of https://rinkeby.rarible.com/token/0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:18661571940073987827662103527955627190048515004732602540856362757661044768826?tab=owners
const raribleBuyResponse = buy("0x1AF7A7555263F275433c6Bb0b8FdCD231F89B1D7:18661571940073987827662103527955627190048515004732602540856362757661044768826")
console.log(raribleBuyResponse)