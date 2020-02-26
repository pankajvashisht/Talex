import React, { Fragment, useState } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
const UserDetails = (props) => {
	const [ userDetails ] = useState({ ...props.location.state.post });
	return (
		<Fragment>
			<Card>
				<CardHeader>
					<h1 style={{    paddingTop: "31px"}}> User Details </h1>
				</CardHeader>
			</Card>
			<CardBody>
				<div>
					<b> Name </b> : {userDetails.name}
				</div>
				<hr />
				<div>
					<b> Email </b> : {userDetails.email}
				</div>
				<hr />
				<div>
					<b> Phone </b> : {userDetails.phone_code}
					{userDetails.phone}
				</div>
				<hr />
				<div>
					<b> Address </b> : {userDetails.address}
				</div>
				<hr />
				<div>
					<b> DOB </b> : {userDetails.dob}
				</div>

				<hr />
			</CardBody>
		</Fragment>
	);
};

export default UserDetails;
