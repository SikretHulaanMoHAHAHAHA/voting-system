import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { toggleVoting, setCandidateVotes, addCandidate } from "@/actions/voting"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export default async function AdminPanel() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value
  
  if (!sessionId) redirect("/")
  
  const user = await prisma.user.findUnique({ where: { id: sessionId } })
  if (!user?.isAdmin) redirect("/")

  const state = await prisma.systemState.findUnique({ where: { id: "1" } })
  const candidates = await prisma.candidate.findMany({ orderBy: { votes: 'desc' } })
  const registeredUsers = await prisma.user.findMany({ 
    where: { hasPreRegistered: true },
    select: { originalName: true, id: true },
    orderBy: { originalName: 'asc' }
  })

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-4">Admin Control Panel</h1>
        
        <form action={toggleVoting}>
          <button className={`px-6 py-3 rounded text-white font-bold ${state?.isVotingOpen ? 'bg-red-600' : 'bg-green-600'}`}>
            {state?.isVotingOpen ? "Stop Voting System" : "Start Voting System"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Candidates</h2>
        
        <form action={addCandidate} className="mb-6 flex gap-2">
          <input type="text" name="name" placeholder="New Candidate Name" className="border p-2 rounded flex-1" required />
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Add Candidate</button>
        </form>

        <div className="grid gap-4">
          {candidates.map(candidate => (
            <div key={candidate.id} className="border p-4 rounded flex items-center justify-between bg-white shadow-sm">
              <span className="font-bold text-lg">{candidate.name}</span>
              
              <form action={async (formData: FormData) => {
                "use server"
                const newVotes = parseInt(formData.get("votes") as string)
                if (!isNaN(newVotes)) await setCandidateVotes(candidate.id, newVotes)
              }} className="flex gap-2 items-center">
                <input 
                  type="number" 
                  name="votes" 
                  defaultValue={candidate.votes}
                  className="border p-2 w-24 rounded"
                />
                <button type="submit" className="bg-black text-white px-4 py-2 rounded font-medium hover:bg-gray-800">
                  Update
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Pre-Registered Users ({registeredUsers.length})</h2>
        <div className="bg-white border p-4 rounded max-h-96 overflow-y-auto shadow-sm">
          {registeredUsers.map(u => (
            <div key={u.id} className="py-3 border-b last:border-0 flex justify-between items-center">
              <span className="font-medium text-lg">{u.originalName}</span>
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">ID: {u.id}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}