import json
from collections import Counter
from datetime import timedelta

from django.contrib import admin
from django.contrib.auth.forms import UserChangeForm
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count, Q, Case, When, Value, CharField, Avg
from django.db.models.functions import ExtractMonth, ExtractHour, TruncMonth
from django.shortcuts import render
from django.template.response import TemplateResponse
from django import forms
from django.utils.formats import date_format
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.utils.timezone import localtime
from django_flatpickr.widgets import DateTimePickerInput
from .models import *
from django.urls import  path

from .serializers import TrainerRegisterSerializer


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
            path('stats-base/', self.admin_view(self.stats_base), name='stats-base'),
        ]
        return custom_urls + urls
    def stats_base(self, request):
        return TemplateResponse(request, 'admin/stats_base.html', {})


    def stats_member(self, request):
        now = timezone.now()
        try:
            year = int(request.GET.get('year', now.year))
        except (ValueError, TypeError):
            year = now.year

        print(f"DEBUG - Year used: {year}")  # Debug year

        # Lấy dữ liệu thô để debug
        debug_dates = Member.objects.filter(created_date__isnull=False) \
                          .values_list('created_date', flat=True)[:5]
        print(f"DEBUG - Sample dates: {list(debug_dates)}")

        # Khởi tạo danh sách thống kê
        monthly_stats = {
            'counts': [0] * 12,
            'male': [0] * 12,
            'female': [0] * 12
        }

        # Query chính xác hơn
        monthly_data = Member.objects.filter(
            created_date__isnull=False,
            created_date__year=year
        ).annotate(
            month=ExtractMonth('created_date')
        ).values('month').annotate(
            total=Count('id'),
            male=Count('id', filter=Q(gender='M')),
            female=Count('id', filter=Q(gender='F'))
        ).order_by('month')

        print(f"DEBUG - Monthly data: {list(monthly_data)}")  # Debug query kết quả

        for item in monthly_data:
            month_idx = item['month'] - 1
            if 0 <= month_idx < 12:
                monthly_stats['counts'][month_idx] = item['total']
                monthly_stats['male'][month_idx] = item['male']
                monthly_stats['female'][month_idx] = item['female']

        # Tính tổng
        total_members = sum(monthly_stats['counts'])
        total_male = sum(monthly_stats['male'])
        total_female = sum(monthly_stats['female'])

        context = {
            'total_member_count': total_members,
            'total_male_count': total_male,
            'total_female_count': total_female,
            'monthly_member_counts': monthly_stats['counts'],
            'male_member_counts': monthly_stats['male'],
            'female_member_counts': monthly_stats['female'],
            'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'year': year,
        }
        return TemplateResponse(request, 'admin/stats_member.html', context)

    def stats_revenue(self, request):
        payments = Payment.objects.filter(payment_status=PaymentStatus.COMPLETED)
        selected_year = request.GET.get('year')

        if selected_year:
            payments = payments.filter(created_date__year=selected_year)

        total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0
        avg_transaction = payments.aggregate(avg=Avg('amount'))['avg'] or 0
        total_count = payments.count()

        status_distribution = []
        for item in Payment.objects.values('payment_status').annotate(count=Count('id')):
            status_distribution.append({
                'payment_status': item['payment_status'],
                'count': item['count'],
                'status_name': PaymentStatus(item['payment_status']).name
            })

        monthly_stats = []
        monthly_data = payments.annotate(month=TruncMonth('created_date')) \
            .values('month') \
            .annotate(revenue=Sum('amount'), count=Count('id')) \
            .order_by('month')

        for item in monthly_data:
            monthly_stats.append({
                'month': date_format(item['month'], 'Y-m'),
                'revenue': float(item['revenue']),
                'count': item['count']
            })

        method_stats = []
        method_data = payments.values('payment_method') \
            .annotate(total=Sum('amount'), count=Count('id'))

        for item in method_data:
            method_stats.append({
                'payment_method': item['payment_method'],
                'method_name': PaymentMethod(item['payment_method']).name,
                'total': float(item['total']),
                'count': item['count']
            })

        context = {
            'total_revenue': total_revenue,
            'avg_transaction': avg_transaction,
            'total_count': total_count,
            'status_distribution': status_distribution,
            'monthly_stats': monthly_stats,
            'method_stats': method_stats,
            'chart_labels': json.dumps([item['month'] for item in monthly_stats]),
            'chart_data': json.dumps([item['revenue'] for item in monthly_stats]),
        }
        return TemplateResponse(request, 'admin/stats_revenue.html', context)

    def stats_usage(self, request):
        now = timezone.localtime(timezone.now())
        current_date_input = request.GET.get('date', now.date().strftime('%Y-%m-%d'))

        try:
            current_date = datetime.strptime(current_date_input, '%Y-%m-%d').date()
        except ValueError:
            current_date = now.date()

        # Lấy lịch theo ngày UTC (giờ lưu trong DB là UTC)
        usage_qs = WorkoutSchedule.objects.filter(
            scheduled_at__date=current_date
        )

        usage_data = []
        for obj in usage_qs:
            local_dt = localtime(obj.scheduled_at)
            hour = local_dt.hour

            # Gán khung giờ tương ứng
            if 6 <= hour < 8:
                slot = '06:00 AM - 08:00 AM'
            elif 8 <= hour < 10:
                slot = '08:00 AM - 10:00 AM'
            elif 10 <= hour < 12:
                slot = '10:00 AM - 12:00 PM'
            elif 14 <= hour < 16:
                slot = '02:00 PM - 04:00 PM'
            elif 16 <= hour < 18:
                slot = '04:00 PM - 06:00 PM'
            elif 18 <= hour < 20:
                slot = '06:00 PM - 08:00 PM'
            elif 20 <= hour < 22:
                slot = '08:00 PM - 10:00 PM'
            else:
                slot = 'Other'

            usage_data.append({
                'time_slot': slot,
                'status': obj.status,
                'training_type': obj.training_type,
            })

        time_labels = [
            '06:00 AM - 08:00 AM', '08:00 AM - 10:00 AM', '10:00 AM - 12:00 PM',
            '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM', '06:00 PM - 08:00 PM',
            '08:00 PM - 10:00 PM'
        ]

        hourly_stats = []
        for slot in time_labels:
            period_data = [x for x in usage_data if x['time_slot'] == slot]
            hourly_stats.append({
                'time_slot': slot,
                'total': len(period_data),
                'completed': len([x for x in period_data if x['status'] == WorkoutScheduleStatus.COMPLETED]),
                'types': dict(Counter(x['training_type'] for x in period_data))
            })

        booked_counts = [hour['total'] for hour in hourly_stats]
        peak_hours = self.calculate_peak_hours(usage_data)

        context = {
            'current_date': current_date.strftime('%d/%m/%Y'),
            'current_date_input': current_date_input,
            'hourly_stats': hourly_stats,
            'time_labels': time_labels,
            'booked_counts': booked_counts,
            'capacity': 20,
            'peak_hours': peak_hours,
        }

        return render(request, 'admin/stats_usage.html', context)

    def calculate_peak_hours(self, data):
        hour_counts = Counter(item['time_slot'] for item in data)
        return [hour for hour, count in hour_counts.most_common(3)]

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

        auth_models = ['User', 'Group', 'Member', 'Trainer']

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


