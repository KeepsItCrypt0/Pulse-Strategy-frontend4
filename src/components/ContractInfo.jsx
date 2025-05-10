import { useState, useEffect } from 'react';
import { formatEther } from './utils';

const ContractInfo = ({ web3, contract, vplsContract, refresh }) => {
  const [totalStaked, setTotalStaked] = useState('0');
  const [vplsSupply, setVplsSupply] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContractData = async () => {
      if (!web3 || !contract || !vplsContract) {
        setError('Web3 or contract not initialized');
        return;
      }

      try {
        // Replace with actual contract method if available
        const staked = await contract.methods.totalStaked().call();
        setTotalStaked(formatEther(staked));

        const supply = await vplsContract.methods.totalSupply().call();
        setVplsSupply(formatEther(supply));

        setError(null);
      } catch (err) {
        console.error('ContractInfo error:', err);
        setError('Failed to fetch contract data. Please try again.');
      }
    };

    fetchContractData();
  }, [web3, contract, vplsContract, refresh]);

  if (error) {
    return <div className="text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Contract Info</h2>
      <p><strong>Total Staked PLS:</strong> {totalStaked} PLS</p>
      <p><strong>vPLS Total Supply:</strong> {vplsSupply} vPLS</p>
    </div>
  );
};

export default ContractInfo;
