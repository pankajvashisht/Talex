import React from "react";
import PropTypes from "prop-types";
import { updateUser } from "../Apis/admin";
const StatusUpdate = ({  table, data, onUpdate,key='status' }) => {
    
    const statusCheck = (status) => {return (status === 1) ? 'badge badge-pill badge-success': 'badge badge-pill badge-danger';}
    const text = (status) => {return (status === 1) ? 'Active': 'Deactive';}
    
    const updateStatus = () => {
        if (data.status) {
            data.status = 0;
        }else{
            data.status = 1;
        }
        updateUser({table,[key]:data.status,id:data.id}).then(info => {
          onUpdate(data);
        }).catch(err => {})
    };

 

    return (<span style={{cursor:"pointer"}} onClick={updateStatus} className={statusCheck(data.status)}>{text(data.status)}</span>);
  
};

StatusUpdate.propTypes = {
  table: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
};

StatusUpdate.defaultProps = {
  type: "button",
  disabled: null,
  classes: "badge badge-success"
};

export default StatusUpdate;
