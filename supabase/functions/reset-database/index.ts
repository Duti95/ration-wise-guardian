import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const { confirmationCode } = await req.json();
    
    if (confirmationCode !== '1978') {
      return new Response(JSON.stringify({ error: 'Invalid confirmation code' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Delete data from all tables in correct order (respecting foreign keys)
    await supabaseClient.from('stock_issue_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('purchase_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('transaction_metadata').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('stock_issues').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('government_diet_menu').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('utensils').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('strength_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    return new Response(JSON.stringify({ success: true, message: 'Database reset successfully' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
