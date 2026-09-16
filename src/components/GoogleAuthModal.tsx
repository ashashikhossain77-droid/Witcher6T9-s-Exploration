import React from 'react';
import { UserAuthModal } from './UserAuthModal';
import { GoogleUserSession, RegisteredUser, TierDefinition } from '../types';

interface GoogleAuthModalProps {
  currentUser?: GoogleUserSession;
  registeredUsers?: RegisteredUser[];
  tiers?: TierDefinition[];
  onSignIn: (user: Partial<GoogleUserSession>) => void;
  onSignOut: () => void;
  onRegisterUser?: (newUser: RegisteredUser) => void;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = (props) => {
  return <UserAuthModal {...props} />;
};

export default GoogleAuthModal;
