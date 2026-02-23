#!/usr/bin/env bash
set -e

echo "==> Instalando dependencias npm..."
npm install

echo "==> Arrancando Supabase local..."
supabase start

echo "==> Configurando .env.local..."
API_URL=$(supabase status 2>&1 | grep "Project URL" | awk '{print $NF}')
ANON_KEY=$(supabase status 2>&1 | grep "Publishable" | awk '{print $NF}')

cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

echo ""
echo "✓ Listo. Ejecuta: npm run dev"
echo "  Next.js      → http://localhost:3000"
echo "  Supabase API → ${API_URL}"
echo "  Studio       → http://127.0.0.1:54323"
