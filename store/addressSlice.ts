import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, json } from '@/services/api';
import { Address } from '@/components/AddressForm';

interface AddressState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
};

// Fetch user addresses
export const fetchUserAddresses = createAsyncThunk(
  'address/fetchUserAddresses',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching user addresses...');
      const res = await apiFetch('/api/profile/addresses', {}, false);
      const result = await json<any>(res);
      console.log('User addresses response:', result);
      
      if (result.success && result.data && result.data.addresses) {
        return result.data.addresses.map((address: any) => ({
          id: address.id || address._id,
          fullName: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
          phone: address.phone || '',
          address: address.addressLine1 || '',
          addressLine2: address.addressLine2 || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postalCode || '',
          country: address.country || '',
          isDefault: address.isDefault || false,
          label: address.label || '',
          type: address.type || 'shipping',
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      return rejectWithValue(error.message || 'Failed to fetch addresses');
    }
  }
);

// Add new address
export const addUserAddress = createAsyncThunk(
  'address/addUserAddress',
  async (address: Address, { rejectWithValue }) => {
    try {
      console.log('Adding new address:', address);
      
      // Split fullName into firstName and lastName
      const nameParts = address.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const res = await apiFetch('/api/profile/addresses', {
        method: 'POST',
        body: JSON.stringify({
          type: 'shipping',
          firstName: firstName,
          lastName: lastName,
          addressLine1: address.address,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          state: address.state,
          postalCode: address.zipCode,
          country: address.country,
          phone: address.phone,
          isDefault: address.isDefault,
          label: address.label,
        }),
      }, false);
      const result = await json<any>(res);
      console.log('Add address response:', result);
      
      if (result.success && result.data) {
        return {
          id: result.data.id || result.data._id,
          fullName: `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim(),
          phone: result.data.phone || '',
          address: result.data.addressLine1 || '',
          addressLine2: result.data.addressLine2 || '',
          city: result.data.city || '',
          state: result.data.state || '',
          zipCode: result.data.postalCode || '',
          country: result.data.country || '',
          isDefault: result.data.isDefault || false,
          label: result.data.label || '',
          type: result.data.type || 'shipping',
        };
      }
      throw new Error('Failed to add address');
    } catch (error: any) {
      console.error('Failed to add address:', error);
      return rejectWithValue(error.message || 'Failed to add address');
    }
  }
);

// Update address
export const updateUserAddress = createAsyncThunk(
  'address/updateUserAddress',
  async (address: Address, { rejectWithValue }) => {
    try {
      console.log('Updating address:', address);
      
      // Split fullName into firstName and lastName
      const nameParts = address.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const res = await apiFetch(`/api/profile/addresses/${address.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          type: 'shipping',
          firstName: firstName,
          lastName: lastName,
          addressLine1: address.address,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          state: address.state,
          postalCode: address.zipCode,
          country: address.country,
          phone: address.phone,
          isDefault: address.isDefault,
          label: address.label,
        }),
      }, false);
      const result = await json<any>(res);
      console.log('Update address response:', result);
      
      if (result.success && result.data) {
        return {
          id: result.data.id || result.data._id,
          fullName: `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim(),
          phone: result.data.phone || '',
          address: result.data.addressLine1 || '',
          addressLine2: result.data.addressLine2 || '',
          city: result.data.city || '',
          state: result.data.state || '',
          zipCode: result.data.postalCode || '',
          country: result.data.country || '',
          isDefault: result.data.isDefault || false,
          label: result.data.label || '',
          type: result.data.type || 'shipping',
        };
      }
      throw new Error('Failed to update address');
    } catch (error: any) {
      console.error('Failed to update address:', error);
      return rejectWithValue(error.message || 'Failed to update address');
    }
  }
);

// Delete address
export const deleteUserAddress = createAsyncThunk(
  'address/deleteUserAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      console.log('Deleting address:', addressId);
      const res = await apiFetch(`/api/profile/addresses/${addressId}`, {
        method: 'DELETE',
      }, false);
      const result = await json<any>(res);
      console.log('Delete address response:', result);
      
      if (result.success) {
        return addressId;
      }
      throw new Error('Failed to delete address');
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      return rejectWithValue(error.message || 'Failed to delete address');
    }
  }
);

// Set default address
export const setDefaultAddress = createAsyncThunk(
  'address/setDefaultAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      console.log('Setting default address:', addressId);
      const res = await apiFetch(`/api/profile/addresses/${addressId}/default`, {
        method: 'PUT',
        body: JSON.stringify({
          type: 'shipping'
        }),
      }, false);
      const result = await json<any>(res);
      console.log('Set default address response:', result);
      
      if (result.success && result.data) {
        return result.data.map((address: any) => ({
          id: address.id || address._id,
          fullName: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
          phone: address.phone || '',
          address: address.addressLine1 || '',
          addressLine2: address.addressLine2 || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postalCode || '',
          country: address.country || '',
          isDefault: address.isDefault || false,
          label: address.label || '',
          type: address.type || 'shipping',
        }));
      }
      throw new Error('Failed to set default address');
    } catch (error: any) {
      console.error('Failed to set default address:', error);
      return rejectWithValue(error.message || 'Failed to set default address');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAddresses: (state) => {
      state.addresses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch addresses';
      })
      
      // Add address
      .addCase(addUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        const newAddress = action.payload;
        
        // If this is the first address or marked as default, update other addresses
        if (newAddress.isDefault) {
          state.addresses = state.addresses.map(addr => ({
            ...addr,
            isDefault: false,
          }));
        }
        
        state.addresses.push(newAddress);
      })
      .addCase(addUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add address';
      })
      
      // Update address
      .addCase(updateUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAddress = action.payload;
        
        // If this address is now default, update other addresses
        if (updatedAddress.isDefault) {
          state.addresses = state.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === updatedAddress.id,
          }));
        } else {
          // Update the specific address
          state.addresses = state.addresses.map(addr =>
            addr.id === updatedAddress.id ? updatedAddress : addr
          );
        }
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update address';
      })
      
      // Delete address
      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.addresses = state.addresses.filter(addr => addr.id !== deletedId);
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete address';
      })
      
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to set default address';
      });
  },
});

export const { clearError, clearAddresses } = addressSlice.actions;

// Selectors
export const selectAddresses = (state: any) => state.address.addresses;
export const selectAddressesLoading = (state: any) => state.address.loading;
export const selectAddressesError = (state: any) => state.address.error;
export const selectDefaultAddress = (state: any) => 
  state.address.addresses.find((addr: Address) => addr.isDefault);

export default addressSlice.reducer;
