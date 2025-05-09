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

  useEffect(() => {
    const initWeb3 = async () => {
      setLoading(true);
      setError(null);
      try {
        let provider;
        if (window.ethereum) {
          provider = window.ethereum;
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (err) {
            console.error('Wallet connection failed:', err);
            setError('Failed to connect wallet. Ensure MetaMask is set to Ethereum Mainnet.');
            setLoading(false);
            return;
          }
        } else {
          provider = new Web3.providers.HttpProvider(RPC_URLS[0]);
          console.warn('No wallet detected, using fallback RPC');
        }

        const web3Instance = new Web3(provider);
        console.log('Web3 initialized:', !!web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        if (networkId !== 1) {
          setError('Please switch to Ethereum Mainnet in your wallet.');
          setLoading(false);
          return;
        }

        const plstrContract = new web3Instance.eth.Contract(contractAbi, PLSTR_ADDRESS);
        const vplsContractInstance = new web3Instance.eth.Contract(vplsAbi, VPLS_ADDRESS);
        console.log('Contracts initialized:', !!plstrContract, !!vplsContractInstance);

        const accounts = await web3Instance.eth.getAccounts();
        console.log('Accounts:', accounts);

        setWeb3(web3Instance);
        setContract(plstrContract);
        setVplsContract(vplsContractInstance);
        setAccount(accounts[0] || null);

        if (accounts[0]) {
          const owner = await plstrContract.methods.owner().call();
          console.log('StrategyController:', owner);
          setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
        }

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize. Please refresh and ensure Ethereum Mainnet is selected.');
        setLoading(false);
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    if (web3 && account && contract) {
      const refreshData = async () => {
        console.log('Refreshing data due to account/chain change');
        setRefresh(prev => prev + 1);
      };
      window.ethereum?.on('accountsChanged', refreshData);
      window.ethereum?.on('chainChanged', refreshData);
      return () => {
        window.ethereum?.removeListener('accountsChanged', refreshData);
        window.ethereum?.removeListener('chainChanged', refreshData);
      };
    }
  }, [web3, account, contract]);

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
              onClick={() => window.location.reload()}
              className="mt-6 btn-primary"
            >
              Retry
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
              onClick={async () => {
                try {
                  await window.ethereum?.request({ method: 'eth_requestAccounts' });
                  window.location.reload();
                } catch (err) {
                  setError('Failed to connect wallet. Please try again.');
                }
              }}
              className="btn-primary text-xl animate-glow"
            >
              Connect Wallet
            </button>
            <p className="mt-6 text-gray-400">Connect your wallet to interact with PulseStrategy.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
