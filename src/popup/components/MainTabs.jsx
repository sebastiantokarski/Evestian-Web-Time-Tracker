import React, { Component } from 'react';
import DoughnutChart from './DoughnutChart.jsx';
import LineChart from './LineChart.jsx';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from './Table.jsx';
import config from '../../js/config';
import DataProcessing from '../../js/DataProcessing';

export default class MainTabs extends Component {
  constructor(props) {
    super(props);

    this.dataProcessing = new DataProcessing(config.EXTENSION_DATA_NAME);

    this.dataProcessing.processFirstDoughnutData();
    this.dataProcessing.processDoughnutsData();
    this.dataProcessing.processLinesChartsData();
  }

  render() {
    return (
      <div className="main-tabs__section">
        <Tabs defaultActiveKey="today" id="doughnuts-chart" >
          <Tab eventKey="today" title="Today">
            <DoughnutChart chartName="myChartToday"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedToday } />
            <Table className="myChartTodayTable"
              tableData={ this.dataProcessing.pagesVisitedTodayArrayData }
              striped />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <DoughnutChart chartName="myChartYesterday"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedYesterday } />
            <Table className="myChartYesterdayTable"
              tableData={ this.dataProcessing.pagesVisitedYesterdayArrayData }
              striped />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <DoughnutChart chartName="myChartMonth"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedThisMonth } />
            <Table className="myChartThisMonthTable"
              tableData={ this.dataProcessing.pagesVisitedThisMonthArrayData }
              striped />
          </Tab>
          <Tab eventKey="lastMonth" title="Last Month">
            <DoughnutChart chartName="myChartLastMonth"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedLastMonth } />
            <Table className="myChartLastMonthTable"
              tableData={ this.dataProcessing.pagesVisitedLastMonthArrayData }
              striped />
          </Tab>
          <Tab eventKey="more" title="More">
            <LineChart
              chartTitle="Time spent each hour"
              chartData1={ this.dataProcessing.timeSpentInHours }
              chartData2={ this.dataProcessing.timeSpentInHoursTotal } />
            <LineChart
              chartTitle="Time spent each day of the week"
              chartData1={ this.dataProcessing.timeSpentEachDayOfTheWeek }
              chartData2={ this.dataProcessing.timeSpentEachDayOfTheWeekTotal } />
          </Tab>
        </Tabs>
      </div>
    );
  }
}
