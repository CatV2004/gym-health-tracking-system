from datetime import timedelta

from django.contrib import admin
from django.contrib.auth.forms import UserChangeForm
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count
from django.template.response import TemplateResponse
from django import forms
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django_flatpickr.widgets import DateTimePickerInput
from .models import *
from django.urls import  path
class MyAdminSite(admin.AdminSite):
    site_header = 'Gym management system and health monitoring'
    site_title = 'Gym Admin'
    index_title = 'Welcome to the admin page'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('stats-member/', self.admin_view(self.stats_member), name='stats-member'),
            path('stats-revenue/', self.admin_view(self.stats_revenue), name='stats-revenue'),
            path('stats-usage/', self.admin_view(self.stats_usage), name='stats-usage'),
        ]
        return custom_urls + urls

    def stats_member(self, request):
        # Thống kê số lượng hội viên theo tháng trong năm
        now = timezone.now()
        year = now.year

        monthly_member_counts = []
        for month in range(1, 13):
            member_count = Member.objects.filter(
                user__date_joined__year=year,
                user__date_joined__month=month
            ).count()
            monthly_member_counts.append(member_count)

        total_member_count = sum(monthly_member_counts)  # Tổng số hội viên

        context = {
            'total_member_count': total_member_count,
            'monthly_member_counts': monthly_member_counts,
            'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        }

        return TemplateResponse(request, 'admin/stats_member.html', context)

    def stats_revenue(self, request):
        # Thống kê doanh thu
        total_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        context = {
            'total_revenue': total_revenue,
        }
        return TemplateResponse(request, 'admin/stats_revenue.html', context)

    def stats_usage(self, request):
        # Lấy dữ liệu phòng tập theo tháng và năm
        now = timezone.now()
        year = request.GET.get('year', now.year)
        month = request.GET.get('month', now.month)

        # # Tính số buổi tập theo phòng
        # room_utilization_data = WorkoutSchedule.objects.filter(
        #     scheduled_at__year=year,
        #     scheduled_at__month=month
        # ).values('subscription__training_package__name').annotate(
        #     total_sessions=Count('id')
        # )
        #
        # # Tổng số buổi tập
        # total_sessions = sum(item['total_sessions'] for item in room_utilization_data)
        #
        # # Tính tỷ lệ sử dụng phòng
        # room_utilization_report = []
        # for item in room_utilization_data:
        #     usage_percentage = (item['total_sessions'] / total_sessions) * 100 if total_sessions else 0
        #     room_utilization_report.append({
        #         'name': item['subscription__training_package__name'],
        #         'total_sessions': item['total_sessions'],
        #         'usage_percentage': usage_percentage,
        #     })
        #
        # context = {
        #     'room_utilization_report': room_utilization_report,
        #     'month': month,
        #     'year': year,
        # }
        # return TemplateResponse(request, 'admin/stats_usage.html', context)

    def get_app_list(self, request):

        app_list = super().get_app_list(request)

        auth_group = {
            'name': 'Authentication and Authorization',
            'app_label': 'auth',
            'models': []
        }
        gymcare_group = {
            'name': 'GymCareApp',
            'app_label': 'gymcareapp',
            'models': []
        }

        # Danh sách các mô hình thuộc nhóm "Authentication and Authorization"
        auth_models = ['User', 'Group', 'Member', 'Trainer']

        # Duyệt qua tất cả các ứng dụng và mô hình
        for app in app_list:
            for model in app['models']:
                if model['object_name'] in auth_models:
                    auth_group['models'].append(model)
                else:
                    gymcare_group['models'].append(model)

        return [auth_group, gymcare_group]


my_admin_site = MyAdminSite(name='myadmin')


class BaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_date', 'updated_date', 'active')
    list_filter = ('active', 'created_date')
    search_fields = ('id',)
    ordering = ['-id']

class UserAdminForm(forms.ModelForm):
    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput,
        required=False
    )
    confirm_password = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput,
        required=False
    )

    class Meta:
        model = User
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password and confirm_password and password != confirm_password:
            raise ValidationError("Password and confirm password do not match.")
        return cleaned_data

class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    list_display = ('id', 'username', 'email', 'phone', 'role', 'is_active' )
    list_filter = ('role', 'is_active')
    fieldsets = (
        ("Personal Information", {
            'fields': ('is_active', 'username', 'password', 'confirm_password', 'first_name', 'last_name', 'email', 'phone', 'avatar', 'image_view', 'role')
        }),
    )
    readonly_fields = ['image_view']
    search_fields = ('username', 'email', 'phone')
    ordering = ['id']

    def image_view(self, user):
        if user.avatar:
            return mark_safe(f"<img src='{user.avatar.url}' width='100px' />")
        else:
            default_avatar = "https://res.cloudinary.com/dohsfqs6d/image/upload/v1742786537/gymcare/user.png"
            return mark_safe(f"<img src='{default_avatar}' width='100px' />")

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password"):
            obj.set_password(form.cleaned_data["password"])
        super().save_model(request, obj, form, change)

class TrainerAdmin(BaseAdmin):
    list_display = ('id', 'user', 'experience')
    search_fields = ('user__username', 'user__email')
    list_filter = ('experience',)
    ordering = ('-experience',)
    fieldsets = (
        ("Basic information:", {
            "fields": ('user', 'experience')
        }),
        ("Certificate:", {
            "fields": ('certification',),
        }),
    )

class MemberForm(forms.ModelForm):
    certification = forms.CharField(widget=CKEditorUploadingWidget, required=False)
    class Meta:
        model = Member
        fields = '__all__'



