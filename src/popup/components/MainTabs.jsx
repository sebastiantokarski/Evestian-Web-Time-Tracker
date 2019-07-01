import React, {Component} from 'react';
import DoughnutChart from './DoughnutChart.jsx';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import config from '../../js/config';
import DataProcessing from '../../js/DataProcessing';

export default class MainTabs extends Component {
  constructor() {
    super();

    this.dataProcessing = new DataProcessing(config.EXTENSION_DATA_NAME);

    this.dataProcessing.processFirstDoughnutData();
  }

  render() {
    return (
      <div className="main-tabs__section">
        <Tabs defaultActiveKey="today" id="doughnuts-chart" className="nav-fill w-100">
          <Tab eventKey="today" title="Today">
            <DoughnutChart chartName="myChartToday" renderOnLoad={ true } chartDataName="pagesVisitedToday" />
            <Table className="myChartTodayTable" striped bordered hover />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <DoughnutChart chartName="myChartYesterday" />
            <Table className="myChartYesterdayTable" striped bordered hover />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <DoughnutChart chartName="myChartMonth" />
            <Table className="myChartThisMonthTable" striped bordered hover />
          </Tab>
          <Tab eventKey="lastMonth" title="Last Month">
            <DoughnutChart chartName="myChartLastMonth" />
            <Table className="myChartLastMonthTable" striped bordered hover />
          </Tab>
        </Tabs>
      </div>
    );
  }
}
