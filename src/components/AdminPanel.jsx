import { useState, useEffect } from 'react';
import { formatNumber, formatDate } from '../utils';

const AdminPanel = ({ web3, account, contract, refresh, setRefresh }) => {
  const [mintAmount, setMintAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [recoverToken, setRecoverToken] = useState('');
  const [recoverRecipient, setRecoverRecipient] = useState('');
  const [recoverAmount, setRecoverAmount] = useState('');
  const [nextMintTime, setNextMintTime] = useState('0');
  const [mintedPlstr, setMintedPlstr] = useState('0');
  const [depositedVpls, setDepositedVpls] = useState('0');
  const [lastMintTime, setLastMintTime] = useState('0');
  const [lastDepositTime, setLastDepositTime] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (web3 && contract) {
          const mintInfo = await contract.methods.getOwnerMintInfo().call();
          setNextMintTime(formatDate(Number(mintInfo.nextMintTime) * 1000));

          const mintEvents = await contract.getPastEvents('SharesMinted', { fromBlock: 0 });
          const depositEvents = await contract.getPastEvents('StakedPLSDeposited', { fromBlock: 0 });

          const totalMinted = mintEvents.reduce((sum, event) => sum + Number(web3.utils.fromWei(event.returnValues.amount, 'ether')), 0);
          const totalDeposited = depositEvents.reduce((sum, event) => sum + Number(web3.utils.fromWei(event.returnValues.amount, 'ether')), 0);

          setMintedPlstr(totalMinted);
          setDepositedVpls(totalDeposited);

          const lastMint = mintEvents[mintEvents.length - 1];
          const lastDeposit = depositEvents[depositEvents.length - 1];
          setLastMintTime(lastMint ? formatDate(Number(lastMint.returnValues.timestamp) * 1000) : 'Never');
          setLastDepositTime(lastDeposit ? formatDate(Number(lastDeposit.returnValues.timestamp) * 1000) : 'Never');
        }
      } catch (err) {
        console.error('AdminPanel error:', err);
      }
    };
    fetchData();
  }, [web3, contract, refresh]);

  const handleMint = async () => {
    if (!mintAmount) return alert('Enter a valid amount');
    setLoading(true);
    try {
      const amountWei = web3.utils.toWei(mintAmount, 'ether');
      await contract.methods.mintShares(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setMintAmount('');
      alert('Shares minted successfully');
    } catch (error) {
      console.error('Mint error:', error);
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return alert('Enter a valid amount');
    setLoading(true);
    try {
      const amountWei = web3.utils.toWei(depositAmount, 'ether');
      await contract.methods.depositStakedPLS(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setDepositAmount('');
      alert('vPLS deposited successfully');
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!recoverToken || !recoverRecipient || !recoverAmount) return alert('Fill all fields');
    setLoading(true);
    try {
      const amountWei = web3.utils.toWei(recoverAmount, 'ether');
      await contract.methods.recoverTokens(recoverToken, recoverRecipient, amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setRecoverToken('');
      setRecoverRecipient('');
      setRecoverAmount('');
      alert('Tokens recovered successfully');
    } catch (error) {
      console.error('Recover error:', error);
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card animate-fadeIn">
      <h2 className="text-2xl mb-6">Admin Panel</h2>
      <div className="space-y-4">
        <p><strong>Next Mint Available:</strong> {nextMintTime}</p>
        <p><strong>Total PLSTR Minted by Owner:</strong> {formatNumber(mintedPlstr)} PLSTR</p>
        <p><strong>Total vPLS Deposited by Owner:</strong> {formatNumber(depositedVpls)} vPLS</p>
        <p><strong>Last Mint:</strong> {lastMintTime}</p>
        <p><strong>Last Deposit:</strong> {lastDepositTime}</p>

        <div className="mt-6">
          <h3 className="text-xl mb-4">Mint PLSTR</h3>
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="input"
            placeholder="Enter PLSTR amount"
            disabled={loading}
          />
          <button
            onClick={handleMint}
            className="btn-primary mt-4"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Mint PLSTR'}
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-xl mb-4">Deposit vPLS</h3>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input"
            placeholder="Enter vPLS amount"
            disabled={loading}
          />
          <button
            onClick={handleDeposit}
            className="btn-primary mt-4"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Deposit vPLS'}
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-xl mb-4">Recover Tokens</h3>
          <input
            type="text"
            value={recoverToken}
            onChange={(e) => setRecoverToken(e.target.value)}
            className="input"
            placeholder="Token Address"
            disabled={loading}
          />
          <input
            type="text"
            value={recoverRecipient}
            onChange={(e) => setRecoverRecipient(e.target.value)}
            className="input mt-4"
            placeholder="Recipient Address"
            disabled={loading}
          />
          <input
            type="number"
            value={recoverAmount}
            onChange={(e) => setRecoverAmount(e.target.value)}
            className="input mt-4"
            placeholder="Amount"
            disabled={loading}
          />
          <button
            onClick={handleRecover}
            className="btn-primary mt-4"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Recover Tokens'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
