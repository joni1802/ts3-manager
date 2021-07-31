import Chart from "chart.js/auto";
import store from "@/store";

export default {
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    darkMode() {
      return store.state.settings.darkMode;
    },
  },
  methods: {
    renderChart(ctx, options) {
      if (this.darkMode) {
        Chart.defaults.scale.grid.color = "#4c5067"; // the grid color
        Chart.defaults.scale.grid.borderColor = "#4c5067"; // x and y axis color
        Chart.defaults.backgroundColor = "#ff79c6"; // dots color in line chart and label background color
        Chart.defaults.borderColor = "#ff79c6"; // line/bar color and label border color
        Chart.defaults.color = "#ffffff"; // text color (y and x axis)
      } else {
        Chart.defaults.scale.grid.color = "rgba(0,0,0,0.1)";
        Chart.defaults.scale.grid.borderColor = "rgba(0,0,0,0.1)";
        Chart.defaults.backgroundColor = "#82B1FF";
        Chart.defaults.borderColor = "#82B1FF";
        Chart.defaults.color = "#000000";
      }

      this.chart = new Chart(ctx, options);
    },
  },
  watch: {
    darkMode(isEnabled) {
      if (isEnabled) {
        this.chart.data.datasets[0].backgroundColor = "#ff79c6"; // dots color in line chart and label background color
        this.chart.data.datasets[0].borderColor = "#ff79c6"; // line/bar color and label border color

        this.chart.options.scales.y.grid.color = "#4c5067"; // grid color y axis
        this.chart.options.scales.x.grid.color = "#4c5067"; // grid color x axis
        this.chart.options.scales.y.grid.borderColor = "#4c5067"; // y axis color
        this.chart.options.scales.x.grid.borderColor = "#4c5067"; // x axis color

        this.chart.options.scales.y.ticks.color = "#ffffff"; // text color y axis
        this.chart.options.scales.x.ticks.color = "#ffffff"; // text color x axis

        this.chart.options.plugins.legend.labels.color = "#ffffff"; // text color label
      } else {
        this.chart.data.datasets[0].backgroundColor = "#82B1FF";
        this.chart.data.datasets[0].borderColor = "#82B1FF";

        this.chart.options.scales.y.grid.color = "rgba(0,0,0,0.1)";
        this.chart.options.scales.x.grid.color = "rgba(0,0,0,0.1)";
        this.chart.options.scales.y.grid.borderColor = "rgba(0,0,0,0.1)";
        this.chart.options.scales.x.grid.borderColor = "rgba(0,0,0,0.1)";

        this.chart.options.scales.y.ticks.color = "#000000";
        this.chart.options.scales.x.ticks.color = "#000000";

        this.chart.options.plugins.legend.labels.color = "#000000";
      }

      this.chart.update();
    },
  },
};
