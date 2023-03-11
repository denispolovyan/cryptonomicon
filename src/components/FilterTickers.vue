<template>
  <div>
    <p class="mb-2 block text-sm font-medium text-gray-700">Фільтр</p>
    <input
      v-model="filter"
      type="text"
      class="block w-60 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
      placeholder="Введіть першу літеру"
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
  </div>
</template>

<script>
export default {
  props: {
    tickersProp: {
      type: Array,
      required: true,
    },
  },

  data: () => {
    return {
      filter: "",
      tickers: [],
      page: 1,
    };
  },
  computed: {
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
  },

  methods: {
    paginatedTickers() {
      const paginatedTickers = this.filteredTickers.slice(
        this.startIndex,
        this.endIndex
      );
      this.$emit("setPaginatedTickers", paginatedTickers);
    },
  },

  watch: {
    filter() {
      this.page = 1;
      this.paginatedTickers();
    },
    tickersProp() {
      this.tickers = this.tickersProp;
      this.paginatedTickers();
      this.filter = "";
    },
    paginatedTickers() {
      if (!this.paginatedTickers.length && this.page > 1) {
        this.page = this.page - 1;
      }
    },
    page() {
      this.paginatedTickers();
    },
  },

  mounted() {
    this.tickers = this.tickersProp;
    this.paginatedTickers();
  },
};
</script>
