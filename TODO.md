# TODO: Rebuild MiraiVPN - PHP Backend + TypeScript Frontend + MySQL

## 1. Create PHP Backend Structure
- [x] Create /backend/ directory
- [x] Create /backend/public/index.php and .htaccess
- [x] Create /backend/src/ with Database.php, Mailer.php, AuthController.php, UserController.php, StripeController.php, VPSController.php, ConfigGenerator.php, Utils.php
- [x] Create /backend/composer.json with dependencies: vlucas/phpdotenv, stripe/stripe-php, resend-php/resend, firebase/php-jwt, symfony/http-foundation, guzzlehttp/guzzle
- [x] Create /backend/.env with DB_HOST=sql.miraivpn.com, etc.

## 2. Implement PHP API Endpoints
- [x] /api/register: user creation, email verification via Resend
- [x] /api/verify: email verification
- [x] /api/login: JWT auth
- [x] /api/reset: password reset
- [x] /api/settings: user preferences
- [x] /api/stripe/webhook: handle Stripe events
- [x] /api/vps/status: list VPS
- [x] /api/vps/choose: select best VPS
- [x] /api/vps/confirm: generate WireGuard config
- [x] /api/vps/config: download config

## 3. Update Database Schema
- Remove Prisma, use raw MySQL in PHP
- Create tables: users, vps_servers, wireguard_keys, sponsorships, payments, logs
- Update .env with MySQL connection

## 4. Update TypeScript Frontend
- Keep Next.js, remove current API routes in src/app/api/
- Update components to call PHP backend via Axios
- Update auth, stripe, vps logic to use new API
- Update package.json: remove Prisma, keep Next.js deps

## 5. Integrate Email Verification Flow
- Frontend: register -> send to /api/register
- Backend: send Resend email with verify link
- Frontend: /verify page calls /api/verify

## 6. Stripe Integration
- Frontend: redirect to Stripe Checkout
- Backend: handle webhooks for subscription updates

## 7. VPS/WireGuard Logic
- Implement VPS selection, config generation in PHP
- Secure config downloads

## 8. Testing and Deployment
- Test PHP API endpoints
- Test frontend integration
- Deploy backend to /var/www/miraivpn/backend
- Deploy frontend to /var/www/miraivpn/frontend
