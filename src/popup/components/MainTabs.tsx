import React, { useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { Table, ChartDoughnut, ChartLine } from 'popup/components';
import config from 'js/config';
import DataProcessing from 'js/DataProcessing';

export default function MainTabs() {
  const dataProcess = new DataProcessing(config.EXTENSION_DATA_NAME);

  const pagesVisitedToday = dataProcess.processPagesVisitedToday();
  const pagesVisitedYesterday = dataProcess.processPagesVisitedYesterday();
  const pagesVisitedThisMonth = dataProcess.processPagesVisitedThisMonth();
  const pagesVisitedAllTime = dataProcess.processPagesVisitedAllTime();

  const timeSpentInHours = dataProcess.processTimeSpentInHours();
  const timeSpentInHoursTotal = dataProcess.processTimeSpentInHoursTotal();
  const timeSpentEachDayOfTheWeek = dataProcess.processTimeSpentEachDayOfTheWeek();
  const timeSpentEachDayOfTheWeekTotal = dataProcess.processTimeSpentEachDayOfTheWeekTotal();

  const [currHoveredChartItem, setCurrHoveredChartItem] = useState<string | null>(null);

  return (
    <div className="main-tabs__section">
      <Tabs defaultActiveKey="today">
        <Tab eventKey="today" title="Today">
          <ChartDoughnut
            renderOnLoad
            data={pagesVisitedToday.chartData}
            setCurrHoveredChartItem={setCurrHoveredChartItem}
          />
          <Table
            className="myChartTodayTable"
            tableData={pagesVisitedToday.tableData}
            hoveredChartItem={currHoveredChartItem}
            striped
            hovered
            rowLimit={10}
          />
        </Tab>
        <Tab eventKey="yesterday" title="Yesterday">
          <ChartDoughnut
            renderOnLoad
            data={pagesVisitedYesterday.chartData}
            setCurrHoveredChartItem={setCurrHoveredChartItem}
          />
          <Table
            className="myChartYesterdayTable"
            tableData={pagesVisitedYesterday.tableData}
            hoveredChartItem={currHoveredChartItem}
            striped
            hovered
            rowLimit={10}
          />
        </Tab>
        <Tab eventKey="thisMonth" title="This Month">
          <ChartDoughnut
            renderOnLoad
            data={pagesVisitedThisMonth.chartData}
            setCurrHoveredChartItem={setCurrHoveredChartItem}
          />
          <Table
            className="myChartThisMonthTable"
            tableData={pagesVisitedThisMonth.tableData}
            hoveredChartItem={currHoveredChartItem}
            striped
            hovered
            rowLimit={10}
          />
        </Tab>
        <Tab eventKey="myChartAllTime" title="All Time">
          <ChartDoughnut
            renderOnLoad
            data={pagesVisitedAllTime?.chartData}
            setCurrHoveredChartItem={setCurrHoveredChartItem}
          />
          <Table
            className="myCharAllTimeTable"
            tableData={pagesVisitedAllTime?.tableData || []}
            hoveredChartItem={currHoveredChartItem}
            striped
            hovered
            rowLimit={10}
          />
        </Tab>
        <Tab eventKey="more" title="More">
          <ChartLine
            chartTitle="Time spent each hour"
            chartData1={timeSpentInHours}
            chartData2={timeSpentInHoursTotal}
          />
          <ChartLine
            chartTitle="Time spent each day of the week"
            chartData1={timeSpentEachDayOfTheWeek}
            chartData2={timeSpentEachDayOfTheWeekTotal}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
