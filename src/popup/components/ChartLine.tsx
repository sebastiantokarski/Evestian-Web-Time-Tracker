import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import Color from '../../js/Color';

export interface ChartLineProps {
  chartTitle: string;
  chartData1: any;
  chartData2: any;
}

export default function ChartLine({ chartTitle, chartData1, chartData2 }: ChartLineProps) {
  const chartFirstColorBorder = new Color('primary').toRGBa(0.65);
  const chartFirstColorBackground = new Color('primaryLight').toRGBa(0.65);
  const chartSecondColorBorder = new Color('secondaryDark').toRGBa(0.65);
  const chartSecondColorBackground = new Color('secondary').toRGBa(0.65);

  useEffect(() => {
    const plugin = {
      id: 'paddingBelowLegends',
      beforeInit: (chart) => {
        if (chart.config.type !== 'line') {
          return;
        }

        // eslint-disable-next-line
        chart.legend.afterFit = function () {
          // eslint-disable-next-line
          this.height += 10;
        };
      },
    };

    Chart.register(plugin);

    return () => Chart.unregister(plugin);
  }, []);

  if (!chartData1 || !chartData2) {
    return null;
  }
  return (
    <section className="lineChart__section">
      <div className="container" style={{ height: '300px' }}>
        <h5 className="lineChart__title">{chartTitle}</h5>
        <Line
          height={300}
          data={{
            datasets: [
              {
                yAxisID: 'Today',
                label: 'Today in minutes',
                data: chartData1.data,
                borderColor: chartFirstColorBorder,
                backgroundColor: chartFirstColorBackground,
                pointStyle: 'circle',
              },
              {
                yAxisID: 'Global',
                label: 'Global in minutes',
                data: chartData2.data,
                borderColor: chartSecondColorBorder,
                backgroundColor: chartSecondColorBackground,
                pointStyle: 'circle',
              },
            ],
            labels: chartData2.labels,
          }}
          options={{
            maintainAspectRatio: false,
            scales: {
              Today: {
                position: 'left',
                type: 'linear',
                // @TODO check why suggestedMin/Max are with warning
                // ticks: {
                //   suggestedMin: 0,
                //   suggestedMax: 60,
                // },
              },
              Global: {
                position: 'right',
                type: 'linear',
                // ticks: {
                //   suggestedMin: 0,
                //   suggestedMax: 60,
                // },
              },
              // yAxes: [
              //   {
              //     id: 'Today',
              //     position: 'left',
              //     type: 'linear',
              //     ticks: {
              //       suggestedMin: 0,
              //       suggestedMax: 60,
              //     },
              //   },
              //   {
              //     id: 'Global',
              //     position: 'right',
              //     type: 'linear',
              //     ticks: {
              //       suggestedMin: 0,
              //       suggestedMax: 60,
              //     },
              //   },
              // ],
            },
            // @TODO The same as earlier
            // legend: {
            //   labels: {
            //     usePointStyle: true,
            //   },
            // },
          }}
        />
      </div>
    </section>
  );
}
