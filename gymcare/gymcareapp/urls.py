from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register('user', views.UserViewSet, basename='user')
router.register('trainer', views.TrainerViewSet, basename='trainer')
router.register('member', views.MemberViewSet, basename='member')
router.register('category-packages', views.CategoryPackageViewSet, basename='category-packages')
router.register('training-package', views.TrainingPackageViewSet, basename='training-package')
# router.register('trainer-packages', views.TrainerPackageViewSet, basename='trainer-packages')
router.register('member-subscriptions', views.MemberSubscriptionViewSet, basename='member-Subscriptions')
router.register('subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register('workout-schedules', views.WorkoutScheduleViewSet, basename='workout-schedule')
router.register('payment', views.PaymentViewSet, basename='payment')
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'change-requests', views.WorkoutScheduleChangeRequestViewSet, basename='change-request')


urlpatterns = [
    path('payment/<int:pk>/zalopay-order/', views.ZaloPayOrderView.as_view(), name='zalopay-order'),
    path('api/payments/create/', views.PaymentView.as_view(), name='create_payment'),
    path('api/payments/payment_return/', views.PaymentReturnView.as_view(), name='payment_return'),
    path('api/payments/ipn/', views.PaymentIPNView.as_view(), name='payment_ipn'),
    path('api/payments/update_status/', views.UpdatePaymentStatusView.as_view(), name='update_payment_status'),

    path("pt-dashboard/", views.PTDashboardView.as_view(), name="pt-dashboard"),

    path('', include(router.urls)),
]