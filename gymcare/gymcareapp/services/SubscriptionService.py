from rest_framework.exceptions import ValidationError

from gymcareapp.models import Subscription, Payment


class SubscriptionService:
    @staticmethod
    def subscribe(member, package):
        # Kiểm tra xem gói tập có tồn tại không
        if not package:
            raise ValidationError({"error": "Gói tập không tồn tại."})

        # Kiểm tra xem member đã đăng ký gói này chưa
        if Subscription.objects.filter(member=member, training_package=package, status='active').exists():
            raise ValidationError({"error": "Bạn đã đăng ký gói tập này rồi."})

        # Tạo Subscription với trạng thái chờ thanh toán
        subscription = Subscription.objects.create(
            member=member,
            training_package=package,
            status='pending_payment'
        )

        # (Tuỳ chọn) Tạo Payment nếu có tích hợp thanh toán
        Payment.objects.create(
            subscription=subscription,
            amount=package.price,
            status='pending'
        )

        return subscription