# class TrainerAdminForm(forms.ModelForm):
#     class Meta:
#         model = Trainer
#         fields = '__all__'
#
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         if self.instance and hasattr(self.instance, 'user') and self.instance.user:
#             self.initial['username'] = self.instance.user.username
#             self.initial['first_name'] = self.instance.user.first_name
#             self.initial['last_name'] = self.instance.user.last_name
#             self.initial['email'] = self.instance.user.email
#             self.initial['phone'] = self.instance.user.phone
#             self.initial['avatar'] = self.instance.user.avatar
#
#     def save(self, commit=True):
#         trainer = super().save(commit=False)
#         user_data = {
#             'username': self.cleaned_data['username'],
#             'first_name': self.cleaned_data['first_name'],
#             'last_name': self.cleaned_data['last_name'],
#             'email': self.cleaned_data['email'],
#             'phone': self.cleaned_data['phone'],
#             'avatar': self.cleaned_data['avatar'],
#         }
#         # Kiểm tra nếu 'username' bị thiếu
#         if not user_data['username']:
#             raise forms.ValidationError('Username is required.')
#
#         serializer = TrainerRegisterSerializer(data={
#             'user': user_data,
#             'certification': self.cleaned_data['certification'],
#             'experience': self.cleaned_data['experience'],
#         })
#         if serializer.is_valid():
#             serializer.save()
#             if commit:
#                 trainer.save()
#         else:
#             raise forms.ValidationError(serializer.errors)
#         return trainer

