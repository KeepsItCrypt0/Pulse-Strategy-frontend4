import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { contractAbi, vplsAbi } from './abi';
import WalletInfo from './components/WalletInfo';
import ContractInfo from './components/ContractInfo';
import IssueShares from './components/IssueShares';
import RedeemShares from './components/RedeemShares';
import AdminPanel from './components/AdminPanel';
import TransactionHistory from './components/TransactionHistory';
import Footer from './components/Footer';

const PLSTR_ADDRESS = '0x6c1dA678A1B615f673208e74AB3510c22117090e';
const VPLS_ADDRESS = '0x0181e249c507d3b454dE2444444f0Bf5dBE72d09';
const RPC_URLS = [
  'https://mainnet.infura.io/v3/0c7b379c34424040826f02574f89b57d',
  'https://eth-mainnet.g.alchemy.com/v2/60nF9qKWaj8FPzlhEuGUmam6bn2tIgBN',
  'https://rpc.ankr.com/eth/8d7581cb1a742b4ebd60ddb0ff4049a193726fef2999a3acb4dc53293cf089b1'
];

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [vplsContract, setVplsContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const switchToMainnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
      console.log('Switched to Ethereum Mainnet');
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x1',
                chainName: 'Ethereum Mainnet',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.infura.io/v3/'],
                blockExplorerUrls: ['https://etherscan.io']
              },
            ],
          });
          console.log('Added Ethereum Mainnet');
          return true;
        } catch (addError) {
          console.error('Failed to add Ethereum Mainnet:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Ethereum Mainnet:', switchError);
      return false;
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      setLoading(true);
      setError(null);
      let provider;
      let web3Instance;

      // Try wallet connection first
      if (window.ethereum) {
        provider = window.ethereum;
        try {
          console.log('Detected provider:', window.ethereum.isMetaMask ? 'MetaMask' : 'OneKey or other');
          console.log('Attempting wallet connection...');
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('Wallet connected, accounts:', accounts);

          // Check and switch network
          const networkId = await new Web3(provider).eth.net.getId();
          console.log('Current network ID:', networkId);
          if (networkId !== 1) {
            const switched = await switchToMainnet();
            if (!switched) {
              setError('Please switch to Ethereum Mainnet (Chain ID 1) in your wallet.');
              setLoading(false);
              return;
            }
          }

          web3Instance = new Web3(provider);
        } catch (err) {
          console.error('Wallet connection failed:', err);
          setError('Failed to connect wallet. Ensure your wallet is unlocked and set to Ethereum Mainnet.');
          setLoading(false);
          return;
        }
      } else {
        console.warn('No wallet detected, attempting RPC fallback...');
        for (const rpc of RPC_URLS) {
          try {
            console.log(`Trying RPC: ${rpc}`);
            provider = new Web3.providers.HttpProvider(rpc);
            web3Instance = new Web3(provider);
            await web3Instance.eth.net.getId();
            console.log(`RPC ${rpc} connected successfully`);
            break;
          } catch (err) {
            console.error(`RPC ${rpc} failed:`, err);
            if (rpc === RPC_URLS[RPC_URLS.length - 1]) {
              setError('No wallet detected and all RPC endpoints failed. Please install a wallet like MetaMask or OneKey.');
              Ascertain Risk Website Warning**: The console log mentions “Detect Risk website,” likely from a wallet’s security feature (e.g., OneKey or MetaMask). This is unrelated to your code but indicates your wallet is scanning for phishing risks. Ensure you’re accessing the correct Netlify URL (`pulsestrategy.netlify.app`).

### Updated Code

#### `src/App.jsx`
```javascript
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { contractAbi, vplsAbi } from './abi';
import WalletInfo from './components/WalletInfo';
import ContractInfo from './components/ContractInfo';
import IssueShares from './components/IssueShares';
import RedeemShares from './components/RedeemShares';
import AdminPanel from './components/AdminPanel';
import TransactionHistory from './components/TransactionHistory';
import Footer from './components/Footer';

const PLSTR_ADDRESS = '0x6c1dA678A1B615f673208e74AB3510c22117090e';
const VPLS_ADDRESS = '0x0181e249c507d3b454dE2444444f0Bf5dBE72d09';
const RPC_URLS = [
  'https://mainnet.infura.io/v3/0c7b379c34424040826f02574f89b57d',
  'https://eth-mainnet.g.alchemy.com/v2/60nF9qKWaj8FPzlhEuGUmam6bn2tIgBN',
  'https://rpc.ankr.com/eth/8d7581cb1a742b4ebd60ddb0ff4049a193726fef2999a3acb4dc53293cf089b1'
];

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [vplsContract, setVplsContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const switchToMainnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
      console.log('Switched to Ethereum Mainnet');
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x1',
                chainName: 'Ethereum Mainnet',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.infura.io/v3/'],
                blockExplorerUrls: ['https://etherscan.io'],
              },
            ],
          });
          console.log('Added Ethereum Mainnet');
          return true;
        } catch (addError) {
          console.error('Failed to add Ethereum Mainnet:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Ethereum Mainnet:', switchError);
      return false;
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      setLoading(true);
      setError(null);
      let provider;
      let web3Instance;

      if (window.ethereum) {
        provider = window.ethereum;
        try {
          console.log('Detected provider:', window.ethereum.isMetaMask ? 'MetaMask' : 'OneKey or other');
          console.log('Attempting wallet connection...');
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('Wallet connected, accounts:', accounts);

          const networkId = await new Web3(provider).eth.net.getId();
          console.log('Current network ID:', networkId);
          if (networkId !== 1) {
            const switched = await switchToMainnet();
            if (!switched) {
              setError('Please switch to Ethereum Mainnet (Chain ID 1) in your wallet.');
              setLoading(false);
              return;
            }
          }

          web3Instance = new Web3(provider);
        } catch (err) {
          console.error('Wallet connection failed:', err);
          setError('Failed to connect wallet. Ensure your wallet is unlocked and set to Ethereum Mainnet.');
          setLoading(false);
          return;
        }
      } else {
        console.warn('No wallet detected, attempting RPC fallback...');
        for (const rpc of RPC_URLS) {
          try {
            console.log(`Trying RPC: ${rpc}`);
            provider = new Web3.providers.HttpProvider(rpc);
            web3Instance = new Web3(provider);
            await web3Instance.eth.net.getId();
            console.log(`RPC ${rpc} connected successfully`);
            break;
          } catch (err) {
            console.error(`RPC ${rpc} failed:`, err);
            if (rpc === RPC_URLS[RPC_URLS.length - 1]) {
              setError('No wallet detected and all RPC endpoints failed. Please install a wallet like MetaMask or OneKey.');
              setLoading(false);
              return;
            }
          }
        }
      }

      try {
        const networkId = await web3Instance.eth.net.getId();
        console.log('Final network ID check:', networkId);
        if (networkId !== 1) {
          setError('Network mismatch. Please ensure your wallet is on Ethereum Mainnet.');
          setLoading(false);
          return;
        }

        console.log('Initializing PLSTR contract at:', PLSTR_ADDRESS);
        const plstrContract = new web3Instance.eth.Contract(contractAbi, PLSTR_ADDRESS);
        console.log('PLSTR contract initialized:', !!plstrContract);

        console.log('Initializing vPLS contract at:', VPLS_ADDRESS);
        const vplsContractInstance = new web3Instance.eth.Contract(vplsAbi, VPLS_ADDRESS);
        console.log('vPLS contract initialized:', !!vplsContractInstance);

        const accounts = await web3Instance.eth.getAccounts();
        console.log('Accounts after initialization:', accounts);

        setWeb3(web3Instance);
        setContract(plstrContract);
        setVplsContract(vplsContractInstance);
        setAccount(accounts[0] || null);

        if (accounts[0]) {
          console.log('Checking StrategyController for account:', accounts[0]);
          const owner = await plstrContract.methods.owner().call();
          console.log('StrategyController:', owner);
          setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
        } else {
          console.warn('No accounts available after wallet connection');
        }

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize contracts. Please refresh and ensure Ethereum Mainnet is selected.');
        setLoading(false);
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    if (web3 && account && contract) {
      console.log('Setting up event listeners for account/network changes');
      const refreshData = async () => {
        console.log('Refreshing data due to account/chain change');
        setRefresh(prev => prev + 1);
      };
      window.ethereum?.on('accountsChanged', refreshData);
      window.ethereum?.on('chainChanged', async () => {
        console.log('Chain changed, checking network');
        const networkId = await web3.eth.net.getId();
        if (networkId !== 1) {
          const switched = await switchToMainnet();
          if (!switched) {
            setError('Please switch to Ethereum Mainnet (Chain ID 1) in your wallet.');
          }
        }
        refreshData();
      });
      return () => {
        window.ethereum?.removeListener('accountsChanged', refreshData);
        window.ethereum?.removeListener('chainChanged', refreshData);
      };
    }
  }, [web3, account, contract]);

  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) {
        setError('No wallet detected. Please install MetaMask or OneKey.');
        setLoading(false);
        return;
      }
      console.log('Requesting wallet connection...');
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Wallet connected, accounts:', accounts);

      const networkId = await new Web3(window.ethereum).eth.net.getId();
      console.log('Network ID after connect:', networkId);
      if (networkId !== 1) {
        const switched = await switchToMainnet();
        if (!switched) {
          setError('Please switch to Ethereum Mainnet (Chain ID 1) in your wallet.');
          setLoading(false);
          return;
        }
      }

      window.location.reload(); // Reload to reinitialize with connected account
    } catch (err) {
      console.error('Connect wallet error:', err);
      let errorMessage = 'Failed to connect wallet. Please ensure your wallet is unlocked and set to Ethereum Mainnet.';
      if (err.code === 4001) {
        errorMessage = 'Wallet connection rejected. Please approve the connection in your wallet.';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="text-center py-16 bg-gradient-to-r from-cyan-900 to-purple-900">
        <h1 className="animate-fadeIn">PulseStrategy</h1>
      </header>
      <main className="container py-12 space-y-12">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
            <p className="mt-6 text-xl">Connecting to blockchain...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400">
            <p className="text-xl">{error}</p>
            <button
              onClick={handleConnectWallet}
              className="mt-6 btn-primary btn-connect text-xl animate-glow"
              disabled={loading}
            >
              Retry Connection
            </button>
          </div>
        ) : account ? (
          <div className="space-y-12 animate-fadeIn">
            <WalletInfo web3={web3} account={account} contract={contract} vplsContract={vplsContract} refresh={refresh} />
            <ContractInfo web3={web3} contract={contract} vplsContract={vplsContract} refresh={refresh} />
            <IssueShares web3={web3} account={account} contract={contract} vplsContract={vplsContract} refresh={refresh} setRefresh={setRefresh} />
            <RedeemShares web3={web3} account={account} contract={contract} refresh={refresh} setRefresh={setRefresh} />
            {isOwner && <AdminPanel web3={web3} account={account} contract={contract} refresh={refresh} setRefresh={setRefresh} />}
            <TransactionHistory web3={web3} account={account} contract={contract} refresh={refresh} />
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={handleConnectWallet}
              className="btn-primary btn-connect text-xl animate-glow"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <p className="mt-6 text-gray-400">Connect your wallet to interact with PulseStrategy.</p>
            <p className="mt-2 text-sm text-gray-500">
              No wallet?{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Install MetaMask
              </a>{' '}
              or{' '}
              <a
                href="https://www.onekey.so/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                OneKey
              </a>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
