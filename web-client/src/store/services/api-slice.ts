import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "#store/store";


export const baseApi = createApi({
  reducerPath: 'baseApi',
  tagTypes: ['Rooms'],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: () => ({})
});


// export const roomApi = createApi({
//   reducerPath: 'roomApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: import.meta.env.VITE_BASE_URL,
//     prepareHeaders: (headers, { getState }) => {
//       const token = (getState() as RootState).auth.token;
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     }
//   }),
//   tagTypes: ['Rooms'],
//   endpoints: (builder) => ({
//     createRoom: builder.mutation<Room, RoomCreateType>({
//       query: (createData) => ({
//         url: '/room',
//         method: 'POST',
//         body: createData,
//       }),

//       // automatically refetch any queries tag with 'Rooms'
//       invalidatesTags: ['Rooms']
//     })
//   })
// })

// export const { useCreateRoomMutation } = roomApi;
