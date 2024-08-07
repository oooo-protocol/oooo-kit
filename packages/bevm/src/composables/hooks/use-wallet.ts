import { BrowserProvider, Contract, formatEther, formatUnits, hexlify, JsonRpcProvider, parseUnits, toUtf8Bytes, type TransactionRequest } from 'ethers'
import { useOConfig } from '../oooo-config'
import { type ChainConfig } from '@/entities/server'
import { formatEtherError } from '../utils'

export interface TransactionParameter {
  from: string
  to: string
  value: string
  gas: string
}

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }, {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }, {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
]

export const useWallet = () => {
  const { walletAddress, provider: eip1193Provider } = useOConfig()

  async function sign (message: string) {
    if (walletAddress == null) throw new Error('Please login wallet before call function')

    const provider = new BrowserProvider(eip1193Provider)

    try {
      return await provider.send(
        'personal_sign',
        [hexlify(toUtf8Bytes(message)), walletAddress]
      )
    } finally {
      provider.destroy()
    }
  }

  async function switchToChain (chainConfig: ChainConfig) {
    const provider = new BrowserProvider(eip1193Provider)
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: chainConfig.chainId }])
    } catch (e) {
      const err = formatEtherError(e as any)
      /**
       * fix metamask mobile not throw 4902 error when not selected chain.
       * reference: https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
       */
      if (err.code === 4902 || err.code === -32603) {
        await provider.send('wallet_addEthereumChain', [chainConfig])
        await provider.send('wallet_switchEthereumChain', [{ chainId: chainConfig.chainId }])
      } else {
        throw e
      }
    } finally {
      provider.destroy()
    }
  }

  async function getBalance (address: string, config: ChainConfig, contractAddress?: string) {
    const provider = new JsonRpcProvider(config.rpcUrls[0])
    try {
      if (contractAddress == null || contractAddress === '') {
        const balance = await provider.getBalance(address)
        return formatEther(balance)
      } else {
        const contract = new Contract(contractAddress, ERC20_ABI, provider)
        const balance = await contract.balanceOf(address)
        const decimals = await contract.decimals()
        return formatUnits(balance, decimals)
      }
    } finally {
      provider.destroy()
    }
  }

  async function tokenTransfer (parameter: TransactionParameter, contractAddress: string) {
    const provider = new BrowserProvider(eip1193Provider)
    try {
      const signer = await provider.getSigner()
      const contract = new Contract(contractAddress, ERC20_ABI, signer)
      const decimals = await contract.decimals()
      const transferParam = [
        parameter.to,
        parseUnits(parameter.value, decimals)
      ]
      const gasLimit = await contract.transfer.estimateGas(...transferParam)
      const { hash } = await contract.transfer(
        ...transferParam,
        {
          gasPrice: parameter.gas,
          gasLimit
        }
      )
      return hash
    } finally {
      provider.destroy()
    }
  }

  async function coinTransfer (parameter: TransactionParameter, config: ChainConfig) {
    const provider = new BrowserProvider(eip1193Provider)
    try {
      const signer = await provider.getSigner()
      const params: TransactionRequest = {
        gasPrice: parameter.gas,
        to: parameter.to,
        from: parameter.from,
        value: parseUnits(parameter.value, config.nativeCurrency.decimals)
      }
      const gasLimit = await provider.estimateGas(params)
      params.gasLimit = gasLimit
      // EIP-155 define, to prevent "replay attacks"
      params.chainId = config.chainId
      console.log('eth_sendTransaction', params)
      const { hash } = await signer.sendTransaction(params)
      return hash
    } finally {
      provider.destroy()
    }
  }

  async function transfer (parameter: TransactionParameter, chainConfig: ChainConfig): Promise<string>
  async function transfer (parameter: TransactionParameter, chainConfig: ChainConfig, contractAddress: string): Promise<string>
  async function transfer (parameter: TransactionParameter, chainConfig: ChainConfig, contractAddress?: string) {
    if (walletAddress == null) throw new Error('Please login wallet before call function')
    await switchToChain(chainConfig)

    if (contractAddress !== '' && contractAddress != null) {
      return await tokenTransfer(parameter, contractAddress)
    } else {
      return await coinTransfer(parameter, chainConfig)
    }
  }

  return {
    sign,
    transfer,
    getBalance,
    switchToChain
  }
}
