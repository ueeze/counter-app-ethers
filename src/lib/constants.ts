export const contractAddress = '0x4195c66979168212232B2d88cb15fd48c5072c83'

// 지원되는 네트워크 정보
export const SUPPORTED_NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Test Network',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io/',
  },
} as const

// 현재 사용 중인 네트워크
export const CURRENT_NETWORK = SUPPORTED_NETWORKS.sepolia
