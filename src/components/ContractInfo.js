import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const ContractInfo = ({ web3, contract, vplsContract, refresh }) => {
  const [contractBalance, setContractBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [backingRatio, setBackingRatio] = useState('0');
  const [remainingIssuance, setRemainingIssuance] = useState('0');

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, [web3, contract, vplsContract, refresh]);

  return (
    <section className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Contract Information</h2>
      <p><strong>vPLS in Contract:</strong> {formatNumber(contractBalance)} vPLS</p>
      <p><strong>PLSTR Issued:</strong> {formatNumber(totalSupply)} PLSTR</p>
      <p><strong>vPLS Backing Ratio:</strong> {backingRatio} vPLS : 1 PLSTR</p>
      <p><strong>Issuance Period Remaining:</strong> {remainingIssuance} days</p>
      <p>
        <strong>PLSTR Contract:</strong>{' '}
        <a href="https://etherscan.io/address/0x6c1dA678A1B615f673208e74AB3510c22117090e" target="_blank" className="text-blue-400">
          {`${PLSTR_ADDRESS.slice(0, 6)}...${PLSTR_ADDRESS.slice(-4)}`}
        </a>
      </p>
      <p>
        <strong>vPLS Contract:</strong>{' '}
        <a href="https://etherscan.io/token/0x0181e249c507d3b454dE2444444f0Bf5dBE72d09" target="_blank" className="text-blue-400">
          {`${VPLS_ADDRESS.slice(0, 6)}...${VPLS_ADDRESS.slice(-4)}`}
        </a>
      </p>
    </section>
  );
};

export default ContractInfo;
