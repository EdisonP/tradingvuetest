<template>
  <trading-vue
    :data="chart"
    :width="width"
    :height="height"
    title-txt="BTCUSD"
    ref="tvjs"
    :toolbar="true"
    :color-back="colors.back"
    :color-grid="colors.grid"
    :color-text="colors.text"
    :color-title="colors.tvTitle"
  >
  </trading-vue>
</template>

<script>
import { TradingVue, DataCube, Constants, Utils } from "trading-vue-js";
import axios from "axios";
const URL = "https://wss.elcacamente.com/api/v1";

export default {
  name: "app",
  components: { TradingVue },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.loadData();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      chart: {},
      width: window.innerWidth - 50,
      height: window.innerHeight - 50,
      colors: {
        colorBack: "#fff",
        colorGrid: "#eee",
        colorText: "#333",
      },
    };
  },
  methods: {
    onResize(event) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    },
    ///////////////////////////////////////
    async loadData() {
      const now = Utils.now();
      const initialTime = now - Constants.DAY;

      // Loading charts with specific lookback period for initial load and more data will be loaded as user pans the chart to the edge
      var chartData = await this.loadChartData([initialTime, now]);
      const ohlcv = {
        type: "Candles",
        indexBased: false,
        data: chartData["chart.data"],
        tf: this.selectedTimeframe,
        settings: {
          upCandleHollow: true,
          lineWidth: 1,
        },
      };
      let dcObj = {};
      dcObj.chart = ohlcv;

      dcObj.offchart = [];
      dcObj.onchart = [];

      this.chart = new DataCube(dcObj);
      // This will handle the loading of data when user pans to the edge
      this.chart.onrange(this.loadChartData);
    },

    ///////////////////////////////////////
    async loadChartData(range) {
      const dataObj = {};

      const priceData = await this.getChartData("/fetchOhlc", range);
      if (priceData.length == 0) {
        this.loadOhlcvSuccess = false;
      }
      dataObj.priceData = priceData;

      return this.tech(dataObj);
    },

    async getChartData(route, range) {
      const [t1, t2] = range;
      const response = await axios.get(URL + route, {
        params: {
          exchange: "BITMEX",
          interval: "5m",
          symbol: "XBTUSD",
          startTime: t1,
          endTime: t2,
        },
        validateStatus: function (status) {
          return true;
        },
      });

      if (response.status === 200) {
        return response.data.reverse();
      } else {
        return [];
      }
    },

    ///////////////////////////////////////
    tech(dataObj) {
      return {
        "chart.data": dataObj.priceData,
        "OpenInterest.data": dataObj.oiData,
        "FundingRate.data": dataObj.fundingData,
        "Liquidations.data": dataObj.liquidationsData,
        "Volatility.data": dataObj.volatilityData,
        "BasePairFundingSizeData.data": dataObj.basePairFundingSizeData,
        "QuotePairFundingSizeData.data": dataObj.quotePairFundingSizeData,
        "BFXPositionSize.data": dataObj.bfxPositionSizeData,
        "IV.data": dataObj.ivData,
      };
    },

    /*       getSomething(URL){
        axios.get(URL + '/fetchOhlc', {
          params: {
            exchange: 'BITMEX',
            interval: '5m',
            symbol: 'XBTUSD'
          }
        }).then(r=> {
          const d = r.data.reverse()
          const obj = {ohlcv: d}
          this.chart = new DataCube(obj)
        })
      }
    }, */
  },
};
</script>