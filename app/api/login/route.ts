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
    const [adminRows]: any = await connection.execute(
      'SELECT * FROM Administratori WHERE ime = ?',
      [username]
    );

    console.log('Admin query executed:', adminRows);

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      console.log('Admin found:', admin);

      // Compare the hashed password with the provided password
      const isPasswordMatch = await bcrypt.compare(password, admin.lozinka);
      console.log('Admin password match result:', isPasswordMatch);

      if (isPasswordMatch) {
        await connection.end(); // Close the connection
        console.log('Database connection closed');

        console.log('Admin login successful');
        return NextResponse.json({ message: 'Login successful', admin, role: 'admin' });
      }
    }

    // Query to find the driver by username
    const [driverRows]: any = await connection.execute(
      'SELECT * FROM Vozaci WHERE ime_vozaca = ?',
      [username]
    );

    console.log('Driver query executed:', driverRows);

    if (driverRows.length > 0) {
      const driver = driverRows[0];
      console.log('Driver found:', driver);

      // Compare the hashed password with the provided password
      const isPasswordMatch = await bcrypt.compare(password, driver.lozinka_vozaca);
      console.log('Driver password match result:', isPasswordMatch);

      if (isPasswordMatch) {
        await connection.end(); // Close the connection
        console.log('Database connection closed');

        console.log('Driver login successful');
        return NextResponse.json({ message: 'Login successful', driver, role: 'driver' });
      }
    }

    await connection.end(); // Close the connection
    console.log('Database connection closed');

    console.log('Invalid credentials');
    return NextResponse.json({ message: 'Pogrešno korisničko ime ili lozinka' }, { status: 401 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}