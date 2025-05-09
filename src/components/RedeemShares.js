import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const RedeemShares = ({ web3, account, contract, refresh, setRefresh }) => {
  const [plstrAmount, setPlstrAmount] = useState('');
  const [vplsReceived, setVplsReceived] = useState('0');
  const [plstrBalance, setPlstrBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (web3 && account && contract) {
        const bal = await contract.methods.balanceOf(account).call();
        setPlstrBalance(web3.utils.fromWei(bal, 'ether'));
      }
    };
    fetchBalance();
  }, [web3, account, contract, refresh]);

  useEffect(() => {
    const calculateVpls = async () => {
      if (web3 && contract && plstrAmount) {
        try {
          const amountWei = web3.utils.toWei(plstrAmount, 'ether');
          const vpls = await contract.methods.getRedeemableStakedPLS(account, amountWei).call();
          setVplsReceived(web3.utils.fromWei(vpls, 'ether'));
        } catch {
          setVplsReceived('0');
        }
      } else {
        setVplsReceived('0');
      }
    };
    calculateVpls();
  }, [web3, contract, plstrAmount]);

  const handleRedeem = async () => {
    if (!plstrAmount || Number(plstrAmount) <= 0) return alert('Enter a valid amount');
    try {
      const amountWei = web3.utils.toWei(plstrAmount, 'ether');
      await contract.methods.redeemShares(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setPlstrAmount('');
      alert('Shares redeemed successfully');
    } catch (error) {
      console.error(error);
      alert('Transaction failed');
    }
  };

  return (
    <section className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Redeem PLSTR</h2>
      <p><strong>PLSTR Balance:</strong> {formatNumber(plstrBalance)} PLSTR</p>
      <div className="mt-4">
        <label className="block mb-2">PLSTR Amount to Redeem</label>
        <input
          type="number"
          value={plstrAmount}
          onChange={(e) => setPlstrAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white"
          placeholder="Enter PLSTR amount"
        />
        <p className="mt-2"><strong>vPLS to Receive:</strong> {formatNumber(vplsReceived)} vPLS</p>
        <button
          onClick={handleRedeem}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Redeem PLSTR
        </button>
      </div>
    </section>
  );
};

export default RedeemShares;
