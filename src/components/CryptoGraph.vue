<template>
  <section class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ ticker?.name }} - USD
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        v-for="(bar, idx) in normalizedGraph"
        v-bind:key="idx"
        :style="{
          height: `${bar}%`,
          width: `${singleGraphColumnWidth}px`,
        }"
        class="bg-purple-800 border"
      ></div>
      <remove-selected-graph @click="$emit('removeSelectedGraph')" />
    </div>
  </section>
</template>

<script>
import RemoveSelectedGraph from "./RemoveSelectedGraph.vue";

export default {
  components: {
    RemoveSelectedGraph,
  },

  data() {
    return {
      maxGraphElements: null,
    };
  },
  props: {
    ticker: {
      type: Object,
      required: false,
    },
    singleGraphColumnWidth: {
      type: Number,
      required: false,
    },

    graph: {
      type: Array,
      required: false,
    },
  },

  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return;
      this.maxGraphElements =
        this.$refs.graph.clientWidth / this.singleGraphColumnWidth;
      this.$emit("setMaxGraphElements", this.maxGraphElements);
    },
  },
  watch: {
    graph: {
      handler() {
			console.log(this.normalizedGraph);
        if (!this.graph.length) {
          this.calculateMaxGraphElements();
        }
      },
      deep: true,
    },
  },

  computed: {
    maxValue() {
      return Math.max(...this.graph);
    },
    minValue() {
      return Math.min(...this.graph);
    },
    compareValues() {
      return this.graph.map(() => 50);
    },
    normalizedGraph() {
      return this.graph.map(
        (price) =>
          5 + ((price - this.minValue) * 95) / (this.maxValue - this.minValue)
      );
    },
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },
};
</script>
