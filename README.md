# MOSS Plagiarism Checker

A modern web application for checking code plagiarism using the MOSS (Measure of Software Similarity) system.

## Features
- Beautiful and intuitive user interface
- Support for multiple programming languages
- Real-time plagiarism checking
- Detailed similarity reports
- File upload and comparison

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Node.js dependencies:
```bash
cd frontend
npm install
```

3. Start the backend server:
```bash
python app.py
```

4. Start the frontend development server:
```bash
cd frontend
npm start
```

## Usage
1. Open your browser and navigate to `http://localhost:3000`
2. Upload your code files
3. Select the programming language
4. Click "Check Plagiarism"
5. View the detailed similarity report

## Note
You need to have a MOSS account and set up your MOSS user ID in the `.env` file. 