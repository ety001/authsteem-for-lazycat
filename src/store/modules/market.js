import Vue from 'vue';
import axios from 'axios';
import Client from 'lightrpc';

const client = new Client('https://api.steemit.com');

const state = {
  ticker: {
    SBD: {},
  },
  orderBook: {
    SBD: {
      bids: [],
      asks: [],
    },
  },
  recentTrades: {
    SBD: [],
  },
  rate: {},
};

const mutations = {
  saveTicker(_state, { asset, result }) {
    if (result) {
      Vue.set(state.ticker, asset, result);
    }
  },
  saveOrderBook(_state, { asset, result }) {
    if (result) {
      Vue.set(state.orderBook, asset, result);
    }
  },
  saveRecentTrades(_state, { asset, result }) {
    if (result) {
      Vue.set(state.recentTrades, asset, result);
    }
  },
  saveRate(_state, result) {
    console.log(result);
    Vue.set(state, 'rate', result);
  },
};

const actions = {
  getTicker: ({ commit }, asset) => {
    client.call('get_ticker', [], (err, result) => {
      commit('saveTicker', { asset, result });
    });
  },
  getOrderBook: ({ commit }, asset) => {
    client.call('get_order_book', [500], (err, result) => {
      commit('saveOrderBook', { asset, result });
    });
  },
  getRecentTrades: ({ commit }, asset) => {
    client.call('get_recent_trades', [25], (err, result) => {
      commit('saveRecentTrades', { asset, result });
    });
  },
  cancelOrder: ({ dispatch }, orderId) => (
    new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`Order ${orderId} canceled`);
        dispatch('getOpenOrders');
        resolve();
      }, 2000);
    })
  ),
  getRate: ({ commit }) => {
    axios.get('https://api.coinmarketcap.com/v1/ticker/steem/').then((response) => {
      if (response.data && response.data[0] && response.data[0].price_btc) {
        commit('saveRate', response.data[0]);
      }
    }).catch(err => console.log(err));
  },
};

export default {
  state,
  mutations,
  actions,
};
