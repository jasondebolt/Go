import React, { Component } from 'react';

export const ErrorMessage = ({header, body}) => (
  <div className="ui negative message">
    <i className="close icon"></i>
    <div className="header">
      {header}
    </div>
    <p>
      {body}
    </p>
  </div>
)
