import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import MenuDashboard from './menudashboard';

ReactDOM.render(
  <BrowserRouter>
    <MenuDashboard />
  </BrowserRouter>,
  document.getElementById('root')
);
