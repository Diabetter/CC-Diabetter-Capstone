# Authentication and Prediction API for Diabeter Capstone Project BANGKIT 2024

## Overview

This project is a Node.js application that uses Firebase for authentication and provides various endpoints for user profile management, prediction handling, and data retrieval. The application is built with Express.js and incorporates Firebase for managing user authentication and Firestore for data storage.

## Features

- User Registration
- User Login
- User Logout
- Password Reset
- Profile Management (Create, Edit, Retrieve)
- Prediction Handling
- Data Retrieval for Food Information
- Search Feature
- History Management

## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/Diabetter/CC-Diabetter-Capstone.git
    ```

2. **Navigate to the project directory:**
    ```sh
    cd CC-Diabetter-Capstone
    ```

3. **Install the dependencies:**
    ```sh
    npm install
    ```

4. **Set up environment variables:**
    Create a `.env` file in the root directory and add your Firebase configuration details.
    ```
    PORT=8080
    FIREBASE_API_KEY=<your_firebase_api_key>
    FIREBASE_AUTH_DOMAIN=<your_firebase_auth_domain>
    FIREBASE_PROJECT_ID=<your_firebase_project_id>
    FIREBASE_STORAGE_BUCKET=<your_firebase_storage_bucket>
    FIREBASE_MESSAGING_SENDER_ID=<your_firebase_messaging_sender_id>
    FIREBASE_APP_ID=<your_firebase_app_id>
    FIREBASE_MEASUREMENT_ID=<your_firebase_measurement_id>
    GCP_UNIVERSE_DOMAIN=<your-universe-domain>
    GCP_TYPE=<your-gcp-type>
    GCP_PROJECT_ID=<your-project-id>
    GCP_PRIVATE_KEY_ID=<your-private-key-id>
    GCP_PRIVATE_KEY=<your-private-key>
    GCP_CLIENT_EMAIL=<your-client-email>
    GCP_CLIENT_ID=<your-client-id>
    GCP_AUTH_URI=<your-auth-uri>
    GCP_TOKEN_URI=<your-token-uri>
    GCP_AUTH_PROVIDER_X509_CERT_URL=<your-auth-cert-url>
    GCP_CLIENT_X509_CERT_URL=<your-client-cert-url>
    KEY_FILE=<your-key-file-name>
    DATABASE_NAME=<your-database-name>
    ```

5. **Start the server:**
    ```sh
    npm start
    ```

## API Endpoints

### Authentication

- **Register User**
    ```
    POST /api/register
    Body:
    {
        "email": "user@example.com",
        "password": "password123",
        "confirm_password": "password123"
    }
    ```

- **Login User**
    ```
    POST /api/login
    Body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```

- **Logout User**
    ```
    POST /api/logout
    ```

- **Reset Password**
    ```
    POST /api/reset-password
    Body:
    {
        "email": "user@example.com"
    }
    ```

### Profile Management

- **Create Profile**
    ```
    POST /api/create-profile
    Body:
    {
        "uid": "user_id",
        "username": "username",
        "gender": "man",
        "age": 25,
        "weight": 70,
        "height": 175,
        "activities": "ringan"
    }
    ```

- **Edit Profile**
    ```
    POST /api/edit-profile
    Body:
    {
        "uid": "user_id",
        "username": "new_username",
        "gender": "man",
        "age": 26,
        "weight": 72,
        "height": 176,
        "activities": "berat"
    }
    ```

- **Get Profile**
    ```
    GET /api/get-profile/
    Body:
    {
        "uid": "user_id"
    }
    ```

### Prediction Handling

- **Predict**
    ```
    POST /api/predict
    Body:
    {
        "uid": "user_id",
        "rating": 5
    }
    ```

- **Store Prediction**
    ```
    POST /api/store-predict
    Body:
    {
        "data": {
            "id": "prediction_id",
            "other_data": "value"
        }
    }
    ```

### Data Retrieval

- **Get Food Data**
    ```
    POST /api/get-makanan
    Body:
    {
        "namaMakanan": "food_name"
    }
    ```

- **Search**
    ```
    POST /api/search
    Body:
    {
        "search": "search_query"
    }
    ```

### History Management

- **Get User History**
    ```
    POST /api/history
    Body:
    {
        "uid": "user_id"
    }
    ```

- **Get All History**
    ```
    POST /api/all-history
    ```

- **Delete History**
    ```
    DELETE /api/delete-history
    Body:
    {
        "id": "history_id"
    }
    ```

