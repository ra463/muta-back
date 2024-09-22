# NodeJS Intern - MUTAENGINE

## Setup Instructions

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create the `config.env` in the config folder like this - `/config/config.env`.
4. Configure environment variables:
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `FROZEN_TIME` (time for which user account should be freezed after unsccessfull attempts)
   - `MAX_UNSUCCESSFULL_ATTEMPT` (max number of wrong attempt to login)
   - `MONGO_URI`
   - `PORT`
   - `RESEND_KEY` (for email sending - resend api key)
   - `CLOUDINARY_API_KEY` (cloudinary api key - Image Storing)
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_NAME`
   - `GOOGLE_CLIENT_ID` (google oauth client_id)
   - `GOOGLE_CLIENT_SECRET` (google oauth client_secret)
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET` (razorpay key secret)
   - `GOOGLE_SECRET_KEY` (google Recapta v2 secret key)
5. Start the server using `npm run dev`.

### Server Deployed Link - [https://muta-engine.adaptable.app]

## Components

- **Backend**: Node.js/Express.js API for processing payments and all other functions.
- **Database**: MongoDB for storing details.
- **Cloudinary**: Storage for user image.
- **Razorpay**: Payment Gateway for our app.
- **Resend**: Service for sending Email.
- **Puppeter**: For PDF generation.
- **Google OAuth**: For Login with google.
- **Google ReCapcha**: For Improving Security.