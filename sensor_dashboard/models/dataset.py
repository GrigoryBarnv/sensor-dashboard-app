from datetime import datetime
import json

from . import db


class ImportedDataset(db.Model):
    __tablename__ = "imported_datasets"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(255), nullable=False)
    source_path = db.Column(db.String(512), nullable=False)
    row_count = db.Column(db.Integer, default=0, nullable=False)
    data = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def set_rows(self, rows):
        self.row_count = len(rows)
        self.data = json.dumps(rows)

    def get_rows(self):
        if not self.data:
            return []
        return json.loads(self.data)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "display_name": self.display_name,
            "row_count": self.row_count,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
