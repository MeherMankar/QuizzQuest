import { NextResponse } from 'next/server';
import { validateQuizTopic, validateNumberOfQuestions, sanitizeInput } from '../../../../lib/validation';

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash'];

export async function POST(req) {
    try {
        let requestBody;
        try {
            requestBody = await req.json();
        } catch {
            return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
        }

        if (!requestBody || typeof requestBody !== 'object' || Array.isArray(requestBody)) {
            return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
        }

        const { topic, numberOfQuestions = 5 } = requestBody;
        const questionCount = Number(numberOfQuestions);

        if (!validateQuizTopic(topic)) {
            return NextResponse.json({ error: 'Topic must be between 2 and 100 characters.' }, { status: 400 });
        }

        if (!validateNumberOfQuestions(questionCount) || !Number.isInteger(questionCount)) {
            return NextResponse.json({ error: 'Number of questions must be between 1 and 20.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.startsWith('your_') || apiKey.startsWith('local-')) {
            return NextResponse.json(
                { error: 'AI quiz generation is not configured. Add a valid GEMINI_API_KEY to .env.local.' },
                { status: 503 }
            );
        }

        const safeTopic = sanitizeInput(topic);
        const questions = await generateQuiz(safeTopic, questionCount, apiKey);

        return NextResponse.json({ success: true, questions });
    } catch (error) {
        console.error('Auto-generate quiz error:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: `Could not generate the quiz. ${message}` }, { status: 502 });
    }
}

async function generateQuiz(topic, numberOfQuestions, apiKey) {
    const prompt = [
        `Write exactly ${numberOfQuestions} useful multiple-choice questions about: ${topic}.`,
        'Return only a JSON array. Each item must have this shape:',
        '{"question":"...","options":["...","...","...","..."],"answer":0}',
        'The answer must be the zero-based index of the one correct option. Keep distractors plausible.',
    ].join('\n');
    const failures = [];

    for (const model of GEMINI_MODELS) {
        let response;
        let data;

        try {
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature: 0.7,
                        },
                    }),
                }
            );
            data = await response.json();
        } catch (error) {
            failures.push(`${model}: ${error instanceof Error ? error.message : 'network request failed'}`);
            continue;
        }

        if (!response.ok || data.error) {
            const reason = data.error?.message || `HTTP ${response.status}`;
            failures.push(`${model}: ${reason}`);
            if ([400, 401, 403].includes(response.status)) break;
            continue;
        }

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof content !== 'string' || !content.trim()) {
            failures.push(`${model}: the model returned no quiz content`);
            continue;
        }

        try {
            return formatQuestions(parseAIResponse(content), numberOfQuestions);
        } catch (error) {
            failures.push(`${model}: ${error instanceof Error ? error.message : 'invalid quiz response'}`);
        }
    }

    throw new Error(failures.join(' | ') || 'No Gemini models are available.');
}

function formatQuestions(payload, expectedCount) {
    if (!Array.isArray(payload) || payload.length !== expectedCount) {
        throw new Error(`Expected ${expectedCount} questions, but received ${Array.isArray(payload) ? payload.length : 'an invalid response'}.`);
    }

    return payload.map((item, index) => {
        if (!item || typeof item.question !== 'string' || !item.question.trim()) {
            throw new Error(`Question ${index + 1} is missing its prompt.`);
        }

        if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some(option => typeof option !== 'string' || !option.trim())) {
            throw new Error(`Question ${index + 1} must have four non-empty answer options.`);
        }

        const answerIndex = typeof item.answer === 'number'
            ? item.answer
            : item.options.indexOf(item.answer);

        if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= item.options.length) {
            throw new Error(`Question ${index + 1} has an invalid correct answer.`);
        }

        return {
            question: item.question.trim(),
            ops: item.options.map(option => option.trim()),
            answer: item.options[answerIndex].trim(),
            answerIndex,
        };
    });
}

function parseAIResponse(content) {
    const cleaned = content
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('[');
        const end = cleaned.lastIndexOf(']');
        if (start !== -1 && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1));
        }
        throw new Error('The model returned invalid JSON.');
    }
}
