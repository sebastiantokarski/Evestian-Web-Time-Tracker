import React, { useState, useEffect } from 'react';
import Chart, { ActiveElement, ChartEvent } from 'chart.js/auto';
import type { Chart as ChartType } from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import DataProcessing from 'js/DataProcessing';

Chart.overrides.doughnut.plugins.legend.display = false;

export interface ChartDoughnutProps {
  data: any;
  renderOnLoad: boolean;
  setCurrHoveredChartItem: (currHoveredItem: string | null) => void;
}

export default function ChartDoughnut({
  data,
  renderOnLoad,
  setCurrHoveredChartItem,
}: ChartDoughnutProps) {
  let lastHoveredItemIndex = null;

  const parseArrayOfSecondsToTimeString = (array: number[]) =>
    DataProcessing.parseSecondsIntoTime(DataProcessing.sum(array));

  const [customTextInside, setCustomTextInside] = useState<string>(
    parseArrayOfSecondsToTimeString(data.data)
  );

  useEffect(() => {
    const plugin = {
      id: 'drawCenterText',
      beforeDraw: (chart) => {
        const bottomCorner = chart.chartArea.bottom;
        const rightCorner = chart.chartArea.right;
        const { ctx } = chart;
        const lineOfTexts = customTextInside.split('\n');
        const fontSize = lineOfTexts.length === 1 ? 24 : 20;

        ctx.restore();
        ctx.font = `${fontSize}px Courier sans-serif`;
        ctx.textBaseline = 'middle';
        for (let i = 0; i < lineOfTexts.length; i += 1) {
          const text = lineOfTexts[i];
          const textX = Math.round((rightCorner - ctx.measureText(text).width) / 2);
          const textY = bottomCorner / 2 + (i + 1) * 24 - (lineOfTexts.length + 1) * 12;

          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      },
    };

    Chart.register(plugin);

    return () => Chart.unregister(plugin);
  }, [customTextInside]);

  /**
   * @param {string} text
   * @param {number} [maxLength=20]
   * @return {string}
   */
  const getShortenText = (text: string, maxLength = 20) => {
    const regex = new RegExp(`(.{${maxLength}})..+`);
    let shortText = text.replace(regex, '$1...');

    if (shortText.slice(-4) === '....') {
      shortText = shortText.slice(0, -1);
    }

    return shortText;
  };

  const handleChartHover = (
    event: ChartEvent,
    elements: ActiveElement[],
    chart: ChartType
  ): void => {
    const hoveredItemIndex = elements?.[0]?.index !== undefined ? elements[0].index : null;

    if (hoveredItemIndex === lastHoveredItemIndex) {
      return;
    }

    const currHoveredItem = chart.data.labels[hoveredItemIndex] as string;

    const chartData = chart.data;
    const hoveredItemName = chartData.labels[hoveredItemIndex] as string;
    let textInside = null;

    if (hoveredItemIndex !== null) {
      const itemInSeconds = chartData.datasets[0].data[hoveredItemIndex] as number;
      const text = DataProcessing.parseSecondsIntoTime(itemInSeconds);
      const perc = ((itemInSeconds / DataProcessing.sum(chartData.datasets[0].data)) * 100).toFixed(
        2
      );

      textInside = `${text}\n${getShortenText(hoveredItemName, 17)}\n${perc}%`;
    } else {
      textInside = parseArrayOfSecondsToTimeString(chartData.datasets[0].data as number[]);
    }

    setCurrHoveredChartItem(currHoveredItem);
    setCustomTextInside(textInside);
    lastHoveredItemIndex = hoveredItemIndex;

    chart.update();
  };

  if (!renderOnLoad || !data) {
    return null;
  }

  return (
    <section className="chart-doughnut__section">
      <div className="chart-doughnut__container">
        <Doughnut
          data={{
            datasets: [
              {
                data: data.data,
                backgroundColor: data.colors,
              },
            ],
            labels: data.labels,
          }}
          options={{
            maintainAspectRatio: false,
            animation: {
              animateScale: true,
            },
            onHover: handleChartHover,
            plugins: {
              tooltip: {
                enabled: false,
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
          }}
        />
      </div>
    </section>
  );
}
