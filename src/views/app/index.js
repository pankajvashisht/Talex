import React, { Component, Suspense } from 'react';
import { Route, withRouter, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import AppLayout from '../../layout/AppLayout';

const Default = React.lazy(() => import(/* webpackChunkName: "dashboards" */ './dashboards/default'));
const Users = React.lazy(() => import(/* webpackChunkName: "users" */ './users'));
const Shops = React.lazy(() => import(/* webpackChunkName: "shops" */ './shops/'));
const ShopDetails = React.lazy(() => import(/* webpackChunkName: "shops-details" */ './shops/shopDetails'));
const Drivers = React.lazy(() => import(/* webpackChunkName: "driver" */ './Drivers'));
const Push = React.lazy(() => import(/* webpackChunkName: "add class" */ './push'));
const UserDetails = React.lazy(() => import(/* webpackChunkName: "user Details" */ './userDetails'));
const Orders  = React.lazy(() => import(/* webpackChunkName: "order" */ './Orders'));
const DriverDetails = React.lazy(() => import(/* webpackChunkName: "driverDetails" */ './Drivers/driverDetails'));
const DriverMap = React.lazy(() => import(/* webpackChunkName: "driver-map" */ './Drivers/map'));
const AppInformation = React.lazy(() => import(/* webpackChunkName: "app-info" */ './AppInformations'));
const AddShop = React.lazy(() => import(/* webpackChunkName: "add-shop" */ './shops/AddShop'));
const AddDriver = React.lazy(() => import(/* webpackChunkName: "add-shop" */ './Drivers/AddDriver'));
const AddUser = React.lazy(() => import(/* webpackChunkName: "add-shop" */ './Users/AddUser'));
const Profile = React.lazy(() => import(/* webpackChunkName: "add-shop" */ './profile'));
class App extends Component {
	render() {
		return (
			<AppLayout>
				<div className="dashboard-wrapper">
					<Suspense fallback={<div className="loading" />}>
						<Switch>
							<Redirect exact from={`/`} to={`/dashboards`} />
							<Route exact path={`/dashboards`} render={(props) => <Default {...props} />} />
							<Route path={`/users`} render={(props) => <Users {...props} />} />
							<Route path={`/shops`} render={(props) => <Shops {...props} />} />
							<Route path={`/shop-details`} render={(props) => <ShopDetails {...props} />} />
							<Route path={`/drivers`} component={Drivers} />} />
							<Route path={`/user-details`} render={(props) => <UserDetails {...props} />} />
							<Route path={`/driver-details`} render={(props) => <DriverDetails {...props} />} />
							<Route path={`/maps-drivers`} render={(props) => <DriverMap {...props} />} />
							<Route path={`/push`} render={(props) => <Push {...props} />} />
							<Route path={`/orders`} render={(props) => <Orders {...props} />} />
							<Route path={`/add-shop`} component={AddShop} />} />
							<Route path={`/add-driver`} component={AddDriver} />} />
							<Route path={`/add-user`} component={AddUser} />} />
							<Route path={`/profile`} component={Profile} />} />
							<Route path={`/app-information`} render={(props) => <AppInformation {...props} />} />
							<Redirect to="/error" />
						</Switch>
					</Suspense>
				</div>
			</AppLayout>
		);
	}
}
const mapStateToProps = ({ menu }) => {
	const { containerClassnames } = menu;
	return { containerClassnames };
};

export default withRouter(connect(mapStateToProps, {})(App));
