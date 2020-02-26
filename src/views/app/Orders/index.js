import React, {Fragment, useState, useEffect} from 'react';
import Pagination from "../../../containers/pages/Pagination";
import {orders} from '../../../Apis/admin';
import { NotificationManager } from "../../../components/common/react-notifications";
import { Row,Card,Nav } from "reactstrap";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../../components/common/CustomBootstrap";
import {convertDate} from '../../../constants/defaultValues';
const additional = {
    currentPage:1,
    totalItemCount: 0,
    totalPage: 1,
    search: "",
    pageSizes: [10, 20, 50, 100],
};
const Orders = React.memo((props)=>{
    const [pageInfo, setPageInfo] = useState(additional);
    const [totalPosts, setTotalPost] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        orders(currentPage, selectedPageSize).then(res => {
            const {data} = res;
            const {result,pagination} = data.data;
            setIsLoading(false);
            setTotalPost(result);
            additional.totalItemCount = pagination.totalRecord;
            additional.selectedPageSize = pagination.limit;
            additional.totalPage = pagination.totalPage;
            setPageInfo({...additional});
        }).catch(err => {
            setIsLoading(false);
            if(err.response){
                const { data } = err.response;
                NotificationManager.warning(
                data.error_message,
                "Something went wrong",
                3000,
                null,
                null,
                ''
                );
            }
        });
    },[selectedPageSize,currentPage]);
    
    
    const onChangePage = (value) => {
        setCurrentPage(value);
    };
    const onCheckItem = (key, value) => {};
    
    
    return isLoading ? (
        <div className="loading" />
      ):(
        <Fragment>
              <Row>
                   <Colxx xxs="6"><h1>Orders</h1></Colxx>
                    <Colxx xxs="6">
                        <select class="form-control"> 
                            <option value="0">New Order</option>
                            <option value="1">Accept Order</option>
                            <option value="2">cancel Order</option>
                            <option value="3">On going Order</option>
                            <option value="4">Complete</option>
                        </select>
                </Colxx>
                 <Nav tabs className="separator-tabs ml-0 mb-5"></Nav>
            </Row>
        
        {totalPosts.map((post,key) => (
            <Colxx xxs="12" key={post.id} className="mb-3">
            <ContextMenuTrigger id="menu_id" data={post.id} >
                <Card
                onClick={event => onCheckItem(event, post.id)}
                className={classnames("d-flex flex-row", {
                    active: "active"
                })}
                >

                <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                    <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                     <NavLink to={`?p=${post.id}`}>
                        <p className="list-item-heading mb-1 truncate">
                        {JSON.parse(post.product_details).name}
                        </p>
                    </NavLink>
                                <NavLink to={`?p=${post.id}`}>
                        <p className="list-item-heading mb-1 truncate">
                        Price: {post.price} 
                        </p>
                        <p className="list-item-heading mb-1 truncate">
                        Quantity: {post.quantity} 
                        </p>
                    </NavLink>
                    <p className="mb-1 text-muted text-small w-15 w-sm-100">
                        {post.location}
                    </p>
                    <p className="mb-1 text-muted text-small w-15 w-sm-100">
                        {convertDate(post.created)}
                    </p>
                    
                    </div>
                    
                </div>
                </Card>
            </ContextMenuTrigger>
            </Colxx>
        ))}


        <Pagination
              currentPage={currentPage}
              totalPage={pageInfo.totalPage}
              onChangePage={i => onChangePage(i)}
        />
    </Fragment>
    );

});

export default Orders;