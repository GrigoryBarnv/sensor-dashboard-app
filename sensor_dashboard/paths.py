from pathlib import Path


PACKAGE_DIR = Path(__file__).resolve().parent
ROOT_DIR = PACKAGE_DIR.parent
DATA_DIR = ROOT_DIR / "data"
PERSISTENT_DIR = ROOT_DIR / "persistent_data"
DB_DIR = PERSISTENT_DIR / "db"
MEASUREMENTS_DIR = PERSISTENT_DIR / "measurements"
TEMP_MEASUREMENTS_DIR = ROOT_DIR / "temp_measurements"
STATIC_DIR = ROOT_DIR / "static"
FRONTEND_BUILD_DIR = STATIC_DIR / "frontend"
