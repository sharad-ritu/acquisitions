import { db } from '#configs/database.js';
import logger from '#configs/logger.js';
import { users } from '#models/user.model.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 10);
  }
  catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

export async function createUser({ name, email, password, role = 'user' }) {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User with email ${newUser.email} created successfully with ID: ${newUser.id}`);
    return newUser;
  }
  catch (error) {
    logger.error('Error creating user:', error);
    throw new Error(error.message || 'Failed to create user');
  }
}

export async function signInUser({ email, password }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Return user data without the password
    const { password: _, ...userData } = user;
    return userData;
  }
  catch (error) {
    logger.error('Error signing in user:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

export async function signOutUser(res) {
  try {
    // Clear the auth token cookie
    res.clearCookie('auth_token');
    return { message: 'Successfully signed out' };
  }
  catch (error) {
    logger.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}
