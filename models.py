from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Book(Base):
    __tablename__ = 'books'

    ID = Column(Integer, primary_key=True)
    Title = Column(String(255))
    Author = Column(String(255))
    Publisher = Column(String(255))
    PublishedDate = Column(Date)
    ShelfNumber = Column(String(50))
    ColumnNumber = Column(Integer)
    RowNumber = Column(Integer)

    loans = relationship("Loan", back_populates="book")

class Loan(Base):
    __tablename__ = 'loans'

    LoanID = Column(Integer, primary_key=True)
    BookID = Column(Integer, ForeignKey('books.ID'))
    LoanDate = Column(Date)
    LoanedTo = Column(String(255))
    ReturnDate = Column(Date)

    book = relationship("Book", back_populates="loans")
