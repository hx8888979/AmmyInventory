import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function dispatchRecords(records, productId, dispatch) {
  const [orderCount, orderValue] = records.filter(record => record.type === 0).reduce((sum, record) => {
    sum[0] += record.count;
    sum[1] += record.count * record.price;
    return sum;
  }, [0, 0]);
  const currentCount = records.reduce((sum, record) => sum + record.count, 0);
  const newValue = orderCount > 0 ? (Math.round(orderValue / orderCount) * currentCount) : 0;

  const patchRecords = dispatch(
    apiSlice.util.updateQueryData('getRecords', productId, draft => {
      draft.records = records;
    })
  );

  const patchProduct = dispatch(
    apiSlice.util.updateQueryData('getProducts', undefined, draft => {
      const product = draft.products.find(product => product.id === productId);
      product.inventory_value = newValue;
      product.inventory_level = currentCount;
      product.inventory_status = orderCount > 0 ? ((currentCount / orderCount > 0.25) ? 0 : 1) : 0;
    })
  );

  return { patchRecords, patchProduct };
}

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_ENDPOINT,
    credentials: 'include'
  }),
  tagTypes: ['Products'],
  endpoints: builder => ({
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Products']
    }),
    deleteProduct: builder.mutation({
      query: ({ productId }) => ({
        url: `/products/${productId}`,
        method: 'DELETE'
      }),
      onQueryStarted: async ({ productId }, { dispatch, queryFulfilled }) => {
        const patchProduct = dispatch(
          apiSlice.util.updateQueryData('getProducts', undefined, draft => {
            draft.products = draft.products.filter(product => product.id !== productId);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchProduct.undo();
        }
      }
    }),
    updateProduct: builder.mutation({
      query: ({ productId, product }) => ({
        url: `/products/${productId}`,
        method: 'PATCH',
        body: JSON.stringify(product)
      }),
      onQueryStarted: async ({ productId, product }, { dispatch, queryFulfilled }) => {
        const patchProduct = dispatch(
          apiSlice.util.updateQueryData('getProducts', undefined, draft => {
            const productIndex = draft.products.findIndex(product => product.id === productId);
            draft.products[productIndex] = { ...draft.products[productIndex], sku: product.sku, product_name: product.name, remark: product.remark };
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchProduct.undo();
        }
      }
    }),
    getRecords: builder.query({
      query: (productId) => `/products/${productId}/records`,
      invalidatesTags: ['Products']
    }),
    addRecord: builder.mutation({
      query: ({ productId, record }) => ({
        url: `/products/${productId}/records`,
        method: 'POST',
        // Include the entire post object as the body of the request
        body: JSON.stringify(record)
      }),
      onQueryStarted: async ({ productId, record }, { dispatch, getState, queryFulfilled }) => {
        const { data: { id } } = await queryFulfilled;
        console.log(id);

        const recordsCache = apiSlice.endpoints.getRecords.select(productId)(getState());
        const records = (recordsCache?.data?.records && [...recordsCache?.data?.records]) || [];
        records.push({ ...record, id });

        dispatchRecords(records, productId, dispatch);
      },
    }),
    updateRecord: builder.mutation({
      query: ({ productId, recordId, record }) => ({
        url: `/products/${productId}/records/${recordId}`,
        method: 'PATCH',
        body: JSON.stringify(record)
      }),
      onQueryStarted: async ({ productId, recordId, record }, { dispatch, getState, queryFulfilled }) => {
        const recordsCache = apiSlice.endpoints.getRecords.select(productId)(getState());
        const records = (recordsCache?.data?.records && [...recordsCache?.data?.records]) || [];
        const index = records.findIndex(record => record.id === recordId);
        records[index] = { id: records[index].id, ...record };

        const { patchRecords, patchProduct } = dispatchRecords(records, productId, dispatch);

        try {
          await queryFulfilled;
        } catch {
          patchRecords.undo();
          patchProduct.undo();
        }
      }
    }),
    deleteRecord: builder.mutation({
      query: ({ productId, recordId }) => ({
        url: `/products/${productId}/records/${recordId}`,
        method: 'DELETE'
      }),
      onQueryStarted: async ({ productId, recordId }, { dispatch, getState, queryFulfilled }) => {
        const recordsCache = apiSlice.endpoints.getRecords.select(productId)(getState());
        const records = (recordsCache?.data?.records && [...recordsCache?.data?.records]) || [];
        const newRecords = records.filter(record => record.id !== recordId);

        const { patchRecords, patchProduct } = dispatchRecords(newRecords, productId, dispatch);

        try {
          await queryFulfilled;
        } catch {
          patchRecords.undo();
          patchProduct.undo();
        }
      }
    }),
    addProduct: builder.mutation({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: JSON.stringify(product)
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    })
  })
})

export const { useGetProductsQuery, useDeleteProductMutation, useUpdateProductMutation, useGetRecordsQuery, useAddRecordMutation, useUpdateRecordMutation, useAddProductMutation, useLoginMutation, useDeleteRecordMutation } = apiSlice;