import { prisma } from './prisma';

export async function getUser() {
  // TODO: Implement Clerk-based user retrieval here.
  // This is a stub as auth is now handled by Clerk and user data by Prisma.
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

