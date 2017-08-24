import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPosts } from '../actions';
import { Link } from 'react-router-dom';

class PostIndex extends Component {

  componentDidMount() {
    this.props.fetchPosts();
  }

  renderPosts() {
    return _.map(this.props.posts, post => {
      return (
        <tr key={post.id}>
          <td>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div className="ui grid">
        <div className="five column row">
          <div className="right floated column">
            <Link className="ui blue button" to="/posts/new">
              Add a Post
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="wide column">
            <h3>Posts</h3>
            <table className="ui celled table">
              <tbody>
                {this.renderPosts()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return { posts: state.posts };
}

// export default connect(null, { fetchPosts: fetchPosts })(PostIndex);
// is same as ...
export default connect(mapStateToProps, { fetchPosts })(PostIndex);
// The above is identical to using mapDispatchToProps.
