import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedText from '../../components/ThemedText';
import { GeminiAIService } from '../../services/GeminiAIService';

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MovieRecommendation {
  title: string;
  year: string;
  genre: string;
  description: string;
  rating: string;
}

interface UserPreferences {
  favoriteGenres: string[];
  ageRange: string;
  interests: string[];
  movieTypes: string[];
}

type QuestionStep = 'genres' | 'age' | 'interests' | 'movieTypes' | 'complete';

export default function TriviaScreen() {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<'preferences' | 'selection' | 'trivia' | 'movies'>('preferences');
  const [questionStep, setQuestionStep] = useState<QuestionStep>('genres');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteGenres: [],
    ageRange: '',
    interests: [],
    movieTypes: [],
  });
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [movieRecommendations, setMovieRecommendations] = useState<MovieRecommendation[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const genreOptions = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary'];
  const ageOptions = ['18-25', '26-35', '36-45', '46-55', '55+'];
  const interestOptions = ['Adventure', 'Mystery', 'Fantasy', 'Historical', 'Crime', 'Family', 'Musical', 'War'];
  const movieTypeOptions = ['Blockbusters', 'Indie Films', 'Foreign Films', 'Classic Movies', 'New Releases', 'Series'];

  const generatePersonalizedContent = async () => {
    setLoading(true);
    try {
      const geminiService = new GeminiAIService();
      
      // Generate trivia questions with fallback
      let triviaData;
      try {
        const triviaPrompt = `Create 5 engaging trivia questions based on these preferences:
        - Favorite genres: ${preferences.favoriteGenres.join(', ')}
        - Age range: ${preferences.ageRange}
        - Interests: ${preferences.interests.join(', ')}
        - Movie types: ${preferences.movieTypes.join(', ')}
        
        Return ONLY a valid JSON array with this exact structure:
        [
          {
            "question": "What movie won the Academy Award for Best Picture in 2020?",
            "options": ["Parasite", "1917", "Joker", "Once Upon a Time in Hollywood"],
            "correctAnswer": 0,
            "explanation": "Parasite made history as the first non-English language film to win Best Picture."
          }
        ]
        
        Make questions relevant to their interests but accessible. No additional text outside the JSON.`;

        const triviaResponse = await geminiService.generateContent(triviaPrompt);
        triviaData = JSON.parse(triviaResponse.replace(/```json|```/g, '').trim());
      } catch (error) {
        console.log('Using fallback trivia questions');
        triviaData = getFallbackTriviaQuestions();
      }
      
      setTriviaQuestions(triviaData);

      // Generate movie recommendations with fallback
      let movieData;
      try {
        const moviePrompt = `Recommend 5 movies based on these preferences:
        - Favorite genres: ${preferences.favoriteGenres.join(', ')}
        - Age range: ${preferences.ageRange}
        - Interests: ${preferences.interests.join(', ')}
        - Movie types: ${preferences.movieTypes.join(', ')}
        
        Return ONLY a valid JSON array with this exact structure:
        [
          {
            "title": "The Matrix",
            "year": "1999",
            "genre": "Sci-Fi",
            "description": "Perfect blend of action and philosophical themes that match your interests.",
            "rating": "8.7/10"
          }
        ]
        
        No additional text outside the JSON.`;

        const movieResponse = await geminiService.generateContent(moviePrompt);
        movieData = JSON.parse(movieResponse.replace(/```json|```/g, '').trim());
      } catch (error) {
        console.log('Using fallback movie recommendations');
        movieData = getFallbackMovieRecommendations();
      }
      
      setMovieRecommendations(movieData);
      setCurrentStep('selection');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content. Using default recommendations.');
      setTriviaQuestions(getFallbackTriviaQuestions());
      setMovieRecommendations(getFallbackMovieRecommendations());
      setCurrentStep('selection');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTriviaQuestions = (): TriviaQuestion[] => [
    {
      question: "Which movie franchise features the character Neo?",
      options: ["The Matrix", "John Wick", "Speed", "Constantine"],
      correctAnswer: 0,
      explanation: "Neo is the main character in The Matrix trilogy, played by Keanu Reeves."
    },
    {
      question: "What is the highest-grossing film of all time?",
      options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars: The Force Awakens"],
      correctAnswer: 2,
      explanation: "Avengers: Endgame became the highest-grossing film worldwide with over $2.7 billion."
    },
    {
      question: "Which director is known for films like 'Inception' and 'The Dark Knight'?",
      options: ["Steven Spielberg", "Christopher Nolan", "Martin Scorsese", "Quentin Tarantino"],
      correctAnswer: 1,
      explanation: "Christopher Nolan is famous for his complex, mind-bending films including Inception and The Dark Knight trilogy."
    },
    {
      question: "What year was the first iPhone released?",
      options: ["2005", "2006", "2007", "2008"],
      correctAnswer: 2,
      explanation: "Apple released the first iPhone on June 29, 2007, revolutionizing the smartphone industry."
    },
    {
      question: "Which streaming service produced 'Stranger Things'?",
      options: ["Netflix", "Amazon Prime", "Disney+", "HBO Max"],
      correctAnswer: 0,
      explanation: "Stranger Things is a Netflix original series that premiered in 2016."
    }
  ];

  const getFallbackMovieRecommendations = (): MovieRecommendation[] => [
    {
      title: "The Shawshank Redemption",
      year: "1994",
      genre: "Drama",
      description: "A timeless story of hope and friendship that appeals to all audiences.",
      rating: "9.3/10"
    },
    {
      title: "Inception",
      year: "2010",
      genre: "Sci-Fi",
      description: "Mind-bending thriller perfect for those who enjoy complex narratives.",
      rating: "8.8/10"
    },
    {
      title: "The Grand Budapest Hotel",
      year: "2014",
      genre: "Comedy",
      description: "Whimsical and visually stunning film with quirky humor.",
      rating: "8.1/10"
    },
    {
      title: "Mad Max: Fury Road",
      year: "2015",
      genre: "Action",
      description: "High-octane action film with incredible practical effects.",
      rating: "8.1/10"
    },
    {
      title: "Parasite",
      year: "2019",
      genre: "Thriller",
      description: "Award-winning film that masterfully blends genres and social commentary.",
      rating: "8.6/10"
    }
  ];

  const handleGenreToggle = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleMovieTypeToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      movieTypes: prev.movieTypes.includes(type)
        ? prev.movieTypes.filter(t => t !== type)
        : [...prev.movieTypes, type]
    }));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === triviaQuestions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < triviaQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Move to movies section
      setCurrentStep('movies');
    }
  };

  const resetTrivia = () => {
    setCurrentStep('preferences');
    setQuestionStep('genres');
    setPreferences({
      favoriteGenres: [],
      ageRange: '',
      interests: [],
      movieTypes: [],
    });
    setTriviaQuestions([]);
    setMovieRecommendations([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSelectedAnswers([]);
    setScore(0);
  };

  const handleSectionChoice = (section: 'trivia' | 'movies') => {
    setCurrentStep(section);
  };

  const nextQuestionStep = () => {
    if (questionStep === 'genres' && preferences.favoriteGenres.length > 0) {
      setQuestionStep('age');
    } else if (questionStep === 'age' && preferences.ageRange) {
      setQuestionStep('interests');
    } else if (questionStep === 'interests' && preferences.interests.length > 0) {
      setQuestionStep('movieTypes');
    } else if (questionStep === 'movieTypes' && preferences.movieTypes.length > 0) {
      setQuestionStep('complete');
    }
  };

  const previousQuestionStep = () => {
    if (questionStep === 'age') {
      setQuestionStep('genres');
    } else if (questionStep === 'interests') {
      setQuestionStep('age');
    } else if (questionStep === 'movieTypes') {
      setQuestionStep('interests');
    } else if (questionStep === 'complete') {
      setQuestionStep('movieTypes');
    }
  };

  const getStepProgress = () => {
    const steps = ['genres', 'age', 'interests', 'movieTypes', 'complete'];
    return ((steps.indexOf(questionStep) + 1) / steps.length) * 100;
  };

  const getStepTitle = () => {
    switch (questionStep) {
      case 'genres': return 'What genres do you love?';
      case 'age': return 'What\'s your age range?';
      case 'interests': return 'What are your interests?';
      case 'movieTypes': return 'What movie types do you prefer?';
      case 'complete': return 'Ready to generate your personalized content?';
      default: return 'Let\'s get to know you!';
    }
  };

  const canProceed = () => {
    switch (questionStep) {
      case 'genres': return preferences.favoriteGenres.length > 0;
      case 'age': return preferences.ageRange !== '';
      case 'interests': return preferences.interests.length > 0;
      case 'movieTypes': return preferences.movieTypes.length > 0;
      case 'complete': return true;
      default: return false;
    }
  };

  // Preferences Screen - Page by Page
  if (currentStep === 'preferences') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.header}
          >
            {questionStep !== 'genres' && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={previousQuestionStep}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            <Ionicons name="bulb" size={40} color="white" style={styles.headerIcon} />
            <ThemedText style={styles.headerTitle}>{getStepTitle()}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Step {['genres', 'age', 'interests', 'movieTypes', 'complete'].indexOf(questionStep) + 1} of 5
            </ThemedText>
          </LinearGradient>

          {/* Progress Bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={[
                  styles.progressFill,
                  { width: `${getStepProgress()}%` },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: theme.text }]}>
              {Math.round(getStepProgress())}% Complete
            </ThemedText>
          </View>

          {/* Question Content */}
          <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
            {questionStep === 'genres' && (
              <>
                <ThemedText style={[styles.questionTitle, { color: theme.text }]}>
                  Choose your favorite movie genres
                </ThemedText>
                <ThemedText style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                  Select at least one genre you enjoy watching
                </ThemedText>
                <View style={styles.optionsGrid}>
                  {genreOptions.map((genre) => (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: preferences.favoriteGenres.includes(genre)
                            ? theme.primary
                            : theme.background,
                          borderColor: preferences.favoriteGenres.includes(genre)
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => handleGenreToggle(genre)}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color: preferences.favoriteGenres.includes(genre)
                              ? 'white'
                              : theme.text,
                          },
                        ]}
                      >
                        {genre}
                      </ThemedText>
                      {preferences.favoriteGenres.includes(genre) && (
                        <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {questionStep === 'age' && (
              <>
                <ThemedText style={[styles.questionTitle, { color: theme.text }]}>
                  What's your age range?
                </ThemedText>
                <ThemedText style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                  This helps us recommend age-appropriate content
                </ThemedText>
                <View style={styles.optionsGrid}>
                  {ageOptions.map((age) => (
                    <TouchableOpacity
                      key={age}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: preferences.ageRange === age
                            ? theme.primary
                            : theme.background,
                          borderColor: preferences.ageRange === age
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => setPreferences(prev => ({ ...prev, ageRange: age }))}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color: preferences.ageRange === age
                              ? 'white'
                              : theme.text,
                          },
                        ]}
                      >
                        {age}
                      </ThemedText>
                      {preferences.ageRange === age && (
                        <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {questionStep === 'interests' && (
              <>
                <ThemedText style={[styles.questionTitle, { color: theme.text }]}>
                  What are your interests?
                </ThemedText>
                <ThemedText style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                  Select topics you're passionate about
                </ThemedText>
                <View style={styles.optionsGrid}>
                  {interestOptions.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: preferences.interests.includes(interest)
                            ? theme.primary
                            : theme.background,
                          borderColor: preferences.interests.includes(interest)
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => handleInterestToggle(interest)}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color: preferences.interests.includes(interest)
                              ? 'white'
                              : theme.text,
                          },
                        ]}
                      >
                        {interest}
                      </ThemedText>
                      {preferences.interests.includes(interest) && (
                        <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {questionStep === 'movieTypes' && (
              <>
                <ThemedText style={[styles.questionTitle, { color: theme.text }]}>
                  What movie types do you prefer?
                </ThemedText>
                <ThemedText style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                  Choose the styles of movies you enjoy most
                </ThemedText>
                <View style={styles.optionsGrid}>
                  {movieTypeOptions.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: preferences.movieTypes.includes(type)
                            ? theme.primary
                            : theme.background,
                          borderColor: preferences.movieTypes.includes(type)
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => handleMovieTypeToggle(type)}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          {
                            color: preferences.movieTypes.includes(type)
                              ? 'white'
                              : theme.text,
                          },
                        ]}
                      >
                        {type}
                      </ThemedText>
                      {preferences.movieTypes.includes(type) && (
                        <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {questionStep === 'complete' && (
              <>
                <ThemedText style={[styles.questionTitle, { color: theme.text }]}>
                  Ready to generate your content?
                </ThemedText>
                <ThemedText style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                  We'll create personalized trivia questions and movie recommendations just for you!
                </ThemedText>
                
                {/* Summary */}
                <View style={[styles.summaryCard, { backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.summaryTitle, { color: theme.text }]}>
                    Your Preferences Summary:
                  </ThemedText>
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    • Genres: {preferences.favoriteGenres.join(', ')}
                  </ThemedText>
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    • Age Range: {preferences.ageRange}
                  </ThemedText>
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    • Interests: {preferences.interests.join(', ')}
                  </ThemedText>
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    • Movie Types: {preferences.movieTypes.join(', ')}
                  </ThemedText>
                </View>
              </>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {questionStep !== 'complete' ? (
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { opacity: canProceed() ? 1 : 0.5 }
                ]}
                onPress={nextQuestionStep}
                disabled={!canProceed()}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.nextGradient}
                >
                  <ThemedText style={styles.nextText}>Continue</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generatePersonalizedContent}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.generateGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="white" />
                      <ThemedText style={styles.generateText}>Generate My Content</ThemedText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Section Selection Screen
  if (currentStep === 'selection') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={resetTrivia}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Ionicons name="sparkles" size={40} color="white" style={styles.headerIcon} />
            <ThemedText style={styles.headerTitle}>Choose Your Experience</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              What would you like to do with your personalized content?
            </ThemedText>
          </LinearGradient>

          {/* Preferences Summary */}
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.summaryTitle, { color: theme.text }]}>
              Your Preferences Summary:
            </ThemedText>
            <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
              • Genres: {preferences.favoriteGenres.join(', ')}
            </ThemedText>
            <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
              • Age Range: {preferences.ageRange}
            </ThemedText>
            <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
              • Interests: {preferences.interests.join(', ')}
            </ThemedText>
            <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
              • Movie Types: {preferences.movieTypes.join(', ')}
            </ThemedText>
          </View>

          {/* Section Choice Cards */}
          <View style={styles.sectionChoiceContainer}>
            {/* Trivia Section */}
            <TouchableOpacity
              style={[styles.sectionCard, { backgroundColor: theme.card }]}
              onPress={() => handleSectionChoice('trivia')}
            >
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.sectionCardGradient}
              >
                <View style={styles.sectionCardIcon}>
                  <Ionicons name="help-circle" size={50} color="white" />
                </View>
                <ThemedText style={styles.sectionCardTitle}>
                  Play Trivia
                </ThemedText>
                <ThemedText style={styles.sectionCardDescription}>
                  Test your knowledge with personalized trivia questions based on your preferences
                </ThemedText>
                <View style={styles.sectionCardFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <ThemedText style={styles.featureText}>5 Custom Questions</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <ThemedText style={styles.featureText}>Score Tracking</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <ThemedText style={styles.featureText}>Detailed Explanations</ThemedText>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Movies Section */}
            <TouchableOpacity
              style={[styles.sectionCard, { backgroundColor: theme.card }]}
              onPress={() => handleSectionChoice('movies')}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.sectionCardGradient}
              >
                <View style={styles.sectionCardIcon}>
                  <Ionicons name="film" size={50} color="white" />
                </View>
                <ThemedText style={styles.sectionCardTitle}>
                  Get Movie Recommendations
                </ThemedText>
                <ThemedText style={styles.sectionCardDescription}>
                  Discover personalized movie recommendations tailored to your taste
                </ThemedText>
                <View style={styles.sectionCardFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <ThemedText style={styles.featureText}>5 Curated Movies</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <ThemedText style={styles.featureText}>Detailed Descriptions</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <ThemedText style={styles.featureText}>Ratings & Reviews</ThemedText>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Or Both Option */}
          <View style={styles.orBothContainer}>
            <ThemedText style={[styles.orBothText, { color: theme.textSecondary }]}>
              Or start with trivia and get movie recommendations after!
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Trivia Screen
  if (currentStep === 'trivia' && triviaQuestions.length > 0) {
    const currentQuestion = triviaQuestions[currentQuestionIndex];
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={resetTrivia}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Trivia Challenge</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Question {currentQuestionIndex + 1} of {triviaQuestions.length}
            </ThemedText>
          </LinearGradient>

          {/* Progress Bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={[
                  styles.progressFill,
                  { width: `${((currentQuestionIndex + 1) / triviaQuestions.length) * 100}%` },
                ]}
              />
            </View>
            <ThemedText style={[styles.scoreText, { color: theme.text }]}>
              Score: {score}/{triviaQuestions.length}
            </ThemedText>
          </View>

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.questionText, { color: theme.text }]}>
              {currentQuestion.question}
            </ThemedText>
          </View>

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerOption,
                  {
                    backgroundColor: selectedAnswer === index
                      ? (index === currentQuestion.correctAnswer ? '#4CAF50' : '#F44336')
                      : theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <ThemedText
                  style={[
                    styles.answerText,
                    {
                      color: selectedAnswer === index ? 'white' : theme.text,
                    },
                  ]}
                >
                  {option}
                </ThemedText>
                {showExplanation && index === currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
                {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <View style={[styles.explanationCard, { backgroundColor: theme.card }]}>
              <ThemedText style={[styles.explanationTitle, { color: theme.text }]}>
                Explanation
              </ThemedText>
              <ThemedText style={[styles.explanationText, { color: theme.textSecondary }]}>
                {currentQuestion.explanation}
              </ThemedText>
            </View>
          )}

          {/* Next Button */}
          {showExplanation && (
            <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.nextGradient}
              >
                <ThemedText style={styles.nextText}>
                  {currentQuestionIndex < triviaQuestions.length - 1 ? 'Next Question' : 'View Movie Recommendations'}
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Movie Recommendations Screen
  if (currentStep === 'movies' && movieRecommendations.length > 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={resetTrivia}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Ionicons name="film" size={40} color="white" style={styles.headerIcon} />
            <ThemedText style={styles.headerTitle}>Your Movie Picks</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Personalized recommendations based on your preferences
            </ThemedText>
          </LinearGradient>

          {/* Trivia Completion Badge */}
          <View style={[styles.completionBadge, { backgroundColor: theme.card }]}>
            <View style={[styles.badgeIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark" size={24} color="white" />
            </View>
            <View style={styles.badgeContent}>
              <ThemedText style={[styles.badgeTitle, { color: theme.text }]}>
                Trivia Complete!
              </ThemedText>
              <ThemedText style={[styles.badgeScore, { color: theme.textSecondary }]}>
                You scored {score}/{triviaQuestions.length} ({Math.round((score/triviaQuestions.length) * 100)}%)
              </ThemedText>
            </View>
          </View>

          {/* Recommendations Header */}
          <View style={[styles.recommendationsHeader, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.recommendationsTitle, { color: theme.text }]}>
              🎬 Recommended Movies
            </ThemedText>
            <ThemedText style={[styles.recommendationsSubtitle, { color: theme.textSecondary }]}>
              Based on your love for {preferences.favoriteGenres.slice(0, 2).join(' & ')} and your interests in {preferences.interests.slice(0, 2).join(' & ')}
            </ThemedText>
          </View>

          {/* Movie Recommendations */}
          {movieRecommendations.map((movie, index) => (
            <View key={index} style={[styles.movieCard, { backgroundColor: theme.card }]}>
              <View style={styles.movieHeader}>
                <View style={styles.movieRank}>
                  <ThemedText style={[styles.rankNumber, { color: theme.primary }]}>
                    #{index + 1}
                  </ThemedText>
                </View>
                <View style={styles.movieInfo}>
                  <ThemedText style={[styles.movieTitle, { color: theme.text }]}>
                    {movie.title}
                  </ThemedText>
                  <ThemedText style={[styles.movieYear, { color: theme.textSecondary }]}>
                    {movie.year}
                  </ThemedText>
                </View>
                <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
                  <Ionicons name="star" size={12} color="white" />
                  <ThemedText style={styles.ratingText}>{movie.rating}</ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.movieGenre, { color: theme.textSecondary }]}>
                🎭 {movie.genre}
              </ThemedText>
              <ThemedText style={[styles.movieDescription, { color: theme.text }]}>
                {movie.description}
              </ThemedText>
            </View>
          ))}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={resetTrivia}>
              <Ionicons name="refresh" size={20} color={theme.primary} />
              <ThemedText style={[styles.actionButtonText, { color: theme.primary }]}>
                New Recommendations
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

// ...
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  headerBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  sectionCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  generateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsContainer: {
    marginHorizontal: 20,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  answerText: {
    fontSize: 16,
    flex: 1,
  },
  explanationCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  finalScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  scoreDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  movieCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  movieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  movieGenre: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  movieDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tryAgainButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tryAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  tryAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  questionContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  navigationContainer: {
    padding: 20,
    paddingTop: 0,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeScore: {
    fontSize: 14,
  },
  recommendationsHeader: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  recommendationsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  movieRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieInfo: {
    flex: 1,
  },
  movieYear: {
    fontSize: 14,
    marginTop: 2,
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionChoiceContainer: {
    padding: 20,
    gap: 20,
  },
  sectionCardGradient: {
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  sectionCardIcon: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionCardFeatures: {
    alignItems: 'flex-start',
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  orBothContainer: {
    padding: 20,
    alignItems: 'center',
  },
  orBothText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
