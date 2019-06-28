import React, {Component} from 'react';
import Doughnut from './Doughnut.jsx';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';

export default class MainTabs extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="main-tabs__section">
        <Tabs defaultActiveKey="today" id="doughnuts-chart" className="nav-fill w-100">
          <Tab eventKey="today" title="Today">
            <Doughnut chartName="myChartToday" />
            <Table className="myChartTodayTable" striped bordered hover />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <Doughnut chartName="myChartYesterday" />
            <Table className="myChartYesterdayTable" striped bordered hover />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <Doughnut chartName="myChartMonth" />
            <Table className="myChartThisMonthTable" striped bordered hover />
          </Tab>
          <Tab eventKey="lastMonth" title="Last Month">
            <Doughnut chartName="myChartLastMonth" />
            <Table className="myChartLastMonthTable" striped bordered hover />
          </Tab>
        </Tabs>
      </div>
    );
  }
}
