import { getPresignedUrl } from "./helpers/s3";

/**
 * Standardizes the user object for API responses.
 * Generates a presigned URL if a profile picture key/URL exists in the database.
 */
export async function prepareUser(userData: any, role: string) {
  if (!userData) return null;

  let profilePicture = userData.profilePicture || userData.profilePictureUrl || null;

  // If we have a profile picture, generate a presigned URL
  if (profilePicture && profilePicture.startsWith("http")) {
    try {
      const url = new URL(profilePicture);
      const key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
      profilePicture = await getPresignedUrl(key);
    } catch (err) {
      console.error("Failed to sign profile picture URL", err);
      // Fallback stays as original or null on error
    }
  }

  // Common user object structure
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: role,
    profilePicture: profilePicture,
    isPaid: userData.isPaid || false,
    paidUntil: userData.paidUntil || null,
    isVerified: userData.isVerified || false,
    // Add role-specific fields
    ...((role === "parent" || role === "relative") && {
      childs: userData.childIds || userData.childId || [],
      folders: userData.folders || [],
      carts: userData.carts || [],
    }),
    ...((role === "doctor" || role === "babysitter") && {
      paymentCollectionMethod: userData.paymentCollectionMethod || "SELF",
      withdrawalFrequency: userData.withdrawalFrequency || null,
      hourlyRate: userData.hourlyRate ?? null,
      consultationFee: userData.consultationFee ?? null,
      bio: userData.bio ?? null,
      experience: userData.experience ?? null,
    }),
    ...((role === "artist" || role === "supplier") && {
      categoryId: userData.categoryId,
      subCategoryId: userData.subCategoryId,
    }),
    ...(role === "relative" && {
      relation: userData.relation || null,
    }),
  };
}
