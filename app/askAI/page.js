"use client";
import { useState } from "react";
import NavBar from "../components/NavBar";

export default function Page() {
    const [userquery, setuserquery] = useState("");
    const [AIresponses, setAIresponses] = useState([]);

    async function getAnswersfromAI(query) {
        try {
            const response = await fetch('/api/auth/getanswerfromAI', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: query }),
            });

            const data = await response.json();
            if (data.success) {
                setAIresponses([...AIresponses, { role: "user", message: query }, { role: "ai", message: data.answer }]);
            } else {
                console.error("Unable to fetch response from AI");
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
        }
    }

    const handleSend = () => {
        if (!userquery.trim()) return;
        getAnswersfromAI(userquery).then(() => setuserquery(""));
    };

    return (
        <>
            <div className="flex flex-col w-screen h-screen bg-slate-900 text-white">
                <NavBar />
                <div className="chatarea h-full w-full p-4 overflow-y-auto flex flex-col gap-3">
                    {AIresponses.map((item, index) => (
                        <div
                            key={index}
                            className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`relative max-w-[75%] p-3 rounded-lg ${item.role === "user" ? "bg-slate-800 text-white" : "bg-gray-800 text-gray-200"}`}>
                                <span className="absolute top-0 left-2 text-md font-semibold text-slate-500">
                                    {item.role === "user" ? "You" : "AI"}
                                </span>
                                <p className="mt-4">{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bottom w-full h-[10%] flex p-2 items-center bg-slate-800">
                    <input
                        className="w-full border border-gray-600 bg-gray-700 p-2 h-full outline-none rounded-lg text-white"
                        onChange={(event) => setuserquery(event.target.value)}
                        value={userquery}
                        placeholder="Ask our AI anything..."
                    />
                    <button onKeyDown={(event)=>{
                        if(event.key === "Enter"){
                            handleSend()
                        }
                    }} onClick={handleSend} className="bg-yellow-500 text-black p-2 rounded-lg ml-2">Send</button>
                </div>
            </div>
        </>
    );
}
