import { AntDesign, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';

export type IconName = 
  // Navigation & UI
  | 'home' | 'heart' | 'cart' | 'user' | 'profile' | 'settings' | 'search' | 'close' | 'back' | 'forward'
  // Actions
  | 'add' | 'remove' | 'edit' | 'delete' | 'share' | 'favorite' | 'unfavorite' | 'star' | 'star-outline'
  // Arrows
  | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down'
  | 'arrow-back' | 'arrow-forward'
  // Status
  | 'check' | 'checkmark' | 'error' | 'warning' | 'info' | 'success'
  // Shopping
  | 'shopping-bag' | 'shopping-cart' | 'gift' | 'tag' | 'price-tag' | 'discount'
  // Communication
  | 'mail' | 'phone' | 'message' | 'chat' | 'notification' | 'bell'
  // Media
  | 'play' | 'pause' | 'stop' | 'volume' | 'mute' | 'camera' | 'image' | 'video'
  // Social
  | 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'linkedin'
  // Layout & UI
  | 'grid' | 'list' | 'funnel' | 'options' | 'trending-up' | 'newspaper' | 'pricetag'
  // Misc
  | 'menu' | 'more' | 'dots' | 'calendar' | 'clock' | 'location' | 'map' | 'flag' | 'globe' | 'lock' | 'unlock'
  // Additional icons
  | 'body' | 'time' | 'sync' | 'notifications' | 'thumb-up' | 'help-circle' | 'car';

export type IconSet = 'ionicons' | 'material' | 'fontawesome' | 'fontawesome5' | 'antdesign' | 'feather' | 'materialcommunity';

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  iconSet?: IconSet;
}

