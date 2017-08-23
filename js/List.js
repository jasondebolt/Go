import React from 'react';
import ReactDOM from 'react-dom';

class ShoppingList extends React.Component {
  render() {
    return (
      <div className="shopping-list">
        <h1>Shopping List for {this.props.name}</h1>
        <ul>
          <li>Instagram</li>
          <li>WhatsApp</li>
          <li>Oculus</li>
          <li>Jason</li>
          <li>hey</li>
          <li>yo</li>
          <li>yoon</li>
          <li>test</li>
          <li>again</li>
          <li>foo</li>
          <li>bar</li>
          <li>baz</li>
        </ul>
      </div>
    );
  }
}

export default ShoppingList;
