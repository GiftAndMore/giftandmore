# Supabase Deployment Script

# 1. Set Environment Variables
$env:SUPABASE_ACCESS_TOKEN = "YOUR_SUPABASE_ACCESS_TOKEN"

# 2. Set Secrets
Write-Host "Setting Secrets..."
npx supabase secrets set SUPABASE_URL="https://zhulmedlfhnctipdlfzy.supabase.co" SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" --project-ref zhulmedlfhnctipdlfzy

# 3. Deploy Functions
Write-Host "Deploying Functions..."
npx supabase functions deploy --project-ref zhulmedlfhnctipdlfzy

Write-Host "Deployment Complete!"
Read-Host -Prompt "Press Enter to exit"
