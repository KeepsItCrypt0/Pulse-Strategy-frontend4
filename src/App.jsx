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
        params: [{ chainId: '0x1' }],
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

  const validateContractAddress = async (web3Instance, address, name) => {
    try {
      const code = await web3Instance.eth.getCode(address);
      console.log(`${name} contract code exists:`, code !== '0x');
      return code !== '0x';
    } catch (err) {
      console.error(`Failed to validate ${name} contract address:`, err);
      return false;
    }
  };

  const initializeContracts = async (web3Instance, accounts) => {
    try {
      console.log('Validating contract ABI:', !!contractAbi, contractAbi.length);
      if (!contractAbi || !Array.isArray(contractAbi)) {
        throw new Error('Invalid PLSTR ABI');
      }
      console.log('Validating vPLS ABI:', !!vplsAbi, vplsAbi.length);
      if (!vplsAbi || !Array.isArray(vplsAbi)) {
        throw new Error('Invalid vPLS ABI');
      }

      console.log('Validating PLSTR address:', PLSTR_ADDRESS);
      const isPlstrValid = await validateContractAddress(web3Instance, PLSTR_ADDRESS, 'PLSTR');
      if (!isPlstrValid) {
        throw new Error('PLSTR contract not deployed at specified address');
      }

      console.log('Validating vPLS address:', VPLS_ADDRESS);
      const isVplsValid = await validateContractAddress(web3Instance, VPLS_ADDRESS, 'vPLS');
      if (!isVplsValid) {
        throw new Error('vPLS contract not deployed at specified address');
      }

      console.log('Initializing PLSTR contract at:', PLSTR_ADDRESS);
      const plstrContract = new web3Instance.eth.Contract(contractAbi, PLSTR_ADDRESS);
      console.log('PLSTR contract initialized:', !!plstrContract);

      console.log('Initializing vPLS contract at:', VPLS_ADDRESS);
      const vplsContractInstance = new web3Instance.eth.Contract(vplsAbi, VPLS_ADDRESS);
      console.log('vPLS contract initialized:', !!vplsContractInstance);

      setContract(plstrContract);
      setVplsContract(vplsContractInstance);

      if (accounts[0]) {
        console.log('Checking StrategyController for account:', accounts[0]);
        const owner = await plstrContract.methods.owner().call();
        console.log('StrategyController:', owner);
        setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
      } else {
        console.warn('No accounts available for owner check');
      }
    } catch (err) {
      console.error('Contract initialization error:', err);
      setError(`Failed to initialize contracts: ${err.message}`);
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
          const accounts = await Promise.race([
            window.ethereum.request({ method: 'eth_requestAccounts' }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Wallet connection timed out')), 10000)
            ),
          ]);
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
          console.log('Web3 instance created:', !!web3Instance);
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

      setWeb3(web3Instance);

      let accounts = await web3Instance.eth.getAccounts();
      console.log('Accounts after initialization:', accounts);
      if (!accounts.length && window.ethereum) {
        console.warn('No accounts returned, retrying eth_getAccounts...');
        accounts = await web3Instance.eth.getAccounts();
        console.log('Retry accounts:', accounts);
      }

      setAccount(accounts[0] || null);
      await initializeContracts(web3Instance, accounts);
      setLoading(false);
    };
    initWeb3();
  }, []);

  useEffect(() => {
    if (web3 && account && contract && vplsContract) {
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
  }, [web3, account, contract, vplsContract]);

  useEffect(() => {
    console.log('Account state changed:', account);
    if (account && !loading && !error) {
      console.log('Forcing UI render with account:', account);
    }
  }, [account, loading, error]);

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
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Wallet connection timed out')), 10000)
        ),
      ]);
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

      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      await initializeContracts(web3Instance, accounts);
      setLoading(false);
    } catch (err) {
      console.error('Connect wallet error:', err);
      let errorMessage = 'Failed to connect wallet. Please ensure your wallet is unlocked and set to Ethereum Mainnet.';
      if (err.code === 4001) {
        errorMessage = 'Wallet connection rejected. Please approve the connection in your wallet.';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.';
      } else if (err.message.includes('timed out')) {
        errorMessage = 'Wallet connection timed out. Please try again.';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const retryInitialization = async () => {
    if (!web3 || !account) {
      setError('Please connect wallet first.');
      return;
    }
    setLoading(true);
    setError(null);
    const accounts = await web3.eth.getAccounts();
    await initializeContracts(web3, accounts);
    setLoading(false);
  };

  console.log('Render state:', {
    account,
    web3: !!web3,
    contract: !!contract,
    vplsContract: !!vplsContract,
    loading,
    error,
  });

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
            {web3 && contract && vplsContract ? (
              <>
                <WalletInfo web3={web3} account={account} contract={contract} vplsContract={vplsContract} refresh={refresh} />
                <ContractInfo web3={web3} contract={contract} vplsContract={vplsContract} refresh={refresh} />
                <IssueShares web3={web3} account={account} contract={contract} vplsContract={vplsContract} refresh={refresh} setRefresh={setRefresh} />
                <RedeemShares web3={web3} account={account} contract={contract} refresh={refresh} setRefresh={setRefresh} />
                {isOwner && <AdminPanel web3={web3} account={account} contract={contract} refresh={refresh} setRefresh={setRefresh} />}
                <TransactionHistory web3={web3} account={account} contract={contract} refresh={refresh} />
              </>
            ) : (
              <div className="text-center text-red-400">
                <p className="text-xl">Failed to initialize Web3 or contracts. Please retry or check contract settings.</p>
                <button
                  onClick={retryInitialization}
                  className="mt-6 btn-primary btn-connect text-xl animate-glow"
                  disabled={loading}
                >
                  Retry Initialization
                </button>
                <button
                  onClick={handleConnectWallet}
                  className="mt-4 btn-primary btn-connect text-xl animate-glow"
                  disabled={loading}
                >
                  Reconnect Wallet
                </button>
              </div>
            )}
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
