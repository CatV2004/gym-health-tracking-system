# from celery import shared_task
# from django.utils import timezone
#
# from gymcareapp.models import WorkoutProgress, Member, ProgressPrediction
# from .predictor import ProgressPredictor
# from datetime import timedelta
#
#
# @shared_task
# def train_global_model():
#     # Lấy dữ liệu từ tất cả thành viên để train model tổng thể
#     progresses = WorkoutProgress.objects.all().order_by('member', 'created_date')
#
#     # Chuẩn bị dữ liệu
#     data = []
#     for p in progresses:
#         data.append([float(p.weight_kg), float(p.body_fat), float(p.muscle_mass)])
#
#     if len(data) > 5:  # Chỉ train nếu có đủ dữ liệu
#         predictor = ProgressPredictor()
#         predictor.train(pd.DataFrame(data, columns=['weight', 'body_fat', 'muscle_mass']))
#
#
# @shared_task
# def generate_member_predictions():
#     # Tạo dự đoán cho từng thành viên
#     members = Member.objects.filter(active=True)
#     predictor = ProgressPredictor()
#
#     if not predictor.load_model():
#         train_global_model()
#         predictor.load_model()
#
#     for member in members:
#         progresses = WorkoutProgress.objects.filter(
#             member=member
#         ).order_by('-created_date')[:4]  # Lấy 4 lần đo gần nhất
#
#         if len(progresses) >= 2:  # Cần ít nhất 2 điểm dữ liệu
#             data = [[
#                 float(p.weight_kg),
#                 float(p.body_fat),
#                 float(p.muscle_mass)
#                 float(p.muscle_mass)
#             ] for p in progresses]
#
#             prediction = predictor.predict(data)
#
#             # Lưu dự đoán
#             ProgressPrediction.objects.create(
#                 member=member,
#                 predicted_weight=prediction['weight'],
#                 predicted_body_fat=prediction['body_fat'],
#                 predicted_muscle_mass=prediction['muscle_mass'],
#                 confidence=0.8,  # Có thể tính toán độ tin cậy thực tế
#                 next_check_date=timezone.now() + timedelta(weeks=1)
#             )