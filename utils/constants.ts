const websocketApiKey = "27ca58cfd0bee254379e6b78c8009fd85d3052ab643f58663c5e542d02d369b2";
export const websocketUrl = "wss://streamer.cryptocompare.com/v2?api_key=" + websocketApiKey;
export const historyApi = "https://min-api.cryptocompare.com/data/histominute?fsym=WBTC&tsym=USD&limit=2000";
export const marketInfoApi = "https://min-api.cryptocompare.com/data/subsWatchlist?fsyms=WBTC&tsym=USD&" + websocketApiKey;