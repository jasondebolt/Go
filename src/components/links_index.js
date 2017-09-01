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
        <tr key={link.id}>
          <td>
            <Link to={`/links/${link.id}`}>{link.title}</Link>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div className="ui grid">
        <div className="row">
          <div className="sixteen wide column">
            <div className="ui grid">
              <div className="ten wide column centered">
                <h4>Create a Link</h4>
                <LinksNew />
              </div>
            </div>
            <br />
            <h4>Links</h4>
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
