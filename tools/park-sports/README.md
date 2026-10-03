The park uses @supabase/supabase-js 2.117.2, bundled locally so the website does not depend on a CDN for its game code. Only the createClient export is bundled. The publishable browser key is in park-sports-config.js; no secret/service-role key is used.

To rebuild assets/vendor/supabase-2.117.2.js, run npm ci in this directory, create an entry file containing `export { createClient } from '@supabase/supabase-js';`, then run this directory's esbuild with --bundle --minify --format=esm --target=safari15 --outfile=../../assets/vendor/supabase-2.117.2.js.

Online sports use public Realtime broadcast/presence channels named tt-park-v1:<random room code>. Only game positions, scores and temporary player IDs are sent. Resident balances, housing applications and messages stay on the device. No database tables, auth settings or RLS policies are modified. Rooms are discarded when players leave.
