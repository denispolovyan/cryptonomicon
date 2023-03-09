<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <preload-gif />
    <div class="container">
      <add-ticker
        @add-ticker="add"
        :disabled="tooManyTickersAdded"
        :tickers="getTickers"
      />
      <template v-if="tickers.length">
        <p class="mb-2 block text-sm font-medium text-gray-700">Фільтр</p>
        <input
          v-model="filter"
          type="text"
          class="block w-60 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
          placeholder="Введите первую букву"
        />
        <div>
          <button
            v-if="page > 1"
            v-on:click="page = page - 1"
            class="mr-4 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            v-if="nextPage"
            v-on:click="page = page + 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
          <ticker-card
            :tickers="tickers"
            :paginatedTickers="paginatedTickers"
            @handleDelete="handleDelete"
            @selectedTicker="selectTicker"
          />
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <crypto-graph
        v-if="selectedTicker"
        :ticker="getSelectedTicker"
        :singleGraphColumnWidth="getGraphWidth"
        :graph="getGraph"
        @removeSelectedGraph="selectedTicker = 0"
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

export default {
  name: "App",

  components: {
    AddTicker,
    CryptoGraph,
    TickerCard,
    PreloadGif,
  },

  data() {
    return {
		selectedTicker: null,
      tickers: [],
      graph: [],
      loader: [],
      filter: "",
      page: 1,
      singleGraphColumnWidth: 40,
		maxTickerLength: 20,
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
    getGraph() {
      return this.graph;
    },
    getGraphWidth() {
      return this.singleGraphColumnWidth;
    },
    getTickers() {
      return this.tickers;
    },
    getSelectedTicker() {
      return this.selectedTicker;
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    nextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    filteredTickers() {
      return this.tickers.filter((t) => t.name.includes(this.filter));
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
  },

  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return;
      this.maxGraphElements =
        this.$refs.graph.clientWidth / this.singleGraphColumnWidth;
    },
    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name == tickerName)
        .forEach((t) => {
          t.price = price;
          this.graph.push(price);
          //   console.log(this.graph);
          if (t == this.selectedTicker) {
            this.calculateMaxGraphElements();
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
      console.log(this.tickers.length);
      const currentTicker = {
        name: ticker,
        price: "--",
      };

      if (ticker && this.findCoincidence(ticker)) {
        subscribeToTicker(currentTicker.name, (newPrice) => {
          this.updateTicker(currentTicker.name, newPrice);
        });

        this.tickers = [...this.tickers, currentTicker];
        this.filter = "";
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
      if (coincidence.length) {
        return false;
      } else {
        return true;
      }
		
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
      //  this.$nextTick().then(this.calculateMaxGraphElements());
      this.graph = [];
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathName}?filter=${value.filter}&page=${value.page}`
      );
    },
    paginatedTickers() {
      if (!this.paginatedTickers.length && this.page > 1) {
        this.page = this.page - 1;
      }
    },
  },
};
</script>
