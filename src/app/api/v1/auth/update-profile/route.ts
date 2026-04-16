import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { verifyAccessTokenFromRequest } from "@/lib/tokens";
import { prepareUser } from "@/lib/prepare-user";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const result = await verifyAccessTokenFromRequest(req);
    if (!result.success) {
      return Res.unauthorized({ message: result.message });
    }
    const user = result.data;

    const { name, profilePicture, paymentCollectionMethod, withdrawalFrequency, hourlyRate, consultationFee, bio, experience } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (profilePicture) updateData.profilePicture = profilePicture;

    // Payment settings specific data (Doctor & Babysitter only)
    const paymentData: any = {};
    if (paymentCollectionMethod) paymentData.paymentCollectionMethod = paymentCollectionMethod;
    if (withdrawalFrequency) paymentData.withdrawalFrequency = withdrawalFrequency;
    if (hourlyRate !== undefined && hourlyRate !== "") paymentData.hourlyRate = parseFloat(hourlyRate);
    if (consultationFee !== undefined && consultationFee !== "") paymentData.consultationFee = parseFloat(consultationFee);
    if (experience !== undefined && experience !== "") paymentData.experience = parseInt(experience);
    if (bio !== undefined) paymentData.bio = bio;

    if (Object.keys(updateData).length === 0 && Object.keys(paymentData).length === 0) {
      return Res.badRequest({ message: "No data to update" });
    }

    let updatedUser;

    switch (user.role.toUpperCase()) {
      case "ADMIN":
        updatedUser = await prisma.admin.update({
          where: { id: user.id },
          data: updateData,
        });
        break;
      case "PARENT":
        updatedUser = await prisma.parent.update({
          where: { id: user.id },
          data: updateData,
        });
        break;
      case "RELATIVE":
        updatedUser = await prisma.childRelation.update({
          where: { id: user.id },
          data: updateData,
        });
        break;
      case "DOCTOR":
        updatedUser = await prisma.doctor.update({
          where: { id: user.id },
          data: { ...updateData, ...paymentData },
        });
        break;
      case "BABYSITTER":
        // Babysitter model uses profilePictureUrl
        const sitterData = { ...updateData, ...paymentData };
        if (sitterData.profilePicture) {
          sitterData.profilePictureUrl = sitterData.profilePicture;
          delete sitterData.profilePicture;
        }
        updatedUser = await prisma.babysitter.update({
          where: { id: user.id },
          data: sitterData,
        });
        break;
      default:
        return Res.unauthorized({ message: "Invalid role for profile update" });
    }

    const preparedUser = await prepareUser(updatedUser, user.role);

    return Res.ok({
      message: "Profile updated successfully",
      data: preparedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return Res.serverError();
  }
}
