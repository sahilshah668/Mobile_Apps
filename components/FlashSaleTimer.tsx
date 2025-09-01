import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FlashSaleTimerProps {
  endTime?: Date;
}

const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({ 
  endTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours from now
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 58,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <IconSymbol name="time" size={16} color={theme.colors.discount} />
      <Text style={styles.timerText}>
        {formatTime(timeLeft.hours)} {formatTime(timeLeft.minutes)} {formatTime(timeLeft.seconds)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timerText: {
    fontSize: theme.fontSizes.link,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default FlashSaleTimer; 