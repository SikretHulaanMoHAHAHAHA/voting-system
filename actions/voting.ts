"use server"

import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function preRegister(formData: FormData) {
  const username = formData.get("username") as string
  if (!username) throw new Error("Username required")
  
  const cleanUsername = username.trim().toLowerCase()

  const existing = await prisma.user.findUnique({
    where: { username: cleanUsername }
  })

  if (!existing) {
    await prisma.user.create({
      data: {
        username: cleanUsername,
        originalName: username.trim(),
        hasPreRegistered: true
      }
    })
  }
  
  redirect("/?mode=login")
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  if (!username) throw new Error("Username required")
  
  const cleanUsername = username.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: { username: cleanUsername }
  })

  if (!user) {
    throw new Error("User not found. Please pre-register first.")
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
    const existingVote = await tx.vote.findUnique({
      where: { userId: sessionId }
    })
    
    if (existingVote) throw new Error("Already voted")

    await tx.vote.create({
      data: {
        userId: sessionId,
        candidateId: candidateId
      }
    })

    await tx.candidate.update({
      where: { id: candidateId },
      data: { votes: { increment: 1 } }
    })
  })

  revalidatePath("/")
}

export async function toggleVoting() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (!user?.isAdmin) throw new Error("Forbidden")

  const state = await prisma.systemState.findUnique({ where: { id: "1" } })
  
  await prisma.systemState.upsert({
    where: { id: "1" },
    update: { isVotingOpen: !state?.isVotingOpen },
    create: { id: "1", isVotingOpen: true }
  })

  revalidatePath("/admin")
}

export async function addCandidate(formData: FormData) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (!user?.isAdmin) throw new Error("Forbidden")

  const name = formData.get("name") as string
  if (!name) return

  await prisma.candidate.create({
    data: { name }
  })

  revalidatePath("/admin")
}

export async function setCandidateVotes(candidateId: string, votes: number) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  if (!sessionId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (!user?.isAdmin) throw new Error("Forbidden")

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { votes: votes }
  })

  revalidatePath("/admin")
}