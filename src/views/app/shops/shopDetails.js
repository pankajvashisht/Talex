import React, { Fragment, useState, useEffect } from 'react';
import {
	Row,
	Card,
	CardBody,
	Nav,
	TabPane,
	CardTitle,
	CardSubtitle,
	CardText,
	CardImg,
	Modal,
	ModalHeader,
	ModalBody,
	Button
} from 'reactstrap';

import StatusUpdate from '../../../components/UpdateStatus';
import { Colxx } from '../../../components/common/CustomBootstrap';
import SingleLightbox from '../../../components/pages/SingleLightbox';
import { products } from '../../../Apis/admin';
import { NotificationManager } from '../../../components/common/react-notifications';
const ShopDetails = (props) => {
	const [ shopDetails ] = useState({ ...props.location.state.post });
	const [ Products, setProducts ] = useState([]);
	const [ showModel, setShowModel ] = useState(false);
	useEffect(() => {
		products(1, 100, shopDetails.id)
			.then((res) => {
				const { data } = res;
				const { result } = data.data;

				setProducts(result);
			})
			.catch((err) => {
				if (err.response) {
					const { data } = err.response;
					NotificationManager.warning(data.error_message, 'Something went wrong', 3000, null, null, '');
				}
			});
	}, []);
	return (
		<Fragment>
			<Row>
				<Colxx xxs="12">
					<h1>Shop Details</h1>
					<Nav tabs className="separator-tabs ml-0 mb-5">
					
					</Nav>

					<TabPane tabId="1">
						<Row>
							<Colxx xxs="12" lg="4" className="mb-4 col-left">
								<Card className="mb-4">
									<div className="position-absolute card-top-buttons" />
									<SingleLightbox
										thumb={
											shopDetails.profile ? shopDetails.profile : '/assets/img/profile-pic.jpg'
										}
										large={
											shopDetails.profile ? shopDetails.profile : '/assets/img/profile-pic.jpg'
										}
										className="card-img-top"
									/>

									<CardBody>
										<p className="text-muted text-small mb-2">{shopDetails.name}</p>
										<p className="mb-3">Shop infomations</p>
										<p className="text-muted text-small mb-2">Locations</p>
										<p className="mb-3">{shopDetails.address}</p>
									</CardBody>
								</Card>

								<Card className="mb-4">
									<CardBody>
										<CardTitle>Details</CardTitle>
										<div className="remove-last-border remove-last-margin remove-last-padding">
											<div>
												<b> Name </b> : {shopDetails.name}
											</div>
											<hr />
											<div>
												<b> Email </b> : {shopDetails.email}
											</div>
											<hr />
											<div>
												<b> Phone </b> : {shopDetails.phone_code}
												{shopDetails.phone}
											</div>
											<hr />
											<div>
												<b> Address </b> : {shopDetails.address}
											</div>
											<hr />
											<div>
												<b> Status </b> :{' '}
												<StatusUpdate
													table="users"
													onUpdate={(data) =>
														(shopDetails.status = shopDetails.status === 1 ? 0 : 1)}
													data={shopDetails}
												/>
											</div>
											<hr />
										</div>
									</CardBody>
								</Card>
							</Colxx>
							<Colxx xxs="12" lg="8" className="mb-4 col-right">
								<Row>
									{
										<Colxx xxs="12" lg="12" xl="12" className="mb-12">
											<Card>
												<CardBody>
													<CardTitle>
														Licence{' '}
														<Button
															className="mb-2 float-right"
															color="primary"
															outline
															onClick={() => {
																setShowModel(true);
															}}
														>
															View Licence
														</Button>
													</CardTitle>
													<CardImg
														style={{ height: '400px' }}
														top
														alt={shopDetails.licence}
														src={shopDetails.licence}
													/>
												</CardBody>
											</Card>
										</Colxx>
									}
								</Row>
								<hr />
								<h1>Products </h1>
								<Row>
									{Products.map((product) => {
										return (
											<Colxx xxs="12" lg="6" xl="4" className="mb-4" key={product.id}>
												<Card>
													<div className="position-relative">
														<CardImg
															style={{ height: '200px' }}
															top
															alt={product.image}
															src={product.image}
														/>
													</div>
													<CardBody>
														<CardSubtitle>{product.name}</CardSubtitle>

														<CardText className="text-muted text-small mb-0 font-weight-light">
															Price : {product.price}
														</CardText>
													</CardBody>
												</Card>
											</Colxx>
										);
									})}
								</Row>
							</Colxx>
						</Row>
					</TabPane>
				</Colxx>

				<Modal isOpen={showModel} size="lg" toggle={() => setShowModel(false)}>
					<ModalHeader toggle={() => setShowModel(false)}>View Licence</ModalHeader>
					<ModalBody>
						<CardImg top alt={shopDetails.licence} src={shopDetails.licence} />
					</ModalBody>
				</Modal>
			</Row>
		</Fragment>
	);
};

export default ShopDetails;
