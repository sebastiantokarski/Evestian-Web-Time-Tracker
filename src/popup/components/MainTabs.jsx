import React, { Component } from 'react';
import ChartDoughnut from './ChartDoughnut.jsx';
import ChartLine from './ChartLine.jsx';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from './Table/Table.jsx';
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
      pagesVisitedAllTime: null,
      timeSpentInHours: null,
      timeSpentInHoursTotal: null,
      timeSpentEachDayOfTheWeek: null,
      timeSpentEachDayOfTheWeekTotal: null,
    };

    this.handleChartHover = this.handleChartHover.bind(this);
    this.performRestOfWork = this.performRestOfWork.bind(this);
    this.onSelectTab = this.onSelectTab.bind(this);
  }

  handleChartHover(chartTable, item) {
    this.setState({
      [`${chartTable}HoveredItem`]: item,
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

  onSelectTab(selectedTabKey) {
    const dataProcess = this.dataProcessing;

    switch (selectedTabKey) {
      case 'myChartAllTime':
        if (!this.state.pagesVisitedAllTime) {
          this.setState({
            pagesVisitedAllTime: dataProcess.processPagesVisitedAllTime(),
          });
        }
        break;
      case 'more':
        if (!this.state.timeSpentInHours) {
          this.setState({
            timeSpentInHours: dataProcess.processTimeSpentInHours(),
            timeSpentInHoursTotal: dataProcess.processTimeSpentInHoursTotal(),
            timeSpentEachDayOfTheWeek: dataProcess.processTimeSpentEachDayOfTheWeek(),
            timeSpentEachDayOfTheWeekTotal: dataProcess.processTimeSpentEachDayOfTheWeekTotal(),
          });
        }
        break;
    }
  }

  render() {
    return (
      <div className="main-tabs__section">
        <Tabs defaultActiveKey="today" id="doughnuts-chart" onSelect={this.onSelectTab}>
          <Tab eventKey="today" title="Today">
            <ChartDoughnut
              renderOnLoad
              chartData={this.state.pagesVisitedToday.chartData}
              chartTable="myChartTodayTable"
              handleChartHover={this.handleChartHover}
            />
            <Table
              className="myChartTodayTable"
              tableData={this.state.pagesVisitedToday.tableData}
              hoveredChartItem={this.state.myChartTodayTableHoveredItem}
              striped
              hovered
              rowLimit={10}
            />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <ChartDoughnut
              renderOnLoad
              chartData={this.state.pagesVisitedYesterday.chartData}
              chartTable="myChartYesterdayTable"
              handleChartHover={this.handleChartHover}
            />
            <Table
              className="myChartYesterdayTable"
              tableData={this.state.pagesVisitedYesterday.tableData}
              hoveredChartItem={this.state.myChartYesterdayTableHoveredItem}
              striped
              hovered
              rowLimit={10}
            />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <ChartDoughnut
              renderOnLoad
              chartData={this.state.pagesVisitedThisMonth.chartData}
              chartTable="myChartThisMonthTable"
              handleChartHover={this.handleChartHover}
            />
            <Table
              className="myChartThisMonthTable"
              tableData={this.state.pagesVisitedThisMonth.tableData}
              hoveredChartItem={this.state.myChartThisMonthTableHoveredItem}
              striped
              hovered
              rowLimit={10}
            />
          </Tab>
          <Tab eventKey="myChartAllTime" title="All Time">
            <ChartDoughnut
              renderOnLoad
              chartData={
                this.state.pagesVisitedAllTime ? this.state.pagesVisitedAllTime.chartData : null
              }
              chartTable="myCharAllTimeTable"
              handleChartHover={this.handleChartHover}
            />
            <Table
              className="myCharAllTimeTable"
              tableData={
                this.state.pagesVisitedAllTime ? this.state.pagesVisitedAllTime.tableData : []
              }
              hoveredChartItem={this.state.myChartAllTimeTableHoveredItem}
              striped
              hovered
              rowLimit={10}
            />
          </Tab>
          <Tab eventKey="more" title="More">
            <ChartLine
              chartTitle="Time spent each hour"
              chartData1={this.state.timeSpentInHours}
              chartData2={this.state.timeSpentInHoursTotal}
            />
            <ChartLine
              chartTitle="Time spent each day of the week"
              chartData1={this.state.timeSpentEachDayOfTheWeek}
              chartData2={this.state.timeSpentEachDayOfTheWeekTotal}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}
