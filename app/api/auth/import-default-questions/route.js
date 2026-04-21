import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { options } from '../[...nextauth]/options';

// Inline default questions — no file system dependency
const DEFAULT_QUESTIONS = [
  { question: "What does HTML stand for?", ops: ["HyperText Markup Language", "HighText Machine Language", "HyperText and links Markup Language", "Hyper Transfer Markup Language"], answer: "HyperText Markup Language" },
  { question: "Which of the following is NOT a JavaScript data type?", ops: ["String", "Boolean", "Integer", "Undefined"], answer: "Integer" },
  { question: "What does CSS stand for?", ops: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"], answer: "Cascading Style Sheets" },
  { question: "Which data structure follows the LIFO principle?", ops: ["Queue", "Stack", "Linked List", "Tree"], answer: "Stack" },
  { question: "What is the time complexity of binary search?", ops: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: "O(log n)" },
  { question: "What does SQL stand for?", ops: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query List"], answer: "Structured Query Language" },
  { question: "Which SQL keyword retrieves data from a table?", ops: ["GET", "FETCH", "SELECT", "RETRIEVE"], answer: "SELECT" },
  { question: "What is the purpose of the PRIMARY KEY constraint in SQL?", ops: ["Allow duplicate values", "Uniquely identify each record", "Link two tables together", "Encrypt column data"], answer: "Uniquely identify each record" },
  { question: "Which of the following is a NoSQL database?", ops: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], answer: "MongoDB" },
  { question: "In OOP, what is Encapsulation?", ops: ["Hiding internal details and exposing only functionality", "Inheriting properties from a parent class", "Creating multiple methods with the same name", "Defining abstract classes"], answer: "Hiding internal details and exposing only functionality" },
  { question: "Which keyword is used to inherit a class in Java?", ops: ["implements", "extends", "inherits", "super"], answer: "extends" },
  { question: "What is polymorphism in OOP?", ops: ["One entity having multiple forms", "A class having only one method", "Hiding data from other classes", "Creating multiple identical classes"], answer: "One entity having multiple forms" },
  { question: "What does API stand for?", ops: ["Application Programming Interface", "Application Process Integration", "Advanced Protocol Interface", "Application Program Instruction"], answer: "Application Programming Interface" },
  { question: "Which HTTP method is used to update an existing resource?", ops: ["GET", "POST", "PUT", "DELETE"], answer: "PUT" },
  { question: "What is the default port number for HTTP?", ops: ["21", "443", "80", "8080"], answer: "80" },
  { question: "What does DNS stand for?", ops: ["Domain Name System", "Data Network Service", "Digital Name Server", "Domain Navigation System"], answer: "Domain Name System" },
  { question: "What is a 404 HTTP status code?", ops: ["Server Error", "Unauthorized Access", "Not Found", "Redirect"], answer: "Not Found" },
  { question: "In Python, how do you start a single-line comment?", ops: ["//", "/* */", "#", "--"], answer: "#" },
  { question: "What is the output of print(2 ** 3) in Python?", ops: ["6", "8", "9", "5"], answer: "8" },
  { question: "Which of the following is an immutable data type in Python?", ops: ["List", "Dictionary", "Set", "Tuple"], answer: "Tuple" },
  { question: "What is the smallest unit of data in computing?", ops: ["Byte", "Kilobyte", "Bit", "Nibble"], answer: "Bit" },
  { question: "How many bits are in one byte?", ops: ["4", "8", "16", "32"], answer: "8" },
  { question: "What is the binary representation of decimal 10?", ops: ["1001", "1010", "1100", "0110"], answer: "1010" },
  { question: "Which sorting algorithm has the best average-case time complexity?", ops: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"], answer: "Quick Sort" },
  { question: "What is the purpose of a foreign key in a relational database?", ops: ["Uniquely identify rows", "Link two tables by referencing a primary key", "Index data faster", "Compress data"], answer: "Link two tables by referencing a primary key" },
  { question: "Which normal form eliminates transitive dependencies?", ops: ["1NF", "2NF", "3NF", "BCNF"], answer: "3NF" },
  { question: "What does DBMS stand for?", ops: ["Data Backup Management System", "Database Management System", "Data Browsing Model System", "Digital Base Management System"], answer: "Database Management System" },
  { question: "Which layer of the OSI model handles routing?", ops: ["Data Link Layer", "Physical Layer", "Network Layer", "Transport Layer"], answer: "Network Layer" },
  { question: "What does LAN stand for?", ops: ["Large Area Network", "Local Area Network", "Linked Access Node", "Layered Access Network"], answer: "Local Area Network" },
  { question: "Which protocol is used to send emails?", ops: ["HTTP", "FTP", "SMTP", "TCP"], answer: "SMTP" },
  { question: "What is the primary purpose of an operating system?", ops: ["Play games", "Manage hardware and software resources", "Connect to the internet", "Compile code"], answer: "Manage hardware and software resources" },
  { question: "What is a deadlock in operating systems?", ops: ["A computer virus", "Two or more processes waiting for each other indefinitely", "When the CPU is idle", "A type of memory error"], answer: "Two or more processes waiting for each other indefinitely" },
  { question: "What is virtual memory?", ops: ["Memory used only by the GPU", "A technique that uses disk space to extend RAM", "Encrypted memory", "Memory stored in the cloud"], answer: "A technique that uses disk space to extend RAM" },
  { question: "What does 'git commit' do?", ops: ["Push changes to a remote repo", "Save changes to the local repository", "Create a new branch", "Merge two branches"], answer: "Save changes to the local repository" },
  { question: "What does 'npm' stand for?", ops: ["Node Package Manager", "New Project Manager", "Node Program Module", "Network Package Module"], answer: "Node Package Manager" },
  { question: "In React, what is a component?", ops: ["A CSS file", "A reusable piece of UI", "A database table", "A server function"], answer: "A reusable piece of UI" },
  { question: "What is Machine Learning?", ops: ["Programming with explicit rules", "A subset of AI that enables systems to learn from data", "A type of database", "A networking protocol"], answer: "A subset of AI that enables systems to learn from data" },
  { question: "What is the capital of France?", ops: ["London", "Berlin", "Paris", "Madrid"], answer: "Paris" },
  { question: "Who developed the theory of relativity?", ops: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"], answer: "Albert Einstein" },
  { question: "What is the chemical symbol for water?", ops: ["O2", "H2O", "CO2", "NaCl"], answer: "H2O" },
  { question: "What is the powerhouse of the cell?", ops: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"], answer: "Mitochondria" },
  { question: "What is the largest planet in our solar system?", ops: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Jupiter" },
  { question: "Who invented the telephone?", ops: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], answer: "Alexander Graham Bell" },
  { question: "How many bones are in the adult human body?", ops: ["196", "206", "216", "226"], answer: "206" },
  { question: "What is the formula for the area of a circle?", ops: ["πr", "2πr", "πr²", "2πr²"], answer: "πr²" },
  { question: "Which planet is known as the Red Planet?", ops: ["Venus", "Mars", "Mercury", "Neptune"], answer: "Mars" },
  { question: "What does RAM stand for?", ops: ["Read Access Memory", "Random Access Memory", "Rapid Application Memory", "Runtime Application Memory"], answer: "Random Access Memory" },
  { question: "What does DNA stand for?", ops: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Acid", "Dextrose Nucleic Acid"], answer: "Deoxyribonucleic Acid" },
  { question: "What is the process by which plants make their food?", ops: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], answer: "Photosynthesis" },
  { question: "Who discovered penicillin?", ops: ["Marie Curie", "Louis Pasteur", "Alexander Fleming", "Jonas Salk"], answer: "Alexander Fleming" },
  { question: "Which programming language is known as the language of the web?", ops: ["Python", "Java", "JavaScript", "C++"], answer: "JavaScript" }
];

export async function POST() {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('QuizApp_users');

    // Allow both teachers and admins to import
    const isTeacher = await db.collection('teachers').findOne({ email: session.user.email });
    const isAdmin = session.user.email === process.env.ADMIN_USERNAME;

    if (!isTeacher && !isAdmin) {
      return NextResponse.json({ error: 'Only teachers can import default questions' }, { status: 403 });
    }

    // Check if this teacher already imported defaults (avoid duplicates)
    const existingCount = await db.collection('user_credentials').countDocuments({
      email: session.user.email,
      isDefault: true,
    });

    if (existingCount > 0) {
      return NextResponse.json({
        message: `Default questions already imported (${existingCount} questions exist). Delete your current questions first to re-import.`,
        count: existingCount,
        alreadyExists: true,
      });
    }

    // Insert into user_credentials (same collection teachers normally use)
    const finalQuestions = DEFAULT_QUESTIONS.map(({ question, ops, answer }) => ({
      question,
      ops,
      answer,
      email: session.user.email,
      isDefault: true,
      createdAt: new Date(),
    }));

    const result = await db.collection('user_credentials').insertMany(finalQuestions);

    return NextResponse.json({
      message: `Successfully imported ${result.insertedCount} default questions! Students can now play quizzes immediately.`,
      count: result.insertedCount,
    });
  } catch (error) {
    console.error('Error importing default questions:', error);
    return NextResponse.json({ error: 'Failed to import questions' }, { status: 500 });
  }
}
