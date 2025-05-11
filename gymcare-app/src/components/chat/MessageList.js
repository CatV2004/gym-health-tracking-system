import React, { useRef, useEffect } from 'react';
import { FlatList, Animated, StyleSheet } from 'react-native';

const MessageList = ({ messages, renderItem, onScroll, ...props }) => {
  const listRef = useRef();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.FlatList
      ref={listRef}
      data={messages}
      renderItem={({ item, index }) => (
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [
              {
                translateY: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20 * (index + 1), 0],
                }),
              },
            ],
          }}
        >
          {renderItem({ item })}
        </Animated.View>
      )}
      keyExtractor={(item) => item.id}
      inverted={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
});

export default MessageList;