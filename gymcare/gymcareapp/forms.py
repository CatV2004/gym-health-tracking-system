from django import forms
from django.contrib import admin
from django.contrib.auth.forms import UserCreationForm
from cloudinary.uploader import upload
from django.core.exceptions import ValidationError
from gymcareapp.models import Trainer, Role, User
import string
import logging
import secrets

logger = logging.getLogger(__name__)


class TrainerAdminForm(forms.ModelForm):
    username = forms.CharField(required=True)
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    email = forms.EmailField(required=True)
    phone = forms.CharField(required=True)
    avatar = forms.ImageField(required=False)

    class Meta:
        model = Trainer
        fields = ['username', 'first_name', 'last_name',
                  'email', 'phone', 'avatar', 'certification', 'experience']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # Nếu là chỉnh sửa, điền giá trị từ user vào form
            user = self.instance.user
            self.fields['username'].initial = user.username
            self.fields['first_name'].initial = user.first_name
            self.fields['last_name'].initial = user.last_name
            self.fields['email'].initial = user.email
            self.fields['phone'].initial = user.phone
            self.fields['username'].widget.attrs['readonly'] = True

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')
        phone = cleaned_data.get('phone')

        if not self.instance.pk:  # Chỉ validate khi tạo mới
            if User.objects.filter(username=username).exists():
                raise ValidationError({'username': "Username đã tồn tại."})
            if User.objects.filter(email=email).exists():
                raise ValidationError({'email': "Email đã tồn tại."})
            if User.objects.filter(phone=phone).exists():
                raise ValidationError({'phone': "Số điện thoại đã tồn tại."})

        return cleaned_data

    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar')
        if avatar and avatar.size > 2 * 1024 * 1024:
            raise forms.ValidationError("Ảnh đại diện không được vượt quá 2MB.")
        return avatar

    def generate_random_password(self):
        """Tạo mật khẩu ngẫu nhiên an toàn"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for i in range(12))

    def save(self, commit=True):
        logger.info("Bắt đầu quá trình save Trainer")
        trainer = super().save(commit=False)

        if self.instance.pk:  # Trường hợp cập nhật
            user = trainer.user
            user.first_name = self.cleaned_data['first_name']
            user.last_name = self.cleaned_data['last_name']
            user.email = self.cleaned_data['email']
            user.phone = self.cleaned_data['phone']

            avatar = self.cleaned_data.get('avatar')
            if avatar:
                try:
                    result = upload(avatar, folder="gymcare/avatar/trainer")
                    user.avatar = result.get('secure_url')
                except Exception as e:
                    raise forms.ValidationError(f"Lỗi upload avatar: {str(e)}")

            user.save()
            if commit:
                trainer.save()
            return trainer
        else:  # Trường hợp tạo mới
            user_data = {
                'username': self.cleaned_data['username'],
                'first_name': self.cleaned_data['first_name'],
                'last_name': self.cleaned_data['last_name'],
                'email': self.cleaned_data['email'],
                'phone': self.cleaned_data['phone'],
                'role': Role.TRAINER.value,
            }

            avatar = self.cleaned_data.get('avatar')
            if avatar:
                try:
                    result = upload(avatar, folder="gymcare/avatar/trainer")
                    user_data['avatar'] = result.get('secure_url')
                except Exception as e:
                    raise forms.ValidationError(f"Lỗi upload avatar: {str(e)}")

            try:
                password = self.generate_random_password()
                user = User.objects.create_user(**user_data)
                user.set_password(password)
                user.save()
            except Exception as e:
                raise forms.ValidationError(f"Lỗi khi tạo tài khoản người dùng: {str(e)}")

            trainer.user = user

            if commit:
                trainer.save()
                logger.info("Trainer created, email should be sent from save_model in admin.")
            return trainer