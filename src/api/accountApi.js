// src/api/accountApi.js

import { getAuth } from 'firebase/auth';

const API_BASE = '/api/users/profile'; 

/**
 * Fetch the current user’s profile.
 * @returns {Promise<{ name: string, email: string, phone: string, ... }>}
 * @throws {Error} if the request fails
 */
export async function getProfile() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const idToken = await user.getIdToken();
  const res = await fetch(API_BASE, {
    method: 'GET',
    credentials: 'omit', // do not send cookies
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    let errMsg = `Failed to fetch profile (${res.status})`;
    try {
      const json = await res.json();
      if (json.error) errMsg = json.error;
    } catch {
      /* ignore JSON parse */
    }
    throw new Error(errMsg);
  }

  return res.json();
}

/**
 * Update the current user’s profile fields.
 * @param {{ name: string, email: string, phone: string }} updates
 * @returns {Promise<{ name: string, email: string, phone: string, ... }>}
 * @throws {Error} if validation fails or server error occurs
 */
export async function updateProfile(updates) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const idToken = await user.getIdToken();
  const res = await fetch(API_BASE, {
    method: 'PUT',
    credentials: 'omit', // do not send cookies
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
    }),
  });

  if (!res.ok) {
    let errMsg = `Failed to update profile (${res.status})`;
    try {
      const json = await res.json();
      if (json.error) errMsg = json.error;
    } catch {
      /* ignore JSON parse */
    }
    throw new Error(errMsg);
  }

  return res.json();
}

/**
 * Delete the current logged‐in user’s account.
 * @returns {Promise<{ message: string }>}
 * @throws {Error} if deletion fails
 */
export async function deleteProfile() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const idToken = await user.getIdToken();
  const res = await fetch(API_BASE, {
    method: 'DELETE',
    credentials: 'omit', // do not send cookies
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    let errMsg = `Failed to delete account (${res.status})`;
    try {
      const json = await res.json();
      if (json.error) errMsg = json.error;
    } catch {
      /* ignore JSON parse */
    }
    throw new Error(errMsg);
  }

  return res.json(); // { message: 'User account deleted successfully' }
}
