import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login as apiLogin, getMe as apiGetMe, getProfile, updateProfile, changePassword } from '../services/api';
import { setTokens, clearTokens } from '../services/token';

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { name: string; email: string; password: string; phone?: string }

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
    appearance: {
      theme: 'light' | 'dark' | 'system';
      language: string;
    };
  };
}

interface UserState {
  name: string;
  phone: string;
  email: string;
  token: string;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
}

const initialState: UserState = {
  name: '',
  phone: '',
  email: '',
  token: '',
  loading: false,
  error: null,
  isAuthenticated: false,
  profile: null,
  profileLoading: false,
  profileError: null,
};

const loginUser = createAsyncThunk(
  'user/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await apiLogin(data.email, data.password);
      const token = res?.accessToken || res?.data?.token;
      await setTokens(token);
      const me = await apiGetMe();
      const meData = me?.data || me;
      return { 
        name: meData?.name || meData?.user?.name || '', 
        phone: meData?.phone || '', 
        email: meData?.email || '', 
        token, 
        isAuthenticated: true 
      };
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

const fetchUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfile();
      return (response?.data || response) as UserProfile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

const updateUserProfile = createAsyncThunk<UserProfile, Partial<UserProfile>, { rejectValue: string }>(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateProfile(profileData);
      return (response?.data || response) as UserProfile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

const changeUserPassword = createAsyncThunk<any, { currentPassword: string; newPassword: string }, { rejectValue: string }>(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await changePassword(passwordData);
      return response?.data || response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to change password');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; phone: string; email: string; token?: string }>) {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.email = action.payload.email;
      state.token = action.payload.token || '';
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser(state) {
      state.name = '';
      state.phone = '';
      state.email = '';
      state.token = '';
      state.isAuthenticated = false;
      state.error = null;
      state.profile = null;
      state.profileError = null;
    },
    logout(state) {
      state.name = '';
      state.phone = '';
      state.email = '';
      state.token = '';
      state.isAuthenticated = false;
      state.error = null;
      state.profile = null;
      state.profileError = null;
      clearTokens();
    },
    clearProfileError(state) {
      state.profileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.phone = action.payload.phone;
        state.email = action.payload.email;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.phone = action.payload.phone;
        state.email = action.payload.email;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Fetch profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })
      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.profileError = null;
        // Update basic user info if profile contains it
        if (action.payload.name) state.name = action.payload.name;
        if (action.payload.phone) state.phone = action.payload.phone;
        if (action.payload.email) state.email = action.payload.email;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })
      // Change password cases
      .addCase(changeUserPassword.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.profileLoading = false;
        state.profileError = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      });
  },
});

export const { setUser, clearUser, logout, clearProfileError } = userSlice.actions;
export default userSlice.reducer;
export { loginUser, registerUser, fetchUserProfile, updateUserProfile, changeUserPassword };
