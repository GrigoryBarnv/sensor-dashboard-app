
# Python-Basis-System with Python 3.10
FROM python:3.10-slim

WORKDIR /app

#copy all local files in the container directory
COPY . .

#install all required packages
RUN pip install --no-cache-dir -r requirements.txt

#set the environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

#app uses port 5000 inside the container
EXPOSE 5000

#run the command flask run to run the app
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
