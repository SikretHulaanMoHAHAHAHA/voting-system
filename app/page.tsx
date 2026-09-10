import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { preRegister, login, logout, castVote } from "@/actions/voting"
import Link from "next/link"
import Image from "next/image"

const prisma = new PrismaClient()

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

  return (
    <div className="min-h-screen font-sans pb-12 text-slate-900">
      <header className="glass-header py-3 px-4 sm:px-8 flex justify-between items-center relative overflow-hidden z-50 animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-white to-red-600"></div>
        <Image 
          src="/images/SJDM.png" 
          alt="SJDM Logo" 
          width={75} 
          height={75} 
          className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
          priority
        />
        <div className="text-center flex-1 px-4">
          <h1 className="text-xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 tracking-tight uppercase">
            San Jose Del Monte
          </h1>
          <p className="text-xs sm:text-sm font-bold text-red-600 tracking-widest uppercase mt-1">
            Official Voting Portal
          </p>
        </div>
        <Image 
          src="/images/BagongPilipinas.png" 
          alt="Bagong Pilipinas Logo" 
          width={75} 
          height={75} 
          className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
          priority
        />
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 mt-4 sm:mt-8 animate-slide-up">
        {!user ? (
          <div className="glass-panel p-8 rounded-2xl max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-700 via-white to-red-600"></div>
            {!isLoginMode ? (
              <>
                <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-wide">VOTER REGISTRATION</h2>
                <form action={preRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Roblox Username</label>
                    <input 
                      type="text" 
                      name="username" 
                      placeholder="Enter your Roblox Username" 
                      required
                      className="w-full border-2 border-gray-200 bg-white/50 p-4 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-700/10 transition-all font-medium"
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-blue-700/25 hover:-translate-y-1 transition-all duration-200 uppercase tracking-widest">
                    Register Account
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 font-medium">
                  Already registered? <Link href="/?mode=login" className="text-red-600 font-black hover:text-red-700 hover:underline transition-colors">Log in here</Link>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-wide">VOTER LOGIN</h2>
                <form action={login} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Roblox Username</label>
                    <input 
                      type="text" 
                      name="username" 
                      placeholder="Enter your Roblox Username" 
                      required
                      className="w-full border-2 border-gray-200 bg-white/50 p-4 rounded-xl focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all font-medium"
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-red-600/25 hover:-translate-y-1 transition-all duration-200 uppercase tracking-widest">
                    Access Voting Poll
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 font-medium">
                  Need an account? <Link href="/" className="text-blue-700 font-black hover:text-blue-800 hover:underline transition-colors">Pre-Register here</Link>
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="glass-panel border-l-8 border-l-blue-700 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 group">
              <div>
                <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Active Voter</p>
                <p className="text-2xl font-black text-gray-900 uppercase mt-1 group-hover:text-blue-700 transition-colors">{user.originalName}</p>
                <p className="text-green-600 font-black text-sm mt-2 flex items-center gap-2 bg-green-500/10 w-fit px-3 py-1.5 rounded-full border border-green-500/20">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  VERIFIED REGISTRATION
                </p>
              </div>
              <form action={logout}>
                <button className="text-sm bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-black hover:bg-gray-50 hover:border-gray-300 hover:text-black hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all uppercase tracking-widest">
                  Log Out
                </button>
              </form>
            </div>

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
                <div className="bg-yellow-50/80 backdrop-blur border-2 border-yellow-400 text-yellow-800 p-5 rounded-xl mb-8 font-black flex items-center gap-3 shadow-sm uppercase tracking-wide animate-pulse">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  THE VOTING PRECINCT IS CURRENTLY CLOSED
                </div>
              )}

              <div className="space-y-6 relative z-10">
                {candidates.map((candidate, index) => {
                  const percentage = totalVotes === 0 ? 0 : Math.round((candidate.votes / totalVotes) * 100)
                  const isLeading = index === 0 && totalVotes > 0

                  return (
                    <div key={candidate.id} className="bg-white/60 hover:bg-white p-5 rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
                      <div className="flex justify-between items-end mb-4">
                        <span className="font-black text-2xl text-gray-900 uppercase tracking-wide group-hover:translate-x-1 transition-transform">{candidate.name}</span>
                        <div className="text-right">
                          <span className={`block text-3xl font-black ${isLeading ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500' : 'text-gray-600'}`}>
                            {percentage}%
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{candidate.votes} Votes</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200/50 rounded-full h-8 relative overflow-hidden shadow-inner border border-gray-100">
                        <div 
                          className={`h-8 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 ${isLeading ? 'bg-gradient-to-r from-blue-800 to-blue-600' : 'bg-gradient-to-r from-red-700 to-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        >
                        </div>
                      </div>

                      {state?.isVotingOpen && !hasVoted && (
                        <form action={castVote.bind(null, candidate.id)} className="mt-5">
                          <button className="w-full sm:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl font-black hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-md uppercase tracking-widest active:scale-95">
                            Vote {candidate.name}
                          </button>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {hasVoted && (
                <div className="mt-10 text-center text-white font-black bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-xl shadow-xl hover:shadow-green-500/25 border-b-4 border-green-700 uppercase tracking-widest flex flex-col items-center gap-3 animate-slide-up hover:-translate-y-1 transition-transform">
                  <svg className="w-12 h-12 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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