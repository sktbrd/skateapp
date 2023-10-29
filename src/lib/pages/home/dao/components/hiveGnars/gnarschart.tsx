import React, { useEffect, useState } from 'react';
import { VoteHistoryQuery, CurrationHistoryQuery } from './queries';
import { Flex, Box, Text } from '@chakra-ui/react';
import * as dhive from '@hiveio/dhive';
import axios from 'axios';

import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import {CategoryScale} from 'chart.js'; 
Chart.register(CategoryScale);

const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

const ETH_INVESTMENT = 3;
const SQL_ENDPOINT = 'https://www.stoken.quest/sql';
const START_DATE = new Date('2022-12-08 20:22:15.000');

interface ChartSlice {
  date: Date;
  hiveQuantity: number;
  hivePrice: number;
  hiveValue: number;
  hiveValueWithVotes: number;
  ethPrice: number;
  ethValue: number;
}

const GnarsChart = () => {
  const [rawData, setRawData] = useState<ChartSlice[]>([]);
  const [chartData, setChartData] = useState({} as any);
  const [chartOptions, setChartOptions] = useState({} as any);
  // const [voteHistory, setVoteHistory] = useState(new Map());
  // const [curationHistory, setCurationHistory] = useState(new Map());
  // const [priceHistoryHIVE, setPriceHistoryHIVE] = useState(new Map());
  // const [priceHistoryETH, setPriceHistoryETH] = useState(new Map());

  const fetchPriceHistory = async (symbol: string) => {
    const start = Math.floor(START_DATE.getTime() / 1000);
    const end = Math.floor(Date.now() / 1000);
    const url = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart/range`;
    const params = {
      vs_currency: 'usd',
      from: start,
      to: end,
      precision: 3,
    };

    const response = await axios.get(url, { params });

    // create a map of price history
    const priceHistory = new Map();

    response.data.prices.forEach((price: any) => {
      const date = new Date(price[0]).toDateString();
      priceHistory.set(date, price[1]);
    });
    
    return priceHistory;
  }

  const fethRewardHistory = async (type: string) => {
    const response = await fetch(SQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: type === 'vote' ? VoteHistoryQuery('gnars') : CurrationHistoryQuery('gnars'),
      }),
    });

    const data = await response.json();
    
    // calculate rewards per date since the START_DATE
    const rewardsPerDate = new Map();

    data.forEach((reward: any) => {
      const date = new Date(reward.timestamp).toDateString();

      // make sure date is from the next day of the START_DATE
      if (new Date(date) < START_DATE) {
        return;
      }

      const quantity = type === 'vote' ? reward.vote_value : reward.hp;

      if (rewardsPerDate.has(date)) {
        rewardsPerDate.set(date, rewardsPerDate.get(date) + quantity);
      } else {
        rewardsPerDate.set(date, quantity);
      }
    });

    return rewardsPerDate;
  }

  const onStart = async () => {
    const priceHistoryHIVE = await fetchPriceHistory('hive');
    const priceHistoryETH = await fetchPriceHistory('ethereum');

    // set price history
    // setPriceHistoryHIVE(priceHistoryHIVE);
    // setPriceHistoryETH(priceHistoryETH);

    const voteHistory = await fethRewardHistory('vote');
    const curationHistory = await fethRewardHistory('curation');

    // calculate total curation rewards
    let totalCurationRewards = 0;
    curationHistory.forEach((reward: number) => {
      totalCurationRewards += reward;
    });

    // set reward history
    // setVoteHistory(voteHistory);
    // setCurationHistory(curationHistory);

    // get account data
    const account = await dhiveClient.database.getAccounts(['gnars']);

    // get dynamic global properties
    const props = await dhiveClient.database.getDynamicGlobalProperties();

    // calculate hive power
    const total_vesting_fund_hive = parseFloat(props.total_vesting_fund_hive.toString().split(' ')[0]);
    const total_vesting_shares = parseFloat(props.total_vesting_shares.toString().split(' ')[0]);
    const base = parseFloat(account[0].vesting_shares.toString().split(' ')[0]);

    const hivePower = ((total_vesting_fund_hive * base) / total_vesting_shares);

    // calculate first investment in hive (next day of the START_DATE)
    const firstDay = new Date(START_DATE.getTime() + 86400000);
    const ethValueFirstDay = ETH_INVESTMENT * priceHistoryETH.get(firstDay.toDateString());
    const hiveQuantityFirstDay =  ethValueFirstDay / priceHistoryHIVE.get(firstDay.toDateString());
    
    // calculate daily reward earned
    const totalDailyReward = hivePower - totalCurationRewards - hiveQuantityFirstDay;
    // devide by the total number of days since the START_DATE
    // this will give us the daily reward earned through hp apr
    const dailyReward = totalDailyReward / priceHistoryHIVE.size;

    // loop through each day since the START_DATE
    // hiveQuantity = hiveQuantityFirstDay | hiveQuantity + currationHistory[date] + dailyReward
    // hiveValueWithVotes = hiveQuantity + voteHistory[date]
    // hiveValue = hiveQuantity * hivePrice[date]
    // ethValue = ETH_INVESTMENT * ethPrice[date]

    const rawData: ChartSlice[] = [];

    let hiveQuantity = hiveQuantityFirstDay;
    let hiveQuantityWithVotes = hiveQuantityFirstDay;

    priceHistoryHIVE.forEach((hivePrice: number, date: string) => {
      const ethPrice = priceHistoryETH.get(date);
      const ethValue = ETH_INVESTMENT * ethPrice;

      // add rewards to hiveQuantity
      hiveQuantity += curationHistory.get(date) + dailyReward;
      const hiveValue = hiveQuantity * hivePrice;

      // add rewards to hiveValueWithVotes
      hiveQuantityWithVotes += voteHistory.get(date) + curationHistory.get(date) + dailyReward;
      const hiveValueWithVotes = hiveQuantityWithVotes * hivePrice;

      rawData.push({
        date: new Date(date),
        hiveQuantity,
        hivePrice,
        hiveValue,
        hiveValueWithVotes,
        ethPrice,
        ethValue,
      });
    });

    setRawData(rawData);
  }

  const updateChart = () => {

    
    const labels = rawData.map((data) => data.date.toDateString());
    const hiveValues = rawData.map((data) => data.hiveValue);

    const hiveValueWithVotes = rawData.map((data) => data.hiveValueWithVotes);

    const ethValues = rawData.map((data) => data.ethValue);
    const hiveQuantity = rawData.map((data) => data.hiveQuantity);
    const hivePrice = rawData.map((data) => data.hivePrice);
    const ethPrice = rawData.map((data) => data.ethPrice);
  
    /* create chart
    line chart with hiveValue and ethValue as datasets
    x axis is date with 10 ticks
    bars in the background for hiveQuantity ligth color
    tooltip with all the data for that day, including the hiveQuantity and the price of hive and eth
    prices should not be in the chart, only in the tooltip
    tooltip should be on hover anywhere on the chart
    only one y axis on the left
    */
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Hive Value',
          data: hiveValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          pointRadius: 0,
          hoverRadius: 10,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1.5,
          yAxisID: 'y',
          cubicInterpolationMode: 'monotone',
        },
        {
          label: 'Hive Value With Votes',
          data: hiveValueWithVotes,
          backgroundColor: 'rgba(255, 231, 98, 0.2)',
          pointRadius: 0,
          hoverRadius: 10,
          borderColor: 'rgba(255, 231, 98, 1)',
          borderWidth: 1.5,
          yAxisID: 'y',
          cubicInterpolationMode: 'monotone',
        },
        {
          label: 'Ethereum Value',
          data: ethValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          pointRadius: 0,
          hoverRadius: 10,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1.5,
          yAxisID: 'y',
          cubicInterpolationMode: 'monotone',
        },
        {
          label: 'Hive Quantity',
          data: hiveQuantity,
          type: 'bar',
          backgroundColor: 'rgba(255, 99, 132, 0.15)',
          yAxisID: 'y1',
        },
      ],
    };
    
    
    const chartOptions = {
      maintainAspectRatio: true,
      scales: {
        x: {
          type: 'category',
          ticks: {
            maxTicksLimit: 30,
          },
        },
        y: {
          display: true,
          position : 'left',
          id: 'y',
        },
        y1: {
          display: false,
          position : 'right',
          id: 'y1',
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function (context:any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y;
              if (context.dataset.label === 'Hive Value') {
                label += ` (Hive Price: ${hivePrice[context.dataIndex]})`;
              } else if (context.dataset.label === 'Ethereum Value') {
                label += ` (Ethereum Price: ${ethPrice[context.dataIndex]})`;
              }
              return label;
            },
          },
        },
      },
    };
    
    
    setChartData(chartData);
    setChartOptions(chartOptions);
  };


  const chart = rawData.length > 0 ? (
    <Line data={chartData} options={chartOptions} />
  ) : (
    <Text>Loading...</Text>
  );

  useEffect(() => {
    onStart();
  }, []);

  useEffect(() => {
    updateChart();
  }, [rawData]);

  return (
    <Flex
      width="100%"
      height="700px"
      alignItems={'center'}
      justifyContent={'center'}
      marginTop={'20px'}
      marginBottom={'20px'}
      direction={'column'}
    >
      {chart}
    </Flex>
  );
};

export default GnarsChart;