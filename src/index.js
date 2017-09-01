import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import promise from 'redux-promise';

import reducers from './reducers';
import LinkIndex from './components/links_index';
import LinksNew from './components/links_new';
import LinksShow from './components/links_show';


const createStoreWithMiddleware = applyMiddleware(promise)(createStore);


class Hello extends Component {
  render() {
    return <div> Hello </div>;
  }
}

class Goodbye extends Component {
  render() {
    return <div> Goodbye </div>;
  }
}

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter>
      <div>
        <Switch> {/* Don't  forget the Capital S Switch statement!!! */}
          <Route path="/links/new" component={LinksNew} />
          {/* this would work too:
            <Route path="/links/:id/:comment" component ...
            params are accessible in the components via 'this.props.match.params.id'
          */}
          <Route path="/links/:id" component={LinksShow} />
          <Route path="/" component={LinkIndex} />
        </Switch>
      </div>
    </BrowserRouter>
  </Provider>
  , document.getElementById('reactEntry'));
