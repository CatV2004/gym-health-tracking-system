import hmac
import hashlib
import json
import requests
from datetime import datetime
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status


class ZaloPayHelper:
    @staticmethod
    def generate_mac(data, key):
        sorted_data = sorted(data.items(), key=lambda x: x[0])

        raw_data = []
        for key, value in sorted_data:
            if value is not None and value != "":
                raw_data.append(f"{key}={value}")

        raw_string = "|".join(raw_data)

        return hmac.new(
            key.encode('utf-8'),
            raw_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def get_timestamp():
        return int(datetime.now().timestamp() * 1000)

    @staticmethod
    def create_order(amount, description, subscription_id):
        zalopay_config = settings.ZALOPAY_CONFIG

        try:
            # Validate amount
            amount = int(float(amount))
            if amount < 1000:
                raise Exception("Amount must be at least 1000 VND")

            app_trans_id = f"{datetime.now().strftime('%y%m%d')}_{str(subscription_id).zfill(6)}"

            # Prepare embed_data
            embed_data = {
                "subscription_id": subscription_id,
                "description": description[:200]  # Limit length to 200 characters
            }

            order_data = {
                "app_id": zalopay_config["app_id"],
                "app_user": f"user_{subscription_id}",
                "app_time": int(datetime.now().timestamp() * 1000),
                "amount": amount,
                "app_trans_id": app_trans_id,
                "embed_data": json.dumps(embed_data, ensure_ascii=False),
                "item": json.dumps([{
                    "name": "Gym Membership",
                    "quantity": 1,
                    "price": amount
                }]),
                "description": description[:255],
                "bank_code": "zalopayapp",
                "callback_url": zalopay_config["callback_url"],
                "device_info": "WEB_SERVER"
            }

            # Generate MAC
            order_data["mac"] = ZaloPayHelper.generate_mac(order_data, zalopay_config["key1"])

            # Log request data
            print("FINAL REQUEST DATA:")
            print(order_data)

            # Call ZaloPay API
            response = requests.post(
                "https://sb-openapi.zalopay.vn/v2/create",
                data=order_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15
            )

            response_data = response.json()
            print("ZALOPAY RESPONSE:", response_data)

            if response_data.get("return_code") != 1:
                error_msg = response_data.get("sub_return_message", "Unknown error")
                raise Exception(f"ZaloPay error {response_data.get('sub_return_code')}: {error_msg}")

            return response_data

        except ValueError as e:
            raise Exception(f"Invalid amount value: {str(e)}")
        except Exception as e:
            raise Exception(f"Create order failed: {str(e)}")


    @staticmethod
    def verify_callback(data):
        zalopay_config = settings.ZALOPAY_CONFIG

        if 'key2' not in zalopay_config:
            raise Exception("Missing ZaloPay key2 in configuration")

        mac = data.get('mac')
        if not mac:
            return False

        data_copy = data.copy()
        data_copy.pop('mac', None)

        expected_mac = ZaloPayHelper.generate_mac(
            data_copy,
            zalopay_config["key2"]
        )
        return hmac.compare_digest(mac, expected_mac)