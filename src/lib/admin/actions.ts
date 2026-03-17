"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin/auth";
import { getAdvisorForAdmin } from "@/lib/admin/queries";

const updateAdvisorSchema = z.object({
  userId: z.string().cuid(),
  name: z.string().min(1, "Name is required").max(200).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email("Invalid email").max(255),
  firmName: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  jobTitle: z.string().max(200).optional(),
  licenseNumber: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  specializations: z.array(z.string().max(100)).optional(),
});

export type UpdateAdvisorInput = z.infer<typeof updateAdvisorSchema>;

export async function updateAdvisorByAdmin(input: UpdateAdvisorInput) {
  try {
    await requireAdminRole();
    const parsed = updateAdvisorSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.flatten().fieldErrors
          ? Object.values(parsed.error.flatten().fieldErrors).flat().join("; ")
          : "Validation failed",
      };
    }

    const existing = await getAdvisorForAdmin(parsed.data.userId);
    if (!existing) {
      return { success: false, error: "Advisor not found" };
    }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: {
        name: parsed.data.name ?? undefined,
        firstName: parsed.data.firstName ?? undefined,
        lastName: parsed.data.lastName ?? undefined,
        email: parsed.data.email,
      },
    });

    if (existing.advisorProfile) {
      await prisma.advisorProfile.update({
        where: { id: existing.advisorProfile.id },
        data: {
          firmName: parsed.data.firmName ?? undefined,
          phone: parsed.data.phone ?? undefined,
          jobTitle: parsed.data.jobTitle ?? undefined,
          licenseNumber: parsed.data.licenseNumber ?? undefined,
          bio: parsed.data.bio ?? undefined,
          specializations: parsed.data.specializations ?? undefined,
        },
      });
    } else {
      await prisma.advisorProfile.create({
        data: {
          userId: parsed.data.userId,
          firmName: parsed.data.firmName ?? undefined,
          phone: parsed.data.phone ?? undefined,
          jobTitle: parsed.data.jobTitle ?? undefined,
          licenseNumber: parsed.data.licenseNumber ?? undefined,
          bio: parsed.data.bio ?? undefined,
          specializations: parsed.data.specializations ?? [],
        },
      });
    }

    revalidatePath("/admin/advisors");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update advisor";
    return { success: false, error: message };
  }
}

const createAdvisorSchema = z.object({
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().min(1, "Name is required").max(200).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  firmName: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  jobTitle: z.string().max(200).optional(),
  licenseNumber: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  specializations: z.array(z.string().max(100)).optional(),
});

export type CreateAdvisorInput = z.infer<typeof createAdvisorSchema>;

export async function createAdvisorByAdmin(input: CreateAdvisorInput) {
  try {
    await requireAdminRole();
    const parsed = createAdvisorSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.flatten().fieldErrors
          ? Object.values(parsed.error.flatten().fieldErrors).flat().join("; ")
          : "Validation failed",
      };
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
        role: "ADVISOR",
        name: parsed.data.name ?? undefined,
        firstName: parsed.data.firstName ?? undefined,
        lastName: parsed.data.lastName ?? undefined,
      },
      select: { id: true, email: true },
    });

    await prisma.advisorProfile.create({
      data: {
        userId: user.id,
        firmName: parsed.data.firmName ?? undefined,
        phone: parsed.data.phone ?? undefined,
        jobTitle: parsed.data.jobTitle ?? undefined,
        licenseNumber: parsed.data.licenseNumber ?? undefined,
        bio: parsed.data.bio ?? undefined,
        specializations: parsed.data.specializations ?? [],
      },
    });

    revalidatePath("/admin/advisors");
    revalidatePath("/admin");
    return { success: true, data: { userId: user.id } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create advisor";
    return { success: false, error: message };
  }
}
