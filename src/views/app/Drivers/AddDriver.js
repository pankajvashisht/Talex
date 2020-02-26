import React, { Fragment, useState, useReducer } from 'react';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import { Row, Card, CardBody, Input, CardTitle, FormGroup, Label, Button, Form } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { addUser } from '../../../Apis/admin';
import Autocomplete from 'react-google-autocomplete';
import { initialState } from './Constants';
import { NotificationManager } from '../../../components/common/react-notifications';

const AddDriver = React.memo(() => {
	const reducer = (form, action) => {
		switch (action.key) {
			case action.key:
				return { ...form, [action.key]: action.value };
			default:
				throw new Error('Unexpected action');
		}
	};
	const location = (place) => {
		dispatch({ key: 'address', value: place.formatted_address });
	};
	const [ driverForm, dispatch ] = useReducer(reducer, initialState);
	const [ loading, setIsLoading ] = useState(false);
	const [ redirect, setRedirect ] = useState(false);
	const adddriver = (event) => {
		event.preventDefault();
		setIsLoading(true);
		addUser(driverForm)
			.then(() => {
				setRedirect(true);
				NotificationManager.success('Driver add successfully', 'Success', 3000, null, null, '');
			})
			.catch((err) => {
				if (err.response) {
					const { data } = err.response;
					NotificationManager.warning(data.error_message, 'Something went wrong', 3000, null, null, '');
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const handleInput = (key, value) => {
		dispatch({ key, value });
	};
	
	if (redirect) {
		return <Redirect to="/drivers" />;
	}
	return (
		<Fragment>
			<Row>
				<Colxx xxs="12">
					<h1>Add Driver</h1>
					<Separator className="mb-5" />
				</Colxx>
			</Row>
			<Row className="mb-4">
				<Colxx xxs="12">
					<Card>
						<CardBody>
							<CardTitle>Add Driver</CardTitle>
							<Form onSubmit={adddriver}>
								<FormGroup row>
									<Colxx sm={6}>
										<FormGroup>
											<Label for="exampleEmailGrid">Driver Name</Label>
											<Input
												type="text"
												required={true}
												value={driverForm.name}
												onChange={({ target }) => handleInput('name', target.value)}
												name="name"
												placeholder="Driver Name"
											/>
										</FormGroup>
									</Colxx>

									<Colxx sm={6}>
										<FormGroup>
											<Label for="examplePasswordGrid">Phone</Label>
											<Input
												type="number"
												required={true}
												value={driverForm.phone}
												onChange={({ target }) => handleInput('phone', target.value)}
												name="phone"
												placeholder="Phone"
											/>
										</FormGroup>
									</Colxx>

									<Colxx sm={12}>
										<FormGroup>
											<Label for="exampleAddressGrid">Address</Label>
											<Autocomplete
												required={true}
												className="form-control"
												style={{ width: '100%' }}
												onPlaceSelected={(place) => {
													location(place);
												}}
											/>
										</FormGroup>
									</Colxx>
									<Colxx sm={6}>
										<FormGroup>
											<Label for="exampleEmailGrid">Password</Label>
											<Input
												type="password"
												required={true}
												value={driverForm.password}
												onChange={({ target }) => handleInput('password', target.value)}
												name="password"
												placeholder="Password"
											/>
										</FormGroup>
									</Colxx>

									<Colxx sm={6}>
										<FormGroup>
											<Label for="examplePasswordGrid">Email</Label>
											<Input
												type="email"
												required={true}
												value={driverForm.email}
												onChange={({ target }) => handleInput('email', target.value)}
												name="email"
												placeholder="Email"
											/>
										</FormGroup>
									</Colxx>
									<Colxx sm={6}>
										<FormGroup>
											<Label for="examplePasswordGrid">Profile</Label>
											<Input
												type="file"
												required={true}
												onChange={({ target }) => handleInput('profile', target.files[0])}
												name="profile"
												placeholder=""
											/>
										</FormGroup>
									</Colxx>
									<Colxx sm={6}>
										<FormGroup>
											<Label for="examplePasswordGrid">Licence</Label>
											<Input
												type="file"
												required={true}
												onChange={({ target }) => handleInput('licence', target.files[0])}
											/>
										</FormGroup>
									</Colxx>
								</FormGroup>

								<Button disabled={loading} type="submit" className={`btn-shadow btn-multiple-state ${loading ? "show-spinner" : ""}`} color="primary">
									Save
								</Button>
							</Form>
						</CardBody>
					</Card>
				</Colxx>
			</Row>
		</Fragment>
	);
});

export default AddDriver;
