'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Wallet, Gem, AlertCircle } from 'lucide-react'

export default function ViewNFTPage() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [nftTokenId, setNftTokenId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    loadNFTInfo()
  }, [])

  const loadNFTInfo = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      setWalletAddress(data.wallet_address || '')

      // Get portfolio to find NFT token ID
      const portfolioResponse = await fetch('/api/portfolio/view')
      const portfolioData = await portfolioResponse.json()

      setNftTokenId(portfolioData.portfolio?.nft_token_id || '')
    } catch (error) {
      console.error('Error loading NFT info:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async () => {
    setConnecting(true)
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed! Please install MetaMask to connect your wallet.')
        setConnecting(false)
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      const address = accounts[0]

      // Save wallet address to database
      const response = await fetch('/api/user/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address })
      })

      if (response.ok) {
        setWalletAddress(address)
        alert('Wallet connected successfully! ✅')
      } else {
        const error = await response.json()
        alert(`Failed to save wallet address: ${error.error}`)
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        alert('Connection rejected. Please approve the connection in MetaMask.')
      } else {
        alert('Failed to connect wallet. Please try again.')
      }
    } finally {
      setConnecting(false)
    }
  }

  const celoExplorerUrl = walletAddress
    ? `https://celo-sepolia.blockscout.com/address/${walletAddress}?tab=tokens`
    : ''

  const nftContractAddress = process.env.NEXT_PUBLIC_PORTFOLIO_NFT_CONTRACT || ''
  const nftUrl = nftTokenId && nftContractAddress
    ? `https://celo-sepolia.blockscout.com/token/${nftContractAddress}/instance/${nftTokenId}`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f0f1e] to-black">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-300 font-semibold flex items-center gap-1 transition">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold text-white">My Portfolio NFT</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 p-3 bg-[#3B82F6]/20 rounded-lg">
              <Gem className="w-8 h-8 text-[#3B82F6]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Your Portfolio NFT
            </h2>
            <p className="text-gray-400">
              Blockchain-verified portfolio on Celo Sepolia
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading NFT info...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Wallet Address */}
              <div className="p-5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#3B82F6]" />
                  Your Wallet
                </h3>
                {walletAddress ? (
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-gray-300 bg-white/5 p-3 rounded border border-white/10 break-all">
                      {walletAddress}
                    </p>
                    <a
                      href={celoExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/50 transition text-sm"
                    >
                      View Wallet on Celo Explorer →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm mb-3">
                      Connect your MetaMask wallet to view and mint your Portfolio NFT.
                    </p>
                    <button
                      onClick={connectWallet}
                      disabled={connecting}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {connecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          Connect MetaMask Wallet
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* NFT Token ID */}
              {nftTokenId ? (
                <div className="p-5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Gem className="w-5 h-5 text-[#3B82F6]" />
                    Portfolio NFT
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Token ID:</p>
                      <p className="font-mono text-2xl font-bold text-[#3B82F6]">
                        #{nftTokenId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Contract Address:</p>
                      <p className="font-mono text-xs text-gray-300 bg-white/5 p-2 rounded border border-white/10 break-all">
                        {nftContractAddress}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <a
                        href={nftUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/50 transition text-xs text-center"
                      >
                        View NFT on Explorer →
                      </a>
                      <a
                        href={`https://celo-sepolia.blockscout.com/token/${nftContractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 border border-white/20 text-gray-300 rounded-lg font-semibold hover:bg-white/10 transition text-xs text-center"
                      >
                        View Collection →
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h3 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    No NFT Minted Yet
                  </h3>
                  <p className="text-amber-300/80 mb-3 text-sm">
                    Sync your GitHub to automatically mint your portfolio NFT!
                  </p>
                  <Link
                    href="/dashboard/github"
                    className="inline-block px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/50 transition text-sm"
                  >
                    Sync GitHub →
                  </Link>
                </div>
              )}

              {/* Info Box */}
              <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-bold text-blue-300 mb-3">📖 About Your NFT</h3>
                <ul className="text-xs text-blue-400 space-y-1.5">
                  <li>✓ <strong>Blockchain:</strong> Celo Sepolia Testnet</li>
                  <li>✓ <strong>Standard:</strong> ERC-721 (NFT)</li>
                  <li>✓ <strong>Metadata:</strong> Stored on IPFS (immutable)</li>
                  <li>✓ <strong>Auto-Updates:</strong> Refreshes every 3 months</li>
                  <li>✓ <strong>Ownership:</strong> You own this NFT in your wallet</li>
                </ul>
              </div>

              {/* Why Can't I See It in MetaMask? */}
              <div className="p-5 bg-white/5 border border-white/20 rounded-lg">
                <h3 className="font-bold text-white mb-3">🤔 Why Can't I See It in MetaMask?</h3>
                <div className="text-xs text-gray-400 space-y-2">
                  <p>
                    <strong className="text-gray-300">MetaMask doesn't auto-detect NFTs on Celo Sepolia testnet.</strong> You need to manually import it!
                  </p>
                  <div className="bg-white/5 p-3 rounded border border-white/10">
                    <p className="font-semibold text-gray-300 mb-2">Follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Open MetaMask → Switch to <strong>Celo Sepolia</strong></li>
                      <li>Go to <strong>NFTs</strong> tab</li>
                      <li>Click <strong>"Import NFT"</strong></li>
                      <li>Enter Contract Address & Token ID (see below)</li>
                      <li>Click <strong>"Add"</strong></li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 <strong>Tip:</strong> On mainnet, MetaMask auto-detects NFTs. This is only needed for testnets!
                  </p>
                </div>
              </div>

              {/* How to Add to MetaMask */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-lg">
                <h3 className="font-bold text-white mb-3">🦊 View NFT in MetaMask</h3>
                <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                  <li>Open MetaMask and switch to <strong>Celo Sepolia</strong> network</li>
                  <li>Go to <strong>NFTs</strong> tab</li>
                  <li>Click <strong>"Import NFT"</strong></li>
                  <li>Enter:
                    <ul className="ml-6 mt-1 space-y-1 text-xs">
                      <li>• Contract: <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-gray-300">{nftContractAddress}</code></li>
                      <li>• Token ID: <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-gray-300">{nftTokenId}</code></li>
                    </ul>
                  </li>
                  <li>Click <strong>"Add"</strong> - Your NFT will appear!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
