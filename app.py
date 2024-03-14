from flask import Flask, jsonify, make_response
from flask_restful import Api, Resource, reqparse
from database import Session
from models import Book, Loan
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)

CORS(app)

def serialize(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

class BooksResource(Resource):
    def get(self):
        with Session() as session:
            books = session.query(Book).all()
            return jsonify([serialize(book) for book in books])

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('Title', required=True)
        parser.add_argument('Author', required=True)
        parser.add_argument('Publisher', required=True)
        parser.add_argument('PublishedDate', required=True)
        parser.add_argument('ShelfNumber', required=True)
        parser.add_argument('ColumnNumber', required=True)
        parser.add_argument('RowNumber', required=True)
        args = parser.parse_args()

        with Session() as session:
            new_book = Book(**args)
            session.add(new_book)
            session.commit()
            return make_response(jsonify(serialize(new_book)), 201)

class BookResource(Resource):
    def get(self, id):
        with Session() as session:
            book = session.query(Book).filter_by(ID=id).first()
            if book:
                return jsonify(serialize(book))
            else:
                return {'message': 'Book not found'}, 404

    def put(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument('Title')
        parser.add_argument('Author')
        parser.add_argument('Publisher')
        parser.add_argument('PublishedDate')
        parser.add_argument('ShelfNumber')
        parser.add_argument('ColumnNumber')
        parser.add_argument('RowNumber')
        args = parser.parse_args()

        with Session() as session:
            book = session.query(Book).filter_by(ID=id).first()
            if book:
                for key, value in args.items():
                    if value is not None:
                        setattr(book, key, value)
                session.commit()
                return jsonify(serialize(book))
            else:
                return {'message': 'Book not found'}, 404

    def delete(self, id):
        with Session() as session:
            book = session.query(Book).filter_by(ID=id).first()
            if book:
                session.delete(book)
                session.commit()
                return '', 204
            else:
                return {'message': 'Book not found'}, 404

class BookLoansResource(Resource):
    def get(self, id):
        with Session() as session:
            book = session.query(Book).filter_by(ID=id).first()
            if book:
                return jsonify([serialize(loan) for loan in book.loans])
            else:
                return {'message': 'Book not found'}, 404

class BookLoanResource(Resource):
    def post(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument('LoanDate', required=True)
        parser.add_argument('ReturnDate', required=True)
        parser.add_argument('LoanedTo', required=True)
        args = parser.parse_args()

        with Session() as session:
            book = session.query(Book).filter_by(ID=id).first()
            if book:
                new_loan = Loan(BookID=id, **args)
                session.add(new_loan)
                session.commit()
                return make_response(jsonify(serialize(new_loan)), 201)
            else:
                return {'message': 'Book not found'}, 404

class BookLoanUpdateResource(Resource):
    def put(self, id, loan_id):
        parser = reqparse.RequestParser()
        parser.add_argument('LoanDate')
        parser.add_argument('LoanedTo')
        parser.add_argument('ReturnDate')
        args = parser.parse_args()

        if 'LoanDate' in args:
            args['LoanDate'] = datetime.strptime(args['LoanDate'], '%a, %d %b %Y %H:%M:%S %Z').date()
        if 'ReturnDate' in args:
            args['ReturnDate'] = datetime.strptime(args['ReturnDate'], '%a, %d %b %Y %H:%M:%S %Z').date()

        with Session() as session:
            loan = session.query(Loan).filter_by(LoanID=loan_id, BookID=id).first()
            if loan:
                for key, value in args.items():
                    if value is not None:
                        setattr(loan, key, value)
                session.commit()
                return jsonify(serialize(loan))
            else:
                return {'message': 'Loan not found'}, 404

    def delete(self, id, loan_id):
        with Session() as session:
            loan = session.query(Loan).filter_by(LoanID=loan_id, BookID=id).first()
            if loan:
                session.delete(loan)
                session.commit()
                return '', 204
            else:
                return {'message': 'Loan not found'}, 404

api.add_resource(BooksResource, '/api/books')
api.add_resource(BookResource, '/api/books/<int:id>')
api.add_resource(BookLoansResource, '/api/books/<int:id>/loans')
api.add_resource(BookLoanResource, '/api/books/<int:id>/loans')
api.add_resource(BookLoanUpdateResource, '/api/books/<int:id>/loans/<int:loan_id>')

if __name__ == '__main__':
    app.run(debug=True)
