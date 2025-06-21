import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { MealAPI } from '../../services/mealApi';
import { useEffect } from 'react';

import { homeStyles } from '../../assets/styles/home.styles';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import CategoryFilter from '../components/CategoryFilter';
import RecipeCard from '../components/RecipeCard';
import { RefreshControl } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HomeScreen = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredRecipes, setFeaturedRecipes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


    const loadData = async () => {
        setLoading(true);
        try {
            const [categories, randomMeals, featuredMeals] = await Promise.all([
                MealAPI.getCategories(),
                MealAPI.getRandomMeals(12),
                MealAPI.getRandomMeal()
            ])

            const transformedCategories = categories.map((category, index) => ({
                id: index + 1,
                title: category.strCategory,
                image: category.strCategoryThumb,
                description: category.strCategoryDescription,
            }))
            setCategories(transformedCategories);
            if (!selectedCategory) setSelectedCategory(transformedCategories[0].title);

            const transformedRandomMeals = randomMeals
                .map((meal) => MealAPI.transformMealData(meal))
                .filter((meal) => meal !== null);
            setRecipes(transformedRandomMeals);

            const transformedFeaturedMeals = MealAPI.transformMealData(featuredMeals);
            setFeaturedRecipes(transformedFeaturedMeals);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }

    const loadCategoryData = async (category) => {

        try {
            const meals = await MealAPI.filterByCategory(category);
            const transformedMeals = meals.map((meal) => MealAPI.transformMealData(meal)).filter((meal) => meal !== null);
            setRecipes(transformedMeals);
        } catch (error) {
            console.error("Error loading category data:", error);
            setRecipes([])
        }
    }

    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        await loadCategoryData(category);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // await sleep(2000);
        await loadData();
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, [])

    if (loading && !refreshing) return <LoadingSpinner message="Loading delicions recipes..." />;
    return (
        <View style={homeStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                contentContainerStyle={homeStyles.scrollContent}
            >
                <View style={homeStyles.welcomeSection}>
                    <Image
                        source={require("../../assets/images/lamb.png")}
                        style={{ width: 100, height: 100 }}
                    />
                    <Image
                        source={require("../../assets/images/chicken.png")}
                        style={{ width: 100, height: 100 }}
                    />
                    <Image
                        source={require("../../assets/images/pork.png")}
                        style={{ width: 100, height: 100 }}
                    />

                </View>

                {/* featured Sections */}
                {featuredRecipes && (
                    <View style={homeStyles.featuredSection}>
                        <TouchableOpacity
                            style={homeStyles.featuredCard}
                            activeOpacity={0.9}
                            onPress={() => router.push(`/recipe/${featuredRecipes.id}`)}
                        >
                            <View style={homeStyles.featuredImageContainer}>
                                <Image
                                    source={{ uri: featuredRecipes.image }}
                                    style={homeStyles.featuredImage}
                                    contentFit='cover'
                                    transition={500}
                                />
                                <View style={homeStyles.featuredOverlay}>
                                    <View style={homeStyles.featuredBadge}>
                                        <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                                    </View>

                                    <View style={homeStyles.featuredContent}>
                                        <Text style={homeStyles.featuredTitle} numberOfLines={2}>{featuredRecipes.title}</Text>

                                        <View style={homeStyles.featuredMeta}>
                                            <View style={homeStyles.metaItem}>
                                                <Ionicons name="time-outline" size={16} color={COLORS.white} />
                                                <Text style={homeStyles.metaText}>{featuredRecipes.cookTime}</Text>
                                            </View>
                                            <View style={homeStyles.metaItem}>
                                                <Ionicons name="people-outline" size={16} color={COLORS.white} />
                                                <Text style={homeStyles.metaText}>{featuredRecipes.servings}</Text>
                                            </View>
                                            {featuredRecipes.area && (
                                                <View style={homeStyles.metaItem}>
                                                    <Ionicons name="location-outline" size={16} color={COLORS.white} />
                                                    <Text style={homeStyles.metaText}>{featuredRecipes.area}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Category Section */}
                {categories.length > 0 && (
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                    />
                )}

                <View style={homeStyles.recipesSection}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>{selectedCategory}</Text>
                    </View>


                    {
                        <FlatList
                            data={recipes}
                            renderItem={({ item }) => <RecipeCard recipe={item} />}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            columnWrapperStyle={homeStyles.row}
                            contentContainerStyle={homeStyles.recipesGrid}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <View style={homeStyles.emptyState}>
                                    <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
                                    <Text style={homeStyles.emptyTitle}>No recipes found</Text>
                                    <Text style={homeStyles.emptyDescription}>We could not find any recipes for the selected category.</Text>
                                </View>
                            }
                        />
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default HomeScreen
