import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import DataProcessing from '../../js/DataProcessing';

Chart.overrides.doughnut.plugins.legend.display = false;

interface ChartDoughnutProps {
  chartData: any;
  chartTable: string;
  renderOnLoad: boolean;
  handleChartHover: (chartTable, hoveredItemName) => void;
}

const ChartDoughnut: React.FC<ChartDoughnutProps> = ({
  chartData,
  chartTable,
  renderOnLoad,
  handleChartHover,
}) => {
  let chartInstance = null;
  let lastHoveredItemIndex = null;

  useEffect(() => {
    const registerChartPlugin = () => {
      Chart.register({
        id: 'drawCenterText',
        beforeDraw: function (chart) {
          // @TODO remove any
          if (chart && chart.options && (chart.options as any).customTextInside) {
            const bottomCorner = chart.chartArea.bottom;
            const rightCorner = chart.chartArea.right;
            const ctx = chart.ctx;
            // @TODO remove any
            const texts = (chart.options as any).customTextInside.split('\n');
            const fontSize = texts.length === 1 ? 24 : 20;

            ctx.restore();
            ctx.font = `${fontSize}px Courier sans-serif`;
            ctx.textBaseline = 'middle';
            for (let i = 0; i < texts.length; i++) {
              const text = texts[i];
              const textX = Math.round((rightCorner - ctx.measureText(text).width) / 2);
              const textY = bottomCorner / 2 + (i + 1) * 24 - (texts.length + 1) * 12;

              ctx.fillText(text, textX, textY);
              ctx.save();
            }
          }
        },
      });
    };

    registerChartPlugin();
  }, []);

  const parseArrayOfSecondsToTimeString = (array) => {
    return DataProcessing.parseSecondsIntoTime(DataProcessing.sum(array));
  };

  /**
   * @param {string} text
   * @param {number} [maxLength=20]
   * @return {string}
   */
  const getShortenText = (text, maxLength = 20) => {
    const regex = new RegExp(`(.{${maxLength}})..+`);

    text = text.replace(regex, '$1...');

    if (text.slice(-4) === '....') {
      text = text.slice(0, -1);
    }

    return text;
  };

  const onChartHover = (chartData, event, items) => {
    const chart = chartInstance.chartInstance;
    const hoveredItemIndex = items.length ? items[0]._index : null;
    const shouldProceed = () => {
      return hoveredItemIndex !== lastHoveredItemIndex;
    };

    if (!shouldProceed()) {
      return;
    }

    let hoveredItemName = null;
    let customTextInside = null;

    if (hoveredItemIndex !== null) {
      const chartDataset = chart.data.datasets[0];
      const itemDataInSeconds = chartDataset.data[hoveredItemIndex];
      const text = DataProcessing.parseSecondsIntoTime(itemDataInSeconds);
      const percentage = ((itemDataInSeconds / DataProcessing.sum(chartData.data)) * 100).toFixed(
        2
      );

      hoveredItemName = chartData.labels[hoveredItemIndex];

      const shortenName = getShortenText(hoveredItemName, 17);

      customTextInside = `${text}\n${shortenName}\n${percentage}%`;
    } else {
      customTextInside = parseArrayOfSecondsToTimeString(chartData.data);
    }

    lastHoveredItemIndex = hoveredItemIndex;
    handleChartHover(chartTable, hoveredItemName);

    chart.options.customTextInside = customTextInside;
    chart.update();
  };

  if (!renderOnLoad || !chartData) {
    return null;
  }

  const chartOptions = {
    maintainAspectRatio: false,
    cutoutPercentage: 58,
    customTextInside: parseArrayOfSecondsToTimeString(chartData.data),
    tooltips: {
      enabled: false,
    },
    animation: {
      animateScale: true,
    },
    hover: {
      onHover: onChartHover.bind(this, chartData),
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';

            if (label) {
              return `${label}: ${DataProcessing.parseSecondsIntoTime(context.parsed)}`;
            }

            return label;
          },
        },
      },
    },
  };
  const data = {
    datasets: [
      {
        data: chartData.data,
        backgroundColor: chartData.colors,
      },
    ],
    labels: chartData.labels,
  };

  return (
    <section className={`chart-doughnut__section`}>
      <div className="chart-doughnut__container">
        {/* @TODO Remove any */}
        <Doughnut ref={(ref) => (chartInstance = ref)} data={data} options={chartOptions as any} />
      </div>
    </section>
  );
};

export default ChartDoughnut;
