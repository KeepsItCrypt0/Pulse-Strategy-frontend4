import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const RedeemShares = ({ web3, account, contract, refresh, setRefresh }) => {
  const [plstrAmount, setPlstrAmount] = useState('');
  const [vplsReceived, setVplsReceived] = useState('0');
  const [plstrBalance, setPlstrBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (web3 && account && contract) {
          const bal = await contract.methods.balanceOf(account).call();
          setPlstrBalance(web3.utils.fromWei(bal, 'ether'));
        }
      } catch (err) {
        console.error('RedeemShares balance error:', err);
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
    setLoading(true);
    try {
      const amountWei = web3.utils.toWei(plstrAmount, 'ether');
      await contract.methods.redeemShares(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setPlstrAmount('');
      alert('Shares redeemed successfully');
    } catch (error) {
      console.error('RedeemShares error:', error);
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card animate-fadeIn">
      <h2 className="text-2xl mb-6">Redeem PLSTR</h2>
      <p><strong>PLSTR Balance:</strong> {formatNumber(plstrBalance)} PLSTR</p>
      <div className="mt-6 space-y-4">
        <label className="block">PLSTR Amount to Redeem</label>
        <input
          type="number"
          value={plstrAmount}
          onChange={(e) => setPlstrAmount(e.target.value)}
          className="input"
          placeholder="Enter PLSTR amount"
          disabled={loading}
        />
        <p><strong>vPLS to Receive:</strong> {formatNumber(vplsReceived)} vPLS</p>
        <button
          onClick={handleRedeem}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Redeem PLSTR'}
        </button>
      </div>
    </section>
  );
};

export default RedeemShares;
