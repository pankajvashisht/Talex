import React, { Fragment, useState, useReducer, useEffect } from 'react';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import { Row, Card, CardBody, Input, CardTitle, FormGroup, Label, Button, Form } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { getTag, addClass as classAdd } from '../../../Apis/admin';
import Autocomplete from 'react-google-autocomplete';
import { initialState } from './constants';
import Select from 'react-select';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { NotificationManager } from '../../../components/common/react-notifications';

const addClass = React.memo(() => {
	const reducer = (form, action) => {
		switch (action.key) {
			case action.key:
				return { ...form, [action.key]: action.value };
			default:
				throw new Error('Unexpected action');
		}
	};
	const location = (place) => {
		dispatch({ key: 'location', value: place.formatted_address });
	};
	const [ classForm, dispatch ] = useReducer(reducer, initialState);
	const [ tags, setTags ] = useState([]);
	const [ loading, setIsLoading ] = useState(false);
	const [ redirect, setRedirect ] = useState(false);
	const addclass = (event) => {
		event.preventDefault();
		setIsLoading(true);
		classAdd(classForm)
			.then(() => {
				setRedirect(true);
				NotificationManager.success('Class add successfully', 'Success', 3000, null, null, '');
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
	useEffect(() => {
		getTag(1, 1000).then((res) => {
			const { data } = res;
			const tags = [];
			data.data.result.forEach((value) => {
				const signle = {
					label: value.name,
					value: value.id,
					key: value.id
				};
				tags.push(signle);
			});
			setTags(tags);
		});
	}, []);
	const handleInput = (key, value) => {
		dispatch({ key, value });
	};
	const handleTag = (data) => {
		const tags = [];
		data.forEach((value) => {
			tags.push(value.value);
		});
		handleInput('tag_id', tags.toString());
	};
	if (redirect) {
		return <Redirect to="/classes" />;
	}
	return (
		<Fragment>
			<Row>
				<Colxx xxs="12">
					Add Class
					<Separator className="mb-5" />
				</Colxx>
			</Row>
			<Row className="mb-4">
				<Colxx xxs="12">
					<Card>
						<CardBody>
							<CardTitle>Add Class</CardTitle>
							<Form onSubmit={addclass}>
								<FormGroup row>
									<Colxx sm={6}>
										<FormGroup>
											<Label for="exampleEmailGrid">Name</Label>
											<Input
												type="text"
												required={true}
												value={classForm.name}
												onChange={({ target }) => handleInput('name', target.value)}
												name="name"
												placeholder="name"
											/>
										</FormGroup>
									</Colxx>

									<Colxx sm={6}>
										<FormGroup>
											<Label for="examplePasswordGrid">Price</Label>
											<Input
												type="number"
												required={true}
												value={classForm.price}
												onChange={({ target }) => handleInput('price', target.value)}
												name="price"
												placeholder="Price"
											/>
										</FormGroup>
									</Colxx>

									<Colxx sm={12}>
										<FormGroup>
											<Label for="exampleAddressGrid">Location</Label>
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
									<Colxx sm={12}>
										<FormGroup>
											<Label>Tags</Label>
											<Select
												components={{ Input: CustomSelectInput }}
												className="react-select"
												classNamePrefix="react-select"
												isMulti
												required
												name="form-field-name"
												onChange={(data) => handleTag(data)}
												options={tags}
											/>
										</FormGroup>
									</Colxx>
									<Colxx sm={12}>
										<FormGroup>
											<Label>Description</Label>
											<textarea
												rows="4"
												cols="50"
												required={true}
												value={classForm.description}
												className="form-control"
												onChange={({ target }) => handleInput('description', target.value)}
											/>
										</FormGroup>
									</Colxx>
								</FormGroup>

								<Button disabled={loading} type="submit" color="primary">
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

export default addClass;
