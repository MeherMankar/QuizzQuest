export async function POST(req) {
    try {
        const { question } = await req.json();
        console.log(question[0],question[1],question[2],question[3]);
        
        
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
                        content: `You generate incorrect quiz answers. 
                        The output must be **EXACTLY** a JSON array of **8 incorrect** numerical answers , 
                        with NO extra text before or after it. 

                        Example output:
                        ["Wrong Answer 1", "Wrong Answer 2", "Wrong Answer 3", ..., "Wrong Answer 8"]`
                    },
                    { 
                        role: "user", 
                        content: `The origional options are: "${question[0]}". Generate 8 incorrect but similar individual answers only in a JSON array.` 
                    },
                ],
                temperature: 0.9,
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

        let incorrectOptions;
        try {
            incorrectOptions = JSON.parse(data.choices[0].message.content.trim());
            if (!Array.isArray(incorrectOptions) || incorrectOptions.length < 8) {
                throw new Error("Invalid AI response format.");
            }
        } catch (err) {
            console.error("Parsing error:", err);
            return new Response(JSON.stringify({ error: "AI response is not in expected JSON format." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Add correct answer and shuffle
        const allOptions = [...incorrectOptions, question].sort(() => Math.random() - 0.5);

        return new Response(JSON.stringify({ success: true, options: allOptions }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error fetching AI-generated options:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
