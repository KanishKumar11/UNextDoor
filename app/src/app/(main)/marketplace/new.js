import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../shared/context/ThemeContext';
import SafeAreaWrapper from '../../../shared/components/SafeAreaWrapper';
import { 
  Container, 
  Row, 
  Column, 
  Spacer, 
  Text, 
  Heading, 
  ModernCard, 
  ModernButton,
  Divider
} from '../../../shared/components';
import { Ionicons } from '@expo/vector-icons';

/**
 * New Product Listing Screen
 * Allows users to create a new product listing
 */
export default function NewProductScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State for form fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  
  // Sample categories
  const categories = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home' },
    { id: 'sports', name: 'Sports' },
    { id: 'books', name: 'Books' },
    { id: 'other', name: 'Other' },
  ];
  
  // Sample conditions
  const conditions = [
    { id: 'new', name: 'New' },
    { id: 'like_new', name: 'Like New' },
    { id: 'good', name: 'Good' },
    { id: 'used', name: 'Used' },
    { id: 'for_parts', name: 'For Parts' },
  ];
  
  // Handle add image
  const handleAddImage = () => {
    // In a real app, this would open the image picker
    console.log('Adding image');
    
    // Simulate adding an image
    const newImage = `https://placehold.co/400x400/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=Image+${images.length + 1}`;
    setImages([...images, newImage]);
  };
  
  // Handle remove image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Handle submit
  const handleSubmit = () => {
    // Validate form
    if (!title || !price || !category || !condition || !description || !location || images.length === 0) {
      // Show error
      console.log('Please fill all required fields');
      return;
    }
    
    // In a real app, this would call an API to create the listing
    console.log('Creating listing:', {
      title,
      price,
      category,
      condition,
      description,
      location,
      images,
    });
    
    // Navigate back to marketplace
    router.push('/marketplace');
  };
  
  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Column style={{ padding: theme.spacing.lg }}>
            <Row justify="space-between" align="center" style={{ marginBottom: theme.spacing.lg }}>
              <Heading level="h1">New Listing</Heading>
              
              <ModernButton
                variant="text"
                text="Cancel"
                onPress={() => router.back()}
              />
            </Row>
            
            {/* Images */}
            <Heading level="h3" gutterBottom>Photos</Heading>
            <Text color="neutral.600" gutterBottom>
              Add up to 10 photos of your item
            </Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: theme.spacing.md }}
            >
              {/* Add image button */}
              <TouchableOpacity
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.neutral[300],
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md,
                }}
                onPress={handleAddImage}
              >
                <Ionicons
                  name="add"
                  size={32}
                  color={theme.colors.neutral[400]}
                />
                <Text color="neutral.500" variant="caption">
                  Add Photo
                </Text>
              </TouchableOpacity>
              
              {/* Image previews */}
              {images.map((image, index) => (
                <View
                  key={index}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    marginRight: theme.spacing.md,
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: theme.colors.neutral[800],
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <Divider style={{ marginVertical: theme.spacing.md }} />
            
            {/* Title */}
            <Heading level="h3" gutterBottom>Title</Heading>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[300],
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                fontSize: theme.typography.fontSize.md,
                marginBottom: theme.spacing.lg,
              }}
              placeholder="What are you selling?"
              value={title}
              onChangeText={setTitle}
            />
            
            {/* Price */}
            <Heading level="h3" gutterBottom>Price</Heading>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[300],
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                fontSize: theme.typography.fontSize.md,
                marginBottom: theme.spacing.lg,
              }}
              placeholder="$0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            
            {/* Category */}
            <Heading level="h3" gutterBottom>Category</Heading>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.lg }}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    borderWidth: 1,
                    borderColor: category === item.id 
                      ? theme.colors.primary[500] 
                      : theme.colors.neutral[300],
                    backgroundColor: category === item.id 
                      ? theme.colors.primary[50] 
                      : 'transparent',
                    borderRadius: theme.borderRadius.full,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    marginRight: theme.spacing.sm,
                    marginBottom: theme.spacing.sm,
                  }}
                  onPress={() => setCategory(item.id)}
                >
                  <Text 
                    color={category === item.id ? 'primary.500' : 'neutral.700'}
                    weight={category === item.id ? 'medium' : 'regular'}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Condition */}
            <Heading level="h3" gutterBottom>Condition</Heading>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.lg }}>
              {conditions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    borderWidth: 1,
                    borderColor: condition === item.id 
                      ? theme.colors.primary[500] 
                      : theme.colors.neutral[300],
                    backgroundColor: condition === item.id 
                      ? theme.colors.primary[50] 
                      : 'transparent',
                    borderRadius: theme.borderRadius.full,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    marginRight: theme.spacing.sm,
                    marginBottom: theme.spacing.sm,
                  }}
                  onPress={() => setCondition(item.id)}
                >
                  <Text 
                    color={condition === item.id ? 'primary.500' : 'neutral.700'}
                    weight={condition === item.id ? 'medium' : 'regular'}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Description */}
            <Heading level="h3" gutterBottom>Description</Heading>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[300],
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                fontSize: theme.typography.fontSize.md,
                height: 120,
                textAlignVertical: 'top',
                marginBottom: theme.spacing.lg,
              }}
              placeholder="Describe your item (condition, features, etc.)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            
            {/* Location */}
            <Heading level="h3" gutterBottom>Location</Heading>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[300],
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                fontSize: theme.typography.fontSize.md,
                marginBottom: theme.spacing.lg,
              }}
              placeholder="Where is your item located?"
              value={location}
              onChangeText={setLocation}
            />
            
            <Spacer size="lg" />
            
            {/* Submit button */}
            <ModernButton
              text="Create Listing"
              variant="solid"
              iconName="checkmark-circle-outline"
              onPress={handleSubmit}
            />
            
            <Spacer size="lg" />
          </Column>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
