
export interface Space {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

export interface SpaceMember {
  space_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  invited_by: string | null;
}

export interface SpaceInvitation {
  id: string;
  space_id: string;
  email: string;
  token: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active';
  created_at: string;
  expires_at: string;
}
