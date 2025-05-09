import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const WalletInfo = ({ web3, account, contract, vplsContract, refresh }) => {
  const [plstrBalance, setPlstrBalance] = useState('0');
  const [vplsBalance, setVplsBalance] = useState('0');
  const [redeemableVpls, setRedeemableVpls] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (web3 && account && contract && vplsContract) {
          const plstrBal = await contract.methods.balanceOf(account).call();
          const vplsBal = await vplsContract.methods.balanceOf(account).call();
          const shareInfo = await contract.methods.getUserShareInfo(account).call();
          const redeemable = await contract.methods.getRedeemableStakedPLS(account, shareInfo.shareBalance).call();

          setPlstrBalance(web3.utils.fromWei(plstrBal, 'ether'));
          setVplsBalance(web3.utils.fromWei(vplsBal, 'ether'));
          setRedeemableVpls(web3.utils.fromWei(redeemable, 'ether'));
        }
      } catch (err) {
        console.error('WalletInfo error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [web3, account, contract, vplsContract, refresh]);

  return (
    <section className="card animate-fadeIn">
      <h2 className="text-2xl mb-6">Wallet Information</h2>
      {loading ? (
        <p className="text-gray-400">Loading wallet data...</p>
      ) : (
        <div className="space-y-4">
          <p><strong>Address:</strong> {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p><strong>PLSTR Balance:</strong> {formatNumber(plstrBalance)} PLSTR</p>
          <p><strong>vPLS Balance:</strong> {formatNumber(vplsBalance)} vPLS</p>
          <p><strong>Redeemable vPLS:</strong> {formatNumber(redeemableVpls)} vPLS</p>
        </div>
      )}
    </section>
  );
};

export default WalletInfo;
