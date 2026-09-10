import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { login, logout, castVote, toggleVoting, addCandidate, setCandidateVotes } from "@/actions/voting"
import Link from "next/link"
import Image from "next/image"
import { SubmitButton } from "@/components/SubmitButton"
import { RegistrationForm } from "@/components/RegistrationForm"

const MASTER_ADMIN = "superadminsjdm123456789"

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const isLoginMode = params.mode === "login"

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("roblox_session")?.value

  let user = null
  let hasVoted = false

  if (sessionId) {
    user = await prisma.user.findUnique({ 
      where: { id: sessionId },
      include: { vote: true }
    })
    hasVoted = !!user?.vote
  }

  const candidates = await prisma.candidate.findMany({ orderBy: { votes: 'desc' } })
  const state = await prisma.systemState.findUnique({ where: { id: "1" } })
  const totalVotes = candidates.reduce((acc, c) => acc + c.votes, 0)
  const isMasterAdmin = user?.username === MASTER_ADMIN

  return (
    <div className="min-h-screen font-sans pb-12 text-slate-900">
      <header className="glass-header py-3 px-4 sm:px-8 flex justify-between items-center relative overflow-hidden z-50 animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-white to-red-600"></div>
        <Image src="/images/SJDM.png" alt="SJDM Logo" width={75} height={75} className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" priority />
        <div className="text-center flex-1 px-4">
          <h1 className="text-xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 tracking-tight uppercase">San Jose Del Monte</h1>
          <p className="text-xs sm:text-sm font-bold text-red-600 tracking-widest uppercase mt-1">Official Voting Portal</p>
        </div>
        <Image src="/images/BagongPilipinas.png" alt="Bagong Pilipinas Logo" width={75} height={75} className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" priority />
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 mt-4 sm:mt-8 animate-slide-up">
        {!user ? (
          <div className="glass-panel p-8 rounded-2xl max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-700 via-white to-red-600"></div>
            {!isLoginMode ? (
              <>
                <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-wide">VOTER REGISTRATION</h2>
                <RegistrationForm />
                <p className="mt-6 text-center text-sm text-gray-600 font-medium">Already registered? <Link href="/?mode=login" className="text-red-600 font-black hover:underline">Log in here</Link></p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-wide">VOTER LOGIN</h2>
                <form action={login} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Roblox Username</label>
                    <input type="text" name="username" placeholder="Enter your Roblox Username" required className="w-full border-2 border-gray-200 bg-white/50 p-4 rounded-xl focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all font-medium" />
                  </div>
                  <SubmitButton loadingText="Authenticating..." className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-red-600/25 transition-all uppercase tracking-widest">
                    Access Voting Poll
                  </SubmitButton>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 font-medium">Need an account? <Link href="/" className="text-blue-700 font-black hover:underline">Pre-Register here</Link></p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="glass-panel border-l-8 border-l-blue-700 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Active Voter</p>
                <p className="text-2xl font-black text-gray-900 uppercase mt-1">{user.originalName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-green-600 font-black text-sm flex items-center gap-1 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    VERIFIED REGISTRATION
                  </p>
                  {isMasterAdmin && (
                    <p className="text-amber-700 font-black text-sm flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 uppercase">
                      👑 Master Admin
                    </p>
                  )}
                </div>
              </div>
              <form action={logout}>
                <SubmitButton loadingText="Logging Out..." className="text-sm bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-black hover:bg-gray-50 uppercase tracking-widest">
                  Log Out
                </SubmitButton>
              </form>
            </div>

            {isMasterAdmin && (
              <div className="glass-panel border-2 border-amber-400 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 animate-slide-up">
                <div className="flex justify-between items-center border-b border-amber-200 pb-4">
                  <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight flex items-center gap-2">
                    System Override Controls
                  </h3>
                  <form action={toggleVoting}>
                    <SubmitButton loadingText="Updating..." className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-md transition-all ${state?.isVotingOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                      {state?.isVotingOpen ? "Close Precinct" : "Open Precinct"}
                    </SubmitButton>
                  </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/70 p-4 rounded-xl border border-amber-200">
                    <h4 className="font-black text-sm text-gray-800 uppercase mb-3">Add Candidate</h4>
                    <form action={addCandidate} className="space-y-3">
                      <input type="text" name="name" placeholder="Candidate Name" required className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-medium" />
                      <SubmitButton loadingText="Adding..." className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-widest shadow-sm">
                        Add to Ballot
                      </SubmitButton>
                    </form>
                  </div>

                  <div className="bg-white/70 p-4 rounded-xl border border-amber-200">
                    <h4 className="font-black text-sm text-gray-800 uppercase mb-3">Manipulate Tally</h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                      {candidates.map((c) => (
                        <form key={c.id} action={async (formData) => {
                          "use server"
                          await setCandidateVotes(c.id, Number(formData.get("votes")))
                        }} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700 truncate w-32">{c.name}</span>
                          <input type="number" name="votes" defaultValue={c.votes} required className="w-16 border border-gray-300 p-1.5 rounded text-xs font-bold text-center" />
                          <SubmitButton loadingText="..." className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-black">
                            Set
                          </SubmitButton>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-panel border-t-8 border-t-red-600 p-6 sm:p-10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-10 right-10 opacity-5 pointer-events-none scale-125">
                 <Image src="/images/BagongPilipinas.png" alt="Background Watermark" width={400} height={400} />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Official Live Tally</h2>
                {state?.isVotingOpen && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full border border-red-200">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <span className="text-xs font-black text-red-700 uppercase tracking-widest">Live</span>
                  </div>
                )}
              </div>
              
              {!state?.isVotingOpen && (
                <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 p-5 rounded-xl mb-8 font-black flex items-center gap-3 shadow-sm uppercase tracking-wide">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  THE VOTING PRECINCT IS CURRENTLY CLOSED
                </div>
              )}

              <div className="space-y-6 relative z-10">
                {candidates.map((candidate, index) => {
                  const percentage = totalVotes === 0 ? 0 : Math.round((candidate.votes / totalVotes) * 100)
                  const isLeading = index === 0 && totalVotes > 0

                  return (
                    <div key={candidate.id} className="bg-white/60 p-5 rounded-xl border-2 border-gray-100 shadow-sm transition-all duration-300">
                      <div className="flex justify-between items-end mb-4">
                        <span className="font-black text-2xl text-gray-900 uppercase tracking-wide">{candidate.name}</span>
                        <div className="text-right">
                          <span className={`block text-3xl font-black ${isLeading ? 'text-blue-700' : 'text-gray-600'}`}>
                            {percentage}%
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{candidate.votes} Votes</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200/50 rounded-full h-8 relative overflow-hidden shadow-inner border border-gray-100">
                        <div className={`h-8 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 ${isLeading ? 'bg-gradient-to-r from-blue-800 to-blue-600' : 'bg-gradient-to-r from-red-700 to-red-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>

                      {state?.isVotingOpen && !hasVoted && (
                        <form action={castVote.bind(null, candidate.id)} className="mt-5">
                          <SubmitButton loadingText="Casting Vote..." className="w-full sm:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl font-black hover:bg-black uppercase tracking-widest shadow-md">
                            Vote {candidate.name}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {hasVoted && (
                <div className="mt-10 text-center text-white font-black bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-xl shadow-xl border-b-4 border-green-700 uppercase tracking-widest flex flex-col items-center gap-3 animate-slide-up">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  VOTE OFFICIALLY CAST & TALLIED
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}