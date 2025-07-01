import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
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
  ModernButton 
} from '../../../../shared/components';
import { Ionicons } from '@expo/vector-icons';

/**
 * Category Screen
 * Displays products in a specific category
 */
export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample categories data
  const categories = {
    electronics: {
      id: 'electronics',
      name: 'Electronics',
      icon: 'laptop-outline',
      color: theme.colors.primary[500],
    },
    clothing: {
      id: 'clothing',
      name: 'Clothing',
      icon: 'shirt-outline',
      color: theme.colors.secondary[500],
    },
    home: {
      id: 'home',
      name: 'Home',
      icon: 'home-outline',
      color: theme.colors.accent[500],
    },
    sports: {
      id: 'sports',
      name: 'Sports',
      icon: 'football-outline',
      color: theme.colors.info[500],
    },
    books: {
      id: 'books',
      name: 'Books',
      icon: 'book-outline',
      color: theme.colors.warning[500],
    },
  };
  
  // Get current category
  const category = categories[id] || {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    icon: 'grid-outline',
    color: theme.colors.primary[500],
  };
  
  // Sample products data
  const allProducts = [
    {
      id: 'p1',
      title: 'iPhone 13 Pro',
      price: 899,
      category: 'electronics',
      condition: 'Like New',
      image: 'https://placehold.co/400x400/2196F3/FFFFFF?text=iPhone',
      location: 'Seoul, Korea',
    },
    {
      id: 'p2',
      title: 'Nike Air Max',
      price: 120,
      category: 'clothing',
      condition: 'Good',
      image: 'https://placehold.co/400x400/FF9800/FFFFFF?text=Nike',
      location: 'Busan, Korea',
    },
    {
      id: 'p3',
      title: 'Coffee Table',
      price: 75,
      category: 'home',
      condition: 'Used',
      image: 'https://placehold.co/400x400/4CAF50/FFFFFF?text=Table',
      location: 'Incheon, Korea',
    },
    {
      id: 'p4',
      title: 'Tennis Racket',
      price: 45,
      category: 'sports',
      condition: 'Like New',
      image: 'https://placehold.co/400x400/9C27B0/FFFFFF?text=Racket',
      location: 'Daegu, Korea',
    },
    {
      id: 'p5',
      title: 'Harry Potter Collection',
      price: 60,
      category: 'books',
      condition: 'Good',
      image: 'https://placehold.co/400x400/795548/FFFFFF?text=Books',
      location: 'Gwangju, Korea',
    },
    {
      id: 'p6',
      title: 'Samsung Galaxy S21',
      price: 650,
      category: 'electronics',
      condition: 'Used',
      image: 'https://placehold.co/400x400/2196F3/FFFFFF?text=Samsung',
      location: 'Seoul, Korea',
    },
  ];
  
  // Filter products by category
  const products = allProducts.filter(product => product.category === id);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Render product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/marketplace/product/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Row align="center">
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.neutral[500]}
          />
          <Text style={styles.productLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </Row>
        <View style={styles.productConditionBadge}>
          <Text style={styles.productConditionText}>{item.condition}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaWrapper>
      <Container>
        <Column>
          {/* Header */}
          <Row 
            align="center" 
            style={{ 
              padding: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.neutral[200],
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: category.color,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing.md,
              }}
            >
              <Ionicons name={category.icon} size={24} color="white" />
            </View>
            
            <Column>
              <Heading level="h2">{category.name}</Heading>
              <Text color="neutral.600">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </Text>
            </Column>
          </Row>
          
          {/* Products grid */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
              <Text style={{ marginTop: theme.spacing.md }}>Loading products...</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.productsContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={48} color={theme.colors.neutral[300]} />
                  <Text style={styles.emptyText}>No products found in this category</Text>
                  <ModernButton
                    text="Back to Marketplace"
                    variant="outline"
                    iconName="arrow-back-outline"
                    onPress={() => router.push('/marketplace')}
                    style={{ marginTop: theme.spacing.lg }}
                  />
                </View>
              }
            />
          )}
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  productsContainer: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  productConditionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  productConditionText: {
    fontSize: 12,
    color: 'white',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});
