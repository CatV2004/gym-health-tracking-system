import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';

const promotions = [
  { id: 1, title: 'Giảm 20% cho gói tập 6 tháng', image: { uri:'https://res.cloudinary.com/dohsfqs6d/image/upload/v1745381313/b42ee668-4fc4-409c-9878-7d31caa40990.png'} },
  { id: 2, title: 'Tặng áo tập khi đăng ký mới', image: { uri:'https://res.cloudinary.com/dohsfqs6d/image/upload/v1745381333/7927a690-cd71-4fa8-aaf6-008af006406c.png'} },
];

const PromotionCarousel = () => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 10 }}>Khuyến mãi</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {promotions.map((promo) => (
          <View key={promo.id} style={{ marginLeft: 16, marginRight: 8 }}>
            <Image source={promo.image} style={{ width: 280, height: 150, borderRadius: 12 }} />
            <Text style={{ marginTop: 8 }}>{promo.title}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PromotionCarousel;
