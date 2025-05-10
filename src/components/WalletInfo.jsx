import { useState, useEffect } from 'react';
import { formatEther } from './utils';

const WalletInfo = ({ web3, account, contract, vplsContract, refresh }) => {
  const [ethBalance, setEthBalance] = useState('0');
  const [vplsBalance, setVplsBalance] = useState('0');
  const [stakedPLS, setStakedPLS] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!web3 || !account || !contract || !vplsContract) {
        setError('Web3 or contract not initialized');
        return;
      }

      try {
        const ethBal = await web3.eth.getBalance(account);
        setEthBalance(formatEther(ethBal));

        const vplsBal = await vplsContract.methods.balanceOf(account).call();
        setVplsBalance(formatEther(vplsBal));

        const staked = await contract.methods.getRedeemableStakedPLS(account).call();
        setStakedPLS(formatEther(staked));

        setError(null);
      } catch (err) {
        console.error('WalletInfo error:', err);
        setError('Failed to fetch balances. Please try again.');
      }
    };

    fetchBalances();
  }, [web3, account, contract, vplsContract, refresh]);

  if (error) {
    return <div className="text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Wallet Info</h2>
      <p><strong>Address:</strong> {account}</p>
      <p><strong>ETH Balance:</strong> {ethBalance} ETH</p>
      <p><strong>vPLS Balance:</strong> {vplsBalance} vPLS</p>
      <p><strong>Staked PLS:</strong> {stakedPLS} PLS</p>
    </div>
  );
};

export default WalletInfo;
