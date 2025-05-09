import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const IssueShares = ({ web3, account, contract, vplsContract, refresh, setRefresh }) => {
  const [vplsAmount, setVplsAmount] = useState('');
  const [plstrReceived, setPlstrReceived] = useState('0');
  const [fee, setFee] = useState('0');
  const [vplsBalance, setVplsBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (web3 && account && vplsContract) {
        const bal = await vplsContract.methods.balanceOf(account).call();
        setVplsBalance(web3.utils.fromWei(bal, 'ether'));
      }
    };
    fetchBalance();
  }, [web3, account, vplsContract, refresh]);

  useEffect(() => {
    const calculateShares = async () => {
      if (web3 && contract && vplsAmount) {
        try {
          const amountWei = web3.utils.toWei(vplsAmount, 'ether');
          const [shares, fee] = await contract.methods.calculateSharesReceived(amountWei).call();
          setPlstrReceived(web3.utils.fromWei(shares, 'ether'));
          setFee(web3.utils.fromWei(fee, 'ether'));
        } catch {
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
    try {
      const amountWei = web3.utils.toWei(vplsAmount, 'ether');
      await vplsContract.methods.approve(contract._address, amountWei).send({ from: account });
      await contract.methods.issueShares(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setVplsAmount('');
      alert('Shares issued successfully');
    } catch (error) {
      console.error(error);
      alert('Transaction failed');
    }
  };

  return (
    <section className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Issue PLSTR</h2>
      <p><strong>vPLS Balance:</strong> {formatNumber(vplsBalance)} vPLS</p>
      <div className="mt-4">
        <label className="block mb-2">vPLS Amount to Deposit</label>
        <input
          type="number"
          value={vplsAmount}
          onChange={(e) => setVplsAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white"
          placeholder="Enter vPLS amount"
        />
        <p className="text-sm mt-2">Minimum 2000 PLSTR issuance required</p>
        <p className="mt-2"><strong>PLSTR to Receive:</strong> {formatNumber(plstrReceived)} PLSTR</p>
        <p><strong>Fee (0.5%):</strong> {formatNumber(fee)} vPLS</p>
        <button
          onClick={handleIssue}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Issue PLSTR
        </button>
      </div>
    </section>
  );
};

export default IssueShares;
