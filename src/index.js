import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import promise from 'redux-promise';

import reducers from './reducers';
import PostIndex from './components/posts_index';
import PostsNew from './components/posts_new';
import PostsShow from './components/posts_show';


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
          <Route path="/posts/new" component={PostsNew} />
          {/* this would work too:
            <Route path="/posts/:id/:comment" component ...
            params are accessible in the components via 'this.props.match.params.id'
          */}
          <Route path="/posts/:id" component={PostsShow} />
          <Route path="/" component={PostIndex} />
        </Switch>
      </div>
    </BrowserRouter>
  </Provider>
  , document.getElementById('reactEntry'));
