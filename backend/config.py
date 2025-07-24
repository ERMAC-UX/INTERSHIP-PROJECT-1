import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Your API Keys
    VIRUSTOTAL_API = os.getenv('VIRUSTOTAL_API', 'cf38a3903a1a87ddda8be9ce77405b3a48cbbaf5d0be7dd5a539a3e7f3339171')
    ABUSEIPDB_API = os.getenv('ABUSEIPDB_API', 'cfe32c805ab88fec494b59a1e8c99b264eb372b82970b42ee686072a864c551460296de8800dfad7')
    
    # SQLite Database
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'database.db')
    
    # API URLs
    VIRUSTOTAL_URL = os.getenv('VIRUSTOTAL_URL', 'https://www.virustotal.com/vtapi/v2/')
    ABUSEIPDB_URL = os.getenv('ABUSEIPDB_URL', 'https://api.abuseipdb.com/api/v2/')
