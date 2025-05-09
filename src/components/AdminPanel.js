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

  useEffect(() => {
    const fetchData = async () => {
      if (web3 && contract) {
        const mintInfo = await contract.methods.getOwnerMintInfo().call();
        setNextMintTime(formatDate(Number(mintInfo.nextMintTime) * 1000));

        // Fetch events for minted PLSTR and deposited vPLS
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
    };
    fetchData();
  }, [web3, contract, refresh]);

  const handleMint = async () => {
    if (!mintAmount) return alert('Enter a valid amount');
    try {
      const amountWei = web3.utils.toWei(mintAmount, 'ether');
      await contract.methods.mintShares(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setMintAmount('');
      alert('Shares minted successfully');
    } catch (error) {
      console.error(error);
      alert('Transaction failed');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return alert('Enter a valid amount');
    try {
      const amountWei = web3.utils.toWei(depositAmount, 'ether');
      await contract.methods.depositStakedPLS(amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setDepositAmount('');
      alert('vPLS deposited successfully');
    } catch (error) {
      console.error(error);
      alert('Transaction failed');
    }
  };

  const handleRecover = async () => {
    if (!recoverToken || !recoverRecipient || !recoverAmount) return alert('Fill all fields');
    try {
      const amountWei = web3.utils.toWei(recoverAmount, 'ether');
      await contract.methods.recoverTokens(recoverToken, recoverRecipient, amountWei).send({ from: account });
      setRefresh(prev => prev + 1);
      setRecoverToken('');
      setRecoverRecipient('');
      setRecoverAmount('');
      alert('Tokens recovered successfully');
    } catch (error) {
      console.error(error);
      alert('Transaction failed');
    }
  };

  return (
    <section className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
      <p><strong>Next Mint Available:</strong> {nextMintTime}</p>
      <p><strong>Total PLSTR Minted by Owner:</strong> {formatNumber(mintedPlstr)} PLSTR</p>
      <p><strong>Total vPLS Deposited by Owner:</strong> {formatNumber(depositedVpls)} vPLS</p>
      <p><strong>Last Mint:</strong> {lastMintTime}</p>
      <p><strong>Last Deposit:</strong> {lastDepositTime}</p>

      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Mint PLSTR</h3>
        <input
          type="number"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white"
          placeholder="Enter PLSTR amount"
        />
        <button
          onClick={handleMint}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Mint PLSTR
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Deposit vPLS</h3>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white"
          placeholder="Enter vPLS amount"
        />
        <button
          onClick={handleDeposit}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Deposit vPLS
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Recover Tokens</h3>
        <input
          type="text"
          value={recoverToken}
          onChange={(e) => setRecoverToken(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white"
          placeholder="Token Address"
        />
        <input
          type="text"
          value={recoverRecipient}
          onChange={(e) => setRecoverRecipient(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white mt-2"
          placeholder="Recipient Address"
        />
        <input
          type="number"
          value={recoverAmount}
          onChange={(e) => setRecoverAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 text-white mt-2"
          placeholder="Amount"
        />
        <button
          onClick={handleRecover}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Recover Tokens
        </button>
      </div>
    </section>
  );
};

export default AdminPanel;
