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

        const { questionId, selectedAnswer } = await req.json();
        const client = await clientPromise;
        const db = client.db("QuizApp_users");
        
        // Convert string questionId to MongoDB ObjectId safely
        if (!ObjectId.isValid(questionId)) {
            console.log(questionId);
            return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
            
            
        }

        const objectId = new ObjectId(questionId); // Safe conversion
        const question = await db.collection("user_credentials").findOne({ _id: objectId });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }
        console.log(question.answer);
        
        const isCorrect = Number(question.answer) === Number(selectedAnswer);
        return NextResponse.json({ isCorrect });
    } catch (error) {
        console.error("Error verifying answer:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
