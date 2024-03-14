from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base



engine = create_engine("mysql://username:password@host:port/database", echo=True)

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
