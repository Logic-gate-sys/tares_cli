import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthType = {
  token: string; 
}


const initAuth: AuthType = {
  token: ''
}
export const authSlice = createSlice({
  name: 'auth',
  initialState: initAuth,
  
  reducers: {
    setToken: (state, action: PayloadAction<AuthType['token']>) => {
      state.token = action.payload
    }
  }
})


export const { setToken } = authSlice.actions; 
export default authSlice.reducer;