import hashlib
import hmac
import urllib.parse
from datetime import datetime
import random
from django.db import transaction
from django.conf import settings
from ..models import Subscription, Payment, PaymentStatus, PaymentMethod


class VNPay:
    def __init__(self):
        self.requestData = {}
        self.responseData = {}
        self.n_str = self._generate_random_string()

    def _generate_random_string(self):
        n = random.randint(10 ** 11, 10 ** 12 - 1)
        return str(n).zfill(12)

    def get_payment_url(self):
        inputData = sorted(self.requestData.items())
        queryString = '&'.join(
            f"{key}={urllib.parse.quote_plus(str(val))}"
            for key, val in inputData
        )
        hashValue = self._hmacsha512(settings.VNPAY_CONFIG['vnp_HashSecret'], queryString)
        return f"{settings.VNPAY_CONFIG['vnp_Url']}?{queryString}&vnp_SecureHash={hashValue}"

    def validate_response(self):
        query_string = '&'.join(
            f"{key}={urllib.parse.quote_plus(str(val))}"
            for key, val in sorted(self.responseData.items())
            if key != "vnp_SecureHash"
        )
        print("Query String for Hash:", query_string)

        hash_value = self._hmacsha512(settings.VNPAY_CONFIG['vnp_HashSecret'], query_string)
        print("Calculated SecureHash:", hash_value)

        return self.responseData.get('vnp_SecureHash') == hash_value

    @staticmethod
    def _hmacsha512(key, data):
        byteKey = key.encode('utf-8')
        byteData = data.encode('utf-8')
        return hmac.new(byteKey, byteData, hashlib.sha512).hexdigest()


class VNPayDatabase:
    @staticmethod
    @transaction.atomic
    def create_payment_record(subscription_id, amount, vnp_response_data):
        try:
            subscription = Subscription.objects.get(id=subscription_id)

            payment = Payment.objects.create(
                subscription=subscription,
                amount=amount,
                payment_method=PaymentMethod.BANK_TRANSFER,
                payment_status=PaymentStatus.COMPLETED if vnp_response_data[
                                                              'vnp_ResponseCode'] == '00' else PaymentStatus.FAILED,
                receipt_url=vnp_response_data.get('vnp_PayUrl', '')
            )

            if payment.payment_status == PaymentStatus.COMPLETED:
                subscription.mark_as_active()

            return payment

        except Exception as e:
            raise Exception(f"Error creating payment record: {str(e)}")


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')