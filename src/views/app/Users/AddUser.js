import React, { Fragment, useState, useReducer } from 'react';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import { Row, Card, CardBody, Input, CardTitle, FormGroup, Label, Button, Form } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { addUser } from '../../../Apis/admin';
import Autocomplete from 'react-google-autocomplete';
import { initialState } from './Constants';
import { NotificationManager } from '../../../components/common/react-notifications';
const AddUser = React.memo(() => {
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
	const [ userForm, dispatch ] = useReducer(reducer, initialState);
	const [ loading, setIsLoading ] = useState(false);
	const [ redirect, setRedirect ] = useState(false);
	const addshop = (event) => {
		event.preventDefault();
		setIsLoading(true);
		addUser(userForm)
			.then(() => {
				setRedirect(true);
				NotificationManager.success('User add successfully', 'Success', 3000, null, null, '');
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
		return <Redirect to="/users" />;
	}
	return (
		<Fragment>
			<Row>
				<Colxx xxs="12">
					<h1>Add User</h1>
					<Separator className="mb-5" />
				</Colxx>
			</Row>
			<Row className="mb-4">
				<Colxx xxs="12">
					<Card>
						<CardBody>
							<CardTitle>Add User</CardTitle>
							<Form onSubmit={addshop}>
								<FormGroup row>
									<Colxx sm={6}>
										<FormGroup>
											<Label for="exampleEmailGrid">User Name</Label>
											<Input
												type="text"
												required={true}
												value={userForm.name}
												onChange={({ target }) => handleInput('name', target.value)}
												name="name"
												placeholder="User Name"
											/>
										</FormGroup>
									</Colxx>

									<Colxx sm={6}>
										<FormGroup>
											<Label for="examplePasswordGrid">Phone</Label>
											<Input
												type="number"
												required={true}
												value={userForm.phone}
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
												value={userForm.password}
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
												value={userForm.email}
												onChange={({ target }) => handleInput('email', target.value)}
												name="email"
												placeholder="Email"
											/>
										</FormGroup>
									</Colxx>
									<Colxx sm={12}>
										<FormGroup>
											<Label for="examplePasswordGrid">DOB</Label>
											<Input
												type="date"
												required={true}
												value={userForm.dob}
												onChange={({ target }) => handleInput('dob', target.value)}
												name="dob"
												placeholder="DOB"
											/>
										</FormGroup>
									</Colxx>
								</FormGroup>

								<Button
									disabled={loading}
									type="submit"
									className={`btn-shadow btn-multiple-state ${loading ? 'show-spinner' : ''}`}
									color="primary"
								>
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

export default AddUser;
