import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPost, deletePost } from '../actions';
import { Link } from 'react-router-dom';

class PostsShow extends Component {
  componentDidMount() {
    // If we really care about network performance and we don't want to fetch
    // the 'same' post twice, you can do this:
    //    if (!this.props.post) {
    //      const { id } = this.props.match.params; // Provided to us by react-router
    //     this.props.fetchPost(id);
    //    }
    // However, it's probably better to play it safe a re-fetch because
    // the user may have been sitting at this page for a long time.
    const { id } = this.props.match.params; // Provided to us by react-router
    this.props.fetchPost(id);
  }

  onDeleteClick() {
    // Pull the id from the URL.
    const { id } = this.props.match.params; // Provided to us by react-router
    this.props.deletePost(id, () => {
      this.props.history.push('/');
    });
  }

  render() {
    {/*
      We would have just returned all { posts } from mapStateToProps, and then in
      this function we would have used posts[this.props.match.params.id], but
      that wouldn't have been as clean and the component wouldn't have been
      very reusable. It would also expose PostsShow to a huge object as a
      dependency. However, this component only really cares about ONE particular
      post, so why should we pass it an entire list of posts??
      Also, many times mapStateToProps function is stored in a separate file.
      Doing so would make this file/component even more reusable.
    */}
    const { post } = this.props;

    if (!post) {
      // We need this because this component will probably render long before
      // the axios request is resolved and the action > reducer > component
      // flow kicks off.
      return <div>Loading...</div>;
    }

    return (
      <div>
        <Link to="/">Back To Index</Link>
        <button
          className="btn btn-danger pull-xs-right"
          onClick={this.onDeleteClick.bind(this)}
        >
          Delete Post
        </button>
        <h3>{post.title}</h3>
        <h6>Categories: {post.categories}</h6>
        <p>{post.content}</p>
      </div>
    )
  }
}


// First argument to mapStateToProps is always are application state.
// But there IS a second argument, which we call 'ownProps'.
// ownProps is props object that is headed to the PostsShow component.
// So, 'this.props' in the component is ABSOLUTELY EQUAL TO (===) ownProps.
function mapStateToProps({ posts }, ownProps) {
  // return { posts } or { posts: posts }// This is dumb way.
  return { post: posts[ownProps.match.params.id]} // This smart way.
  // Thus, you can use mapStateToProps not just to pull off peices of state,
  // but you can also do some intermediate logic in them.
}

//export default PostsShow;
export default connect(mapStateToProps, { fetchPost, deletePost })(PostsShow);
