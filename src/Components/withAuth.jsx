import React from 'react';
import { Redirect } from 'react-router-dom';

function isLoggedIn() {
  const token = localStorage.getItem('token');
  return token !== null;
}

function withAuth(Component) {
  return class extends React.Component {
    render() {
      if (!isLoggedIn()) {
        return <Redirect to="/login" />;
      }
      return <Component {...this.props} />;
    }
  };
}

export default withAuth;
