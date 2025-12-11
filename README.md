INAV Payment Collection App

A simple mobile app for collecting EMI payments from customers with personal loans.
Built with React Native (Expo) + Node.js (Express) + Supabase (PostgreSQL).

📱 Features

View loan details (Account No, Issue Date, Interest Rate, Tenure, EMI Due)

Make EMI payments (enter account number + amount)

Store payments securely in database

Get a confirmation screen after payment

View complete payment history for any account

Smooth navigation + splash screen

🛠️ Tech Stack:
Frontend

React Native (Expo) – Build cross-platform mobile apps with a single JavaScript codebase

React Navigation – Navigate between screens smoothly

Axios – Make API requests to backend

Expo EAS – Build and generate APK for Android devices

Backend

Node.js + Express.js – Lightweight, fast REST API server

Supabase (PostgreSQL) – Cloud-hosted SQL database for storing customers & payments

Deployment

Render – Hosted backend API with automatic redeployments

Expo EAS Build – Cloud service used to generate the production APK

🌐 Live Backend URL
https://inav-app.onrender.com

▶️ Running the App (Frontend)
cd inav-payment-frontend
npm install
npx expo start


Open on Android via Expo Go or emulator.


🗄️ Database Tables
->customers

account_number

issue_date

interest_rate

tenure_months

emi_due

->payments

customer_id

account_number

payment_amount

payment_date

status

📦 APK

The Android APK is built using EAS Build and included with the submission.

✔️ Deliverables

GitHub repo

Live backend URL

APK file
