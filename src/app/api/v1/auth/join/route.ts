import { Res } from "@/lib/general-response";
import { hashing } from "@/lib/helpers/hash";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { createAccessToken } from "@/lib/tokens";
import { prepareUser } from "@/lib/prepare-user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const { role, ...data } = body;

    if (!role) {
      return Res.badRequest({ message: "Role is required" });
    }

    const email = data.email?.toLowerCase();
    
    // Check if email already exists in the SPECIFIC table for this role
    let existingUser = null;
    switch (role.toUpperCase()) {
      case "PARENT": existingUser = await prisma.parent.findUnique({ where: { email } }); break;
      case "ARTIST": existingUser = await prisma.artist.findUnique({ where: { email } }); break;
      case "SUPPLIER": existingUser = await prisma.supplier.findUnique({ where: { email } }); break;
      case "DOCTOR": existingUser = await prisma.doctor.findUnique({ where: { email } }); break;
      case "BABYSITTER": existingUser = await prisma.babysitter.findUnique({ where: { email } }); break;
    }

    if (existingUser) {
      return Res.badRequest({ message: "Email already exists in this role" });
    }

    const hashedPassword = await hashing(data.password);

    let createdUser;

    switch (role.toUpperCase()) {
      case "PARENT":
        createdUser = await prisma.parent.create({
          data: {
            name: data.name,
            email,
            password: hashedPassword,
            profilePicture: data.profilePicture,
            isVerified: false,
          },
        });
        break;

      case "ARTIST":
        createdUser = await prisma.artist.create({
          data: {
            name: data.name,
            email,
            password: hashedPassword,
            cnic: data.cnic || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId,
            nationalId: data.nationalId,
            portfolio: data.portfolio,
            copyrightCertificates: data.copyrightCertificates,
            exhibitionRecords: data.exhibitionRecords,
            bankDetails: data.bankDetails,
            profilePicture: data.profilePicture, // Add profilePicture
            status: "INACTIVE",
            isVerified: false,
            isPaid: false,
          },
        });
        break;

      case "SUPPLIER":
        createdUser = await prisma.supplier.create({
          data: {
            name: data.name,
            email,
            password: hashedPassword,
            cnic: data.cnic || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId,
            nationalId: data.nationalId,
            businessRegistration: data.businessRegistration,
            taxId: data.taxId,
            productCatalog: data.productCatalog,
            insurance: data.insurance,
            profilePicture: data.profilePicture, // Add profilePicture
            status: "INACTIVE",
            isVerified: false,
            isPaid: false,
          },
        });
        break;

      case "DOCTOR":
        const serviceMode = (data.serviceMode || "CLINIC").toUpperCase();
        createdUser = await prisma.doctor.create({
          data: {
            name: data.name,
            email,
            password: hashedPassword,
            phone: data.phone || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode,
            specialty: data.specialty || "",
            licenseNumber: data.licenseNumber || "",
            yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
            consultationFee: parseFloat(data.consultationFee) || 0,
            serviceMode: serviceMode as any,
            bio: data.bio,
            profilePicture: data.profilePicture,
            nationalId: data.nationalId,
            medicalLicense: data.medicalLicense,
            specialtyCertificate: data.specialtyCertificate,
            malpracticeInsurance: data.malpracticeInsurance,
            deaRegistration: data.deaRegistration,
            isVerified: false,
            isPaid: false,
            ...(serviceMode !== "HOME" && data.clinicName && {
              clinic: {
                create: {
                  name: data.clinicName,
                  address: data.clinicAddress || "",
                  city: data.city || "",
                  state: data.state || "",
                  zipCode: data.zipCode || "",
                }
              }
            })
          },
        });

        if (data.days && data.days.length > 0) {
          await prisma.availability.createMany({
            data: data.days.map((day: string) => ({
              doctorId: createdUser.id,
              day,
              startTime: data.startTime || "",
              endTime: data.endTime || "",
            }))
          });
        }
        break;

      case "BABYSITTER":
        createdUser = await prisma.babysitter.create({
          data: {
            name: data.name,
            email,
            password: hashedPassword,
            phone: data.phone || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode,
            experience: parseInt(data.experience) || 0,
            ageGroups: data.ageGroups || [],
            languages: data.languages || [],
            certifications: data.certifications,
            bio: data.bio,
            profilePictureUrl: data.profilePicture,
            nationalIdUrl: data.nationalId,
            firstAidCertificateUrl: data.firstAidCertificate,
            backgroundCheckUrl: data.backgroundCheck,
            childcareDiplomaUrl: data.childcareDiploma,
            referenceLettersUrl: data.referenceLetters,
            isVerified: false,
            isPaid: false,
          },
        });

        if (data.days && data.days.length > 0) {
          await prisma.availability.createMany({
            data: data.days.map((day: string) => ({
              babysitterId: createdUser.id,
              day,
              startTime: data.startTime || "",
              endTime: data.endTime || "",
            }))
          });
        }
        break;

      default:
        return Res.badRequest({ message: "Invalid role" });
    }

    const accessToken = await createAccessToken({ ...createdUser, role: role.toLowerCase() });
    const prepared = await prepareUser(createdUser, role.toLowerCase());

    return Res.created({
      message: "Registration successful. Please complete your payment to activate.",
      data: {
        user: prepared,
        tokens: {
          accessToken,
        },
      },
    });
  } catch (error) {
    console.error("Join Error:", error);
    return Res.serverError({ message: "Internal server error" });
  }
}
