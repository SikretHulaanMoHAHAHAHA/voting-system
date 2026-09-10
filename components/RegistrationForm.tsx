"use client"

import { useState } from "react"
import { preRegister } from "@/actions/voting"
import { SubmitButton } from "@/components/SubmitButton"

export function RegistrationForm() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [error, setError] = useState("")

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1)
    setNum2(Math.floor(Math.random() * 10) + 1)
    setUserAnswer("")
    setError("")
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    generateCaptcha()
    setIsModalOpen(true)
  }

  const verifyAndSubmit = async (formData: FormData) => {
    if (parseInt(userAnswer) !== num1 + num2) {
      setError("Incorrect verification answer.")
      return
    }
    await preRegister(formData)
  }

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Roblox Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Roblox Username"
            required
            className="w-full border-2 border-gray-200 bg-white/50 p-4 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-700/10 transition-all font-medium"
          />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-blue-700/25 hover:-translate-y-1 transition-all duration-200 uppercase tracking-widest">
          Register Account
        </button>
      </form>

      {isModalOpen && (
        /* FIX: The dark overlay now handles the scrolling (overflow-y-auto) with padding on top/bottom */
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex px-4 py-10">
          
          /* FIX: m-auto forces it to center when there is space, but scroll naturally when there isn't */
          <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-md w-full m-auto shadow-2xl animate-fade-in border-t-8 border-t-blue-700 flex flex-col">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">Security & Consent</h3>
            
            <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed">
              By registering, you consent to the use of a strictly necessary security cookie to ensure one vote per person and prevent electoral fraud. This cryptographic token binds your session to this specific device, guaranteeing the mathematical integrity of the voting tally without tracking your personal browsing habits.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 shrink-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Anti-Bot Verification</p>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-gray-800 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
                  {num1} + {num2} =
                </span>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="?"
                  className="w-full border-2 border-gray-200 p-2 rounded-lg text-lg font-black text-center focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                />
              </div>
              {error && <p className="text-red-600 text-xs font-bold mt-2">{error}</p>}
            </div>

            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-xl transition-colors uppercase text-xs sm:text-sm tracking-widest"
              >
                Cancel
              </button>
              <form action={verifyAndSubmit} className="flex-1 flex">
                <input type="hidden" name="username" value={username} />
                <SubmitButton 
                  loadingText="Verifying..."
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-xl transition-colors uppercase text-xs sm:text-sm tracking-widest"
                >
                  I Consent
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}