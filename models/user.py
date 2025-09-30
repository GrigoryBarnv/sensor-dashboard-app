from . import db, UserMixin, generate_password_hash, check_password_hash
from datetime import datetime
import json
import os

class Measurement(db.Model):
    __tablename__ = 'measurements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    product_name = db.Column(db.String(50))
    product_number = db.Column(db.String(10))
    date = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    data = db.Column(db.Text)  # JSON string of measurement data
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'product_name': self.product_name,
            'product_number': self.product_number,
            'date': self.date,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'data': json.loads(self.data) if self.data else None
        }

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    matrikelnummer = db.Column(db.String(10), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    measurements = db.relationship('Measurement', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return str(self.id)

    def add_measurement(self, data_buffer, product_name, product_number, date):
        """Save measurement data and create CSV file"""
        # Create measurements directory if it doesn't exist
        os.makedirs('measurements', exist_ok=True)
        
        # Generate filename
        filename = f"{product_name}_{product_number}_{date}_Measure.CSV"
        filepath = os.path.join('measurements', filename)
        
        # Save as CSV
        with open(filepath, 'w') as f:
            # Write header
            f.write("time,MQ136,MQ138,MQ137,MQ4,MQ9,MQ8,MQ3_10,MQ5,MQ2,MQ135,MQ6,MQ3_1\n")
            
            # Write data
            for entry in data_buffer:
                if 'time' in entry and all(sensor in entry for sensor in ['MQ136', 'MQ138', 'MQ137', 'MQ4', 'MQ9', 'MQ8', 'MQ3_10', 'MQ5', 'MQ2', 'MQ135', 'MQ6', 'MQ3_1']):
                    line = [
                        entry['time'],
                        str(entry['MQ136']), str(entry['MQ138']), str(entry['MQ137']),
                        str(entry['MQ4']), str(entry['MQ9']), str(entry['MQ8']),
                        str(entry['MQ3_10']), str(entry['MQ5']), str(entry['MQ2']),
                        str(entry['MQ135']), str(entry['MQ6']), str(entry['MQ3_1'])
                    ]
                    f.write(','.join(line) + '\n')
        
        # Create measurement record
        measurement = Measurement(
            user_id=self.id,
            filename=filename,
            product_name=product_name,
            product_number=product_number,
            date=date,
            data=json.dumps(data_buffer)
        )
        db.session.add(measurement)
        db.session.commit()
        return measurement

    @staticmethod
    def get_by_matrikelnummer(matrikelnummer):
        return User.query.filter_by(matrikelnummer=matrikelnummer).first()
