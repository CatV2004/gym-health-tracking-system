from django.urls import path, include
from rest_framework.routers import DefaultRouter

from progress_tracker.views import TrainModelView, MemberProgressPredictionView, \
    GenerateAllPredictionsView, LatestPredictionByTrainerView
from . import views
from django.urls import re_path

router = DefaultRouter()
router.register('user', views.UserViewSet, basename='user')
router.register('trainer', views.TrainerViewSet, basename='trainer')
router.register('member', views.MemberViewSet, basename='member')
router.register('category-packages', views.CategoryPackageViewSet, basename='category-packages')
router.register('training-package', views.TrainingPackageViewSet, basename='training-package')
router.register('type-packages', views.TypePackageListView, basename='type-packages')
router.register('member-subscriptions', views.MemberSubscriptionViewSet, basename='member-Subscriptions')
router.register('subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register('workout-schedules', views.WorkoutScheduleViewSet, basename='workout-schedule')
router.register('payment', views.PaymentViewSet, basename='payment')
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'change-requests', views.WorkoutScheduleChangeRequestViewSet, basename='change-request')
router.register(r'promotions', views.PromotionViewSet, basename='promotion')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),

    path('payment/<uuid:pk>/zalopay-order/', views.ZaloPayOrderView.as_view(), name='zalopay-order'),
    path('api/payments/create/', views.PaymentView.as_view(), name='create_payment'),
    path('api/payments/payment_return/', views.PaymentReturnView.as_view(), name='payment_return'),
    path('api/payments/<str:payment_id>/upload-receipt/', views.PaymentReceiptUploadView.as_view(), name='upload-payment-receipt'),
    path('api/payments/ipn/', views.PaymentIPNView.as_view(), name='payment_ipn'),
    path('api/payments/update_status/', views.UpdatePaymentStatusView.as_view(), name='update_payment_status'),
    path("pt-dashboard/", views.PTDashboardView.as_view(), name="pt-dashboard"),

    path('train-model/', TrainModelView.as_view(), name='train-model'),
    path('my-predictions/', MemberProgressPredictionView.as_view(), name='member-predictions'),
    path('generate-predictions/', GenerateAllPredictionsView.as_view(), name='generate-predictions'),
    path('get-latest-prediction/', LatestPredictionByTrainerView.as_view(), name='trainer-get-latest-prediction'),

]
