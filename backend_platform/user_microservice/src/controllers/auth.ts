import type { Request, Response } from 'express';
import {confirmPasswordReset as updatePassword, resetPassword, signIn,signUp,viewUserProfile} from '#repositories/users';
import { createToken, verifyToken } from '#utils/crypto';
import { upload } from '#utils/uploader';
import type { PasswordResetConfirmInput, PasswordResetRequestInput, SignupData, SigninInput } from '#schemas/auth';



export async function signup(request: Request, response: Response): Promise<void> {
  if (!request.file) {
    response.status(400).json({ error: 'Avatar image is required' });
    return;
  }
  const avatarUrl = await upload(request.file);
  const user = await signUp({ ...(request.body as SignupData), avatarUrl });

  if (!user) {
    response.status(409).json({ error: 'Email or username is already registered' });
    return;
  }

  response.status(201).json({
    user: toAuthUser(user),
    token: createToken({sub: String(user.id),email: user.email,username: user.username,pLevel: user.playerLevel,}, 60 * 60 * 24)
  });
}

export async function signin(request: Request, response: Response): Promise<void> {
  const user = await signIn(request.body as SigninInput);
  if (!user) {
    response.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  response.json({
    user: toAuthUser(user),
    token: createToken({ sub: String(user.id),email: user.email,username: user.username, pLevel: user.playerLevel}, 60 * 60 * 24),
  });
}

function toAuthUser(user: {
  id: number;
  email: string;
  username: string;
  accuracy: number;
  wins: number;
  rank: string;
  playerLevel: string;
  bio: string;
  totalScore: number;
  createdAt: Date;
}) {
  return {
    id: String(user.id),
    email: user.email,
    username: user.username,
    p_level: user.playerLevel,
    accuracy: user.accuracy,
    rank: user.rank,
    wins: user.wins,
    bio: user.bio,
    total_score: user.totalScore,
    createdAt: user.createdAt,
  };
}

export async function requestPasswordReset(request: Request,response: Response): Promise<void> {
  const user = await resetPassword(request.body as PasswordResetRequestInput);
  if (!user) {
    response.json({ message: 'If the account exists, a reset token has been generated' });
    return;
  }

  const token = createToken({ sub: String(user.id), purpose: 'password-reset' }, 15 * 60);
  response.json({
    message: 'If the account exists, a reset token has been generated',
    resetToken: token,
  });
}

export async function confirmPasswordReset( request: Request,  response: Response): Promise<void> {
  const { token, password } = request.body as PasswordResetConfirmInput;
  try {
    const claims = verifyToken(token);
    if (claims.purpose !== 'password-reset') throw new Error('Invalid reset token');
    const user = await updatePassword(Number(claims.sub), password);
    if (!user) {
      response.status(400).json({ error: 'Invalid reset token' });
      return;
    }
    response.json({ message: 'Password reset successfully' });
  } catch {
    response.status(400).json({ error: 'Invalid or expired reset token' });
  }
}

export async function profile(request: Request, response: Response): Promise<void> {
  const user = await viewUserProfile(request.authUser!.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json({ user: user });
}
