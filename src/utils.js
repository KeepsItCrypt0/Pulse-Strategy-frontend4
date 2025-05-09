export const formatNumber = (num) => {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};
