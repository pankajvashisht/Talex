import React, { Fragment, useState, useEffect } from 'react';
import ListPageHeading from '../../../containers/pages/ListPageHeading';
import Pagination from '../../../containers/pages/Pagination';
import { drivers } from '../../../Apis/admin';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Card,CardBody, CardTitle } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { Colxx } from '../../../components/common/CustomBootstrap';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
const additional = {
	currentPage: 1,
	totalItemCount: 0,
	totalPage: 1,
	search: '',
	pageSizes: [ 10, 20, 50, 100 ]
};
const MapWithAMarker  = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap defaultZoom={8} defaultCenter={{ lat:props.lat, lng:props.lng }}>
      <Marker position={{ lat:props.lat, lng:props.lng }} />
    </GoogleMap>
  ))
);
const DriverMap = React.memo((props) => {
	const [ pageInfo, setPageInfo ] = useState(additional);
	const [ totalPosts, setTotalPost ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(true);
	const [ selectedPageSize, setSelectedPageSize ] = useState(10);
	const [ currentPage, setCurrentPage ] = useState(1);
    const [ searchText, setSearchtext ] = useState(undefined);

	useEffect(
		() => {
			drivers(currentPage, selectedPageSize, searchText)
				.then((res) => {
					const { data } = res;
					const { result, pagination } = data.data;
					setIsLoading(false);
					setTotalPost(result);
					additional.totalItemCount = pagination.totalRecord;
					additional.selectedPageSize = pagination.limit;
					additional.totalPage = pagination.totalPage;
					setPageInfo({ ...additional });
				})
				.catch((err) => {
					setIsLoading(false);
					if (err.response) {
						const { data } = err.response;
						NotificationManager.warning(data.error_message, 'Something went wrong', 3000, null, null, '');
					}
				});
		},
		[ selectedPageSize, currentPage, searchText ]
    );
    const isOnline = (status) => {
        if(status===1){
            return (<span   className="badge badge-pill badge-success">Online</span>);
        }
        return (<span   className="badge badge-pill badge-danger">Offline</span>);
    };
	const onSearchKey = (event) => {
		setSearchtext(event.target.value);
	};
	const changePageSize = (value) => {
		setIsLoading(true);
		setSelectedPageSize(value);
	};
	const onChangePage = (value) => {
		setCurrentPage(value);
	};
	
	
	const startIndex = (currentPage - 1) * selectedPageSize;
	const endIndex = currentPage * selectedPageSize;
	return isLoading ? (
		<div className="loading" />
	) : (
		<Fragment>
			<ListPageHeading
				match={props.match}
				heading="MAPS"
				changePageSize={changePageSize}
				selectedPageSize={selectedPageSize}
				totalItemCount={pageInfo.totalItemCount}
				startIndex={startIndex}
				endIndex={endIndex}
				onSearchKey={onSearchKey}
				orderOptions={pageInfo.orderOptions}
				pageSizes={pageInfo.pageSizes}
			/>
			{totalPosts.map((post, key) => (
                <>
				
                <Colxx xxs="12" key={post.created} className="mb-6">
                    <Card>
                    <CardBody>
                        <CardTitle>
                        <NavLink
                            to={{
                                pathname: '/driver-details',
                                state: { post }
                            }}
                            className="w-40 w-sm-100"
                        >
										<p className="list-item-heading mb-1 truncate">{post.name}</p>
									</NavLink>
                                    <CardTitle className={{float:"right"}}>{isOnline(post.is_online)}</CardTitle>
                        </CardTitle>
                        
                        <MapWithAMarker
                        lat={post.latitude}
                        lng={post.longitude}
                        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC5-nBPRTKoIFzoVXfALW-oPnBlCLQTTIY&v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={<div className="map-item" />}
                        containerElement={<div className="map-item" />}
                        mapElement={<div className="map-item" />}/>
                    </CardBody>
                    </Card>
                </Colxx>  
                </>
			))}
                                 
			<Pagination
				currentPage={currentPage}
				totalPage={pageInfo.totalPage}
				onChangePage={(i) => onChangePage(i)}
			/>
		</Fragment>
	);
});

export default DriverMap;
