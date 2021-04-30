export const getAccounts = provider =>
  provider.request({ method: "eth_accounts" });
