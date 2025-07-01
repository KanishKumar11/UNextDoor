import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../shared/context/ThemeContext';
import SafeAreaWrapper from '../../../../shared/components/SafeAreaWrapper';
import { 
  Container, 
  Row, 
  Column, 
  Spacer, 
  Text, 
  Heading, 
  ModernCard, 
  ModernButton,
  ModernAvatar,
  Divider
} from '../../../../shared/components';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Product Detail Screen
 * Displays detailed information about a product
 */
export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample products data
  const allProducts = [
    {
      id: 'p1',
      title: 'iPhone 13 Pro',
      price: 899,
      category: 'electronics',
      condition: 'Like New',
      description: 'iPhone 13 Pro in excellent condition. Comes with original box, charger, and accessories. No scratches or dents. Battery health at 95%.',
      images: [
        'https://placehold.co/400x400/2196F3/FFFFFF?text=iPhone+1',
        'https://placehold.co/400x400/2196F3/FFFFFF?text=iPhone+2',
        'https://placehold.co/400x400/2196F3/FFFFFF?text=iPhone+3',
      ],
      location: 'Seoul, Korea',
      postedDate: '2023-05-15',
      seller: {
        id: 'u1',
        name: 'John Doe',
        avatar: 'https://placehold.co/200x200/E91E63/FFFFFF?text=JD',
        rating: 4.8,
        joinedDate: '2022-01-10',
      },
    },
    {
      id: 'p2',
      title: 'Nike Air Max',
      price: 120,
      category: 'clothing',
      condition: 'Good',
      description: 'Nike Air Max shoes, size US 9. Worn a few times but still in good condition. Original box included.',
      images: [
        'https://placehold.co/400x400/FF9800/FFFFFF?text=Nike+1',
        'https://placehold.co/400x400/FF9800/FFFFFF?text=Nike+2',
      ],
      location: 'Busan, Korea',
      postedDate: '2023-06-20',
      seller: {
        id: 'u2',
        name: 'Jane Smith',
        avatar: 'https://placehold.co/200x200/9C27B0/FFFFFF?text=JS',
        rating: 4.5,
        joinedDate: '2021-11-05',
      },
    },
    {
      id: 'p3',
      title: 'Coffee Table',
      price: 75,
      category: 'home',
      condition: 'Used',
      description: 'Wooden coffee table in rustic style. Some signs of use but sturdy and functional. Dimensions: 120x60x45 cm.',
      images: [
        'https://placehold.co/400x400/4CAF50/FFFFFF?text=Table+1',
        'https://placehold.co/400x400/4CAF50/FFFFFF?text=Table+2',
        'https://placehold.co/400x400/4CAF50/FFFFFF?text=Table+3',
        'https://placehold.co/400x400/4CAF50/FFFFFF?text=Table+4',
      ],
      location: 'Incheon, Korea',
      postedDate: '2023-07-05',
      seller: {
        id: 'u3',
        name: 'Robert Kim',
        avatar: 'https://placehold.co/200x200/3F51B5/FFFFFF?text=RK',
        rating: 4.9,
        joinedDate: '2022-03-15',
      },
    },
  ];
  
  // Find product by ID
  const product = allProducts.find(p => p.id === id);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // If product not found
  if (!product && !isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error[500]} />
            <Spacer size="md" />
            <Heading level="h2" gutterBottom>Product Not Found</Heading>
            <Text color="neutral.600" gutterBottom textAlign="center">
              The product you're looking for doesn't exist or has been removed.
            </Text>
            <Spacer size="lg" />
            <ModernButton
              text="Back to Marketplace"
              variant="outline"
              iconName="arrow-back-outline"
              onPress={() => router.push('/marketplace')}
            />
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Spacer size="md" />
            <Text>Loading product details...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }
  
  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image gallery */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ height: width * 0.8 }}
          >
            {product.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: width * 0.8 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Product info */}
          <Column style={{ padding: theme.spacing.lg }}>
            <Row justify="space-between" align="center">
              <Heading level="h1">{product.title}</Heading>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.neutral[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="heart-outline" size={24} color={theme.colors.neutral[700]} />
              </TouchableOpacity>
            </Row>
            
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.colors.primary[500],
                marginTop: theme.spacing.sm,
              }}
            >
              ${product.price}
            </Text>
            
            <Row align="center" style={{ marginTop: theme.spacing.sm }}>
              <ModernButton
                text={product.condition}
                variant="outline"
                size="sm"
                style={{ marginRight: theme.spacing.sm }}
              />
              
              <Row align="center">
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={theme.colors.neutral[500]}
                />
                <Text color="neutral.500" style={{ marginLeft: 4 }}>
                  {product.location}
                </Text>
              </Row>
              
              <Spacer flex={1} />
              
              <Text color="neutral.500">
                Posted {formatDate(product.postedDate)}
              </Text>
            </Row>
            
            <Divider style={{ marginVertical: theme.spacing.lg }} />
            
            {/* Description */}
            <Heading level="h3" gutterBottom>Description</Heading>
            <Text color="neutral.700" style={{ lineHeight: 22 }}>
              {product.description}
            </Text>
            
            <Divider style={{ marginVertical: theme.spacing.lg }} />
            
            {/* Seller info */}
            <Heading level="h3" gutterBottom>Seller</Heading>
            <Row align="center">
              <ModernAvatar
                source={{ uri: product.seller.avatar }}
                size="md"
                style={{ marginRight: theme.spacing.md }}
              />
              
              <Column style={{ flex: 1 }}>
                <Text weight="semibold">{product.seller.name}</Text>
                <Row align="center">
                  <Ionicons
                    name="star"
                    size={16}
                    color={theme.colors.warning[500]}
                  />
                  <Text color="neutral.700" style={{ marginLeft: 4 }}>
                    {product.seller.rating} • Joined {formatDate(product.seller.joinedDate)}
                  </Text>
                </Row>
              </Column>
              
              <ModernButton
                text="View Profile"
                variant="outline"
                size="sm"
              />
            </Row>
            
            <Spacer size="xl" />
            
            {/* Action buttons */}
            <Row>
              <ModernButton
                text="Message Seller"
                variant="solid"
                iconName="chatbubble-outline"
                style={{ flex: 1, marginRight: theme.spacing.sm }}
              />
              
              <ModernButton
                text="Make Offer"
                variant="outline"
                iconName="pricetag-outline"
                style={{ flex: 1, marginLeft: theme.spacing.sm }}
              />
            </Row>
            
            <Spacer size="lg" />
          </Column>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
