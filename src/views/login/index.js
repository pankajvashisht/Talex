import React, { useState , Suspense} from "react";
import { Row, Card, CardTitle, Label, FormGroup, Button } from "reactstrap";
import { Redirect, NavLink } from 'react-router-dom';
import { NotificationManager } from "../../components/common/react-notifications";
import { Formik, Form, Field } from "formik";
import {Adminlogin} from '../../Apis/admin';
import { Colxx } from "../../components/common/CustomBootstrap";
import IntlMessages from "../../helpers/IntlMessages";
import UserLayout from '../../layout/UserLayout';
import {localData,checkAuth} from '../../utils/helper'
const Login = React.memo(({props}) => {
const [loading , setLoading] = useState(false);
const [redirect , setRedirect] = useState(checkAuth('LoginUser'));
const [userInfo, SetUserinfo] = useState({
    email:"",
    password:""
});
const validateEmail = (value) => {
    let error;
    if (!value) {
      error = "Please enter your email address";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = "Invalid email address";
    }
    userInfo['email'] = value;
    SetUserinfo({...userInfo});
    return error;
  }

 const validatePassword = (value) => {
    let error;
    if (!value) {
      error = "Please enter your password";
    } else if (value.length < 4) {
      error = "Value must be longer than 3 characters";
    }
    userInfo['password'] = value;
    SetUserinfo({...userInfo});
    return error;
  }
 const onUserLogin = () => {
    setLoading(true); 
    const {email , password} = userInfo;
    Adminlogin({email, password}).then(async res => {
      await localData('LoginUser', res.data.data);
      await localData('__theme_color', 'dark.orange');
      setRedirect(true);
      NotificationManager.success(
        "User Login successfully",
        "Login Success",
        3000,
        null,
        null,
        ''
      );

    }).catch(err => {
      setLoading(false); 
      if(err.response){
        const { data } = err.response;
        NotificationManager.warning(
          data.error_message,
          "Login Error",
          3000,
          null,
          null,
          ''
        );
      }
    });
    
 }; 
const initialValues = userInfo;
if(redirect){
  return <Redirect to="/" />;
}
return(
    <UserLayout>
    <Suspense fallback={<div className="loading" />}>
    <Row className="h-100">
        <Colxx xxs="12" md="10" className="mx-auto my-auto">
          <Card className="auth-card">
            <div className="position-relative image-side ">
              <p className="text-white h2">MAGIC IS IN THE DETAILS</p>
              <p className="white mb-0">
                Please use your credentials to login.
                <br />
              </p>
            </div>
            <div className="form-side">
              
              <NavLink to={`/`} className="white">
                <img style={{marginLeft: "12vw",borderRadius:"50%"}} height="160px" src="/assets/img/logo.jpeg" />
                {/* <span className="logo-single" /> */}
              </NavLink>
              <CardTitle className="mb-4">
                <IntlMessages id="user.login-title" />
              </CardTitle>

              <Formik
                initialValues={initialValues}
                onSubmit={onUserLogin}>
                {({ errors, touched }) => (
                  <Form className="av-tooltip tooltip-label-bottom">
                    <FormGroup className="form-group has-float-label">
                      <Label>
                        <IntlMessages id="user.email" />
                      </Label>
                      <Field
                        className="form-control"
                        name="email"
                        validate={validateEmail}
                        value={userInfo.email}
                      />
                      {errors.email && touched.email && (
                        <div className="invalid-feedback d-block">
                          {errors.email}
                        </div>
                      )}
                    </FormGroup>
                    <FormGroup className="form-group has-float-label">
                      <Label>
                        <IntlMessages id="user.password" />
                      </Label>
                      <Field
                        className="form-control"
                        type="password"
                        name="password"
                        value={userInfo.password}
                        validate={validatePassword}
                      />
                      {errors.password && touched.password && (
                        <div className="invalid-feedback d-block">
                          {errors.password}
                        </div>
                      )}
                    </FormGroup>
                    <div className="d-flex justify-content-between align-items-center">
                      {/* <NavLink to={`/user/forgot-password`}>
                        <IntlMessages id="user.forgot-password-question" />
                      </NavLink> */}
                      <Button
                        color="primary"
                        className={`btn-shadow btn-multiple-state ${loading ? "show-spinner" : ""}`}
                        size="lg"
                      >
                        <span className="spinner d-inline-block">
                          <span className="bounce1" />
                          <span className="bounce2" />
                          <span className="bounce3" />
                        </span>
                        <span className="label"><IntlMessages id="user.login-button" /></span>
                      </Button>
                    </div>


                  </Form>
                )}
              </Formik>
            </div>
          </Card>
        </Colxx>
      </Row>
    </Suspense> 
    </UserLayout>   
);

});

export default Login;
