import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../[...nextauth]/options';
import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(options);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    // Fetch user's quiz attempts
    const quizAttempts = await db.collection('quiz_attempts').find({ 
      userEmail 
    }).sort({ completedAt: -1 }).limit(50).toArray();

    // Calculate statistics
    const totalQuizzes = quizAttempts.length;
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const perfectScores = quizAttempts.filter(a => a.score === 100).length;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = quizAttempts.filter(a => 
      new Date(a.completedAt) > sevenDaysAgo
    ).length;

    // Calculate rank
    const allUsers = await db.collection('quiz_attempts').aggregate([
      { $group: { _id: '$userEmail', totalScore: { $sum: '$score' } } },
      { $sort: { totalScore: -1 } }
    ]).toArray();

    const userRank = allUsers.findIndex(u => u._id === userEmail) + 1;

    // Get quiz history
    const quizHistory = quizAttempts.slice(0, 10).map(attempt => ({
      id: attempt._id,
      quizTitle: attempt.quizTitle || 'Untitled Quiz',
      score: attempt.score || 0,
      totalQuestions: attempt.totalQuestions || 0,
      correctAnswers: attempt.correctAnswers || 0,
      completedAt: attempt.completedAt,
      timeTaken: attempt.timeTaken || 0
    }));

    // Performance by category
    const categoryPerformance = {};
    quizAttempts.forEach(attempt => {
      const category = attempt.category || 'General';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { score: 0, count: 0 };
      }
      categoryPerformance[category].score += attempt.score || 0;
      categoryPerformance[category].count += 1;
    });

    const categories = Object.keys(categoryPerformance).map(cat => ({
      name: cat,
      averageScore: Math.round(categoryPerformance[cat].score / categoryPerformance[cat].count),
      quizzesTaken: categoryPerformance[cat].count
    }));

    return NextResponse.json({
      stats: {
        totalQuizzes,
        totalScore,
        averageScore,
        perfectScores,
        recentActivity,
        rank: userRank || 0
      },
      quizHistory,
      categories,
      achievements: [
        { id: 1, name: 'First Quiz', unlocked: totalQuizzes >= 1, icon: '🎯' },
        { id: 2, name: 'Quiz Master', unlocked: totalQuizzes >= 10, icon: '🏆' },
        { id: 3, name: 'Perfect Score', unlocked: perfectScores >= 1, icon: '💯' },
        { id: 4, name: 'Dedicated Learner', unlocked: recentActivity >= 5, icon: '📚' },
        { id: 5, name: 'Top 10', unlocked: userRank <= 10 && userRank > 0, icon: '⭐' }
      ]
    });
  } catch (error) {
    console.error('Failed to fetch user statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}
