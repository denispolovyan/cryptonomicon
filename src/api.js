const API_KEY =
  "c3d9e7f2d667ef49e6d841bcce9c57264551b304fbbc580037e992a6563ecc86";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const tickersHandlers = new Map();

const AGGREGATE_INDEX = 5;

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);


  if (type != AGGREGATE_INDEX) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendMessageToWs(message) {
  let stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWS(ticker) {
  sendMessageToWs({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeToTickerOnWS(ticker) {
  sendMessageToWs({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWS(ticker);
};

export const unsubscribeToTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeToTickerOnWS(ticker);
};

export async function loadRequiredList() {
  return await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  )
    .then((data) => data.json())
    .then((data) => {
      let arr = [];
      Object.keys(data.Data).forEach((key) => {
        arr.push(key);
      });
      return arr;
    });
}
