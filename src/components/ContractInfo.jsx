import { useState, useEffect } from 'react';
import { formatNumber, formatDate } from '../utils';

const PLSTR_ADDRESS = '0x6c1dA678A1B615f673208e74AB3510c22117090e';
const VPLS_ADDRESS = '0x0181e249c507d3b454dE2444444f0Bf5dBE72d09';

const ContractInfo = ({ web3, contract, vplsContract, refresh }) => {
  const [contractBalance, setContractBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [backingRatio, setBackingRatio] = useState('0');
  const [remainingIssuance, setRemainingIssuance] = useState('0');
  const [mintedPlstr, setMintedPlstr] = useState('0');
  const [depositedVpls, setDepositedVpls] = useState('0');
  const [lastMintTime, setLastMintTime] = useState('Never');
  const [lastDepositTime, setLastDepositTime] = useState('Never');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!web3 || !contract || !vplsContract) {
        throw new Error('Web3 or contract not initialized');
      }
      const info = await contract.methods.getContractInfo().call();
      const supply = await contract.methods.totalSupply().call();
      const ratio = await contract.methods.getVPLSBackingRatio().call();
      const vplsBal = await vplsContract.methods.balanceOf(contract._address).call();

      const mintEvents = await contract.getPastEvents('SharesMinted', { fromBlock: 0 });
      const depositEvents = await contract.getPastEvents('StakedPLSDeposited', { fromBlock: 0 });

      const totalMinted = mintEvents.reduce((sum, event) => sum + Number(web3.utils.fromWei(event.returnValues.amount, 'ether')), 0);
      const totalDeposited = depositEvents.reduce((sum, event) => sum + Number(web3.utils.fromWei(event.returnValues.amount, 'ether')), 0);

      const lastMint = mintEvents[mintEvents.length - 1];
      const lastDeposit = depositEvents[depositEvents.length - 1];

      setContractBalance(web3.utils.fromWei(vplsBal, 'ether'));
      setTotalSupply(web3.utils.fromWei(supply, 'ether'));
      setBackingRatio((Number(ratio) / 1e18).toFixed(2));
      setRemainingIssuance(Math.max(0, Math.floor(Number(info.remainingIssuancePeriod) / 86400)));
      setMintedPlstr(totalMinted);
      setDepositedVpls(totalDeposited);
      setLastMintTime(lastMint ? formatDate(Number(lastMint.returnValues.timestamp) * 1000) : 'Never');
      setLastDepositTime(lastDeposit ? formatDate(Number(lastDeposit.returnValues.timestamp) * 1000) : 'Never');
    } catch (err) {
      console.error('ContractInfo error:', err);
      setError('Failed to load contract data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [web3, contract, vplsContract, refresh]);

  return (
    <section className="card animate-fadeIn">
      <h2 className="mb-6">Contract Information</h2>
      {loading ? (
        <p className="text-gray-400">Loading contract data...</p>
      ) : error ? (
        <div>
          <p className="text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-4 btn-primary">Retry</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p><strong>vPLS in Contract:</strong> {formatNumber(contractBalance)} vPLS</p>
          <p><strong>PLSTR Issued:</strong> {formatNumber(totalSupply)} PLSTR</p>
          <p><strong>vPLS Backing Ratio:</strong> {backingRatio} vPLS : 1 PLSTR</p>
          <p><strong>Issuance Period Remaining:</strong> {remainingIssuance} days</p>
          <p><strong>Total PLSTR Minted by StrategyController:</strong> {formatNumber(mintedPlstr)} PLSTR</p>
          <p><strong>Total vPLS Deposited by StrategyController:</strong> {formatNumber(depositedVpls)} vPLS</p>
          <p><strong>Last Mint:</strong> {lastMintTime}</p>
          <p><strong>Last Deposit:</strong> {lastDepositTime}</p>
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
