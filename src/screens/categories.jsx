import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../services/graphql.service';
import { ProductCard } from '../components/ProductCard';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export const CategoriesScreen = () => {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [stockFilter, setStockFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract products from the response
  const products = data?.categories?.items?.[0]?.products?.items || [];
  
  // Extract unique categories from all products and separate by level
  const level2CategoriesMap = new Map();
  const level3CategoriesMap = new Map();
  
  products.forEach(product => {
    product.categories?.forEach(cat => {
      if (cat.level === 2) {
        if (!level2CategoriesMap.has(cat.id)) {
          level2CategoriesMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            product_count: cat.product_count,
            level: cat.level
          });
        }
      } else if (cat.level === 3) {
        if (!level3CategoriesMap.has(cat.id)) {
          level3CategoriesMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            product_count: cat.product_count,
            level: cat.level
          });
        }
      }
    });
  });
  
  const level2Categories = Array.from(level2CategoriesMap.values());
  const level3Categories = Array.from(level3CategoriesMap.values());
  
  // Filter subcategories based on selected parent category
  const filteredSubCategories = selectedParentCategory
    ? level3Categories.filter(subCat => {
        // Find products that have both the parent category and this subcategory
        return products.some(product => {
          const hasParent = product.categories?.some(cat => cat.name === selectedParentCategory && cat.level === 2);
          const hasSub = product.categories?.some(cat => cat.id === subCat.id && cat.level === 3);
          return hasParent && hasSub;
        });
      })
    : [];
  
  let filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'all' || p.stock_status === stockFilter;
    
    // Category filter - hierarchical filtering
    let matchesCategory = true;
    if (selectedParentCategory) {
      const hasParent = p.categories?.some(cat => cat.name === selectedParentCategory && cat.level === 2);
      if (selectedSubCategory) {
        // Both parent and subcategory selected
        const hasSub = p.categories?.some(cat => cat.name === selectedSubCategory && cat.level === 3);
        matchesCategory = hasParent && hasSub;
      } else {
        // Only parent category selected
        matchesCategory = hasParent;
      }
    }
    
    return matchesSearch && matchesStock && matchesCategory;
  });

  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      (a.price_range?.minimum_price?.regular_price?.value || 0) - (b.price_range?.minimum_price?.regular_price?.value || 0)
    );
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      (b.price_range?.minimum_price?.regular_price?.value || 0) - (a.price_range?.minimum_price?.regular_price?.value || 0)
    );
  } else if (sortBy === 'newest') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      (b.id || 0) - (a.id || 0)
    );
  } else {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }


  const renderParentCategoryTab = ({ item }) => {
    const isSelected = selectedParentCategory === item.name;
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
        onPress={() => {
          if (isSelected) {
            // Deselect parent category
            setSelectedParentCategory(null);
            setSelectedSubCategory(null);
          } else {
            // Select new parent category and clear subcategory
            setSelectedParentCategory(item.name);
            setSelectedSubCategory(null);
          }
        }}
      >
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
          {item.name}
        </Text>
        <View style={[styles.productCountBadge, isSelected && styles.productCountBadgeActive]}>
          <Text style={[styles.productCountText, isSelected && styles.productCountTextActive]}>
            {item.product_count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubCategoryTab = ({ item }) => {
    const isSelected = selectedSubCategory === item.name;
    return (
      <TouchableOpacity
        style={[styles.subCategoryTab, isSelected && styles.subCategoryTabActive]}
        onPress={() => setSelectedSubCategory(isSelected ? null : item.name)}
      >
        <Ionicons 
          name="arrow-forward" 
          size={14} 
          color={isSelected ? '#667eea' : '#999'} 
          style={styles.subCategoryIcon}
        />
        <Text style={[styles.subCategoryTabText, isSelected && styles.subCategoryTabTextActive]}>
          {item.name}
        </Text>
        <View style={[styles.subProductCountBadge, isSelected && styles.subProductCountBadgeActive]}>
          <Text style={[styles.subProductCountText, isSelected && styles.subProductCountTextActive]}>
            {item.product_count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Products</Text>
        <Text style={styles.headerSubtitle}>{filteredProducts.length} of {products.length} items</Text>
      </View>

      {/* Search Bar with Icons */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
          style={styles.filterIconButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sorting</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Sort By Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'name' && styles.filterOptionActive]}
                  onPress={() => setSortBy('name')}
                >
                  <Ionicons name="text" size={20} color={sortBy === 'name' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'name' && styles.filterOptionTextActive]}>
                    Name (A-Z)
                  </Text>
                  {sortBy === 'name' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'price-low' && styles.filterOptionActive]}
                  onPress={() => setSortBy('price-low')}
                >
                  <Ionicons name="arrow-down" size={20} color={sortBy === 'price-low' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'price-low' && styles.filterOptionTextActive]}>
                    Price: Low to High
                  </Text>
                  {sortBy === 'price-low' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'price-high' && styles.filterOptionActive]}
                  onPress={() => setSortBy('price-high')}
                >
                  <Ionicons name="arrow-up" size={20} color={sortBy === 'price-high' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'price-high' && styles.filterOptionTextActive]}>
                    Price: High to Low
                  </Text>
                  {sortBy === 'price-high' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'newest' && styles.filterOptionActive]}
                  onPress={() => setSortBy('newest')}
                >
                  <Ionicons name="time" size={20} color={sortBy === 'newest' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'newest' && styles.filterOptionTextActive]}>
                    Newest First
                  </Text>
                  {sortBy === 'newest' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>
              </View>

              {/* Stock Status Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Availability</Text>
                <TouchableOpacity
                  style={[styles.filterOption, stockFilter === 'all' && styles.filterOptionActive]}
                  onPress={() => setStockFilter('all')}
                >
                  <Ionicons name="apps" size={20} color={stockFilter === 'all' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, stockFilter === 'all' && styles.filterOptionTextActive]}>
                    All Products
                  </Text>
                  {stockFilter === 'all' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, stockFilter === 'IN_STOCK' && styles.filterOptionActive]}
                  onPress={() => setStockFilter('IN_STOCK')}
                >
                  <Ionicons name="checkmark-circle" size={20} color={stockFilter === 'IN_STOCK' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, stockFilter === 'IN_STOCK' && styles.filterOptionTextActive]}>
                    In Stock Only
                  </Text>
                  {stockFilter === 'IN_STOCK' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Parent Categories (Level 2) */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.categoryLabel}>Categories</Text>
        <FlatList
          horizontal
          data={level2Categories}
          keyExtractor={(item, index) => `parent-${item.id}-${index}`}
          renderItem={renderParentCategoryTab}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        />
      </View>

      {/* Subcategories (Level 3) - Only show when parent category is selected */}
      {selectedParentCategory && filteredSubCategories.length > 0 && (
        <View style={styles.subCategoriesContainer}>
          <View style={styles.subCategoryHeader}>
            <Text style={styles.subCategoryLabel}>
              {selectedParentCategory} » Subcategories
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setSelectedParentCategory(null);
                setSelectedSubCategory(null);
              }}
              style={styles.clearCategoryButton}
            >
              <Ionicons name="close-circle" size={18} color="#667eea" />
              <Text style={styles.clearCategoryText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={filteredSubCategories}
            keyExtractor={(item, index) => `sub-${item.id}-${index}`}
            renderItem={renderSubCategoryTab}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          />
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  filterSection: {
    marginVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryTabActive: {
    backgroundColor: '#667eea',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  productCountBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  productCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  productCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  productCountTextActive: {
    color: '#ffffff',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subCategoriesContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subCategoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  subCategoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  subCategoryTabActive: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  subCategoryIcon: {
    marginRight: 6,
  },
  subCategoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginRight: 6,
  },
  subCategoryTabTextActive: {
    color: '#667eea',
  },
  subProductCountBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  subProductCountBadgeActive: {
    backgroundColor: '#667eea',
  },
  subProductCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  subProductCountTextActive: {
    color: '#ffffff',
  },
  productsContainer: {
    padding: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
