import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Stack, TextField, Typography } from '@mui/material';
import { useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '../../../features/api/apiSlice';
import Cropper from '../../../components/cropper';

function ProductEditor(props) {
  const { product } = props;
  const cropperRef = useRef();
  const navigate = useNavigate();
  const [addProduct, { isLoading, isSuccess, isError, error }] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const { handleSubmit, register, formState: { errors }, setError, clearErrors } = useForm();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const handleCreate = async ({ sku, name, remark }) => {
    if (cropperRef.current) {
      const data = cropperRef.current.getCanvas({ height: 300, width: 300 })?.toDataURL();
      const img = data.split(';base64,')[1]
      if (!!product) {
        await updateProduct({ productId: product.id, product: { sku, img, name, remark } }).unwrap();
      } else {
        await addProduct({ sku, img, name, remark }).unwrap();
      }
      navigate('/dashboard/inventory');
    } else {
      setError('img', { type: 'required', message: 'preview image is required' })
    }
  };

  const handleDelete = async () => {
    await deleteProduct({ productId: product.id }).unwrap();
    navigate('/dashboard/inventory');
  }

  return (
    <Card sx={{ padding: '20px' }}>
      <form onSubmit={handleSubmit(handleCreate)}>
        <Stack spacing={3} >
          <Typography variant='subtitle1'>Preview</Typography>
          <Stack>
            <Cropper cropperRef={cropperRef} width={300} height={300} onChange={() => { clearErrors('img') }} defaultValue={product?.img} />
            {!!errors.img ? <Typography variant='caption' sx={{ color: 'red' }}>&nbsp;&nbsp;&nbsp;&nbsp;{errors.img?.message}</Typography> : null}
          </Stack>
          <TextField required label="SKU" inputProps={register("sku", { required: true, maxLength: { value: 20, message: "should be less than 20 letters" } })} error={!!errors.sku} helperText={errors.sku?.message} defaultValue={product?.sku} />
          <TextField required label="Name" inputProps={register("name", { required: true, maxLength: 20 })} error={!!errors.name} defaultValue={product?.product_name} />
          <TextField label="Remark" inputProps={register("remark", { maxLength: { value: 20, message: "should be less than 20 letters" } })} error={!!errors.remark} helperText={errors.remark?.message} defaultValue={product?.remark} />
          {
            !product ?
              <Button disabled={isLoading} variant="contained" type="submit">Create</Button>
              : <Stack spacing={2}>
                <Button disabled={isLoading} variant="contained" type="submit">Update</Button>
                {
                  !deleteConfirmation ?
                    <Button variant="contained" color='error' onClick={() => setDeleteConfirmation(true)}>Delete</Button>
                    : <Stack direction="row" spacing={2} justifyContent="center">
                      <Button disabled={isLoading} variant="contained" color='error' onClick={handleDelete}>Confirm Delete</Button>
                      <Button variant="contained" onClick={() => setDeleteConfirmation(false)}>Cancel Delete</Button>
                    </Stack>
                }
              </Stack>
          }
        </Stack>
      </form>
    </Card>
  );
}

export default ProductEditor;