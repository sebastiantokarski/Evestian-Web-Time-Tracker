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

    this.state = {
      hoveredChartItem: null,
      pagesVisitedToday: this.dataProcessing.processPagesVisitedToday(),
      pagesVisitedYesterday: this.dataProcessing.processPagesVisitedYesterday(),
      pagesVisitedThisMonth: this.dataProcessing.processPagesVisitedThisMonth(),
      pagesVisitedAllTime: this.dataProcessing.processPagesVisitedAllTime(),
    };

    this.handleChartHover = this.handleChartHover.bind(this);
    this.performRestOfWork = this.performRestOfWork.bind(this);
  }

  handleChartHover(item) {
    this.setState({
      hoveredChartItem: item,
    });
  }

  performRestOfWork() {
    this.dataProcessing.processLinesChartsData();
  }

  componentDidMount() {
    window.addEventListener('load', this.performRestOfWork);
  }

  render() {
    return (
      <div className="main-tabs__section">
        <Tabs defaultActiveKey="today" id="doughnuts-chart" >
          <Tab eventKey="today" title="Today">
            <DoughnutChart
              renderOnLoad
              chartData={ this.state.pagesVisitedToday.chartData }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartTodayTable"
              tableData={ this.state.pagesVisitedToday.tableData }
              hoveredChartItem={ this.state.hoveredChartItem }
              striped />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <DoughnutChart
              renderOnLoad
              chartData={ this.state.pagesVisitedYesterday.chartData }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartYesterdayTable"
              tableData={ this.state.pagesVisitedYesterday.tableData }
              hoveredChartItem={ this.state.hoveredChartItem }
              striped />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <DoughnutChart
              renderOnLoad
              chartData={ this.state.pagesVisitedThisMonth.chartData }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartThisMonthTable"
              tableData={ this.state.pagesVisitedThisMonth.tableData }
              hoveredChartItem={ this.state.hoveredChartItem }
              striped />
          </Tab>
          <Tab eventKey="myChartAllTime" title="All Time">
            <DoughnutChart
              renderOnLoad
              chartData={ this.state.pagesVisitedAllTime.chartData }
              handleChartHover={ this.handleChartHover } />
            <Table
              className="myChartLastMonthTable"
              tableData={ this.state.pagesVisitedAllTime.tableData }
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
