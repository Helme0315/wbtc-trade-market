import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import * as constants from "../utils/constants";
let socket = null;

const IndexPage = () => {
  const [isCallHistroy, setIsCallHistroy] = useState(false);
  const [tradeData, setTradeData] = useState([]);
  const [options, setOptions] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [dayVolume, setDayVolume] = useState(0);

  useEffect(() => {
    getTradeHistory();
    setChartOptions();
    getMakretInfo();
    socketInitializer();
  }, [isCallHistroy])

  const setChartOptions = () => {
    setOptions({
      rangeSelector: {
        selected: 0
      },
      title: {
        text: "WBTC/USD Market"
      },
      yAxis: [
        {
          labels: {
            align: "right",
            x: -3
          },
          height: "60%",
          lineWidth: 2,
          resize: {
            enabled: true
          }
        },
      ],
      tooltip: {
        split: true
      },
      series: [
        {
          type: "candlestick",
          name: "WBTC/USD",
          data: tradeData,
          dataGrouping: {
            units: [
              [
                'minute',
                [1, 2, 5, 10, 15, 30]
              ], [
                'hour',
                [1, 2, 3, 4]
              ], [
                'day',
                [1]
              ]
            ]
          }
        },
      ]
    });
  }

  const socketInitializer = () => {
    socket = new WebSocket(constants.websocketUrl);

    socket.onopen = function onStreamOpen() {
      setTimeout(function() {
        var subRequest = {
          "action": "SubAdd",
          "subs": ["0~Coinbase~WBTC~USD"]
        };
        socket.send(JSON.stringify(subRequest))

      }, 3000);
      
    }

    socket.onmessage = evt => {
      const newPrices = JSON.parse(evt.data);
      if(newPrices.TYPE === '0' && tradeData) {
        let currentTradeData = tradeData;
        let lastTradeInfo = currentTradeData[currentTradeData.length - 1];
        let socketTradeInfo;

        if (newPrices.TS * 1000 > lastTradeInfo[0]) {
          socketTradeInfo = [
            newPrices.TS * 1000,
            lastTradeInfo[4],
            lastTradeInfo[4],
            lastTradeInfo[4],
            newPrices.P,
          ]
        } else {
          
          if(newPrices.P < lastTradeInfo[3]) {
            lastTradeInfo[3] = newPrices.P
          } else if(newPrices.P > lastTradeInfo[2]) {
            lastTradeInfo[2] = newPrices.P
          }
          lastTradeInfo[4] = newPrices.P;
          lastTradeInfo[0] = newPrices.TS * 1000;
          socketTradeInfo = lastTradeInfo
        }
        currentTradeData.push(socketTradeInfo)
        setTradeData(currentTradeData);
        setChartOptions();
      }
    };
    
  }

  const getTradeHistory = async () => {
    const res = await fetch(constants.historyApi);
    const history = await res.json();
    if (history.Response && history.Response === 'Error') {
      console.log('CryptoCompare API error:',history.Message)
      setTradeData([]);
    }
    if (history.Data.length) {
      let tradeHistory = history.Data.map(el => {
        return [
          el.time * 1000, //requires time in ms
          el.open,
          el.high,
          el.low,
          el.close,
        ]
      })
      setTradeData(tradeHistory)
    }
    setIsCallHistroy(true);
  }

  const getMakretInfo = async () => {
    const res = await fetch(constants.marketInfoApi);
    const marketInfo = await res.json();
    if(marketInfo && marketInfo['WBTC']) {
      setTotalSupply(marketInfo['WBTC']['Supply'])
      setDayVolume(marketInfo['WBTC']['TotalVolume24H'])
    }
  }

  return (
    <div>
      <Head>
        <title>WBTC/USD Market</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      <br/>

      <label>Total Supply: {totalSupply.toFixed(2)}</label>
      <br/>
      <label>Volumn 24h: {dayVolume.toFixed(2)}</label>
      
      
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={"stockChart"}
        allowChartUpdate={true}
        options={options}
      />

    </div>
  )
}

export default IndexPage
