import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation } from 'react-router-dom';
import { Stack, Container, Typography, } from '@mui/material';
import { useGetProductsQuery } from '../features/api/apiSlice';
import ProductEditor from '../sections/@dashboard/inventory/ProductEditor';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function EditProductPage() {
  const query = useQuery();
  const id = query.get('id');
  const { data } = useGetProductsQuery();
  const product = useMemo(() => (!!data && data.products.find((product) => product.id === id) || null), [data]);

  if (!id) {
    return <Navigate to="/dashboard/inventory" />
  }

  return (
    <>
      <Helmet>
        <title> Ammy | Inventory | Edit Product</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Inventory | Edit Product
          </Typography>
        </Stack>
        
        {
          !product ? <Typography variant="h6">Loading Product Info...</Typography>
          :<ProductEditor product={product} />
        }
        

      </Container>
    </>
  );
}

export default EditProductPage;