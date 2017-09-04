import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchLinks } from '../actions';
import { Link } from 'react-router-dom';
import LinksNew from './links_new';

class LinkIndex extends Component {

  componentDidMount() {
    this.props.fetchLinks();
  }

  renderLinks() {
    return _.map(this.props.links, link => {
      return (
        <tr key={link.alias}>
          <td>
            <Link to={`/links/edit/${link.alias}`}>{link.alias}</Link>
          </td>
          <td> {link.url} </td>
          <td> {link.owner} </td>
          <td> {link.clicks} </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div className="ui grid">
        <div className="row">
          <div className="sixteen wide column">
            <h2 className="ui header">Create a link</h2>
            <div className="ui grid">
              <div className="sixteen wide column centered">
                <LinksNew />
              </div>
            </div>
          </div>
          <div className="row">
            <br />
            <h2 className="ui header">Links</h2>
            <table className="ui celled table">
              <tbody>
                {this.renderLinks()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return { links: state.links };
}

// export default connect(null, { fetchLinks: fetchLinks })(LinkIndex);
// is same as ...
export default connect(mapStateToProps, { fetchLinks })(LinkIndex);
// The above is identical to using mapDispatchToProps.
