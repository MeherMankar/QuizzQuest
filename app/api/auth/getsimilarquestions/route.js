export async function POST(req) {
    try {
        const { question } = await req.json();

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
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    { 
                        role: "system", 
                        content: `You generate quiz questions for the same topic. 
                        The output must be **EXACTLY** a JSON array of **3 slightly different** questions, 
                        with NO extra text before or after it. 

                        Example output:
                        ["Question 1", "Question 2", "Question 3"]`
                    },
                    { 
                        role: "user", 
                        content: `The original question is: "${question}". Generate 3 different questions that are differnt from the given question for the same topic only in a JSON array.` 
                    },
                ],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", data);
            return new Response(JSON.stringify({ error: data.error?.message || "Failed to fetch AI response" }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        let similarQuestions;
        try {
            similarQuestions = JSON.parse(data.choices[0].message.content.trim());
            if (!Array.isArray(similarQuestions) || similarQuestions.length < 3) {
                throw new Error("Invalid AI response format.");
            }
        } catch (err) {
            console.error("Parsing error:", err);
            return new Response(JSON.stringify({ error: "AI response is not in expected JSON format." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, similarQuestions }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error fetching AI-generated questions:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
