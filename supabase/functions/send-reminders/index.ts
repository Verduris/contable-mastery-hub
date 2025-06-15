
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.44.4";
import { Resend } from "npm:resend@3.5.0";
import { differenceInDays, parseISO, startOfToday } from 'https://esm.sh/date-fns@3.6.0';

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests for local testing
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("Edge function 'send-reminders' invoked.");

  try {
    // 1. Fetch pending tax events
    const { data: events, error: fetchError } = await supabase
      .from("tax_events")
      .select("title, date, description")
      .eq("status", "Pendiente");

    if (fetchError) {
      console.error("Error fetching tax events:", fetchError);
      throw fetchError;
    }

    if (!events || events.length === 0) {
      console.log("No pending tax events found. Exiting.");
      return new Response(JSON.stringify({ message: "No pending events." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Filter for events due in the next 7 days
    const today = startOfToday();
    const upcomingEvents = events.filter(event => {
        try {
            const eventDate = parseISO(event.date);
            const daysUntilDue = differenceInDays(eventDate, today);
            return daysUntilDue >= 0 && daysUntilDue <= 7;
        } catch(e) {
            console.error(`Could not parse date for event: ${event.title}`, e);
            return false;
        }
    });

    if (upcomingEvents.length === 0) {
      console.log("No upcoming events in the next 7 days. Exiting.");
      return new Response(JSON.stringify({ message: "No upcoming events to remind." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`Found ${upcomingEvents.length} upcoming event(s). Sending reminders...`);

    // 3. Send email reminders for each upcoming event
    const emailPromises = upcomingEvents.map(event => {
      const eventDate = parseISO(event.date);
      const daysUntilDue = differenceInDays(eventDate, today);
      const subject = `Recordatorio Fiscal: ${event.title} vence en ${daysUntilDue} día(s)`;
      
      const emailHtml = `
        <h1>Recordatorio de Obligación Fiscal</h1>
        <p>Hola,</p>
        <p>Este es un recordatorio de que la siguiente obligación fiscal está por vencer:</p>
        <ul>
          <li><strong>Obligación:</strong> ${event.title}</li>
          <li><strong>Fecha de Vencimiento:</strong> ${event.date}</li>
          <li><strong>Descripción:</strong> ${event.description}</li>
        </ul>
        <p>Por favor, asegúrate de cumplir con esta obligación a tiempo para evitar recargos.</p>
        <p>Saludos,<br>Tu Asistente Fiscal Contable</p>
      `;

      return resend.emails.send({
        from: "Recordatorios <onboarding@resend.dev>",
        // NOTE: Using a placeholder email. For a real app, you'd fetch the user's email.
        to: ["user@example.com"], 
        subject: subject,
        html: emailHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Email sent successfully for event: ${upcomingEvents[index].title}`);
      } else {
        console.error(`Failed to send email for event: ${upcomingEvents[index].title}`, result.reason);
      }
    });

    return new Response(JSON.stringify({ message: `Processed ${upcomingEvents.length} reminders.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in send-reminders function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
