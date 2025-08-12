import theme from '@/constants/theme';
import { selectCartItemCount, selectWishlistItemCount } from '@/store/cartSlice';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const cartItemCount = useSelector(selectCartItemCount);
  const wishlistItemCount = useSelector(selectWishlistItemCount);

  const getTabIcon = (routeName: string, focused: boolean) => {
    const color = focused ? theme.colors.primary : theme.colors.subtitle;
    
    switch (routeName) {
      case 'home':
        return <Ionicons name="home" size={24} color={color} />;
      case 'explore':
        return <Ionicons name="search" size={24} color={color} />;
      case 'favorites':
        return <Ionicons name="heart" size={24} color={color} />;
      case 'cart':
        return <Ionicons name="cart" size={24} color={color} />;
      case 'profile':
        return <Ionicons name="person" size={24} color={color} />;
      default:
        return <Ionicons name="home" size={24} color={color} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'home':
        return 'Home';
      case 'explore':
        return 'Explore';
      case 'favorites':
        return 'Favorites';
      case 'cart':
        return 'Cart';
      case 'profile':
        return 'Profile';
      default:
        return 'Home';
    }
  };

  const getBadgeCount = (routeName: string) => {
    switch (routeName) {
      case 'cart':
        return cartItemCount;
      case 'favorites':
        return wishlistItemCount;
      default:
        return 0;
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {

        const label = getTabLabel(route.name);
        const isFocused = state.index === index;
        const badgeCount = getBadgeCount(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {getTabIcon(route.name, isFocused)}
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.label,
              { color: isFocused ? theme.colors.primary : theme.colors.subtitle }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default CustomTabBar; 