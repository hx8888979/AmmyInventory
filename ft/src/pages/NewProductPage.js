import { Helmet } from 'react-helmet-async';
import {Stack,Container,Typography} from '@mui/material';
import ProductEditor from '../sections/@dashboard/inventory/ProductEditor';

function NewProductPage(props) {
  return (
    <>
      <Helmet>
        <title> Ammy | Inventory | New Product</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Inventory | New Product
          </Typography>
        </Stack>

        <ProductEditor />
      </Container>
    </>
  );
}
export default NewProductPage;