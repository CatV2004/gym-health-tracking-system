from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from gymcareapp import permissions
from gymcareapp.models import ProgressPrediction, Member
import pandas as pd

from progress_tracker.predictor import ProgressPredictor

class TrainModelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({"error": "member_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = Member.objects.get(id=member_id, active=True)
        except Member.DoesNotExist:
            raise NotFound("Member not found or not active.")

        predictor = ProgressPredictor()
        result = predictor.train()

        if result['status'] == 'error':
            return Response(
                {"error": result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            prediction = predictor.predict_for_member(member)
            prediction_record = ProgressPrediction.objects.create(
                member=member,
                predicted_weight=prediction['weight'],
                predicted_body_fat=prediction['body_fat'],
                predicted_muscle_mass=prediction['muscle_mass'],
                confidence=result['confidence'],
                next_check_date=prediction['next_check_date']
            )

            return Response({
                "status": "Prediction successful",
                "loss": result['loss'],
                "val_loss": result.get('val_loss')
            })

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LatestPredictionByTrainerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member_id = request.query_params.get('member_id')
        if not member_id:
            return Response(
                {"error": "Thiếu member_id trong query parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy thành viên với ID này"},
                status=status.HTTP_404_NOT_FOUND
            )

        prediction = ProgressPrediction.objects.filter(member=member).order_by('-prediction_date').first()

        if not prediction:
            return Response(
                {"error": "Thành viên này chưa có dữ liệu dự đoán"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Trả về dữ liệu
        return Response({
            "member_id": member.id,
            "member_name": str(member.user.get_full_name()),
            "predicted_weight": float(prediction.predicted_weight),
            "predicted_body_fat": float(prediction.predicted_body_fat) if prediction.predicted_body_fat else None,
            "predicted_muscle_mass": float(prediction.predicted_muscle_mass) if prediction.predicted_muscle_mass else None,
            "confidence": prediction.confidence,
            "prediction_date": prediction.prediction_date,
            "next_check_date": prediction.next_check_date
        }, status=status.HTTP_200_OK)


class MemberProgressPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            member = request.user.member_profile
        except Member.DoesNotExist:
            return Response(
                {"error": "User is not a member"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Kiểm tra xem có cần tạo dự đoán mới không
        last_prediction = ProgressPrediction.objects.filter(
            member=member
        ).order_by('-prediction_date').first()

        last_progress = WorkoutProgress.objects.filter(
            member=member,
            active=True
        ).order_by('-created_date').first()

        # Nếu không có dự đoán nào hoặc có tiến trình mới hơn dự đoán cuối cùng
        if not last_prediction or (last_progress and last_progress.created_date > last_prediction.prediction_date):
            predictor = ProgressPredictor()
            if predictor.load_model():
                try:
                    prediction = predictor.predict_for_member(member)

                    # Tạo bản ghi dự đoán mới
                    new_prediction = ProgressPrediction.objects.create(
                        member=member,
                        predicted_weight=prediction['weight'],
                        predicted_body_fat=prediction['body_fat'],
                        predicted_muscle_mass=prediction['muscle_mass'],
                        confidence=0.85,  # Có thể tính toán confidence từ validation loss
                        next_check_date=prediction['next_check_date']
                    )

                    last_prediction = new_prediction
                except Exception as e:
                    print(f"Lỗi khi dự đoán: {str(e)}")

        if not last_prediction:
            return Response(
                {"error": "Không có dữ liệu dự đoán"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Lấy lịch sử tiến trình thực tế
        progresses = WorkoutProgress.objects.filter(
            member=member,
            active=True
        ).order_by('created_date')

        progress_history = [{
            'date': p.created_date,
            'weight': float(p.weight_kg),
            'body_fat': float(p.body_fat) if p.body_fat else None,
            'muscle_mass': float(p.muscle_mass) if p.muscle_mass else None
        } for p in progresses]

        # Lấy lịch sử dự đoán trước đó
        predictions = ProgressPrediction.objects.filter(
            member=member
        ).order_by('prediction_date')

        prediction_history = [{
            'date': p.prediction_date,
            'predicted_weight': float(p.predicted_weight),
            'predicted_body_fat': float(p.predicted_body_fat) if p.predicted_body_fat else None,
            'predicted_muscle_mass': float(p.predicted_muscle_mass) if p.predicted_muscle_mass else None,
            'confidence': p.confidence,
            'next_check_date': p.next_check_date
        } for p in predictions]

        return Response({
            'current_prediction': {
                'date': last_prediction.prediction_date,
                'predicted_weight': float(last_prediction.predicted_weight),
                'predicted_body_fat': float(
                    last_prediction.predicted_body_fat) if last_prediction.predicted_body_fat else None,
                'predicted_muscle_mass': float(
                    last_prediction.predicted_muscle_mass) if last_prediction.predicted_muscle_mass else None,
                'confidence': last_prediction.confidence,
                'next_check_date': last_prediction.next_check_date
            },
            'progress_history': progress_history,
            'prediction_history': prediction_history
        })


class GenerateAllPredictionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        predictor = ProgressPredictor()
        if not predictor.load_model():
            return Response(
                {"error": "Model chưa được huấn luyện"},
                status=status.HTTP_400_BAD_REQUEST
            )

        members = Member.objects.filter(active=True)
        success_count = 0
        error_count = 0

        for member in members:
            try:
                prediction = predictor.predict_for_member(member)

                ProgressPrediction.objects.create(
                    member=member,
                    predicted_weight=prediction['weight'],
                    predicted_body_fat=prediction['body_fat'],
                    predicted_muscle_mass=prediction['muscle_mass'],
                    confidence=0.85,  # Có thể lấy từ validation loss
                    next_check_date=prediction['next_check_date']
                )
                success_count += 1
            except Exception as e:
                print(f"Không thể dự đoán cho thành viên {member.id}: {str(e)}")
                error_count += 1

        return Response({
            "status": "Predictions generated",
            "success_count": success_count,
            "error_count": error_count
        })