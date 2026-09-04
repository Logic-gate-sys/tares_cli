import { baseApi } from "./api-slice";
import type { Room, RoomCreateType } from "#types/entities";



export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation<Room, RoomCreateType>({
      query: (createData) => ({
        url: '/rooms',
        method: 'POST',
        body: createData,
      }),
      // invalidatesTags automaticaly triggers refetch for query with 'Rooms' tag
      invalidatesTags: ['Rooms']
      // invalidatesTags: (result, error, {id})=> [{type:'Rooms', id: id}]; // invalidate only specific room
    }),

    deleteRoom: builder.mutation<void, {id: string}>({
      query: (data) => ({
        url: `/rooms/${data.id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['Rooms']
    }),
    updateRoom: builder.mutation <Room, Partial<Room>>({
      query: (data) => ({
        url: `/rooms/${data.id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Rooms']
    }),

    getRooms: builder.query<Room[], void>({
      query: () => '/rooms', // auto defaults to GET
      providesTags: ['Rooms']
      /* providesTags: (results) => results? [...results.map((id)=> ({type:'Room' as const, id:id})), //specific item tags
        {type:'Rooms', id:'LIST'}] // collection tag
        : [type:'Rooms', id:'LIST'}]
        */
    })
  }),
  overrideExisting: false
})


export const { useCreateRoomMutation,useDeleteRoomMutation,useUpdateRoomMutation, useGetRoomsQuery } = roomApi;
