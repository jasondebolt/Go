import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPosts } from '../actions';
import { Link } from 'react-router-dom';
import PostsNew from './posts_new';

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
        <div className="row">
          <div className="sixteen wide column">
            <div className="ui grid">
              <div className="ten wide column centered">
                <h4>Create a Post</h4>
                <PostsNew />
              </div>
            </div>
            <br />
            <h4>Posts</h4>
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
