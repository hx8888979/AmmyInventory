import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, TableRow, TableCell, TableHead, Typography, Table, TableBody, Stack } from '@mui/material';

import { useGetRecordsQuery } from '../../../features/api/apiSlice';
import RecordEditor from './RecordEditor';
import Iconify from '../../../components/iconify';



function SortRecords(records) {
  if (!records) return [];
  const data = [...records];
  return data.sort((a, b) => {
    let order = a.type - b.type;
    if (order === 0) {
      order = a.date - b.date;
    }
    return order;
  });
}

function RecordList(props) {
  const { productId } = props;
  const { data, isLoading } = useGetRecordsQuery(productId);
  const [recordEditing, setRecordEditing] = useState();
  const navigate = useNavigate();

  const sortedRecords = useMemo(() => SortRecords(data?.records), [data]);
  const statistics = useMemo(() => {
    if (!data?.records) return null;
    const total = data?.records.reduce((s, c) => s + c.count, 0);
    const [orderCount, orderTotal] = data?.records.filter((c) => c.type === 0)?.reduce((s, c) => [s[0] + c.count, s[1] + c.count * c.price], [0, 0]);
    const avgPrice = Math.floor(orderTotal / orderCount);
    const assetValue = total * avgPrice / 100;
    return { total, avgPrice, assetValue }
  }, [data]);

  return (
    <Box sx={{ margin: 1 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6" gutterBottom component="div">
          History
        </Typography>
        <Stack direction="row">
          <Button size="small" onClick={()=>navigate(`edit?id=${productId}`)}>Edit Product</Button>
          <IconButton size="small" onClick={() => setRecordEditing(-1)}><Iconify icon="eva:plus-fill" /></IconButton >
        </Stack>
      </Stack>
      <Table size="small" aria-label="purchases">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Date</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">price ($)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            sortedRecords ? sortedRecords.map((record, index) =>
              recordEditing === index ?
                <RecordEditor key={record.id} productId={productId} record={record} onCancel={() => setRecordEditing()} onConfirm={() => setRecordEditing()} /> :
                <TableRow key={record.id} onClick={(e) => { if (e.detail >= 2) setRecordEditing(index); }}>
                  <TableCell>{record.type === 0 ? 'Order' : 'Sales'}</TableCell>
                  <TableCell component="th" scope="row">
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">{record.count}</TableCell>
                  <TableCell align="right">
                    {record.type === 0 ? record.price / 100 : '-'}
                  </TableCell>
                </TableRow>
            ) : null
          }
          {recordEditing === -1 ? <RecordEditor productId={productId} onCancel={() => setRecordEditing()} /> : null}
          {statistics ?
            <TableRow>
              <TableCell colSpan={3} align="right">{`Total ${statistics.total}`}</TableCell>
              <TableCell align="right">{`Asset Value ${statistics.assetValue}`}</TableCell>
            </TableRow>
            : null}
        </TableBody>
      </Table>
    </Box>
  );
}

export default RecordList;