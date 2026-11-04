import { useState } from "react"
import { Mic, MicOff, Volume2, ChevronRight } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import DetailShell from "@/krushika/components/DetailShell"

type ChatEntry = { role: "user" | "assistant"; text: string }

export default function VoiceAssistantScreen() {
  const { t } = useLang()
  const v = t.pages.voice
  const x = t.x.coreB.voice
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [chat, setChat] = useState<ChatEntry[]>([])
  const [selectedQ, setSelectedQ] = useState<string | null>(null)

  function askQuestion(idx: number) {
    const q = x.suggestions[idx]
    setSelectedQ(q)
    setListening(true)
    setChat((prev) => [...prev, { role: "user", text: q }])
    setTimeout(() => {
      setListening(false)
      setProcessing(true)
      setTimeout(() => {
        setProcessing(false)
        const answer = x.responses[idx] ?? x.fallback
        setChat((prev) => [...prev, { role: "assistant", text: answer }])
        setSelectedQ(null)
      }, 1200)
    }, 1400)
  }

  function toggleMic() {
    if (listening || processing) return
    setListening(true)
    setTimeout(() => {
      setListening(false)
      setProcessing(true)
      setTimeout(() => {
        setProcessing(false)
        setChat((prev) => [
          ...prev,
          { role: "user", text: x.micQuestion },
          { role: "assistant", text: x.micAnswer },
        ])
      }, 1200)
    }, 2000)
  }

  return (
    <DetailShell title={v.title} subtitle={v.subtitle}>
      {/* Demo notice */}
      <div className="mb-4 rounded-2xl bg-amber-50 p-3">
        <p className="text-xs text-amber-700">{v.demo}</p>
      </div>

      {/* Chat history */}
      {chat.length > 0 && (
        <div className="mb-4 space-y-3">
          {chat.map((entry, i) => (
            <div
              key={i}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {entry.role === "assistant" && (
                <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f7d32]">
                  <Volume2 className="h-3.5 w-3.5 text-white" />
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  entry.role === "user"
                    ? "rounded-br-sm bg-[#2f7d32] text-white"
                    : "rounded-bl-sm bg-white text-gray-700 shadow-sm"
                }`}
              >
                {entry.text}
              </div>
            </div>
          ))}
          {(listening || processing) && (
            <div className="flex justify-start">
              <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f7d32]">
                <Volume2 className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="rounded-2xl rounded-bl-sm bg-white px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mic button */}
      <div className="mb-6 flex flex-col items-center">
        <button
          onClick={toggleMic}
          aria-label={x.micLabel}
          disabled={listening || processing}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-95 ${
            listening
              ? "bg-red-500 shadow-xl shadow-red-300"
              : processing
                ? "bg-amber-400 shadow-xl shadow-amber-200"
                : "bg-[#2f7d32] shadow-xl shadow-green-300"
          }`}
        >
          {listening && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-50" />
          )}
          {listening ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </button>
        <p className="mt-3 text-sm font-medium text-gray-500">
          {listening ? v.listening : processing ? v.processing : v.tapToSpeak}
        </p>
      </div>

      {/* Suggestions */}
      {chat.length === 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-600">{v.suggestions}</p>
          <div className="space-y-2">
            {x.suggestions.map((q, idx) => (
              <button
                key={q}
                onClick={() => askQuestion(idx)}
                disabled={listening || processing}
                className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                <Mic className="h-4 w-4 shrink-0 text-gray-300" />
                <span className="flex-1">{q}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}
    </DetailShell>
  )
}
