import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Doughnut from './components/Doughnut.jsx';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
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
        <Tabs defaultActiveKey="today" id="doughnuts-chart">
          <Tab eventKey="today" title="Today">
            <Doughnut chartTitle="Today" chartName="myChartToday" />
          </Tab>
          <Tab eventKey="yesterday" title="Yesterday">
            <Doughnut chartTitle="Yesterday" chartName="myChartYesterday" />
          </Tab>
          <Tab eventKey="thisMonth" title="This Month">
            <Doughnut chartTitle="This Month" chartName="myChartMonth" />
          </Tab>
          <Tab eventKey="lastMonth" title="Last Month">
            <Doughnut chartTitle="Last Month" chartName="myChartLastMonth" />
          </Tab>
        </Tabs>
        <Table className="result-table" striped bordered hover>

        </Table>
        <Footer />
      </Fragment>
    );
  }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
