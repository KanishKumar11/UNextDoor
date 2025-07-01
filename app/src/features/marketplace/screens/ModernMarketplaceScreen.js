import React, { useState, useEffect } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';

// Import modern components
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernHeader,
  ModernBadge,
  ModernButton,
} from '../../../shared/components';

/**
 * ModernMarketplaceScreen component
 * A modern implementation of the marketplace screen
 */
const ModernMarketplaceScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState(sampleProducts);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter products based on search query and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sample categories
  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'electronics', name: 'Electronics', icon: 'laptop-outline' },
    { id: 'clothing', name: 'Clothing', icon: 'shirt-outline' },
    { id: 'home', name: 'Home', icon: 'home-outline' },
    { id: 'sports', name: 'Sports', icon: 'football-outline' },
    { id: 'books', name: 'Books', icon: 'book-outline' },
  ];
  
  // Sample products
  const sampleProducts = [
    {
      id: '1',
      title: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 99.99,
      category: 'electronics',
      image: 'https://via.placeholder.com/150',
      rating: 4.5,
      reviews: 128,
    },
    {
      id: '2',
      title: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear',
      price: 19.99,
      category: 'clothing',
      image: 'https://via.placeholder.com/150',
      rating: 4.2,
      reviews: 85,
    },
    {
      id: '3',
      title: 'Coffee Maker',
      description: 'Automatic coffee maker with timer',
      price: 49.99,
      category: 'home',
      image: 'https://via.placeholder.com/150',
      rating: 4.0,
      reviews: 64,
    },
    {
      id: '4',
      title: 'Yoga Mat',
      description: 'Non-slip yoga mat for home workouts',
      price: 29.99,
      category: 'sports',
      image: 'https://via.placeholder.com/150',
      rating: 4.7,
      reviews: 42,
    },
    {
      id: '5',
      title: 'Novel Collection',
      description: 'Collection of bestselling novels',
      price: 39.99,
      category: 'books',
      image: 'https://via.placeholder.com/150',
      rating: 4.8,
      reviews: 56,
    },
    {
      id: '6',
      title: 'Smart Watch',
      description: 'Fitness tracker and smart watch',
      price: 129.99,
      category: 'electronics',
      image: 'https://via.placeholder.com/150',
      rating: 4.3,
      reviews: 97,
    },
  ];
  
  // Render product item
  const renderProductItem = ({ item }) => (
    <ModernCard
      interactive
      onPress={() => router.push({
        pathname: '/marketplace/product',
        params: { productId: item.id },
      })}
      style={styles.productCard}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={theme.colors.accent[500]} />
          <Text variant="caption" weight="medium" style={styles.ratingText}>
            {item.rating}
          </Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text weight="semibold" numberOfLines={1} style={styles.productTitle}>
          {item.title}
        </Text>
        
        <Text variant="caption" numberOfLines={2} style={styles.productDescription}>
          {item.description}
        </Text>
        
        <Row justify="space-between" align="center" style={styles.productFooter}>
          <Text weight="bold" color={theme.colors.primary[700]}>
            ${item.price.toFixed(2)}
          </Text>
          
          <ModernBadge
            variant="subtle"
            color="info"
            size="sm"
          >
            {item.reviews} reviews
          </ModernBadge>
        </Row>
      </View>
    </ModernCard>
  );
  
  return (
    <Container>
      <ModernHeader
        title="Marketplace"
        subtitle="Find and buy products"
        showBackButton={false}
      />
      
      <View style={styles.content}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.text.secondary}
            style={styles.searchIcon}
          />
          
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.text.hint}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={
                  selectedCategory === category.id
                    ? theme.colors.primary[500]
                    : theme.colors.text.secondary
                }
                style={styles.categoryIcon}
              />
              
              <Text
                variant="caption"
                weight={selectedCategory === category.id ? 'semibold' : 'regular'}
                color={
                  selectedCategory === category.id
                    ? theme.colors.primary[500]
                    : theme.colors.text.secondary
                }
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Products grid */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsContainer}
          columnWrapperStyle={styles.productsRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search"
                size={48}
                color={theme.colors.neutral[300]}
              />
              <Text
                variant="body"
                color={theme.colors.text.secondary}
                align="center"
                style={styles.emptyText}
              >
                No products found
              </Text>
            </View>
          }
        />
        
        {/* Floating action button */}
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={() => router.push('/marketplace/new')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  categoryIcon: {
    marginRight: 4,
  },
  productsContainer: {
    paddingBottom: 80, // Space for FAB
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    marginLeft: 2,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    marginBottom: 4,
  },
  productDescription: {
    marginBottom: 8,
    height: 32, // Fixed height for 2 lines
  },
  productFooter: {
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ModernMarketplaceScreen;
