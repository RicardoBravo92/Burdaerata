import { prisma } from './prisma';

export async function getUser() {
  // If using Clerk, this might need to be handled differently.
  // The original code used supabase.auth.getUser().
  // Assuming we still want to fetch the user from the database.
  // For now, I'll keep the signature but this might require the userId from Clerk.
  console.warn('getUser() called: Ensure Clerk userId is used if Supabase Auth is removed.');
  return null; 
}

export async function getProfile(userId: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
    });
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export const fetchUserProfile = async (userId: string) => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!profile) throw new Error('User not found');
  return profile;
};

// update profile
export async function updateProfile(full_name: string, userId: string) {
  try {
    const data = await prisma.user.update({
      where: { id: userId },
      data: { full_name },
    });
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

