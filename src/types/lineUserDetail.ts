export interface LineUserDetail {
  line_user_id: string;
  university: string;
  faculty: string;
  department: string | null;
  hometown: string | null;
}

export interface CreateLineUserDetailPayload {
  line_user_id: string;
  university: string;
  faculty: string;
  department: string | null;
  hometown: string | null;
}
