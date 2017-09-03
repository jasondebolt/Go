import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {'user': ''}
  }

  componentDidMount() {
    axios.get(`/api/context`).then(response => {
      const user = response.data.user
      console.log(response)
      console.log(response.data.user)
      this.setState({'user': user})
    });
  }

  render() {
    const { user } = this.props;
    if (user == '') {
      return (<div>Loading...</div>)
    }
    return (
    <div className="ui fixed inverted menu">
      <div className="ui container">
        <a href="#" className="header item">
          <img className="logo ui image" src="/static/logo.png" />
        </a>
        <Link className="header item" to="/links"> Go </Link>
        <Link className="header item" to="/links/update"> Update Link </Link>
        <a href="/logout" className="header item">Logout</a>
        <div className="header item right"> Welcome, &nbsp; {this.state.user} </div>
      </div>
    </div>
    )
  }
}

export default Header;
