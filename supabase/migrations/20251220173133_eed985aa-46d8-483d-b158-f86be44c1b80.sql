-- Create group_messages table for real-time chat
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON public.group_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Group members can read messages
CREATE POLICY "Group members can read messages"
ON public.group_messages
FOR SELECT
USING (
  public.is_group_member(group_id, auth.uid())
);

-- Policy: Group members can send messages (only their own)
CREATE POLICY "Group members can send messages"
ON public.group_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  public.is_group_member(group_id, auth.uid())
);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.group_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for group_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;