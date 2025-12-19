"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AlertTriangle, ArrowLeft, ArrowUp, Copy, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react"

type Role = "user" | "assistant"

type RecommendedTool = {
  id: string
  name: string
  price: string
  strengths: string[]
  url?: string
  rating?: number
  logo?: string
}

type AssistantPayload = {
  response: string
  reformulatedQuestion: string
  primaryRecommendation: RecommendedTool | null
  alternatives: RecommendedTool[]
  reasoning: string
  actionSuggestion: string
  followUpQuestions: string[]
  timestamp: string
}

type Message = {
  id: string
  role: Role
  content: string
  timestamp: Date
  recommendations?: {
    primary?: RecommendedTool | null
    alternatives?: RecommendedTool[]
  }
}

type Suggestion = {
  category: string
  question: string
  description: string
}

type ChatThread = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

function DotsLoader() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="inline-block size-2 rounded-full bg-gray-400 animate-bounce" />
      <span className="inline-block size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
      <span className="inline-block size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
    </div>
  )
}

function MessageActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center gap-1 transition-opacity duration-150", className)}>{children}</div>
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isAssistant = message.role === "assistant"
  const copyText = () => navigator.clipboard.writeText(message.content)

  return (
    <div className={cn("mx-auto flex w-full max-w-3xl px-2 md:px-10", isAssistant ? "justify-start" : "justify-end")}
         data-role={message.role}>
      {isAssistant ? (
        <div className="group flex w-full flex-col gap-1">
          <div className="w-full min-w-0 rounded-lg bg-transparent p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="markdown"
              components={{
                table: (props: any) => (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse" {...props} />
                  </div>
                ),
                th: (props: any) => (
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left text-sm font-semibold text-gray-900" {...props} />
                ),
                td: (props: any) => (
                  <td className="border border-gray-200 px-3 py-2 text-sm text-gray-800" {...props} />
                ),
                h1: (props: any) => (
                  <h1 className="mt-2 text-2xl font-bold text-gray-900" {...props} />
                ),
                h2: (props: any) => (
                  <h2 className="mt-4 text-xl font-semibold text-gray-900" {...props} />
                ),
                h3: (props: any) => (
                  <h3 className="mt-3 text-lg font-semibold text-gray-900" {...props} />
                ),
                p: (props: any) => (
                  <p className="my-2 leading-relaxed text-gray-800" {...props} />
                ),
                ul: (props: any) => (
                  <ul className="my-2 list-disc pl-5 text-gray-800" {...props} />
                ),
                ol: (props: any) => (
                  <ol className="my-2 list-decimal pl-5 text-gray-800" {...props} />
                ),
                li: (props: any) => (
                  <li className="mb-1" {...props} />
                ),
                strong: (props: any) => (
                  <strong className="font-semibold text-gray-900" {...props} />
                ),
                em: (props: any) => (
                  <em className="italic" {...props} />
                ),
                hr: (props: any) => (
                  <hr className="my-4 border-gray-200" {...props} />
                ),
                blockquote: (props: any) => (
                  <blockquote className="my-3 border-l-4 border-gray-300 pl-3 text-gray-700" {...props} />
                ),
                code: (props: any) => (
                  <code className={cn("rounded bg-gray-100 px-1 py-0.5 text-[90%] text-gray-900", props.className)} {...props}>
                    {props.children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <MessageActions className={cn("-ml-1 opacity-0 group-hover:opacity-100", isLast && "opacity-100")}
          >
            <Button variant="ghost" size="icon" className="rounded-full" onClick={copyText} aria-label="Copier">
              <Copy className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Utile">
              <ThumbsUp className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Pas utile">
              <ThumbsDown className="size-4" />
            </Button>
          </MessageActions>
        </div>
      ) : (
        <div className="group flex max-w-[85%] flex-col items-end gap-1 sm:max-w-[75%]">
          <div className="bg-muted text-primary w-fit rounded-3xl px-5 py-2.5 whitespace-pre-wrap">
            {message.content}
          </div>
          <MessageActions className="opacity-0 group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={copyText} aria-label="Copier">
              <Copy className="size-4" />
            </Button>
          </MessageActions>
        </div>
      )}
    </div>
  )
}

function ToolCard({ tool, primary }: { tool: RecommendedTool; primary?: boolean }) {
  return (
    <div className={cn("mt-3 rounded-xl border p-4", primary ? "border-indigo-200 bg-indigo-50" : "border-gray-200 bg-gray-50")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {tool.logo && <img src={tool.logo} alt={tool.name} className="size-6 rounded" />}
            <h4 className="font-semibold text-gray-900">{tool.name}</h4>
            {primary && <span className="text-xs font-medium text-indigo-700">Recommandé</span>}
          </div>
          <p className="mb-2 text-sm text-gray-600">{tool.price}</p>
          {typeof tool.rating === "number" && (
            <div className="mb-2 text-sm font-medium text-gray-800">{tool.rating}/5</div>
          )}
          <div className="flex flex-wrap gap-1">
            {tool.strengths?.slice(0, 3).map((s, i) => (
              <span key={i} className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                {s}
              </span>
            ))}
          </div>
        </div>
        {tool.url && (
          <Button asChild variant="outline" size="sm" className="ml-2">
            <a href={tool.url} target="_blank" rel="noreferrer">Visiter</a>
          </Button>
        )}
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Bonjour ! Je suis votre assistant Winksia. Décrivez votre besoin et je recommande les meilleurs outils IA.",
    timestamp: new Date()
  }])
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"ready" | "submitted" | "error">("ready")
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const res = await fetch("/api/assistant/ask", { method: "GET" })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data?.suggestions)) setSuggestions(data.suggestions as Suggestion[])
        }
      } catch {}
    }
    loadSuggestions()

    // Charger l'historique depuis localStorage
    try {
      const raw = localStorage.getItem("assistant_threads")
      if (raw) {
        const parsed = JSON.parse(raw) as ChatThread[]
        setThreads(parsed)
        if (parsed.length > 0) {
          setActiveThreadId(parsed[0].id)
          setMessages(parsed[0].messages.length ? parsed[0].messages : messages)
        }
      }
    } catch {}
  }, [])

  // Déclencher une comparaison automatique si compare=1 est présent
  useEffect(() => {
    try {
      const compare = searchParams?.get('compare')
      if (compare === '1') {
        // Essayer de récupérer les outils persistés depuis la page Outils
        const raw = typeof window !== 'undefined' ? localStorage.getItem('compare_tools_data') : null
        if (raw) {
          const tools = JSON.parse(raw) as any[]
          if (Array.isArray(tools) && tools.length >= 2) {
            const names = tools.map(t => t?.name).filter(Boolean).join(', ')
            const prompt = `Compare ces outils: ${names}. Donne un tableau synthétique des forces/faiblesses, cas d’usage, intégrations clés, prix, et termine par une recommandation argumentée selon 3 profils (startup, PME, Enterprise).`
            void sendQuestion(prompt, true)
          }
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    scrollerRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  const hasOnlyWelcome = useMemo(() => messages.length === 1 && messages[0].id === "welcome", [messages])

  const persistThreads = (next: ChatThread[]) => {
    try { localStorage.setItem("assistant_threads", JSON.stringify(next)) } catch {}
  }

  const startNewThread = () => {
    setActiveThreadId(null)
    setMessages([{ id: "welcome", role: "assistant", content: "Bonjour ! Je suis votre assistant Winksia. Décrivez votre besoin et je recommande les meilleurs outils IA.", timestamp: new Date() }])
  }

  // Envoi d'une question arbitraire (utilisé pour la comparaison auto)
  const sendQuestion = async (text: string, forceNew?: boolean) => {
    if (!text.trim() || status === "submitted") return
    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    if (forceNew) {
      setMessages([userMsg])
    } else {
      setMessages((m) => [...m, userMsg])
    }
    setStatus("submitted")
    setError(null)

    try {
      const res = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          context: messages.slice(-6).map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `HTTP ${res.status}`)
      }

      const data: AssistantPayload = await res.json()

      const assistantMsg: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(data.timestamp || Date.now()),
        recommendations: {
          primary: data.primaryRecommendation,
          alternatives: data.alternatives,
        },
      }
      setMessages((m) => [...m, assistantMsg])

      // Gestion des threads
      const nowIso = new Date().toISOString()
      let nextThreads: ChatThread[] = []
      if (forceNew || !activeThreadId) {
        const title = userMsg.content.slice(0, 60)
        const newThread: ChatThread = {
          id: `thread-${Date.now()}`,
          title: title || "Nouvelle conversation",
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: [userMsg, assistantMsg],
        }
        setThreads((prev) => {
          const updated = [newThread, ...prev]
          persistThreads(updated)
          return updated
        })
        setActiveThreadId(newThread.id)
      } else {
        setThreads((prev) => {
          const updated = prev.map((t) =>
            t.id === activeThreadId ? { ...t, messages: [...messages, userMsg, assistantMsg], updatedAt: nowIso, title: t.title || userMsg.content.slice(0, 60) } : t
          )
          persistThreads(updated)
          return updated
        })
      }
      setStatus("ready")
    } catch (e: any) {
      setStatus("error")
      setError(e?.message || "Erreur inconnue")
    }
  }

  const send = async () => {
    if (!input.trim()) return
    await sendQuestion(input)
    setInput("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header sans barre de recherche */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-16 py-4">
          <div className="grid grid-cols-2 items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4 justify-self-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1e3a8a" }}>
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Winksia</h1>
                </div>
              </div>
            </div>
            {/* Actions à droite */}
            <div className="flex items-center gap-3 justify-self-end ml-auto">
              <Link
                href="/outils"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-600"
                aria-label="Retour aux outils"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Corps avec historique à gauche + chat à droite */}
      <div className="relative flex-1 overflow-hidden">
        <div className="grid h-full min-h-0 w-full grid-cols-1 gap-0 px-2 md:px-3 md:grid-cols-[320px_1fr]">
          {/* Sidebar Historique */}
          <aside className="hidden h-full border-r bg-white md:block">
            <div className="flex h-full min-h-0 flex-col">
              <div className="px-2 py-3">
                <Button
                  onClick={startNewThread}
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  Nouvelle conversation
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-3 max-h-[calc(100vh-140px)]">
                {threads.length === 0 && (
                  <div className="px-3 text-sm text-gray-500">Aucune conversation enregistrée</div>
                )}
                <ul className="space-y-1">
                  {threads.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => {
                          setActiveThreadId(t.id)
                          setMessages(t.messages && t.messages.length ? t.messages : messages)
                        }}
                        className={cn(
                          "w-full rounded-lg p-3 text-left transition-colors",
                          activeThreadId === t.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                        )}
                        title={t.title}
                      >
                        <div className="line-clamp-2 text-sm font-medium text-gray-900">{t.title}</div>
                        <div className="mt-1 text-xs text-gray-500">{new Date(t.updatedAt).toLocaleString()}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Zone Chat */}
          <section className="flex h-full flex-col overflow-hidden">
            <div className="relative flex-1 space-y-0 overflow-y-auto">
              <div className="space-y-10 px-4 py-6">
              {messages.map((m, i) => (
                <div key={m.id}>
                  <MessageBubble message={m} isLast={i === messages.length - 1} />

                  {/* Recommandations liées au message assistant */}
                  {m.role === "assistant" && m.recommendations?.primary && (
                    <div className="mx-auto mt-2 w-full max-w-3xl px-2 md:px-10">
                      <ToolCard tool={m.recommendations.primary} primary />
                      {m.recommendations.alternatives && m.recommendations.alternatives.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-700">Alternatives :</div>
                          <div className="mt-2 space-y-2">
                            {m.recommendations.alternatives.map((t) => (
                              <ToolCard key={t.id} tool={t} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {status === "submitted" && (
                <div className="mx-auto flex w-full max-w-3xl items-start gap-2 px-2 md:px-10">
                  <DotsLoader />
                </div>
              )}

              {status === "error" && error && (
                <div className="mx-auto w-full max-w-3xl px-2 md:px-10">
                  <div className="flex items-center gap-2 rounded-lg border-2 border-red-300 bg-red-300/20 px-2 py-2 text-sm text-red-600">
                    <AlertTriangle className="size-4 text-red-500" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Suggestions initiales */}
              {hasOnlyWelcome && suggestions.length > 0 && (
                <div className="mx-auto w-full max-w-3xl space-y-2 px-2 md:px-10">
                  <div className="text-sm font-medium text-gray-700">Suggestions</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.question}-${i}`}
                        className="rounded-xl border border-gray-200 bg-transparent p-3 text-left transition-colors hover:bg-gray-50"
                        disabled={status === "submitted"}
                        onClick={() => setInput(s.question)}
                      >
                        <div className="text-xs text-indigo-600">{s.category}</div>
                        <div className="text-sm font-medium text-gray-900">{s.question}</div>
                        <div className="text-xs text-gray-500">{s.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={scrollerRef} />
              </div>
            </div>

            {/* Input */}
            <div className="inset-x-0 bottom-0 mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 md:px-5 md:pb-5">
              <div className="relative z-10 w-full rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Posez votre question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="min-h-[44px] resize-none border-none px-3 pt-2 text-base leading-[1.3] focus-visible:ring-0"
                  />

                  <Button
                    size="icon"
                    disabled={!input.trim() || (status !== "ready" && status !== "error")}
                    onClick={send}
                    className="size-10 rounded-full text-white"
                    style={{ backgroundColor: "#1e3a8a" }}
                    aria-label="Envoyer"
                  >
                    {status === "ready" || status === "error" ? (
                      <ArrowUp className="size-5" />
                    ) : (
                      <span className="size-3 rounded-sm bg-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
