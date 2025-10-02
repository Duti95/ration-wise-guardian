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

    console.log('Starting database reset...');
    
    // Delete data from all tables in correct order (respecting foreign keys)
    // Note: Report views (purchase_transactions_report, item_transaction_report, issue_transactions_report)
    // are read-only views and will automatically reflect the empty state
    
    const { error: issueItemsError } = await supabaseClient.from('stock_issue_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (issueItemsError) console.error('Error deleting stock_issue_items:', issueItemsError);
    
    const { error: purchaseItemsError } = await supabaseClient.from('purchase_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (purchaseItemsError) console.error('Error deleting purchase_items:', purchaseItemsError);
    
    const { error: metadataError } = await supabaseClient.from('transaction_metadata').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (metadataError) console.error('Error deleting transaction_metadata:', metadataError);
    
    const { error: issuesError } = await supabaseClient.from('stock_issues').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (issuesError) console.error('Error deleting stock_issues:', issuesError);
    
    const { error: purchasesError } = await supabaseClient.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (purchasesError) console.error('Error deleting purchases:', purchasesError);
    
    const { error: menuError } = await supabaseClient.from('government_diet_menu').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (menuError) console.error('Error deleting government_diet_menu:', menuError);
    
    const { error: utensilsError } = await supabaseClient.from('utensils').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (utensilsError) console.error('Error deleting utensils:', utensilsError);
    
    const { error: categoriesError } = await supabaseClient.from('strength_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (categoriesError) console.error('Error deleting strength_categories:', categoriesError);
    
    const { error: itemsError } = await supabaseClient.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (itemsError) console.error('Error deleting items:', itemsError);
    
    const { error: vendorsError } = await supabaseClient.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (vendorsError) console.error('Error deleting vendors:', vendorsError);
    
    console.log('Database reset completed');

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