class MemberAdmin(BaseAdmin):
    form = MemberForm
    list_display = ('id', 'user', 'gender', 'birth_year', 'height', 'weight')
    search_fields = ('user__username', 'user__email')
    list_filter = ('gender', 'birth_year', 'height', 'weight')
    fieldsets = (
        ("Information:", {
            "fields": ("user",),
        }),
        ("Body Metrics:", {
            "fields": ("gender", "birth_year","height", "weight"),
        }),
        ("Training goals:", {
            "fields": ("goal",),
        })
    )




class TrainingPackageAdmin(BaseAdmin):
    list_display = ('id', 'name', 'type_package', 'cost')
    list_filter = ('type_package', 'cost')
    search_fields = ('name', )

    fieldsets = (
        ('Basic information', {
            'fields': ('name', 'type_package')
        }),
        ('Package details', {
            'fields': ('cost', 'session_count', 'description')
        }),
    )


class SubscriptionAdmin(BaseAdmin):
    list_display = ('id', 'member', 'training_package', 'start_date', 'end_date', 'status', 'total_cost')
    search_fields = ('member__user__username', 'training_package__name')
    list_filter = ('training_package', 'status', 'start_date', 'end_date')
    readonly_fields = ('total_cost',)
    fieldsets = (
        ('Member Information', {
            'fields': ('member',),
            'description': 'Select the member subscribing to the training package.',
        }),
        ('Training Package Information', {
            'fields': ('training_package',),
            'description': 'Select the training package that this member has subscribed to.',
        }),
        ('Subscription Duration', {
            'fields': ('start_date', 'end_date'),
            'description': 'Specify the duration of this subscription.',
        }),
        ('Status & Cost', {
            'fields': ('status', 'total_cost'),
            'description': 'Status of subscription and calculated cost.',
        }),
    )

    def save_model(self, request, obj, form, change):
        obj.save()

class PaymentAdmin(BaseAdmin):
    list_display = ('id', 'subscription', 'amount', 'payment_method', 'payment_status')
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('subscription__member__user__username',)
    readonly_fields = ['image_view']
    fieldsets = (
        ('Payment Information', {
            'fields': ('subscription', 'amount', 'payment_method', 'payment_status'),
            'description': 'Basic information about the payment, including amount and method of payment.'
        }),
        ('Receipt', {
            'fields': ('receipt_url', 'image_view'),
            'description': 'Upload and view the receipt image here.',
        }),
    )

    def image_view(self, payment):
        if payment.receipt_url:
            return mark_safe(f"<img src='{payment.receipt_url.url}' width='100px' />")
        else:
            return "No receipt image available."


class WorkoutProgressAdmin(BaseAdmin):
    list_display = ( 'member', 'weight_kg', 'body_fat', 'muscle_mass', 'recorded_by', 'created_date')
    search_fields = ('member__user__username', 'recorded_by__user__username')
    list_filter = ('recorded_by', 'created_date')
    readonly_fields = ('created_date', 'updated_date')
    fieldsets = (
        ("General information", {
            "fields": ("member", "recorded_by", )
        }),
        ("Body mass index", {
            "fields": ("weight_kg", "body_fat", "muscle_mass"),
        }),

    )

class WorkoutScheduleForm(forms.ModelForm):
    class Meta:
        model = WorkoutSchedule
        fields = ['subscription', 'scheduled_at', 'training_type', 'status', 'duration']
        widgets = {
            'scheduled_at': forms.DateTimeInput(
                attrs={'type': 'datetime-local'},
                format='%Y-%m-%dT%H:%M'  # Đảm bảo định dạng là yyyy-mm-ddTHH:mm
            )
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['scheduled_at'].input_formats = ['%Y-%m-%dT%H:%M']  # Định dạng đầu vào đúng
class WorkoutScheduleAdmin(BaseAdmin):
    form = WorkoutScheduleForm
    list_display = ('id', 'subscription', 'training_type', 'scheduled_at', 'duration', 'status')
    list_filter = ('training_type', 'status')
    search_fields = ('subscription__member__user__username', 'training_type', 'scheduled_at')
    ordering = ('scheduled_at',)
    fieldsets = (
        ("General Information", {
            'fields': ('subscription', 'scheduled_at', 'training_type', 'status'),
            'classes': ('wide',),
            'description': 'Basic information about the training schedule.'
        }),
        ("Training Session Details", {
            'fields': ('duration',),
            'classes': ('collapse',),
            'description': 'Detailed information about the session duration (minutes).'
        }),
    )
    def get_status_display(self, obj):
        return obj.get_status_display()


class ReviewAdmin(BaseAdmin):
    list_display = ('reviewer', 'training_package', 'rating', 'comment', 'created_date')
    list_filter = ('rating',)
    search_fields = ('reviewer__username', 'training_package__name', 'comment')
    readonly_fields = ('created_date', 'updated_date')
    fieldsets = (
        ('Review Information', {
            'fields': ('reviewer', 'training_package', 'rating', 'comment', 'parent_comment')
        }),
    )

my_admin_site.register(User, UserAdmin)
my_admin_site.register(Trainer, TrainerAdmin)
my_admin_site.register(Member, MemberAdmin)
my_admin_site.register(Subscription, SubscriptionAdmin)
my_admin_site.register(TrainingPackage, TrainingPackageAdmin)
my_admin_site.register(Payment, PaymentAdmin)
my_admin_site.register(WorkoutProgress, WorkoutProgressAdmin)
my_admin_site.register(WorkoutSchedule, WorkoutScheduleAdmin)
my_admin_site.register(Review, ReviewAdmin)

