import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchContext } from '../actions';
import _ from 'lodash';
import { API_ROOT, NON_API_ROOT } from '../config/api-config';
//import axios from 'axios';

class Header extends Component {
  //constructor(props) {
  //  super(props);
  //  this.state = {'user': ''}
  //}

  componentDidMount() {
    this.props.fetchContext();
    //axios.get(`/api/context`).then(response => {
    //  const user = response.data.user
    //  console.log(response)
    //  console.log(response.data.user)
    //  this.setState({'user': user})
    //});
  }

  render() {
    if (!this.props.context || _.isEmpty(this.props.context)) {
      return (<div>Loading...</div>)
    }
    return (
    <div className="ui fixed inverted menu">
      <div className="ui container">
        <a href="#" className="header item">
          <img className="logo ui image" src={NON_API_ROOT + "/static/logo.png"} />
        </a>
        <Link className="header item" to={NON_API_ROOT + "/api/links"}> Go </Link>
        <a href={NON_API_ROOT + "/api/logout"} className="header item">Logout</a>
        <div className="header item right"> Welcome, &nbsp; {this.props.context.userdata.email} </div>
      </div>
    </div>
    )
  }
}

//export default Header;

function mapStateToProps(state) {
  return { context: state.context };
}

export default connect(mapStateToProps, { fetchContext })(Header);
