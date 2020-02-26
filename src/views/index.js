import React, { memo } from "react";
import { Redirect ,Route, Switch, BrowserRouter as Router} from "react-router-dom";
import {checkAuth} from  '../utils/helper';
const AuthRoute = ({ component: Component , ...rest }) => {
  return (
    <Route
      {...rest}
      render={props =>
        checkAuth('LoginUser') ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/admin/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

const ViewApp = React.lazy(() =>
  import(/* webpackChunkName: "views-app" */ './app')
);
const Login = React.lazy(() =>
  import(/* webpackChunkName: "views-user" */ './login')
);
const Admin = () => {
  return (
     <Router basename="admin">
      <Switch>  
        <Route
            expect
            path="/login"
            component={Login}
        />
        { <AuthRoute
            path="/"
            component={ViewApp}
        /> }
      </Switch>
    </Router>
  );

};

export default memo(Admin);