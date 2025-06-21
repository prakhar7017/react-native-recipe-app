import React, { useEffect } from 'react'
import { View, Text, FlatList } from 'react-native'
import { MealAPI } from '../../services/mealApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useState } from 'react';
import { searchStyles } from '../../assets/styles/search.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from "../components/LoadingSpinner"
const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);


    const performSearch = async (query) => {

        if (!query.trim()) {
            const randomMeals = await MealAPI.getRandomMeals(12);
            return randomMeals.map(meal => MealAPI.transformMealData(meal)).filter(meal => meal !== null);
        }

        const namesResult = await MealAPI.searchMealsByName(query);
        let results = namesResult;

        if (results.length === 0) {
            const ingredientResult = await MealAPI.filterByIngredient(query);
            results = ingredientResult;
        }
        return results
            .slice(0, 12)
            .map((meal) => MealAPI.transformMealData(meal))
            .filter((meal) => meal !== null);
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const results = await performSearch("");
                setRecipes(results);
            } catch (error) {
                console.error("Error loading initial data:", error);
                setRecipes([]);
            } finally {
                setInitialLoading(false);
            }
        }
        loadInitialData();
    }, [])

    useEffect(() => {
        if (initialLoading) return;
        const handleSearch = async () => {
            setLoading(true);
            try {
                const results = await performSearch(debouncedSearchQuery);
                setRecipes(results);
            } catch (error) {
                console.error("Error searching meals:", error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        }
        handleSearch();
    }, [debouncedSearchQuery, initialLoading])


    if (initialLoading) return <LoadingSpinner message="Loading Results..." />;

    return (
        <View style={searchStyles.container}>
            <View style={searchStyles.searchSection}>
                <View style={searchStyles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textLight} style={searchStyles.searchIcon} />
                    <TextInput
                        placeholder="Search recipes by name or ingredient"
                        placeholderTextColor={COLORS.textLight}
                        style={searchStyles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType='search'
                    />
                    {
                        searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={searchStyles.clearButton}
                                onPress={() => setSearchQuery('')}
                            >
                                <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>

            <View style={searchStyles.resultsSection}>
                <View style={searchStyles.resultsHeader}>
                    <Text style={searchStyles.resultsTitle}>{
                        searchQuery.length > 0 ? `Results for "${searchQuery}"` : "All Recipes"
                    }</Text>
                    <Text style={searchStyles.resultsCount}>{recipes.length} recipes found</Text>

                </View>
                {
                loading ? (
                    <View style={searchStyles.loadingContainer}>
                        <LoadingSpinner message="Loading Results..."  size='small'/>
                    </View>
                ) :(
                    <FlatList 
                    data={recipes}
                    renderItem={({item}) => (<RecipeCard recipe={item}/>)}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={searchStyles.row}
                    contentContainerStyle={searchStyles.recipesGrid}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text>No recipes found</Text>}
                    />
                )
            }
            </View>
        </View>
    )

}
export default SearchScreen