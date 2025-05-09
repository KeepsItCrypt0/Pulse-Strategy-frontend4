import { useState, useEffect } from 'react';
import { formatNumber, formatDate } from '../utils';

const TransactionHistory = ({ web3, account, contract, refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (web3 && account && contract) {
          const events = await contract.getPastEvents('allEvents', {
            filter: { buyer: account, redeemer: account },
            fromBlock: 0
          });
          const txs = events.map(event => ({
            type: event.event,
            amount: event.returnValues.shares
              ? formatNumber(web3.utils.fromWei(event.returnValues.shares, 'ether'))
              : formatNumber(web3.utils.fromWei(event.returnValues.stakedPLS, 'ether')),
            timestamp: formatDate(Number(event.returnValues.timestamp) * 1000)
          }));
          setTransactions(txs.reverse().slice(0, 10));
        }
      } catch (err) {
        console.error('TransactionHistory error:', err);
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [web3, account, contract, refresh]);

  return (
    <section className="card animate-fadeIn">
      <h2 className="mb-6">Transaction History</h2>
      {loading ? (
        <p className="text-gray-400">Loading transactions...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i}>
                <td>{tx.type}</td>
                <td>{tx.amount} {tx.type.includes('Redeem') ? 'vPLS' : 'PLSTR'}</td>
                <td>{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-400">No transactions found</p>
      )}
    </section>
  );
};

export default TransactionHistory;
