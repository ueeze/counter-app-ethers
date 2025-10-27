import { ethers } from 'ethers'
import { contractAddress, CURRENT_NETWORK } from './constants'
import CounterABI from './Counter.json'

// 컨트랙트 메서드들을 타입 안전하게 정의
interface CounterContractMethods {
  getCounter(): Promise<bigint>
  incrementCounter(): Promise<ethers.ContractTransactionResponse>
  decrementCounter(): Promise<ethers.ContractTransactionResponse>
  resetCounter(): Promise<ethers.ContractTransactionResponse>
  owner(): Promise<string>
}

export class CounterContractService {
  private contract: (ethers.Contract & CounterContractMethods) | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null

  async connect(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('이 함수는 브라우저에서만 실행할 수 있습니다.')
    }

    if (!window.ethereum) {
      throw new Error('MetaMask가 설치되지 않았습니다.')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()

    // 네트워크 확인
    const network = await this.provider.getNetwork()
    console.log('현재 네트워크:', network)

    // 컨트랙트 주소 유효성 검증
    if (!ethers.isAddress(contractAddress)) {
      throw new Error(`유효하지 않은 컨트랙트 주소: ${contractAddress}`)
    }

    // 컨트랙트 코드 존재 여부 확인
    const code = await this.provider.getCode(contractAddress)
    console.log('컨트랙트 코드:', code)
    console.log('컨트랙트 배포됨:', code !== '0x')

    if (code === '0x') {
      throw new Error(
        `컨트랙트가 해당 주소에 배포되지 않았습니다: ${contractAddress}`
      )
    }

    this.contract = new ethers.Contract(
      contractAddress,
      CounterABI,
      this.signer
    ) as ethers.Contract & CounterContractMethods
  }

  async getCounter(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('컨트랙트에 연결되지 않았습니다.')
    }

    try {
      const result = await this.contract.getCounter()
      return result
    } catch (error) {
      console.error('getCounter 에러:', error)
      if (error instanceof Error) {
        if (error.message.includes('BAD_DATA')) {
          throw new Error(
            '컨트랙트가 해당 주소에 배포되지 않았거나 잘못된 네트워크에 연결되었습니다.'
          )
        }
      }
      throw new Error(
        `카운터 값을 가져오는데 실패했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
      )
    }
  }

  async incrementCounter(): Promise<void> {
    if (!this.contract) {
      throw new Error('컨트랙트에 연결되지 않았습니다.')
    }
    const tx = await this.contract.incrementCounter()
    await tx.wait()
  }

  async decrementCounter(): Promise<void> {
    if (!this.contract) {
      throw new Error('컨트랙트에 연결되지 않았습니다.')
    }
    const tx = await this.contract.decrementCounter()
    await tx.wait()
  }

  async resetCounter(): Promise<void> {
    if (!this.contract) {
      throw new Error('컨트랙트에 연결되지 않았습니다.')
    }
    const tx = await this.contract.resetCounter()
    await tx.wait()
  }

  async getOwner(): Promise<string> {
    if (!this.contract) {
      throw new Error('컨트랙트에 연결되지 않았습니다.')
    }
    return await this.contract.owner()
  }

  async getWalletAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('지갑에 연결되지 않았습니다.')
    }
    return await this.signer.getAddress()
  }

  isConnected(): boolean {
    return this.contract !== null
  }

  async getNetworkInfo(): Promise<{ chainId: bigint; name: string }> {
    if (!this.provider) {
      throw new Error('프로바이더에 연결되지 않았습니다.')
    }
    const network = await this.provider.getNetwork()
    return {
      chainId: network.chainId,
      name: network.name,
    }
  }

  async switchToCorrectNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask가 설치되지 않았습니다.')
    }

    // Sepolia 테스트넷으로 전환
    const sepoliaChainId = `0x${CURRENT_NETWORK.chainId.toString(16)}`

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      })
    } catch (switchError: any) {
      // 네트워크가 MetaMask에 추가되지 않은 경우
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: sepoliaChainId,
                chainName: CURRENT_NETWORK.name,
                rpcUrls: [CURRENT_NETWORK.rpcUrl],
                blockExplorerUrls: [CURRENT_NETWORK.blockExplorer],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          })
        } catch (addError) {
          throw new Error(`${CURRENT_NETWORK.name}을 추가할 수 없습니다.`)
        }
      } else {
        throw new Error('네트워크 전환에 실패했습니다.')
      }
    }
  }

  async getContractDebugInfo(): Promise<{
    contractAddress: string
    networkInfo: { chainId: bigint; name: string }
    contractCode: string
    isContractDeployed: boolean
  }> {
    if (!this.provider) {
      throw new Error('프로바이더에 연결되지 않았습니다.')
    }

    const network = await this.provider.getNetwork()
    const code = await this.provider.getCode(contractAddress)

    return {
      contractAddress,
      networkInfo: {
        chainId: network.chainId,
        name: network.name,
      },
      contractCode: code,
      isContractDeployed: code !== '0x',
    }
  }
}

// 전역 인스턴스
export const counterService = new CounterContractService()
