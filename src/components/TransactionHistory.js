import { useState, useEffect } from 'react';
import { formatNumber, formatDate } from '../utils';

const TransactionHistory = ({ web3, account, contract, refresh }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
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
        setTransactions(txs.reverse().slice(0, 10)); // Show last 10 transactions
      }
    };
    fetchTransactions();
  }, [web3, account, contract, refresh]);

  return (
    <section className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
      {transactions.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Type</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Date</th>
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
        <p>No transactions found</p>
      )}
    </section>
  );
};

export default TransactionHistory;
