import React, { Fragment, useState } from 'react';
import {
	Row,
	Card,
	CardBody,
	Nav,
	NavItem,
	TabPane,
	CardTitle,
	CardImg,
	Modal,
	ModalHeader,
	ModalBody,
	Button
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import StatusUpdate from '../../../components/UpdateStatus';
import { Colxx } from '../../../components/common/CustomBootstrap';
import SingleLightbox from '../../../components/pages/SingleLightbox';
const DriverDetails = (props) => {
	const [ driverDetails ] = useState({ ...props.location.state.post });
	const [ showModel, setShowModel ] = useState(false);
	return (
		<Fragment>
			<Row>
				<Colxx xxs="12">
					<h1>Shop Details</h1>
					<Nav tabs className="separator-tabs ml-0 mb-5">
						<NavItem>
							<NavLink
								className={classnames({
									active: 1,
									'nav-link': true
								})}
								location={{}}
								to="#"
							/>
						</NavItem>
					</Nav>

					<TabPane tabId="1">
						<Row>
							<Colxx xxs="12" lg="4" className="mb-4 col-left">
								<Card className="mb-4">
									<div className="position-absolute card-top-buttons" />
									<SingleLightbox
										thumb={
											driverDetails.profile ? (
												driverDetails.profile
											) : (
												'/assets/img/profile-pic.jpg'
											)
										}
										large={
											driverDetails.profile ? (
												driverDetails.profile
											) : (
												'/assets/img/profile-pic.jpg'
											)
										}
										className="card-img-top"
									/>

									<CardBody>
										<p className="text-muted text-small mb-2">{driverDetails.name}</p>
										<p className="mb-3">Shop infomations</p>
										<p className="text-muted text-small mb-2">Locations</p>
										<p className="mb-3">{driverDetails.address}</p>
									</CardBody>
								</Card>

								<Card className="mb-4">
									<CardBody>
										<CardTitle>Details</CardTitle>
										<div className="remove-last-border remove-last-margin remove-last-padding">
											<div>
												<b> Name </b> : {driverDetails.name}
											</div>
											<hr />
											<div>
												<b> Email </b> : {driverDetails.email}
											</div>
											<hr />
											<div>
												<b> Phone </b> : {driverDetails.phone_code}
												{driverDetails.phone}
											</div>
											<hr />
											<div>
												<b> Address </b> : {driverDetails.address}
											</div>
											<hr />
											<div>
												<b> Status </b> :{' '}
												<StatusUpdate
													table="users"
													onUpdate={(data) =>
														(driverDetails.status = driverDetails.status === 1 ? 0 : 1)}
													data={driverDetails}
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
														alt={driverDetails.licence}
														src={driverDetails.licence}
													/>
												</CardBody>
											</Card>
										</Colxx>
									}
								</Row>
							</Colxx>
						</Row>
					</TabPane>
				</Colxx>
				<Modal isOpen={showModel} size="lg" toggle={() => setShowModel(false)}>
					<ModalHeader toggle={() => setShowModel(false)}>View Licence</ModalHeader>
					<ModalBody>
						<CardImg top alt={driverDetails.licence} src={driverDetails.licence} />
					</ModalBody>
				</Modal>
			</Row>
		</Fragment>
	);
};

export default DriverDetails;
