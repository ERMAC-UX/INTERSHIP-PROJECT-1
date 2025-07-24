# INTERSHIP-PROJECT-1
# README.md

```markdown
# CTI Dashboard – Windows Edition

A Cyber Threat Intelligence portal built with Flask (backend) and React (frontend), optimized for Windows, using SQLite and APIs fromTotal and AbuseIPDB.

## Features

- Real-time scans of IPs, domains, and URLs  
- VirusTotal & AbuseIPDB integration  
- Local SQLite storage (no MongoDB)  
- Modern, responsive UI with animations and glassmorphism effects  
- Scan history tracking and statistics dashboard  
- Built-in real-time clock display  
- Professional, aesthetic design with micro-interactions

## Prerequisites

- Python 3.7 or higher  
- Node.js 14 or higher & npm  
- Internet access for API calls  

## Project Structure

```
cti-dashboard/
├── backend/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── build/           # Production build output (after `npm run build`)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── start.bat            # Windows setup & startup script
```

## Setup & Installation

1. **Clone the repository**  
   ```
   git clone https://github.com/ERMAC-UX/INTERSHIP-PROJECT-1.git
   cd INTERSHIP-PROJECT-1
   ```

2. **Backend dependencies**  
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend dependencies**  
   ```
   cd ../frontend
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the backend server**  
   ```
   cd backend
   python app.py
   ```
   Backend API will run at `http://127.0.0.1:5000`

2. **Start the frontend development server**  
   ```
   cd ../frontend
   npm start
   ```
   Frontend will open at `http://localhost:3000` with hot reloading.

### Production Build

1. **Build the frontend**  
   ```
   cd frontend
   npm run build
   ```
   This generates optimized static files in `frontend/build`.

2. **Serve the build** (example using `serve`)  
   ```
   npm install -g serve
   serve -s build
   ```
   Open the provided URL to view the production site.

## Automated Setup & Startup (Windows)

You can use the provided `start.bat` script to automate dependency installation and service startup:

```
# From the project root
start.bat
```

This will:
1. Install Python (backend) dependencies  
2. Install Node.js (frontend) dependencies  
3. Launch the backend server in a new window  
4. Launch the frontend server in a new window

## Usage

1. Enter an IP address, domain, or URL into the search bar.  
2. Click **Scan Now** to retrieve threat intelligence data.  
3. View VirusTotal and AbuseIPDB results side by side.  
4. Check recent scan history and overall statistics.

## Creator

**Suprodip Biswas** (BTech student) – Developed with ❤️ using Flask, React, and modern CSS techniques.

## License

This project is licensed under the MIT License.  
```

Enjoy using your CTI Dashboard!
