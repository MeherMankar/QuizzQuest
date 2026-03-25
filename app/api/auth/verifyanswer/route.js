import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { options } from '../[...nextauth]/options';

export async function POST(req) {
    try {
        const session = await getServerSession(options);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await req.json();
        const { answers } = body;
        const client = await clientPromise;
        const db = client.db("QuizApp_users");

        let correctCount = 0;
        const results = {};

        // Process each answer
        for (const [questionId, selectedAnswer] of Object.entries(answers)) {
            if (!ObjectId.isValid(questionId)) {
                console.log('Invalid questionId:', questionId);
                continue;
            }

            const objectId = new ObjectId(questionId);
            const question = await db.collection("user_credentials").findOne({ _id: objectId });

            if (!question) {
                console.log('Question not found:', questionId);
                continue;
            }

            const isCorrect = question.answer === selectedAnswer;
            if (isCorrect) correctCount++;
            results[questionId] = {
                isCorrect,
                correctAnswer: question.answer,
                userAnswer: selectedAnswer
            };
        }

        return NextResponse.json({ 
            score: correctCount,
            results: results
        });
    } catch (error) {
        console.error("Error verifying answer:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
