import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function POST(req) {
    try {
        const { topic, numberOfQuestions } = await req.json();
        
        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        // Generate a prompt for the Together AI API
        const prompt = `Create ${numberOfQuestions} multiple choice questions about ${topic}. Each question should have 4 options. The questions should be challenging and test the user's understanding of key concepts. Avoid questions that are too trivial or require only rote memorization.

Format your response as a valid JSON array of objects with this exact structure:
[
  {
    "question": "The question text",
    "options": ["option1", "option2", "option3", "option4"],
    "answer": 0
  }
]
Where "answer" is a number (0-3) indicating the index of the correct answer in the options array.
The questions should be challenging but fair, and all options should be plausible. All options should be related to the topic.
Important: Ensure the output is valid JSON that can be parsed directly.
Do not include any text before or after the JSON array.`;

        // Call Together AI API
        const response = await fetch('https://api.together.xyz/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
            },
            body: JSON.stringify({
                model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
                prompt: prompt,
                max_tokens: 1000,
                temperature: 0.7,
                top_p: 0.7,
                frequency_penalty: 0.1,
                presence_penalty: 0.1,
                response_format: { type: "json_object" }
            })
        });

        const aiResponse = await response.json();
        let generatedQuestions;
        
        // Try to parse the AI response
        const rawAiText = aiResponse.choices?.[0]?.text || aiResponse.output?.text; 

        if (!rawAiText) {
            console.error('AI Response structure (no text field):', JSON.stringify(aiResponse, null, 2));
            throw new Error('No output text in AI response'); // Caught by outer catch
        }
        
        const trimmedText = rawAiText.trim();

        try {
            // Attempt 1: Parse the entire text as JSON
            let parsedJson = JSON.parse(trimmedText);

            if (Array.isArray(parsedJson)) {
                generatedQuestions = parsedJson;
            } else if (typeof parsedJson === 'object' && parsedJson !== null) {
                // If it's an object, look for an array property
                const arrayProperty = Object.values(parsedJson).find(val => Array.isArray(val));
                if (arrayProperty) {
                    generatedQuestions = arrayProperty;
                } else {
                    // If it's an object but no array property, this is an unexpected structure.
                    // We will fall through to the catch block which then tries regex.
                    throw new Error("Parsed as object, but no array property found."); 
                }
            } else {
                // If not an array or object after parsing (e.g., string, number), this is unexpected.
                // Fall through to catch.
                throw new Error("Parsed JSON is not an array or object.");
            }
        } catch (parseOrExtractionError) {
            // Attempt 2: If direct parsing/extraction fails, try to find a JSON array string using regex
            console.warn(`Initial JSON parsing/extraction failed: ${parseOrExtractionError.message}. Falling back to regex.`);
            const match = trimmedText.match(/\[[\s\S]*?\]/);
            if (match && match[0]) {
                try {
                    generatedQuestions = JSON.parse(match[0]);
                } catch (regexParseError) {
                    console.error('Error parsing JSON array extracted via regex:', regexParseError);
                    console.log('AI Raw Text for regex parse error:', trimmedText);
                    console.log('AI Full Response for regex parse error:', JSON.stringify(aiResponse, null, 2));
                    // This error will be caught by the outer try-catch for the route handler
                    throw new Error('Failed to parse JSON array from regex match: ' + regexParseError.message);
                }
            } else {
                console.error('No JSON array found via regex after initial parsing failed.');
                console.log('AI Raw Text for no regex match:', trimmedText);
                console.log('AI Full Response for no regex match:', JSON.stringify(aiResponse, null, 2));
                // This error will be caught by the outer try-catch
                throw new Error('No parsable JSON content found in AI response. The AI may not be following instructions.');
            }
        }

       // Validate the structure of generated questions
        if (!Array.isArray(generatedQuestions) || !generatedQuestions.every(q =>
            q.question && Array.isArray(q.options) && q.options.length === 4 &&
            typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3
        )) {
            console.error('Invalid question format after all parsing attempts.');
            // It's useful to log what was actually parsed if validation fails
            console.log('Attempted Generated Questions for validation failure:', JSON.stringify(generatedQuestions, null, 2));
            console.log('Original AI Raw Text for validation failure:', trimmedText);
            console.log('AI Full Response for validation failure:', JSON.stringify(aiResponse, null, 2));
            // This error will be caught by the outer try-catch
            throw new Error('Invalid question format');
        }

        // Ensure that the answer is not the same for all questions
        const firstAnswer = generatedQuestions[0].answer;
        if (generatedQuestions.every(q => q.answer === firstAnswer)) {
            console.error('All questions have the same answer.');
            console.log('Attempted Generated Questions for same answer failure:', JSON.stringify(generatedQuestions, null, 2));
            console.log('Original AI Raw Text for same answer failure:', trimmedText);
            console.log('AI Full Response for same answer failure:', JSON.stringify(aiResponse, null, 2));
            throw new Error('All questions have the same answer');
        }

        // Format questions for database
        const formattedQuestions = generatedQuestions.map(q => ({
            question: q.question,
            ops: q.options,
            answer: q.options[q.answer], // Store the actual answer text
        }));

        // Save to database
        const client = await clientPromise;
        const db = client.db('QuizApp_users');
        await db.collection('questions').insertMany(formattedQuestions);

        return NextResponse.json({ 
            success: true, 
            questions: formattedQuestions 
        });
    } catch (error) {
        console.error('Auto-generate quiz error:', error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}
