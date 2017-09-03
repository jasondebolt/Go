import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchLink, deleteLink } from '../actions';
import { Link } from 'react-router-dom';

class LinksShow extends Component {
  componentDidMount() {
    // If we really care about network performance and we don't want to fetch
    // the 'same' link twice, you can do this:
    //    if (!this.props.link) {
    //      const { id } = this.props.match.params; // Provided to us by react-router
    //     this.props.fetchLink(id);
    //    }
    // However, it's probably better to play it safe a re-fetch because
    // the user may have been sitting at this page for a long time.
    const { alias } = this.props.match.params; // Provided to us by react-router
    this.props.fetchLink(alias);
  }

  onDeleteClick() {
    // Pull the id from the URL.
    const { alias } = this.props.match.params; // Provided to us by react-router
    console.log('HERE')
    console.log(this.props)
    console.log('HERE')
    this.props.deleteLink(alias, () => {
      this.props.history.push('/');
    });
  }

  render() {
    {/*
      We would have just returned all { links } from mapStateToProps, and then in
      this function we would have used links[this.props.match.params.id], but
      that wouldn't have been as clean and the component wouldn't have been
      very reusable. It would also expose LinksShow to a huge object as a
      dependency. However, this component only really cares about ONE particular
      link, so why should we pass it an entire list of links??
      Also, many times mapStateToProps function is stored in a separate file.
      Doing so would make this file/component even more reusable.
    */}
    const { link } = this.props;

    if (!link) {
      // We need this because this component will probably render long before
      // the axios request is resolved and the action > reducer > component
      // flow kicks off.
      return <div>Loading...</div>;
    }

    return (
      <div>
        <Link to="/">Back To Index</Link>
        <button
          className="ui red button right floated column"
          onClick={this.onDeleteClick.bind(this)}
        >
          Delete Link
        </button>
        <h3>{link.alias}</h3>
        <h6>Url: {link.url}</h6>
      </div>
    )
  }
}


// First argument to mapStateToProps is always are application state.
// But there IS a second argument, which we call 'ownProps'.
// ownProps is props object that is headed to the LinksShow component.
// So, 'this.props' in the component is ABSOLUTELY EQUAL TO (===) ownProps.
function mapStateToProps({ links }, ownProps) {
  // return { links } or { links: links }// This is dumb way.
  return { link: links[ownProps.match.params.alias]} // This smart way.
  // Thus, you can use mapStateToProps not just to pull off peices of state,
  // but you can also do some intermediate logic in them.
}

//export default LinksShow;
export default connect(mapStateToProps, { fetchLink, deleteLink })(LinksShow);
