'use client'

import { useState, useEffect } from 'react'
import { counterService } from '@/lib/contract'

export default function CounterApp() {
  const [counter, setCounter] = useState<bigint>(0n)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [owner, setOwner] = useState<string>('')
  const [walletAddress, setWalletAddress] = useState<string>('')

  const connectWallet = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await counterService.connect()
      setIsConnected(true)
      await loadCounter()
      await loadOwner()
      await loadWalletAddress()
    } catch (err) {
      setError(err instanceof Error ? err.message : '지갑 연결에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCounter = async () => {
    try {
      const currentCounter = await counterService.getCounter()
      setCounter(currentCounter)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '카운터 값을 불러오는데 실패했습니다.'
      )
    }
  }

  const loadOwner = async () => {
    try {
      const contractOwner = await counterService.getOwner()
      setOwner(contractOwner)
    } catch (err) {
      console.error('소유자 정보를 불러오는데 실패했습니다:', err)
    }
  }

  const loadWalletAddress = async () => {
    try {
      const address = await counterService.getWalletAddress()
      setWalletAddress(address)
    } catch (err) {
      console.error('지갑 주소를 불러오는데 실패했습니다:', err)
    }
  }

  const incrementCounter = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await counterService.incrementCounter()
      await loadCounter()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '카운터 증가에 실패했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const decrementCounter = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await counterService.decrementCounter()
      await loadCounter()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '카운터 감소에 실패했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const resetCounter = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await counterService.resetCounter()
      await loadCounter()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '카운터 리셋에 실패했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected) {
      loadCounter()
    }
  }, [isConnected])

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        블록체인 카운터
      </h1>

      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            MetaMask를 연결하여 카운터 앱을 사용하세요
          </p>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {isLoading ? '연결 중...' : '지갑 연결'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              현재 카운터 값
            </p>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {counter.toString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={incrementCounter}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              +
            </button>
            <button
              onClick={decrementCounter}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              -
            </button>
          </div>

          <button
            onClick={resetCounter}
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            리셋
          </button>

          {(owner || walletAddress) && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
              {owner && (
                <div>
                  <p>컨트랙트 소유자:</p>
                  <p className="font-mono text-xs break-all">{owner}</p>
                </div>
              )}
              {walletAddress && (
                <div>
                  <p>연결된 지갑 주소:</p>
                  <p className="font-mono text-xs break-all">{walletAddress}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                트랜잭션 처리 중...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
