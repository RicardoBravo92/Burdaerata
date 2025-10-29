import { supabase } from './supabaseClient';

export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}

export async function getProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting profile:', error);
    return null;
  }

  return profile;
}

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

//update profile
export async function updateProfile(full_name: string, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ full_name })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}
