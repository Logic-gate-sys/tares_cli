import { baseApi } from "./api-slice";
import type { Room, RoomCreateType } from "#types/entities";



export const baseExtended = baseApi.injectEndpoints({
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


export const { useCreateRoomMutation, useGetRoomsQuery } = baseExtended;