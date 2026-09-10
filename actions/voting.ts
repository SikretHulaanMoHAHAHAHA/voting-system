"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const MASTER_ADMIN = "superadminsjdm123456789"

export async function preRegister(formData: FormData) {
  const username = formData.get("username") as string
  if (!username) throw new Error("Username required")

  const cleanUsername = username.trim().toLowerCase()
  const isMasterAdmin = cleanUsername === MASTER_ADMIN

  const existing = await prisma.user.findUnique({
    where: { username: cleanUsername }
  })

  if (!existing) {
    await prisma.user.create({
      data: {
        username: cleanUsername,
        originalName: username.trim(),
        hasPreRegistered: true,
        isAdmin: isMasterAdmin
      }
    })
  } else if (isMasterAdmin && !existing.isAdmin) {
    await prisma.user.update({ where: { id: existing.id }, data: { isAdmin: true } })
  }

  redirect("/?mode=login")
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  if (!username) throw new Error("Username required")

  const cleanUsername = username.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { username: cleanUsername } })

  if (!user) throw new Error("User not found. Please pre-register first.")

  if (cleanUsername === MASTER_ADMIN && !user.isAdmin) {
    await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } })
  }

  const cookieStore = await cookies()
  cookieStore.set("roblox_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  })

  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("roblox_session")
  redirect("/?mode=login")
}

export async function castVote(candidateId: string) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const state = await prisma.systemState.findUnique({ where: { id: "1" } })
  if (!state?.isVotingOpen) throw new Error("Voting is closed")

  await prisma.$transaction(async (tx) => {
    const existingVote = await tx.vote.findUnique({ where: { userId: sessionId } })
    if (existingVote) throw new Error("Already voted")

    await tx.vote.create({ data: { userId: sessionId, candidateId: candidateId } })
    await tx.candidate.update({ where: { id: candidateId }, data: { votes: { increment: 1 } } })
  })

  revalidatePath("/")
}

export async function toggleVoting() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (user?.username !== MASTER_ADMIN) throw new Error("Forbidden")

  const state = await prisma.systemState.findUnique({ where: { id: "1" } })

  await prisma.systemState.upsert({
    where: { id: "1" },
    update: { isVotingOpen: !state?.isVotingOpen },
    create: { id: "1", isVotingOpen: true }
  })

  revalidatePath("/")
}

export async function addCandidate(formData: FormData) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (user?.username !== MASTER_ADMIN) throw new Error("Forbidden")

  const name = formData.get("name") as string
  if (!name) return

  await prisma.candidate.create({ data: { name } })
  revalidatePath("/")
}

export async function setCandidateVotes(candidateId: string, votes: number) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (user?.username !== MASTER_ADMIN) throw new Error("Forbidden")

  await prisma.candidate.update({ where: { id: candidateId }, data: { votes: votes } })
  revalidatePath("/")
}