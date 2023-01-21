import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import { sentenceCase } from 'change-case';
import { TableRow, TableCell, Avatar, Collapse, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Label from '../../../components/label';
import RecordList from './RecordList';

function UserListRow(props) {
  const [open, setOpen] = useState(false);
  const { inventory: { img, id, sku, product_name: productName, inventory_status: statusID, inventory_level: level, inventory_value: value, remark }, ...rest } = props;
  const status = statusID === 0 ? 'Normal' : 'Low';

  return (<Fragment {...rest}>
    <TableRow onClick={() => setOpen(!open)}>
      <TableCell>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => setOpen(!open)}
        >
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>

      <TableCell component="th" scope="row" padding="none" align='center'>
        <Avatar src={img} sx={{ margin: "auto" }} variant="rounded" />
      </TableCell>

      <TableCell align="left">{sku}</TableCell>

      <TableCell align="left">{productName}</TableCell>

      <TableCell align="left">
        <Label color={(status === 'Low' && 'error') || 'success'}>{sentenceCase(status)}</Label>
      </TableCell>

      <TableCell align="left">{level}</TableCell>

      <TableCell align="left">{value / 100}</TableCell>

      <TableCell align="right">{remark}</TableCell>

    </TableRow>
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
        <Collapse in={open} unmountOnExit>
          <RecordList productId={id} />
        </Collapse>
      </TableCell>
    </TableRow>
  </Fragment>
  );
}

export default UserListRow;