## Run/Compile Commands
npm run dev
npm run lint

## Github - How to?
git checkout -b NewName     /* Develop in branch */
git checkout main           /* pull the main branch after deploy on Cloudflare */
git pull origin main

## Deploy on Cloudflare (via GitHub Merging)
1. Go to GitHub: https://github.com/shibutzplus/shibutzplus/pulls
2. Click on "New pull request" (from your feature branch to main)
3. Click on "Create pull request"
4. Click on "Merge pull request"
5. This will automatically trigger the Cloudflare Build & Deploy pipeline to update production.

## Preview Admin
https://shibutzplus-git-ABCDE-shibutz-plus-projects.vercel.app/admin/sign-in
shibutzplus@gmail.com
123456

## Login / Authentication with Next-Auth
The application uses Next-Auth for authentication. 

## Production Server & Dashboard (Cloudflare)
- **Live Site:** https://shibutzplus.com
- **Cloudflare Dashboard:** https://dash.cloudflare.com/9c530885ad264c96d05babc5c7dc69a3/workers/services/view/shibutzplus/production

# Email
shibutzplus@gmail.com   (g1M...)
contact@shibutzplus.com

## Email Service
https://www.emailjs.com/

## Sync upstash Service (shibutzplus@gmail.com google login)
https://upstash.com/
https://console.upstash.com/redis/62bf20b4-e16e-45ae-8c38-6d673b6955ac?teamid=0

## File Storage Service (Cloudflare R2)
https://dash.cloudflare.com/09e65e9e58fb283402e234e907e36587/r2/default/buckets/shibutz-plus-uploads

## DB Neon (shibutzplus@gmail.com google login)
# Make sure to update DB for production and staging (defined in env.local)
https://console.neon.tech/app/projects/curly-feather-89043363
npx drizzle-kit push

## How to stop query debug logs in terminal ?
src\db\index.ts

## Trello
https://trello.com/b/SrahpnDm/%D7%A9%D7%99%D7%91%D7%95%D7%A5

## New Year Process
- TRUNCATE TABLE annual_schedule_alt;   /* Delete all data from alt schedule table if existed */
- substitute teachers we dont touch. Sganiot wil change if the want
