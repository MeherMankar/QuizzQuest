import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { validateQuizTopic, validateNumberOfQuestions, sanitizeInput } from '../../../../lib/validation';

export async function POST(req) {
    try {
        const { topic, numberOfQuestions, aiProvider = 'gemini' } = await req.json();
        
        // Input validation
        if (!validateQuizTopic(topic)) {
            return NextResponse.json({ error: "Topic must be between 2-100 characters" }, { status: 400 });
        }
        
        if (!validateNumberOfQuestions(numberOfQuestions)) {
            return NextResponse.json({ error: "Number of questions must be between 1-20" }, { status: 400 });
        }
        
        const sanitizedTopic = sanitizeInput(topic);

        // Generate a prompt for AI
        const prompt = `Create ${numberOfQuestions} multiple choice questions about ${sanitizedTopic}. Each question should have 4 options. Format as JSON array: [{"question": "text", "options": ["a", "b", "c", "d"], "answer": 0}]`;

        let generatedQuestions;
        let lastError;

        // Try different AI providers with fallback
        try {
            if (aiProvider === 'openai') {
                generatedQuestions = await generateWithOpenAI(prompt);
            } else if (aiProvider === 'huggingface') {
                generatedQuestions = await generateWithHuggingFace(prompt);
            } else if (aiProvider === 'openrouter') {
                generatedQuestions = await generateWithOpenRouter(prompt);
            } else if (aiProvider === 'routeway') {
                generatedQuestions = await generateWithRouteway(prompt);
            } else {
                generatedQuestions = await generateWithGemini(prompt);
            }
        } catch (error) {
            lastError = error;
            console.log(`Primary AI provider (${aiProvider}) failed, trying fallback...`);
            
            // Fallback to Gemini if primary fails
            try {
                generatedQuestions = await generateWithGemini(prompt);
            } catch (fallbackError) {
                console.log('Fallback also failed, trying OpenRouter...');
                try {
                    generatedQuestions = await generateWithOpenRouter(prompt);
                } catch (finalError) {
                    throw new Error(`All AI providers failed. Last error: ${finalError.message}`);
                }
            }
        }

        // Format questions for database
        const formattedQuestions = generatedQuestions.map(q => ({
            question: q.question,
            ops: q.options,
            answer: q.options[q.answer],
        }));

        // Save to database
        const client = await clientPromise;
        if (client) {
            const db = client.db('QuizApp_users');
            await db.collection('questions').insertMany(formattedQuestions);
        }

        return NextResponse.json({ 
            success: true, 
            questions: formattedQuestions 
        });
    } catch (error) {
        console.error('Auto-generate quiz error:', error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}

async function generateWithHuggingFace(prompt) {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                return_full_text: false
            }
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(`HuggingFace API Error: ${data.error}`);
    }
    
    if (!data[0] || !data[0].generated_text) {
        throw new Error(`Invalid HuggingFace API response`);
    }
    
    const content = data[0].generated_text;
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    return parseAIResponse(cleanContent);
}

async function generateWithOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error(`Invalid OpenAI API response`);
    }
    
    const content = data.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    return parseAIResponse(cleanContent);
}

async function generateWithOpenRouter(prompt) {
    // Try multiple model endpoints in case some are not available on the user's OpenRouter account
    const candidateModels = [
        'mistralai/mistral-7b-instruct:free',
        'meta-llama/llama-3-8b-instruct:free',
        'mistralai/mistral-7b-instruct',
        'meta-llama/llama-3-8b-instruct'
    ];

    let lastErr;
    for (const model of candidateModels) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (data.error) {
                // If OpenRouter reports no endpoints for this model, try the next candidate
                const msg = data.error.message || JSON.stringify(data.error);
                if (/no endpoints found/i.test(msg) || /No endpoints found/i.test(msg)) {
                    lastErr = new Error(`OpenRouter endpoint not available for model ${model}: ${msg}`);
                    console.warn(lastErr.message);
                    continue;
                }
                throw new Error(`OpenRouter API Error: ${msg}`);
            }

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error(`Invalid OpenRouter API response for model ${model}`);
            }

            const content = data.choices[0].message.content;
            const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
            console.log(`OpenRouter succeeded with model ${model}`);
            return parseAIResponse(cleanContent);
        } catch (err) {
            // Keep the last error and try the next model
            lastErr = err;
            console.warn(`OpenRouter attempt failed for model ${model}: ${err.message}`);
            continue;
        }
    }

    // If we exhausted models, throw the last error
    throw new Error(lastErr ? lastErr.message : 'OpenRouter: no models tried');
}

async function generateWithRouteway(prompt) {
    const response = await fetch('https://api.routeway.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ROUTEWAY_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(`Routeway API Error: ${data.error.message}`);
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error(`Invalid Routeway API response structure: ${JSON.stringify(data)}`);
    }
    
    const content = data.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    return parseAIResponse(cleanContent);
}

async function generateWithGemini(prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error(`Invalid Gemini API response structure`);
    }
    
    const content = data.candidates[0].content.parts[0].text;
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    return parseAIResponse(cleanContent);
}

/**
 * Try several strategies to extract JSON from AI model responses.
 * - First try direct JSON.parse
 * - Then try to extract the first JSON array/object substring
 * - If still failing, throw with a helpful message including a short preview
 */
function parseAIResponse(content) {
    // Quick attempt
    try {
        return JSON.parse(content);
    } catch (e) {
        // try to find a JSON object or array inside the content
        const m = content.match(/(\[.*\]|\{.*\})/s);
        if (m && m[0]) {
            try {
                return JSON.parse(m[0]);
            } catch (e2) {
                // fallthrough to error below
            }
        }

        // Try extracting between first [ and last ] (common when an array is returned with leading text)
        const firstBracket = content.indexOf('[');
        const lastBracket = content.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            const sub = content.slice(firstBracket, lastBracket + 1);
            try {
                return JSON.parse(sub);
            } catch (e3) {
                // continue
            }
        }

        // Try extracting between first { and last }
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const sub = content.slice(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(sub);
            } catch (e4) {
                // continue
            }
        }

        // If nothing worked, throw with a short preview to help debugging (not the full content)
        const preview = content.length > 400 ? content.slice(0, 400) + '...' : content;
        throw new Error(`Failed to parse AI response as JSON. Preview: ${preview}`);
    }
}


