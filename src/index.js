import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import promise from 'redux-promise';

import reducers from './reducers';
import Header from './components/header';
import LinkIndex from './components/links_index';
import LinksNew from './components/links_new';
import LinksEdit from './components/links_edit';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter>
      <div>
        <Header />
        <Switch> {/* Don't  forget the Capital S Switch statement!!! */}
          {/* this would work too:
            <Route path="/links/new" component={LinksNew} />
            {/* this would work too:
            <Route path="/links/:alias/:comment" component ...
            params are accessible in the components via 'this.props.match.params.id'
          */}
          <Route path="/links/edit/:alias+" component={LinksEdit} />
          <Route path="/" component={LinkIndex} />
        </Switch>
      </div>
    </BrowserRouter>
  </Provider>
  , document.getElementById('reactEntry'));
