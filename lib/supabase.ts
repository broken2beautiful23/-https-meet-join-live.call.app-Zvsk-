
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfavgjzwghiwbfsjdrrp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXZnanp3Z2hpd2Jmc2pkcnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTEyNjAsImV4cCI6MjA4NjI2NzI2MH0.dp2AfLL0EVn4aj4vW7zSj64DVo8ARbdQIRKiaN3nN0Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
