import { Res } from "@/lib/general-response";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Define the static vaccination data
const staticVaccinations = [
  { title: "BCG", daysAfterBirth: 0 },
  { title: "Hepatitis B", daysAfterBirth: 14 },
  { title: "DTaP-IPV-Hib-HepB 1", daysAfterBirth: 60 },
  { title: "DTaP-IPV-Hib-HepB 2", daysAfterBirth: 120 },
  { title: "MMR 1", daysAfterBirth: 270 },
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    const { parentId } = await params;
    if (!parentId) {
      return Res.badRequest({ message: "Parent ID is required" });
    }
    const { name, avatar, type, birthday, height, weight } = await req.json();
    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });
    if (!existingParent) {
      return Res.notFound({ message: "Parent not found" });
    }
    if (existingParent.childIds.length > 0) {
      return Res.error({
        message: "Oops! Not able to create more than 1 child",
      });
    }
    const child = await prisma.child.create({
      data: {
        name,
        avatar,
        type,
        birthday: new Date(birthday),
        height,
        weight,
        isDeleted: false,
        parents: {
          connect: {
            id: parentId,
          },
        },
      },
    });

    // Calculate vaccination due dates and prepare data for creation
    // const vaccinationsToCreate = staticVaccinations.map((vac) => {
    //   const dueDate = new Date(child.birthday);
    //   dueDate.setDate(dueDate.getDate() + vac.daysAfterBirth);
    //   return {
    //     childId: child.id,
    //     title: vac.title,
    //     dueDate: dueDate,
    //   };
    // });

    // Use `createMany` to insert all vaccinations at once
    // await prisma.vaccination.createMany({
    //   data: vaccinationsToCreate,
    // });

    return Res.created({ message: "Child has been created", data: child });
  } catch (error) {
    console.log(`${error}`);
    return Res.serverError();
  }
}
