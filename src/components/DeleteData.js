import React from "react";
import PropTypes from "prop-types";
import {Button} from "reactstrap";
import swal from "sweetalert";
import { deleteUser } from "../Apis/admin";
const DeleteData = ({ classes, children, table, data,ondelete, view = 'User' }) => {
  const deleted = ( ) => {
    swal({
      title: `Are you sure want delete?`,
      text: `Are you sure want to delete ` + view,
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        deleteUser({table:table,id:data}).then(data => {
          swal(view+" have been deleted", {
            icon: "success"
          });
          ondelete(data);
        }).catch(err => {
          swal("Something went wrong", {
            icon: "error"
          });
        });
      } else {
        swal("Process Cancel");
      }
    });
  };

  return (
    <Button
      className={classes}
      children={children}
      onClick={deleted}
    />
  );
};

DeleteData.propTypes = {
  children: PropTypes.node.isRequired,
  table: PropTypes.string.isRequired,
  data: PropTypes.number.isRequired
};

DeleteData.defaultProps = {
  type: "button",
  disabled: null,
  classes: "mb-2 btn btn-danger"
};

export default DeleteData;