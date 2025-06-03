#
# import os
# import firebase_admin
# from firebase_admin import credentials, firestore
#
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#
# cred_path = os.path.join(BASE_DIR,'configs', 'firebase_service_account_key.json')
#
# cred = credentials.Certificate(cred_path)
#
# firebase_admin.initialize_app(cred)
#
# db = firestore.client()
#
