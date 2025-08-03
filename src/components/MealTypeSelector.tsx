import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealTypeSelectorProps {
  selectedMealType: MealType;
  onMealTypeChange: (mealType: MealType) => void;
}

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedMealType,
  onMealTypeChange,
}) => {
  const mealTypes = useMemo(
    () => [
      { value: 'breakfast' as MealType, label: 'Breakfast' },
      { value: 'lunch' as MealType, label: 'Lunch' },
      { value: 'dinner' as MealType, label: 'Dinner' },
    ],
    [],
  );

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate to the selected position
  useEffect(() => {
    const selectedIndex = mealTypes.findIndex(
      meal => meal.value === selectedMealType,
    );

    Animated.timing(slideAnim, {
      toValue: selectedIndex,
      useNativeDriver: false,
      duration: 200,
    }).start();
  }, [selectedMealType, slideAnim, mealTypes]);

  return (
    <View style={styles.container}>
      {/* Animated background indicator */}
      <Animated.View
        style={[
          styles.animatedBackground,
          {
            left: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: ['0%', '33.33%', '66.67%'],
            }),
          },
        ]}
      />

      {mealTypes.map(mealType => (
        <TouchableOpacity
          key={mealType.value}
          style={[
            styles.segment,
            selectedMealType === mealType.value && styles.selectedSegment,
          ]}
          onPress={() => onMealTypeChange(mealType.value)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              selectedMealType === mealType.value && styles.selectedSegmentText,
            ]}
          >
            {mealType.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 4,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    elevation: 5,
    position: 'relative',
  },
  animatedBackground: {
    position: 'absolute',
    top: 4,
    marginLeft: 4,
    bottom: 4,
    width: '33.33%',
    backgroundColor: '#0171EA',
    borderRadius: 21,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectedSegment: {
    backgroundColor: 'transparent', // Remove background since we have animated background
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5a6c7d', // Darker blue-gray for unselected text
  },
  selectedSegmentText: {
    color: '#ffffff', // White text for selected segment
    fontWeight: '700',
  },
});
