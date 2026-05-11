import { createClient } from "@supabase/supabase-js";

// INAYOS KO ITO: Tinanggal ko yung "/rest/v1/" sa dulo. 
// Dapat hanggang ".co" lang siya.
const supabaseUrl = "https://xnqgqarxrelabwcckrfg.supabase.co"; 

// Ang key mo ay mukhang tama na.
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucWdxYXJ4cmVsYWJ3Y2NrcmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDA4MDIsImV4cCI6MjA5MzQ3NjgwMn0.L060zw6zkgF1eK152jhrS9w97idXldFOt771Py33NfE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ADMIN_EMAILS = [
  "jcesperanza@neu.edu.ph",
  "luiskenneth.fajardo@neu.edu.ph",
  "romeofelipe.fetalvo@neu.edu.ph",
  "kayelaine.diaz@neu.edu.ph",
  "cassandrajadealiyah.perez@neu.edu.ph"
];