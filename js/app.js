import Hello from './Hello';
import ShoppingList from './List';
import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

const ButtonExampleButton = () => (
  <Button compact>
    Click Here
  </Button>
)

ReactDOM.render(<Hello/>, document.getElementById('reactEntry'));
ReactDOM.render(<ShoppingList/>, document.getElementById('shopping-list'));
ReactDOM.render(<ButtonExampleButton/>, document.getElementById('semantic-button'));
