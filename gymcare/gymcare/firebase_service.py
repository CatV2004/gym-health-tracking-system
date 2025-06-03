import os
import firebase_admin
from firebase_admin import credentials
from django.conf import settings


def initialize_firebase():
    cred_path = os.path.join(settings.BASE_DIR, "gymcare-f65b0-firebase-adminsdk-fbsvc-c2ec15b279.json")

    if not os.path.exists(cred_path):
        raise FileNotFoundError(
            f"Firebase service account file not found at: {cred_path}\n"
            "Hãy tải file JSON từ Firebase Console và đặt trong thư mục project."
        )

    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully!")