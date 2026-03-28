import clientPromise from '../../../../lib/mongodb'; 
import { getServerSession } from "next-auth";
import { options } from '../[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const session = await getServerSession(options);
        
        if (!session || !session.user) { 
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { role } = await req.json();
        const userEmail = session.user.email;

        const client = await clientPromise;
        const db = client.db('QuizApp_users');

        // Check if user has ever been a teacher
        const isTeacher = await db.collection('teachers').findOne({ email: userEmail });
        
        // Only users who have been promoted to teacher can switch roles
        if (!isTeacher) {
            return NextResponse.json({ 
                error: 'Only teachers can switch roles. Contact admin to become a teacher.' 
            }, { status: 403 });
        }

        // Teachers can switch between teacher and student
        if (role !== 'teacher' && role !== 'student') {
            return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
        }

        // Update the user's current role
        await db.collection('users').updateOne(
            { email: userEmail },
            { $set: { role: role } },
            { upsert: true }
        );

        // Remove from students collection
        await db.collection('students').deleteOne({ email: userEmail });

        // Add to appropriate collection based on current role
        if (role === 'student') {
            await db.collection('students').insertOne({
                email: userEmail,
                createdAt: new Date()
            });
        }
        // Note: We don't remove from teachers collection - once a teacher, always can switch back

        return NextResponse.json({ 
            message: `Role switched to ${role} successfully`, 
            role: role 
        });
    } catch (error) {
        console.error('Error switching user role:', error);
        return NextResponse.json({ 
            error: 'Failed to switch user role',
            details: error.message
        }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        // Get session info for authentication
        const session = await getServerSession(options);
        if (!session || !session.user) { 
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        const userEmail = session.user.email;
        const client = await clientPromise;
        const db = client.db('QuizApp_users');
        
        // First check the user's role in the users collection
        const user = await db.collection('users').findOne({ email: userEmail });
        if (user && user.role) {
            return NextResponse.json({ role: user.role });
        }
        
        // Fallback to checking individual collections
        const teacher = await db.collection('teachers').findOne({ email: userEmail });
        if (teacher) {
            // Update the user's role in the main collection
            await db.collection('users').updateOne(
                { email: userEmail },
                { $set: { role: 'teacher' } },
                { upsert: true }
            );
            return NextResponse.json({ role: 'teacher' });
        }

        const student = await db.collection('students').findOne({ email: userEmail });
        if (student) {
            // Update the user's role in the main collection
            await db.collection('users').updateOne(
                { email: userEmail },
                { $set: { role: 'student' } },
                { upsert: true }
            );
            return NextResponse.json({ role: 'student' });
        }

        return NextResponse.json({ role: null });
    } catch (error) {
        console.error('Failed to fetch user role:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch user role',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
