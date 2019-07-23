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
      timeSpentInHours: null,
      timeSpentInHoursTotal: null,
      timeSpentEachDayOfTheWeek: null,
      timeSpentEachDayOfTheWeekTotal: null,
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
    this.setState({
      timeSpentInHours: this.dataProcessing.processTimeSpentInHours(),
      timeSpentInHoursTotal: this.dataProcessing.processTimeSpentInHoursTotal(),
      timeSpentEachDayOfTheWeek: this.dataProcessing.processTimeSpentEachDayOfTheWeek(),
      timeSpentEachDayOfTheWeekTotal: this.dataProcessing.processTimeSpentEachDayOfTheWeekTotal(),
    });
  }

  componentDidMount() {
    window.addEventListener('load', this.performRestOfWork, false);
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.performRestOfWork, false);
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
              chartData1={ this.state.timeSpentInHours }
              chartData2={ this.state.timeSpentInHoursTotal } />
            <LineChart
              chartTitle="Time spent each day of the week"
              chartData1={ this.state.timeSpentEachDayOfTheWeek }
              chartData2={ this.state.timeSpentEachDayOfTheWeekTotal } />
          </Tab>
        </Tabs>
      </div>
    );
  }
}
