import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login as apiLogin, getMe as apiGetMe } from '../services/api';
import { setTokens, clearTokens } from '../services/token';

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { name: string; email: string; password: string; phone?: string }

interface UserState {
  name: string;
  phone: string;
  token: string;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  name: '',
  phone: '',
  token: '',
  loading: false,
  error: null,
  isAuthenticated: false,
};

 const loginUser = createAsyncThunk(
  'user/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await apiLogin(data.email, data.password);
      const token = res?.accessToken || res?.data?.token;
      await setTokens(token);
      const me = await apiGetMe();
      return { name: me?.name || me?.data?.user?.name || '', phone: me?.phone || '', token, isAuthenticated: true };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

 const registerUser = createAsyncThunk(
  'user/register',
  async (_data: RegisterRequest, { rejectWithValue }) => {
    try {
      return rejectWithValue('Registration via app is disabled');
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; phone: string; token?: string }>) {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.token = action.payload.token || '';
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser(state) {
      state.name = '';
      state.phone = '';
      state.token = '';
      state.isAuthenticated = false;
      state.error = null;
    },
    logout(state) {
      state.name = '';
      state.phone = '';
      state.token = '';
      state.isAuthenticated = false;
      state.error = null;
      clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.phone = action.payload.phone;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.phone = action.payload.phone;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;
export { loginUser, registerUser };
