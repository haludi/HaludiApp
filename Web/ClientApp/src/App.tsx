import * as React from 'react';
import { Route } from 'react-router';

import Layout from './components/Layout';
import Home from './components/Home';
import Counter from './components/Counter';
import Test from './components/Test';
import FetchData from './components/FetchData';
import FuelTracking from './components/FuelTracking/FuelTracking';

import './App.scss'

export default () => (
    <Layout>
      <Route exact path='/' component={Home} />
      <Route path='/counter' component={Counter} />
      <Route path='/test' component={Test} />
      <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
      <Route path='/fuel-tracking/' component={FuelTracking} />
    </Layout>
);
