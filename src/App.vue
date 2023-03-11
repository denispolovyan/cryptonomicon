<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <preload-gif />
    <div class="container">
      <add-ticker
        @add-ticker="add"
        :disabled="tooManyTickersAdded"
        :tickers="tickers"
      />
      <template v-if="tickers.length">
        <filter-tickers
          :tickersProp="tickers"
          @setPaginatedTickers="setPaginatedTickers"
        />
        <hr class="w-full border-t border-gray-600 my-4" />
        <ticker-card
          :paginatedTickers="paginatedTickers"
          :currentTicker="selectedTicker"
          @handleDelete="handleDelete"
          @selectedTicker="selectTicker"
        />
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <crypto-graph
        ref="graph"
        v-if="selectedTicker"
        :ticker="selectedTicker"
        :singleGraphColumnWidth="singleGraphColumnWidth"
        :graph="graph"
        @removeSelectedGraph="removeSelectedTicker"
        @setMaxGraphElements="setMaxGraphElements"
      />
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeToTicker } from "./api";

import PreloadGif from "./components/PreloadGif.vue";
import AddTicker from "./components/AddTicker.vue";
import CryptoGraph from "./components/CryptoGraph.vue";
import TickerCard from "./components/TickerCard.vue";
import FilterTickers from "./components/FilterTickers.vue";

export default {
  name: "App",

  components: {
    AddTicker,
    CryptoGraph,
    TickerCard,
    PreloadGif,
    FilterTickers,
  },

  data() {
    return {
      tickers: [],
      graph: [],
      loader: [],
      singleGraphColumnWidth: 40,
      maxTickerLength: 20,
      paginatedTickers: null,
      maxGraphElements: null,
      selectedTicker: null,
    };
  },
  created() {
    const tickersData = localStorage.getItem("cryptonomicon-list");
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) => {
          this.updateTicker(ticker.name, newPrice);
        });
      });
    }
  },

  computed: {
    tooManyTickersAdded() {
      return this.tickers.length > this.maxTickerLength;
    },
  },
  
  methods: {
    setPaginatedTickers(paginatedTickers) {
      this.paginatedTickers = paginatedTickers;
    },
    removeSelectedTicker() {
      this.selectedTicker = null;
    },
    setMaxGraphElements(maxGraphElements) {
      this.maxGraphElements = maxGraphElements;
    },
    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name == tickerName)
        .forEach((t) => {
          t.price = price;
          this.graph.push(price);
          if (t == this.selectedTicker) {
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
        });
    },
    formatPrice(price) {
      if (!price) {
        return "-";
      }
      const normalizedPrice =
        price > 1 ? price.toFixed(2) : price.toPrecision(2);
      return normalizedPrice;
    },
    add(ticker) {
      const currentTicker = {
        name: ticker,
        price: "--",
      };

      if (ticker && this.findCoincidence(ticker)) {
        subscribeToTicker(currentTicker.name, (newPrice) => {
          this.updateTicker(currentTicker.name, newPrice);
        });

        this.tickers = [...this.tickers, currentTicker];
        //   this.filter = "";
        localStorage.setItem(
          "cryptonomicon-list",
          JSON.stringify(this.tickers)
        );
      } else return;

    },
    handleDelete(elementToDelete) {
      this.tickers = this.tickers.filter((t) => t != elementToDelete);
      unsubscribeToTicker(elementToDelete.name);
    },
    findCoincidence(tickerName) {
      let coincidence = this.tickers.filter((t) => t.name == tickerName);
      return coincidence.length ? false : true;
    },
    selectTicker(ticker) {
      this.selectedTicker = ticker;
    },
  },

  watch: {
    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
    selectedTicker() {
      this.graph = [];
    },
  },
};
</script>
