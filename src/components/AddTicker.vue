<template>
  <section>
    <div>
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тікер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            v-on:keydown.enter="add()"
            v-on:keydown="loadList()"
            v-on:click="(showPrompts = true), loadList(), clearErrorFields()"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Наприклад DOGE"
          />
        </div>
        <div
          v-on:click="loadList"
          v-if="cryptoNames.length && showPrompts"
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-if="cryptoNames[0]"
            v-on:click="setTicker(cryptoNames[0])"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ cryptoNames[0] }}
          </span>
          <span
            v-if="cryptoNames[1]"
            v-on:click="setTicker(cryptoNames[1])"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ cryptoNames[1] }}
          </span>
          <span
            v-if="cryptoNames[2]"
            v-on:click="setTicker(cryptoNames[2])"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ cryptoNames[2] }}
          </span>
          <span
            v-if="cryptoNames[3]"
            v-on:click="setTicker(cryptoNames[3])"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ cryptoNames[3] }}
          </span>
        </div>
        <div v-if="showRepeatMessage" class="text-sm text-red-600">
          Такий тікер вже існує
        </div>
        <div v-if="showEmptyInputMessage" class="text-sm text-red-600">
          Введіть значення в поле
        </div>
      </div>
    </div>
    <add-button class="" :disabled="disabled" v-on:click="add()" type="button" />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";
import { loadRequiredList } from "../api";

export default {
  components: {
    AddButton,
  },
  props: {
    tickers: {
      type: Array,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: {
    "add-ticker": {
      type: Boolean,
    },
  },

  data() {
    return {
      ticker: "",
      cryptoNames: [],
      showRepeatMessage: false,
      showEmptyInputMessage: false,
      showPrompts: false,
    };
  },

  methods: {
    add() {
      this.$emit("add-ticker", this.ticker);
      this.loadList();
      this.repeatCheck();
      this.inputCheck();
      this.ticker = "";
    },

    async loadList() {
      this.cryptoNames = await loadRequiredList(this.ticker);
      if (!this.ticker) {
        return;
      }
      this.sortPrompts();
    },

    repeatCheck() {
      this.showRepeatMessage = this.tickersCoincidence();
    },

    tickersCoincidence() {
      let coincidence = this.tickers.filter((t) => t.name == this.ticker);
      return coincidence.length ? true : false;
    },

    inputCheck() {
      this.showEmptyInputMessage = !this.ticker ? true : false;
    },

    sortPrompts() {
      this.cryptoNames = this.cryptoNames.filter((el) =>
        el.includes(this.ticker)
      );
    },
    clearErrorFields() {
      this.showRepeatMessage = false;
      this.showEmptyInputMessage = false;
    },

    setTicker(newTicker) {
      this.ticker = newTicker;
    },
  },
};
</script>
