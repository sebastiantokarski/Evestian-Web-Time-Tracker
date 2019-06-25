import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Doughnut from './components/Doughnut.jsx';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import LineChart from './components/LineChart.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/popup.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
    };
  }
  render() {
    return (
      <Fragment>
        <Header/>
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
        <div className="container">
          <h4 className="text-center">AllTime: <span id="totalTime"></span><br/>from <span id="firstVisit"></span></h4>
        </div>
        <LineChart chartName="myChartTimeTodayHours" chartTitle="Time spent each hour today" />
        <LineChart chartName="myChartTimDaysOfTheWeek" chartTitle="Time spent each day of current week" />
        <LineChart chartName="myChartTimeTodayMinutes" chartTitle="Time spent each minute today" />
        <Footer />
      </Fragment>
    );
  }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
