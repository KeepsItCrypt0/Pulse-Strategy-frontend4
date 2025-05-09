import { useState, useEffect } from 'react';
import { formatNumber } from '../utils';

const WalletInfo = ({ web3, account, contract, vplsContract, refresh }) => {
  const [plstrBalance, setPlstrBalance] = useState('0');
  const [vplsBalance, setVplsBalance] = useState('0');
  const [redeemableVpls, setRedeemableVpls] = useState('0');

  useEffect(() => {
    const fetchData = async () => {
      if (web3 && account && contract && vplsContract) {
        const plstrBal = await contract.methods.balanceOf(account).call();
        const vplsBal = await vplsContract.methods.balanceOf(account).call();
        const shareInfo = await contract.methods.getUserShareInfo(account).call();
        const redeemable = await contract.methods.getRedeemableStakedPLS(account, shareInfo.shareBalance).call();

        setPlstrBalance(web3.utils.fromWei(plstrBal, 'ether'));
        setVplsBalance(web3.utils.fromWei(vplsBal, 'ether'));
        setRedeemableVpls(web3.utils.fromWei(redeemable, 'ether'));
      }
    };
    fetchData();
  }, [web3, account, contract, vplsContract, refresh]);

  return (
    <section className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Wallet Information</h2>
      <p><strong>Address:</strong> {account}</p>
      <p><strong>PLSTR Balance:</strong> {formatNumber(plstrBalance)} PLSTR</p>
      <p><strong>vPLS Balance:</strong> {formatNumber(vplsBalance)} vPLS</p>
      <p><strong>Redeemable vPLS:</strong> {formatNumber(redeemableVpls)} vPLS</p>
    </section>
  );
};

export default WalletInfo;
