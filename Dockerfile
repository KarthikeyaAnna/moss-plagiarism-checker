FROM python:3.9-slim

# Install Perl for moss.pl
RUN apt-get update && apt-get install -y perl

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Make moss.pl executable
RUN chmod +x moss.pl

# Expose port
EXPOSE 5001

# Command to run the app
CMD ["python", "app.py"]