class TrainerAdmin(BaseAdmin):
    # form = TrainerAdminForm
    list_display = ('id', 'user', 'experience')
    search_fields = ('user__username', 'user__email')
    list_filter = ('experience',)
    ordering = ('-experience',)
    autocomplete_fields = ('user',)
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
    autocomplete_fields = ('user',)
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
    list_display = ('id', 'name', 'type_package', 'session_count' , 'cost')
    list_filter = ('type_package', 'cost')
    search_fields = ('name', )
    readonly_fields = ('created_date', 'updated_date')
    autocomplete_fields = ('pt', 'category_package')

    fieldsets = (
        ('Basic information', {
            'fields': ('name', 'type_package')
        }),
        ('Trainer & Category', {
            'fields': ('pt', 'category_package')
        }),
        ('Package details', {
            'fields': ('cost', 'session_count', 'description')
        }),
        ('System Info', {
            'classes': ('collapse',),
            'fields': ('created_date', 'updated_date')
        }),
    )

class SubscriptionAdmin(BaseAdmin):
    list_display = ('id', 'member', 'training_package', 'start_date', 'end_date', 'status', 'total_cost')
    search_fields = ('member__user__username', 'training_package__name')
    list_filter = ('training_package', 'status', 'start_date', 'end_date')
    readonly_fields = ('total_cost',)
    autocomplete_fields = ('member', 'training_package')

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

class CategoryPackagesAdmin(BaseAdmin):
    list_display = ('id', 'created_date', 'updated_date', 'deleted_date', 'active', 'name', 'description')
    search_fields = ('name',)
    list_filter = ('name', 'created_date', 'updated_date')
    readonly_fields = ('id', 'created_date', 'updated_date', 'deleted_date')  # Không cho sửa mấy trường hệ thống

    fieldsets = (
        ('Information system', {
            'fields': ('id', 'created_date', 'updated_date', 'deleted_date', 'active'),
            'classes': ('collapse',),
        }),
        ('Package information', {
            'fields': ('name', 'description'),
        }),
    )



class WorkoutProgressAdmin(BaseAdmin):
    list_display = ( 'member', 'weight_kg', 'body_fat', 'muscle_mass', 'recorded_by', 'created_date')
    search_fields = ('member__user__username', 'recorded_by__user__username')
    list_filter = ('recorded_by', 'created_date')
    readonly_fields = ('created_date', 'updated_date')
    autocomplete_fields = ('member', 'recorded_by')

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
                format='%Y-%m-%dT%H:%M'
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['scheduled_at'].input_formats = ['%Y-%m-%dT%H:%M']

    def clean_scheduled_at(self):
        scheduled_at = self.cleaned_data.get('scheduled_at')
        if scheduled_at:
            return scheduled_at.replace(second=0, microsecond=0)  # CHỈ TỚI GIÂY
        return scheduled_at

    def clean(self):
        cleaned_data = super().clean()

        scheduled_at = cleaned_data.get("scheduled_at")
        if scheduled_at and scheduled_at < timezone.now():
            raise ValidationError({"scheduled_at": "Scheduled time cannot be in the past."})

        duration = cleaned_data.get("duration")
        if duration and duration <= 0:
            raise ValidationError({"duration": "Duration must be greater than 0."})

        return cleaned_data

class WorkoutScheduleAdmin(BaseAdmin):
    # form = WorkoutScheduleForm
    list_display = ('id', 'subscription', 'training_type', 'scheduled_at', 'duration', 'status')
    list_filter = ('training_type', 'status')
    search_fields = ('subscription__member__user__username', 'training_type', 'scheduled_at')
    ordering = ('scheduled_at',)
    autocomplete_fields = ('subscription',)

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
my_admin_site.register(CategoryPackage, CategoryPackagesAdmin)
my_admin_site.register(Payment, PaymentAdmin)
my_admin_site.register(WorkoutProgress, WorkoutProgressAdmin)
my_admin_site.register(WorkoutSchedule, WorkoutScheduleAdmin)
my_admin_site.register(Review, ReviewAdmin)

