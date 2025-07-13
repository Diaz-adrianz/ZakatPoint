import { SendHorizonalIcon, SparklesIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useEffect, useRef, useState } from "react"
import { Input } from "./ui/input"
import Markdown from 'react-markdown'
import { usePage } from "@inertiajs/react"
import { SharedData } from "@/types"

interface Chat {
    role: "user" | 'bot',
    message: string
}

const ChatBotArticle = () => {
    const { csrfToken } = usePage<SharedData>().props 
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('')
    const [chats, setChats] = useState<Chat[]>([
        {
            role: 'bot'
            ,message: "Assalamualaikum! Saya siap membantu pertanyaan Anda seputar zakat."
        }
    ])

    const chatArea = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (chatArea.current) 
            chatArea.current.scrollTop = chatArea.current.scrollHeight;
    }, [chats])


    const getResponse = () => {
        const message = input

        setLoading(true)
        setInput('')
        setChats((c) => [...c, {role: 'user', message}])

        const fd = new FormData()
        fd.append("message", message)

        if (csrfToken) {
            fd.append("_token", csrfToken); 
        } else {
            setLoading(false)
            setChats(c => [...c, { role: 'bot', message: 'Maaf, terjadi kesalahan autentikasi Silakan refresh halaman.' }]);
            return;
        }

        fetch(route('article.chat'), { body: fd, method: 'POST' })
            .then(res => res.json())
            .then(dat => setChats(c => [...c, {role: 'bot', message: dat.message}]))
            .finally(() => {
                setLoading(false)
            })
    }


  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button className="fixed bottom-6 right-6">
                <SparklesIcon /> Tanya AI
            </Button>
        </PopoverTrigger>
        <PopoverContent className="relative w-screen max-w-lg p-0">
            <div ref={chatArea} className="flex flex-col gap-8 overflow-y-auto p-6 max-h-96 pb-32">
                {chats.map((chat, i) => (
                    <div
                        key={i}
                        className={'flex items-center justify-end'}
                    >
                        {chat.role == 'user' ? (
                            <div className="ms-8 w-fit max-w-sm rounded-md bg-primary p-3 text-primary-foreground">
                                {chat.message}
                            </div>
                        ) : (
                            <div className="w-full border rounded-md p-3 me-8">
                                <Markdown>{chat.message}</Markdown>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="w-full">
                        <p>✨ Berpikir... mohon tunggu sebentar.</p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 bg-background left-0 right-0 flex flex-col items-center gap-2 border-t bg-base-100 p-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        getResponse()
                    }}
                    className="flex w-full items-center gap-2"
                >
                    <Input
                        disabled={loading}
                        placeholder={'Tanyakan apa saja'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button disabled={loading || !input} type="submit" size={'icon'}>
                        <SendHorizonalIcon />
                    </Button>
                </form>
                <small className="!typo-small">AI bisa membuat kesalahan. Periksa informasi penting.</small>
            </div>
        </PopoverContent>
    </Popover>  
    )
}

export default ChatBotArticle