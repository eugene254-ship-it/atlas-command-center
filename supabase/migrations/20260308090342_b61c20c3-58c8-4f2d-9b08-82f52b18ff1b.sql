CREATE OR REPLACE FUNCTION public.notify_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (event_type, title, message, metadata)
  VALUES (
    'user_signup',
    'New User Signup',
    NEW.email || ' just created an account.',
    jsonb_build_object('email', NEW.email, 'user_id', NEW.id)
  );
  RETURN NEW;
END;
$$;