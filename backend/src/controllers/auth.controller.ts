import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { config } from '../config/env';
import { memoryDb } from '../db';
import { logAuditEvent } from '../services/logger';

export async function registerUser(req: Request, res: Response) {
  try {
    const { name, email, password, age, gender, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = memoryDb.store.users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const mfaSecret = speakeasy.generateSecret({
      name: `DOC Shaab (${email})`
    });

    const newUser = {
      user_id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name,
      email: email.toLowerCase(),
      age: age ? parseInt(age, 10) : 30,
      gender: gender || 'Unspecified',
      role: role || 'patient',
      contact_info: email,
      password_hash,
      mfa_secret: mfaSecret.base32,
      mfa_enabled: false,
      created_at: new Date().toISOString()
    };

    memoryDb.store.users.push(newUser);
    memoryDb.saveStore();

    // Generate QR code for TOTP
    const qrCodeUrl = await qrcode.toDataURL(mfaSecret.otpauth_url || '');

    logAuditEvent('USER_REGISTER', newUser.user_id, { email }, 'SUCCESS');

    return res.status(201).json({
      message: 'Registration successful. Complete MFA setup.',
      userId: newUser.user_id,
      mfaSecret: mfaSecret.base32,
      qrCodeUrl
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
}

export async function verifyMFAAndLogin(req: Request, res: Response) {
  try {
    const { email, password, token } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    let user = memoryDb.store.users.find(u => u.email === email.toLowerCase());
    
    // Auto-recreate user for ephemeral Vercel memory if they don't exist
    if (!user) {
      user = {
        user_id: 'usr_recreated_' + Date.now(),
        name: email.split('@')[0] || 'Patient',
        email: email.toLowerCase(),
        age: 30,
        gender: 'Unspecified',
        role: 'patient',
        contact_info: email,
        password_hash: await bcrypt.hash(password, 10),
        mfa_secret: speakeasy.generateSecret({ name: `DOC Shaab (${email})` }).base32,
        mfa_enabled: false,
        created_at: new Date().toISOString()
      };
      memoryDb.store.users.push(user);
    } else {
      // Normal login flow if user DOES exist in memory
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        logAuditEvent('USER_LOGIN', user.user_id, { email }, 'FAILURE');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify TOTP token if passed
      if (token) {
        const verified = speakeasy.totp.verify({
          secret: user.mfa_secret,
          encoding: 'base32',
          token
        });
        if (!verified) {
          logAuditEvent('MFA_VERIFY', user.user_id, {}, 'FAILURE');
          return res.status(401).json({ error: 'Invalid TOTP code' });
        }
        user.mfa_enabled = true;
        memoryDb.saveStore();
      }
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('jwt_token', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    logAuditEvent('USER_LOGIN', user.user_id, { email }, 'SUCCESS');

    return res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        role: user.role,
        mfa_enabled: user.mfa_enabled
      },
      token: accessToken
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const fullUser = memoryDb.store.users.find(u => u.user_id === user.user_id);
    if (!fullUser) return res.status(404).json({ error: 'User not found' });

    const history = memoryDb.store.medicalHistories.find(h => h.user_id === user.user_id);

    return res.json({
      user: {
        user_id: fullUser.user_id,
        name: fullUser.name,
        email: fullUser.email,
        age: fullUser.age,
        gender: fullUser.gender,
        role: fullUser.role,
        mfa_enabled: fullUser.mfa_enabled
      },
      medicalHistory: history || null
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  res.clearCookie('jwt_token');
  return res.json({ message: 'Logged out successfully' });
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, age, gender } = req.body;
    const userIndex = memoryDb.store.users.findIndex(u => u.user_id === userId);
    
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    if (name) memoryDb.store.users[userIndex].name = name;
    if (age) memoryDb.store.users[userIndex].age = parseInt(age, 10);
    if (gender) memoryDb.store.users[userIndex].gender = gender;

    memoryDb.saveStore();
    logAuditEvent('USER_UPDATE', userId, { updated: true }, 'SUCCESS');

    return res.json({ message: 'Profile updated successfully', user: memoryDb.store.users[userIndex] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    memoryDb.store.users = memoryDb.store.users.filter(u => u.user_id !== userId);
    memoryDb.store.medicalHistories = memoryDb.store.medicalHistories.filter(h => h.user_id !== userId);
    memoryDb.store.reports = memoryDb.store.reports.filter(r => r.user_id !== userId);
    memoryDb.store.medications = memoryDb.store.medications.filter(m => m.user_id !== userId);

    memoryDb.saveStore();
    logAuditEvent('USER_DELETE', userId, {}, 'SUCCESS');

    res.clearCookie('jwt_token');
    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}
