import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// We don't need to specify index.js, since that is looked up by default.
// See https://nodejs.org/dist/latest-v7.x/docs/api/modules.html#modules_folders_as_modules
import { createLink, fetchLinks } from '../actions';


class LinksNew extends Component {

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

  onSubmit(values) {
    //console.log(values);
    //console.log(this.props);
    // this.props.history.push('/'); --> May return us to main page before link is created. Not ideal.
    this.props.createLink(values, () => {
      this.props.reset()
      this.props.fetchLinks()
      //this.props.history.push('/');
    })
  }

  render() {
    // Pull on the handleSubmit function that we get from reduxForm.
    const { handleSubmit } = this.props;
    return (
      <div className="ui segments">
        <form className="ui segment huge form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          {/*
            You can pass arbitrary values to the Field object and they will
            be accessible in the component as an attribute of the 'field' object
            within the component. See how {field.label} is used in 'renderField'
            above.
          */}
          <Field
            foo="FOO TITLE"
            label="Alias"
            name="alias"
            component={this.renderField}
          />
          <Field
            foo="FOO CATEGORIES"
            label="Url"
            name="url"
            component={this.renderField}
          />
          <button type="submit" className="ui green button">Submit</button>
          {/*
            Link tags actually do show up as anchor tags (see style.css file)
          */}
          <Link to="/" className="ui blue button">Cancel</Link>
        </form>
      </div>
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

  // If errors is empty, the form is fine to submit.
  return errors;
}

// Make sure that the string that you assign to the form property is unique.
// This is a helper that allow our redux form to communicate directly from
// our component to the reducer that we've already setup. I think that
// this just attaches a bunch of action creators to the component??

// OLD VERSION
//export default reduxForm({
//  validate,
//  form: 'LinksNewForm'
//})(LinksNew)

// NEW VERSION
export default reduxForm({
  validate,
  form: 'LinksNewForm'
})(connect(null, { createLink, fetchLinks })(LinksNew));
