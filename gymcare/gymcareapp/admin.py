from django.contrib import admin
from .models import *

class BaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_date', 'updated_date', 'active')
    list_filter = ('active', 'created_date')
    search_fields = ('id',)
    ordering = ['-id']

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'phone', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'phone')
    ordering = ['id']

class TrainerAdmin(BaseAdmin):
    list_display = ('id', 'user', 'experience')
    search_fields = ('user__username', 'user__email')

class MemberAdmin(BaseAdmin):
    list_display = ('id', 'user', 'height', 'weight', 'goal')
    search_fields = ('user__username', 'user__email')

class TypePackageAdmin(BaseAdmin):
    list_display = ('id', 'type_name', 'price')
    search_fields = ('type_name',)

class TrainingPackageAdmin(BaseAdmin):
    list_display = ('id', 'name', 'pt', 'type_package', 'start_date', 'end_date', 'total_cost')
    list_filter = ('type_package',)
    search_fields = ('name', 'pt__user__username')

class SubscriptionAdmin(BaseAdmin):
    list_display = ('id', 'member', 'training_package')
    search_fields = ('member__user__username', 'training_package__name')

class PaymentAdmin(BaseAdmin):
    list_display = ('id', 'subscription', 'amount', 'payment_method', 'payment_status')
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('subscription__member__user__username',)

class WorkoutProgressAdmin(BaseAdmin):
    list_display = ('id', 'weight_kg', 'body_fat', 'muscle_mass', 'notes')
    search_fields = ('id',)

class WorkoutScheduleAdmin(BaseAdmin):
    list_display = ('id', 'subscription', 'training_type', 'scheduled_at', 'duration', 'status')
    list_filter = ('training_type', 'status')
    search_fields = ('subscription__member__user__username',)

class ReviewAdmin(BaseAdmin):
    list_display = ('id', 'reviewer', 'training_package', 'rating')
    list_filter = ('rating',)
    search_fields = ('reviewer__user__username', 'training_package__name')

admin.site.register(User, UserAdmin)
admin.site.register(Trainer, TrainerAdmin)
admin.site.register(Member, MemberAdmin)
admin.site.register(TypePackage, TypePackageAdmin)
admin.site.register(TrainingPackage, TrainingPackageAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(WorkoutProgress, WorkoutProgressAdmin)
admin.site.register(WorkoutSchedule, WorkoutScheduleAdmin)
admin.site.register(Review, ReviewAdmin)

