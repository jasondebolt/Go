import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, initialize } from 'redux-form';
import { putLink, fetchLink, fetchLinks, deleteLink, fetchContext } from '../actions';
import { Link } from 'react-router-dom';
import { ErrorMessage } from './messages';

class LinksShow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      'unauthorized_error': false
    }
  }
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
    this.handleInitialize();

    // Scroll to top of window.
    window.scrollTo(0, 0)
  }

  handleInitialize() {
    const initData = {
      "alias": this.props.link.alias,
      "url": this.props.link.url,
      "owner": this.props.link.owner
    };
    this.props.initialize(initData);
  }

  onDeleteClick() {
    // Pull the id from the URL.
    const { alias } = this.props.match.params; // Provided to us by react-router
    this.props.deleteLink(alias,
      (successResponse) => {
        this.props.history.push('/');
      },
      (errorResponse) => {
        this.setState({'unauthorized_error': true})
      }
    )
  }

  render() {
    const { link } = this.props;
    const { handleSubmit } = this.props;

    if (!link) {
      return <div>Loading...</div>;
    }

    const className = `field ${this.state.unauthorized_error ? 'error': ''}`;

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          <h2 className="ui header">Update or delete a link</h2>
          <div className="ui grid">
            <div className="wide column centered">
              <div className="ui segments">
                <form className="ui segment huge form" onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                  {/*
                    You can pass arbitrary values to the Field object and they will
                    be accessible in the component as an attribute of the 'field' object
                    within the component. See how {field.label} is used in 'renderField'
                    above.
                  */}
                  <Field
                    label="Alias"
                    name="alias"
                    component={this.renderField}
                  />
                  <Field
                    label="Url"
                    name="url"
                    component={this.renderField}
                  />
                  <Field
                    label="Owner"
                    name="owner"
                    component={this.renderField}
                  />
                  <button type="submit" className="ui green button">Submit</button>
                  {/*
                    Link tags actually do show up as anchor tags (see style.css file)
                  */}
                  <Link to="/" className="ui blue button">Cancel</Link>
                  <Link to="/" className="ui button red"
                    onClick={handleSubmit(this.onDeleteClick.bind(this))}>Delete</Link>
                </form>
              </div>
              {
                this.state.unauthorized_error
                  ? <ErrorMessage
                    header="Sorry, you do not own this link."
                    body="Only this link owner can change this link."
                    />
                  : null
              }
            </div>
          </div>
        </div>
      </div>
      )
  }

  renderField(field) {
    //console.log(field.foo)
    // const { meta } = field; // --> destructuring is cool, but keep it simple for now.
    // const { meta : { touched, error }} = field; // --> Even cooler!!
    const className = `field ${field.meta.touched && field.meta.error ? 'error': ''}`;
    return (
      <div className={className}> {
        /* field.input is an object which contains a bunch
        of different event handlers and a bunch of different props.
        Stuff like 'onChange, onBlur, onFocus' as well as the value of the
        intput. By doing the ..., we are saying that field.input is an object
        and we want all of the properties this object to be communicated as
        properts to the input tag. It's a little bit of fancy JSX that keeps
        us from having to write things like:
        <input
          onChange={field.input.onChange}
          onFocus={field.input.onFocus}
        />
      */}
        <label>{field.label}</label>
        <input
          type="text"
          {...field.input}
        />
        {/*
          This error string will be the same string that we defined in the
          validate function for this particular field.
        */}
        {field.meta.touched ? field.meta.error: ''}
      </div>
    )
  }

  handleFormSubmit(formProps) {
    // this.props.history.push('/'); --> May return us to main page before link is created. Not ideal.
    this.props.putLink(formProps,
      (successResponse) => {
        //this.props.reset()
        this.props.fetchLinks()
        this.props.history.push('/');
      },
      (errorResponse) => {
        this.setState({'unauthorized_error': true})
      }
    )
  }

}

function validate(values) {
  //console.log(values) --> { alias: 'asdf': url: 'asdf'}
  const errors = {}

  if (!values.alias) {
    errors.alias = "Enter an alias!"
  }
  if (!values.url) {
    errors.url = "Enter a url!"
  }
  if (!values.owner) {
    errors.owner = "Enter an owner!"
  }

  // If errors is empty, the form is fine to submit.
  return errors;
}


// First argument to mapStateToProps is always are application state.
// But there IS a second argument, which we call 'ownProps'.
// ownProps is props object that is headed to the LinksShow component.
// So, 'this.props' in the component is ABSOLUTELY EQUAL TO (===) ownProps.
function mapStateToProps({ links, context}, ownProps) {
  // return { links } or { links: links }// This is dumb way.
  return {
    link: links[ownProps.match.params.alias],
    context: context
  }
}

export default reduxForm({
  validate,
  form: 'LinksUpdateForm',
})(connect(mapStateToProps, { putLink, fetchLink, fetchLinks, deleteLink, fetchContext })(LinksShow));
