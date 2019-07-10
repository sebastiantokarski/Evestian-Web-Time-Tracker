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

    this.state = {
      hoveredChartItem: null,
    };

    this.dataProcessing = new DataProcessing(config.EXTENSION_DATA_NAME);

    this.dataProcessing.processFirstDoughnutData();
    this.dataProcessing.processDoughnutsData();
    this.dataProcessing.processLinesChartsData();

    this.handleChartHover = this.handleChartHover.bind(this);
  }

  handleChartHover(item) {
    this.setState({
      hoveredChartItem: item,
    });
  }

  render() {
    return (
      <div className="main-tabs__section">
        <Tabs defaultActiveKey="today" id="doughnuts-chart" >
          <Tab eventKey="today" title="Today">
            <DoughnutChart
              chartName="myChartToday"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedToday }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartTodayTable"
              tableData={ this.dataProcessing.pagesVisitedTodayArrayData }
              hoveredChartItem={ this.state.hoveredChartItem }
              striped />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <DoughnutChart
              chartName="myChartYesterday"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedYesterday }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartYesterdayTable"
              tableData={ this.dataProcessing.pagesVisitedYesterdayArrayData }
              hoveredChartItem={ this.state.hoveredChartItem }
              striped />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <DoughnutChart
              chartName="myChartMonth"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedThisMonth }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartThisMonthTable"
              tableData={ this.dataProcessing.pagesVisitedThisMonthArrayData }
              hoveredChartItem={ this.state.hoveredChartItem }
              striped />
          </Tab>
          <Tab eventKey="lastMonth" title="Last Month">
            <DoughnutChart chartName="myChartLastMonth"
              renderOnLoad
              chartData={ this.dataProcessing.pagesVisitedLastMonth }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartLastMonthTable"
              tableData={ this.dataProcessing.pagesVisitedLastMonthArrayData }
              hoveredChartItem={ this.state.hoveredChartItem }
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
