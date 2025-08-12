import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const VIPOffersScreen: React.FC = () => {
  const router = useRouter();

  const exclusiveOffers = [
    {
      id: '1',
      title: 'VIP Early Access',
      description: 'Get 24-hour early access to new collections',
      discount: '20% OFF',
      icon: 'star',
      color: '#FFD700',
    },
    {
      id: '2',
      title: 'Free Express Shipping',
      description: 'Complimentary next-day delivery on all orders',
      discount: 'FREE',
      icon: 'shopping-bag',
      color: '#4A90E2',
    },
    {
      id: '3',
      title: 'Exclusive Rewards',
      description: 'Earn 3x points on every purchase',
      discount: '3X POINTS',
      icon: 'gift',
      color: '#FF6B6B',
    },
    {
      id: '4',
      title: 'Personal Stylist',
      description: 'Free personal styling consultation',
      discount: 'FREE',
      icon: 'user',
      color: '#9B59B6',
    },
  ];

  const specialDeals = [
    {
      id: '1',
      title: 'Flash Sale',
      description: 'Limited time - Up to 70% off',
      timeLeft: '2:45:30',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
    },
    {
      id: '2',
      title: 'New Collection',
      description: 'Spring/Summer 2024 arrivals',
      timeLeft: '1:30:15',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=200&fit=crop',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['rgba(21, 107, 255, 0.95)', 'rgba(21, 107, 255, 0.8)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <IconSymbol name="gift" size={24} color="#FFD700" />
            <Text style={styles.headerTitle}>VIP Access</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* VIP Status Card */}
        <View style={styles.vipCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.vipGradient}
          >
            <View style={styles.vipContent}>
              <IconSymbol name="star" size={40} color="white" />
              <Text style={styles.vipTitle}>VIP Member</Text>
              <Text style={styles.vipSubtitle}>Exclusive benefits unlocked</Text>
              <View style={styles.vipStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>1,250</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>15</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>Gold</Text>
                  <Text style={styles.statLabel}>Tier</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Exclusive Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Benefits</Text>
          {exclusiveOffers.map((offer) => (
            <TouchableOpacity key={offer.id} style={styles.offerCard}>
              <View style={styles.offerIcon}>
                <IconSymbol name={offer.icon as any} size={24} color={offer.color} />
              </View>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>{offer.description}</Text>
              </View>
              <View style={styles.offerBadge}>
                <Text style={styles.offerDiscount}>{offer.discount}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Deals</Text>
          {specialDeals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 142, 142, 0.1)']}
                style={styles.dealGradient}
              >
                <View style={styles.dealContent}>
                  <View style={styles.dealText}>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealDescription}>{deal.description}</Text>
                    <View style={styles.timerContainer}>
                      <IconSymbol name="time" size={16} color="#FF6B6B" />
                      <Text style={styles.timerText}>{deal.timeLeft}</Text>
                    </View>
                  </View>
                  <View style={styles.dealAction}>
                    <TouchableOpacity style={styles.dealButton}>
                      <Text style={styles.dealButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  vipCard: {
    margin: theme.spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  vipGradient: {
    padding: theme.spacing.lg,
  },
  vipContent: {
    alignItems: 'center',
  },
  vipTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginTop: 12,
  },
  vipSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: theme.fonts.regular,
    marginTop: 4,
  },
  vipStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginBottom: 16,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  offerBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offerDiscount: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  dealCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dealGradient: {
    padding: theme.spacing.lg,
  },
  dealContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealText: {
    flex: 1,
  },
  dealTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  dealDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  dealAction: {
    marginLeft: 16,
  },
  dealButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dealButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default VIPOffersScreen; 