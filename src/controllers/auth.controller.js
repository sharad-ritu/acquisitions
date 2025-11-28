import logger from '#configs/logger.js';
import { createUser, signInUser, signOutUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationError } from '#utils/format.js';
import { jwtToken } from '#utils/jwt.js';
import { signInSchema, signUpSchema } from '#validations/auth.validation.js';

export async function signUp(req, res, next) {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'auth_token', token);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
  catch (error) {
    logger.error('Error in signup:', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
}

export async function signIn(req, res, next) {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await signInUser({ email, password });

    const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'auth_token', token);

    return res.status(200).json({
      message: 'Successfully signed in',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
  catch (error) {
    logger.error('Error in sign in:', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    next(error);
  }
}

export async function signOut(_req, res, next) {
  try {
    const result = await signOutUser(res);
    return res.status(200).json(result);
  }
  catch (error) {
    logger.error('Error in sign out:', error);
    next(error);
  }
}
