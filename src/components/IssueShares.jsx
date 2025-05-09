import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const IssueShares = ({ web3, account, contract, vplsContract, refresh, setRefresh }) => {
  const [vplsAmount, setVplsAmount] = useState('');
  const [plstrReceived, setPlstrReceived] = useState('0');
  const [fee, setFee] = useState('0');
  const [vplsBalance, setVplsBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      if (web3 && account && vplsContract) {
        const bal = await vplsContract.methods.balanceOf(account).call();
        setVplsBalance(web3.utils.fromWei(bal, 'ether'));
      }
    } catch (err) {
      console.error('IssueShares balance error:', err);
      setError('Failed to load vPLS balance.');
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [web3, account, vplsContract, refresh]);

  useEffect(() => {
    const calculateShares = async () => {
      if (web3 && contract && vplsAmount && Number(vplsAmount) > 0) {
        try {
          const amountWei = web3.utils.toWei(vplsAmount, 'ether');
          const [shares, fee] = await contract.methods.calculateSharesReceived(amountWei).call();
          setPlstrReceived(web3.utils.fromWei(shares, 'ether'));
          setFee(web3.utils.fromWei(fee, 'ether'));
        } catch (err) {
          console.error('IssueShares calculation error:', err);
          setPlstrReceived('0');
          setFee('0');
        }
      } else {
        setPlstrReceived('0');
        setFee('0');
      }
    };
    calculateShares();
  }, [web3, contract, vplsAmount]);

  const handleIssue = async () => {
    if (!vplsAmount || Number(vplsAmount) <= 0) return alert('Enter a valid amount');
    setLoading(true);
    setError(null);
    try {
      const amountWei = web3.utils.toWei(vplsAmount, 'ether');
      await vplsContract.methods.approve(contract._address, amountWei).send({ from: account });
      await contract.methods.issueShares(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setVplsAmount('');
      alert('Shares issued successfully');
    } catch (error) {
      console.error('IssueShares error:', error);
      setError('Transaction failed. Check your wallet and network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card animate-fadeIn">
      <h2 className="mb-6">Issue PLSTR</h2>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <p><strong>vPLS Balance:</strong> {formatNumber(vplsBalance)} vPLS</p>
      <div className="mt-6 space-y-4">
        <label className="block">vPLS Amount to Deposit</label>
        <input
          type="number"
          value={vplsAmount}
          onChange={(e) => setVplsAmount(e.target.value)}
          className="input"
          placeholder="Enter vPLS amount"
          disabled={loading}
        />
        <p className="text-sm text-gray-400">Minimum 2000 PLSTR issuance required</p>
        <p><strong>PLSTR to Receive:</strong> {formatNumber(plstrReceived)} PLSTR</p>
        <p><strong>Fee (0.5%):</strong> {formatNumber(fee)} vPLS</p>
        <button
          onClick={handleIssue}
          className="btn-primary animate-glow"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Issue PLSTR'}
        </button>
      </div>
    </section>
  );
};

export default IssueShares;
