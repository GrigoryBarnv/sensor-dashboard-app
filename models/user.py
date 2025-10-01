from . import db, UserMixin, generate_password_hash, check_password_hash
from datetime import datetime
import json
import os
from arduino_read import SENSORS  # Import sensor list in correct order

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
        # Save in both data and persistent_data/measurements directories
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(app_dir, 'data')
        measurements_dir = os.path.join(app_dir, 'persistent_data', 'measurements')
        
        # Create directories if they don't exist
        os.makedirs(data_dir, exist_ok=True)
        os.makedirs(measurements_dir, exist_ok=True)
        
        print(f"DEBUG: Data directory: {data_dir}")
        print(f"DEBUG: Measurements directory: {measurements_dir}")
        
        # Generate filename
        filename = f"{product_name}_{product_number}_{date}_Measure.CSV"
        data_filepath = os.path.join(data_dir, filename)
        measurements_filepath = os.path.join(measurements_dir, filename)
        
        print(f"DEBUG: Creating measurement files at:")
        print(f"DEBUG: - {data_filepath}")
        print(f"DEBUG: - {measurements_filepath}")
        print(f"DEBUG: Data buffer contains {len(data_buffer)} entries")
        
        try:
            # Function to write CSV file
            def write_csv_file(filepath):
                with open(filepath, 'w') as f:
                    # Write header with sensors in the order they appear in Arduino output
                    header = ['time'] + SENSORS
                    header_line = ','.join(header)
                    f.write(header_line + '\n')
                    print(f"DEBUG: Wrote header: {header_line}")
                    
                    # Write data
                    for entry in data_buffer:
                        print(f"DEBUG: Processing entry: {entry}")
                        if isinstance(entry, dict) and 'time' in entry and all(sensor in entry for sensor in SENSORS):
                            # Build line with values in same order as header
                            values = [str(entry[sensor]) for sensor in SENSORS]
                            print(f"DEBUG: SENSORS order: {SENSORS}")
                            print(f"DEBUG: Values in order: {values}")
                            print(f"DEBUG: Entry values: {[(sensor, entry[sensor]) for sensor in SENSORS]}")
                            line = [str(entry['time'])] + values
                            f.write(','.join(line) + '\n')
                            print(f"DEBUG: Wrote line to file: {','.join(line)}")
                        else:
                            print(f"DEBUG: Skipping invalid entry: {entry}")
            
            # Write to both locations
            write_csv_file(data_filepath)
            write_csv_file(measurements_filepath)
            print("DEBUG: Successfully wrote files to both locations")
            
        except Exception as e:
            print(f"DEBUG: Error writing files: {str(e)}")
            raise  # Re-raise to handle in the caller
        
        try:
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
            print("DEBUG: Successfully created measurement record in database")
            return measurement
            
        except Exception as e:
            print(f"DEBUG: Error creating measurement record: {str(e)}")
            raise  # Re-raise to handle in the caller

    def delete_measurement(self, measurement_id):
        """Delete measurement and its CSV file"""
        measurement = Measurement.query.get(measurement_id)
        if measurement and measurement.user_id == self.id:
            # Get paths
            app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_filepath = os.path.join(app_dir, 'data', measurement.filename)
            measurements_filepath = os.path.join(app_dir, 'persistent_data', 'measurements', measurement.filename)
            
            print(f"DEBUG: Deleting measurement files:")
            print(f"DEBUG: - {data_filepath}")
            print(f"DEBUG: - {measurements_filepath}")
            
            # Delete CSV files
            try:
                if os.path.exists(data_filepath):
                    os.remove(data_filepath)
                    print(f"DEBUG: Deleted file: {data_filepath}")
                if os.path.exists(measurements_filepath):
                    os.remove(measurements_filepath)
                    print(f"DEBUG: Deleted file: {measurements_filepath}")
            except Exception as e:
                print(f"DEBUG: Error deleting files: {e}")
                raise  # Re-raise to handle in the caller
            
            # Delete from database
            try:
                db.session.delete(measurement)
                db.session.commit()
                print("DEBUG: Successfully deleted measurement record from database")
                return True
            except Exception as e:
                print(f"DEBUG: Error deleting measurement record: {e}")
                raise  # Re-raise to handle in the caller
        return False

    @staticmethod
    def get_by_matrikelnummer(matrikelnummer):
        return User.query.filter_by(matrikelnummer=matrikelnummer).first()
