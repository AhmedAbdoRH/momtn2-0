-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
-- Allow everyone to read comments if they can see the photo
CREATE POLICY "Enable read access for comments" 
ON public.comments 
FOR SELECT 
TO authenticated, anon 
USING (
  EXISTS (
    SELECT 1 FROM public.photos 
    WHERE id = comments.photo_id
  )
);

-- Allow authenticated users to insert comments
CREATE POLICY "Enable insert for authenticated users only" 
ON public.comments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow comment owners to update their comments
CREATE POLICY "Enable update for comment owners" 
ON public.comments 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow comment owners to delete their comments
CREATE POLICY "Enable delete for comment owners" 
ON public.comments 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS comments_photo_id_idx ON public.comments(photo_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at_trigger
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();