const ICON_MAPPING: Record<IconName, { set: IconSet; name: string }> = {
  // Navigation & UI
  home: { set: 'ionicons', name: 'home' },
  heart: { set: 'ionicons', name: 'heart' },
  cart: { set: 'ionicons', name: 'cart' },
  user: { set: 'ionicons', name: 'person' },
  profile: { set: 'ionicons', name: 'person-circle' },
  settings: { set: 'ionicons', name: 'settings' },
  search: { set: 'ionicons', name: 'search' },
  close: { set: 'ionicons', name: 'close' },
  back: { set: 'ionicons', name: 'arrow-back' },
  forward: { set: 'ionicons', name: 'arrow-forward' },
  
  // Actions
  add: { set: 'ionicons', name: 'add' },
  remove: { set: 'ionicons', name: 'remove' },
  edit: { set: 'ionicons', name: 'create' },
  delete: { set: 'ionicons', name: 'trash' },
  share: { set: 'ionicons', name: 'share' },
  favorite: { set: 'ionicons', name: 'heart' },
  unfavorite: { set: 'ionicons', name: 'heart-outline' },
  star: { set: 'ionicons', name: 'star' },
  'star-outline': { set: 'ionicons', name: 'star-outline' },
  
  // Arrows
  'arrow-right': { set: 'ionicons', name: 'arrow-forward' },
  'arrow-left': { set: 'ionicons', name: 'arrow-back' },
  'arrow-up': { set: 'ionicons', name: 'arrow-up' },
  'arrow-down': { set: 'ionicons', name: 'arrow-down' },
  'arrow-back': { set: 'ionicons', name: 'arrow-back' },
  'arrow-forward': { set: 'ionicons', name: 'arrow-forward' },
  'chevron-right': { set: 'ionicons', name: 'chevron-forward' },
  'chevron-left': { set: 'ionicons', name: 'chevron-back' },
  'chevron-up': { set: 'ionicons', name: 'chevron-up' },
  'chevron-down': { set: 'ionicons', name: 'chevron-down' },
  
  // Status
  check: { set: 'ionicons', name: 'checkmark' },
  checkmark: { set: 'ionicons', name: 'checkmark-circle' },
  error: { set: 'ionicons', name: 'close-circle' },
  warning: { set: 'ionicons', name: 'warning' },
  info: { set: 'ionicons', name: 'information-circle' },
  success: { set: 'ionicons', name: 'checkmark-circle' },
  
  // Shopping
  'shopping-bag': { set: 'ionicons', name: 'bag' },
  'shopping-cart': { set: 'ionicons', name: 'cart' },
  gift: { set: 'ionicons', name: 'gift' },
  tag: { set: 'ionicons', name: 'pricetag' },
  'price-tag': { set: 'ionicons', name: 'pricetag' },
  discount: { set: 'ionicons', name: 'pricetag-outline' },
  
  // Communication
  mail: { set: 'ionicons', name: 'mail' },
  phone: { set: 'ionicons', name: 'call' },
  message: { set: 'ionicons', name: 'chatbubble' },
  chat: { set: 'ionicons', name: 'chatbubbles' },
  notification: { set: 'ionicons', name: 'notifications' },
  bell: { set: 'ionicons', name: 'notifications-outline' },
  
  // Media
  play: { set: 'ionicons', name: 'play' },
  pause: { set: 'ionicons', name: 'pause' },
  stop: { set: 'ionicons', name: 'stop' },
  volume: { set: 'ionicons', name: 'volume-high' },
  mute: { set: 'ionicons', name: 'volume-mute' },
  camera: { set: 'ionicons', name: 'camera' },
  image: { set: 'ionicons', name: 'image' },
  video: { set: 'ionicons', name: 'videocam' },
  
  // Social
  facebook: { set: 'fontawesome', name: 'facebook' },
  twitter: { set: 'fontawesome', name: 'twitter' },
  instagram: { set: 'fontawesome', name: 'instagram' },
  youtube: { set: 'fontawesome', name: 'youtube-play' },
  linkedin: { set: 'fontawesome', name: 'linkedin' },
  
  // Layout & UI
  grid: { set: 'ionicons', name: 'grid' },
  list: { set: 'ionicons', name: 'list' },
  funnel: { set: 'ionicons', name: 'funnel' },
  options: { set: 'ionicons', name: 'options' },
  'trending-up': { set: 'ionicons', name: 'trending-up' },
  'newspaper': { set: 'ionicons', name: 'newspaper' },
  'pricetag': { set: 'ionicons', name: 'pricetag' },
  
  // Misc
  menu: { set: 'ionicons', name: 'menu' },
  more: { set: 'ionicons', name: 'ellipsis-horizontal' },
  dots: { set: 'ionicons', name: 'ellipsis-vertical' },
  calendar: { set: 'ionicons', name: 'calendar' },
  clock: { set: 'ionicons', name: 'time' },
  location: { set: 'ionicons', name: 'location' },
  map: { set: 'ionicons', name: 'map' },
  flag: { set: 'ionicons', name: 'flag' },
  globe: { set: 'ionicons', name: 'globe' },
  lock: { set: 'ionicons', name: 'lock-closed' },
  unlock: { set: 'ionicons', name: 'lock-open' },
  
  // Additional icons
  body: { set: 'ionicons', name: 'person' },
  time: { set: 'ionicons', name: 'time' },
  sync: { set: 'ionicons', name: 'sync' },
  notifications: { set: 'ionicons', name: 'notifications' },
  'thumb-up': { set: 'ionicons', name: 'thumbs-up' },
  'help-circle': { set: 'ionicons', name: 'help-circle' },
  car: { set: 'ionicons', name: 'car' },
};

export function IconSymbol({
  name,
  size = 24,
  color = '#000',
  style,
  iconSet,
}: IconSymbolProps) {
  const iconConfig = ICON_MAPPING[name];
  const finalIconSet = iconSet || iconConfig?.set || 'ionicons';
  const iconName = iconConfig?.name || name;

  const renderIcon = () => {
    switch (finalIconSet) {
      case 'ionicons':
        return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
      case 'material':
        return <MaterialIcons name={iconName as any} size={size} color={color} style={style} />;
      case 'fontawesome':
        return <FontAwesome name={iconName as any} size={size} color={color} style={style} />;
      case 'fontawesome5':
        return <FontAwesome5 name={iconName as any} size={size} color={color} style={style} />;
      case 'antdesign':
        return <AntDesign name={iconName as any} size={size} color={color} style={style} />;
      case 'feather':
        return <Feather name={iconName as any} size={size} color={color} style={style} />;
      case 'materialcommunity':
        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
      default:
        return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
    }
  };

  return renderIcon();
}
