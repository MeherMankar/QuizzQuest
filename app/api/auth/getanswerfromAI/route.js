export async function POST(req) {
    try {
        const { question } = await req.json(); // Parse request body

        if (!question) {
            return new Response(JSON.stringify({ error: "Question is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`, // Ensure .env contains TOGETHER_API_KEY
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // Free model on Together AI
                messages: [
                    { role: "system", content: "You are a helpful AI assistant." },
                    { role: "user", content: question },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", data);
            return new Response(JSON.stringify({ error: data.error || "Failed to fetch AI response" }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, answer: data.choices[0].message.content }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error fetching AI response:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
