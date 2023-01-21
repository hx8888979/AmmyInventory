import { useState } from 'react';
import dayjs from 'dayjs';
import { Box, Button, TableRow, TableCell, Select, MenuItem, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { useAddRecordMutation, useDeleteRecordMutation, useUpdateRecordMutation } from '../../../features/api/apiSlice';

function RecordEditor(props) {
  const { productId, onCancel, onConfirm, record } = props;
  const [deleteConfirmation, setdeleteConfirmation] = useState(false);
  const [recordType, setRecordType] = useState(record?.type || 0);
  const [recordDate, setRecordDate] = useState(record?.date || dayjs());
  const [recordCount, setRecordCount] = useState(record?.count || 0);
  const [recordPrice, setRecordPrice] = useState((record?.price && record.price / 100) || 0);

  const [addNewPost, { isLoading }] = useAddRecordMutation();
  const [updateRecord, { isLoadingUpdateRecord }] = useUpdateRecordMutation();
  const [deleteRecord, { isLoadingDeleteRecord }] = useDeleteRecordMutation();


  const handlePost = async () => {
    const newRecord = {
      type: parseInt(recordType, 10),
      date: new Date(recordDate).getTime(),
      count: parseInt(recordCount, 10),
      price: Math.round(parseFloat(recordPrice, 10).toFixed(2) * 100)
    };
    if (!!record) {
      await updateRecord({ productId, recordId: record.id, record: newRecord }).unwrap();
    } else {
      await addNewPost({ productId, record: newRecord }).unwrap();
    }
    if (onConfirm) onConfirm();
  };

  const handleDelete = async () => {
    await deleteRecord({ productId, recordId: record.id }).unwrap();
    if (onConfirm) onConfirm();
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Select variant='standard' value={recordType} onChange={(e) => setRecordType(e.target.value)}>
            <MenuItem value={0}>Order</MenuItem>
            <MenuItem value={1}>Sales</MenuItem>
            <MenuItem value={2}>Change</MenuItem>
          </Select>
        </TableCell>
        <TableCell scope="row">
          <DesktopDatePicker
            value={recordDate}
            onChange={(value) => setRecordDate(value)}
            renderInput={(params) => <TextField {...params} />}
          />
        </TableCell>
        <TableCell align="right">
          <TextField inputProps={{ style: { textAlign: "right" } }} type="number" value={recordCount} onChange={(e) => setRecordCount(e.target.value)} onFocus={(e) => e.target.select()} />
        </TableCell>
        <TableCell align="right">
          <TextField inputProps={{ style: { textAlign: "right" } }} type="number" value={recordPrice} onChange={(e) => setRecordPrice(e.target.value)} onFocus={(e) => e.target.select()} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="right" colSpan={4}>
          <Box pr={3} component="span">
            {
              !!record ?
                (!deleteConfirmation ?
                  <Button color="error" onClick={() => setdeleteConfirmation(true)}>Delete</Button> :
                  <Box pr={3} component="span">
                    <Button color="error" onClick={() => handleDelete()}>Confirm Delete</Button>
                    <Button onClick={() => setdeleteConfirmation(false)}>Cancel Delete</Button>
                  </Box>)
                : null
            }
          </Box>

          <Button onClick={handlePost} disabled={isLoading || isLoadingUpdateRecord}>Confirm</Button>
          <Button onClick={() => onCancel && onCancel()} disabled={isLoading || isLoadingUpdateRecord}>Cancel</Button>
        </TableCell>
      </TableRow>
    </>
  );
}

export default RecordEditor;