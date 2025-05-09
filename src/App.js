import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { contractAbi } from './abi';
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

  // Initialize Web3 and contract
  useEffect(() => {
    const initWeb3 = async () => {
      let provider;
      if (window.ethereum) {
        provider = window.ethereum;
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error('User denied account access');
        }
      } else {
        provider = new Web3.providers.HttpProvider(RPC_URLS[0]);
      }
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const plstrContract = new web3Instance.eth.Contract(contractAbi, PLSTR_ADDRESS);
      setContract(plstrContract);

      const vplsContractInstance = new web3Instance.eth.Contract(contractAbi, VPLS_ADDRESS);
      setVplsContract(vplsContractInstance);

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

      // Check if connected account is owner
      const owner = await plstrContract.methods.owner().call();
      setIsOwner(accounts[0]?.toLowerCase() === owner.toLowerCase());
    };
    initWeb3();
  }, []);

  // Auto-refresh data on transaction
  useEffect(() => {
    if (web3 && account && contract) {
      const refreshData = async () => {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold">PulseStrategy</h1>
      </header>
      <main className="container mx-auto p-4 space-y-8">
        {account ? (
          <>
            <WalletInfo web3={web3} account={account} contract={contract} vplsContract={vplsContract} refresh={refresh} />
            <ContractInfo web3={web3} contract={contract} vplsContract={vplsContract} refresh={refresh} />
            <IssueShares web3={web3} account={account} contract={contract} vplsContract={vplsContract} refresh={refresh} setRefresh={setRefresh} />
            <RedeemShares web3={web3} account={account} contract={contract} refresh={refresh} setRefresh={setRefresh} />
            {isOwner && <AdminPanel web3={web3} account={account} contract={contract} refresh={refresh} setRefresh={setRefresh} />}
            <TransactionHistory web3={web3} account={account} contract={contract} refresh={refresh} />
          </>
        ) : (
          <div className="text-center">
            <button
              onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
