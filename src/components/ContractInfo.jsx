import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const PLSTR_ADDRESS = '0x6c1dA678A1B615f673208e74AB3510c22117090e';
const VPLS_ADDRESS = '0x0181e249c507d3b454dE2444444f0Bf5dBE72d09';

const ContractInfo = ({ web3, contract, vplsContract, refresh }) => {
  const [contractBalance, setContractBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [backingRatio, setBackingRatio] = useState('0');
  const [remainingIssuance, setRemainingIssuance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (web3 && contract && vplsContract) {
          const info = await contract.methods.getContractInfo().call();
          const supply = await contract.methods.totalSupply().call();
          const ratio = await contract.methods.getVPLSBackingRatio().call();
          const vplsBal = await vplsContract.methods.balanceOf(contract._address).call();

          setContractBalance(web3.utils.fromWei(vplsBal, 'ether'));
          setTotalSupply(web3.utils.fromWei(supply, 'ether'));
          setBackingRatio((Number(ratio) / 1e18).toFixed(2));
          setRemainingIssuance(Math.max(0, Math.floor(Number(info.remainingIssuancePeriod) / 86400)));
        }
      } catch (err) {
        console.error('ContractInfo error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [web3, contract, vplsContract, refresh]);

  return (
    <section className="card animate-fadeIn">
      <h2 className="text-2xl mb-6">Contract Information</h2>
      {loading ? (
        <p className="text-gray-400">Loading contract data...</p>
      ) : (
        <div className="space-y-4">
          <p><strong>vPLS in Contract:</strong> {formatNumber(contractBalance)} vPLS</p>
          <p><strong>PLSTR Issued:</strong> {formatNumber(totalSupply)} PLSTR</p>
          <p><strong>vPLS Backing Ratio:</strong> {backingRatio} vPLS : 1 PLSTR</p>
          <p><strong>Issuance Period Remaining:</strong> {remainingIssuance} days</p>
          <p>
            <strong>PLSTR Contract:</strong>{' '}
            <a href={`https://etherscan.io/address/${PLSTR_ADDRESS}`} target="_blank" rel="noopener noreferrer">
              {`${PLSTR_ADDRESS.slice(0, 6)}...${PLSTR_ADDRESS.slice(-4)}`}
            </a>
          </p>
          <p>
            <strong>vPLS Contract:</strong>{' '}
            <a href={`https://etherscan.io/token/${VPLS_ADDRESS}`} target="_blank" rel="noopener noreferrer">
              {`${VPLS_ADDRESS.slice(0, 6)}...${VPLS_ADDRESS.slice(-4)}`}
            </a>
          </p>
        </div>
      )}
    </section>
  );
};

export default ContractInfo;
