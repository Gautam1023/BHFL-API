# Node Hierarchy Processor

A full-stack application to process hierarchical node relationships via REST API.

## Overview
This project provides a POST endpoint to analyze node strings in `X->Y` format, detect cycles, build tree structures, and return detailed insights. Includes a clean web interface for easy interaction.

## Tech Stack
- Backend: Node.js, Express
- Frontend: Vanilla HTML/CSS/JS
- Deployment: Compatible with Vercel, Render, etc.

## Local Setup
1. Install Node.js (v16+)
2. Clone the repository
3. Run `npm install`
4. Start server: `node server.js`
5. Visit `http://localhost:3000` in your browser

## API Endpoint
**POST** `/bfhl`

### Request Body
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

### Response
Returns user details, hierarchy structures, invalid entries, duplicates, and summary statistics.

## Deployment
Push to GitHub and connect to Vercel/Render for instant deployment. No additional configuration needed.

## Example Usage
Input: `["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X"]`
- Returns valid tree for A-B-C-D group
- Detects cycle in X-Y-Z group
- Lists invalid entries and duplicates
