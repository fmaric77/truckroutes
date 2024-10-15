// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db'; // Adjust the import path as necessary
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  console.log('Received login request:', { username, password });

  try {
    const connection = await getConnection();
    console.log('Database connection established');

    // Query to find the administrator by username
    const [rows]: any = await connection.execute(
      'SELECT * FROM Administratori WHERE ime = ?',
      [username]
    );

    console.log('Query executed:', rows);

    await connection.end(); // Close the connection
    console.log('Database connection closed');

    if (rows.length > 0) {
      const admin = rows[0];
      console.log('Admin found:', admin);

      // Compare the hashed password with the provided password
      const isPasswordMatch = await bcrypt.compare(password, admin.lozinka);
      console.log('Password match result:', isPasswordMatch);

      if (isPasswordMatch) {
        // You can use a session or cookie to store admin info
        console.log('Login successful');
        return NextResponse.json({ message: 'Login successful', admin });
      }
    }

    console.log('Invalid credentials');
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}