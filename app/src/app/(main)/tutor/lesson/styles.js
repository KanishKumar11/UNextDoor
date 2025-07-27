import { StyleSheet } from 'react-native';
import { BRAND_COLORS, BORDER_COLORS } from '../../../../shared/constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: "Montserrat-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: BRAND_COLORS.WARM_CORAL,
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: BRAND_COLORS.OCEAN_BLUE,
    textAlign: "center",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: BRAND_COLORS.SKY_AQUA + "30",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
  },
  sectionContent: {
    flex: 1,
    elevation: 0,
    minHeight: 400,
  },
  navigationContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
  },
  nextButton: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
  },
  fullScreenButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  fullScreenButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    borderRadius: 12,
  },
  completeButton: {
    backgroundColor: BRAND_COLORS.OCEAN_BLUE,
  },
  disabledButton: {
    backgroundColor: BRAND_COLORS.SHADOW_GREY + "80",
    opacity: 0.7,
  },
  completedButton: {
    backgroundColor: BRAND_COLORS.OCEAN_BLUE,
  },
  requirementIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: BRAND_COLORS.RUCKSACK_BROWN + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.RUCKSACK_BROWN + "40",
  },
  requirementText: {
    fontSize: 14,
    color: BRAND_COLORS.RUCKSACK_BROWN,
    marginLeft: 8,
    fontFamily: "Montserrat-Medium",
  },
  errorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: BRAND_COLORS.WARM_CORAL + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.WARM_CORAL + "40",
  },
  debugInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  debugText: {
    fontSize: 12,
    color: "#6c757d",
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
  },
  debugButton: {
    marginTop: 8,
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  debugButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
    textAlign: "center",
  },

  // Modern section styles
  modernSectionContainer: {
    marginBottom: 24,
  },
  modernCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant - #FAFAFA
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_COLORS.LIGHT, // Using constant
    shadowColor: BRAND_COLORS.OCEAN_BLUE, // Using constant
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginLeft: 12,
  },
  modernIntroductionText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    lineHeight: 24,
    color: BRAND_COLORS.SHADOW_GREY,
  },

  // Objectives styles
  objectivesList: {
    marginTop: 8,
  },
  modernObjectiveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  objectiveNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  objectiveNumberText: {
    color: BRAND_COLORS.WHISPER_WHITE,
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
  modernObjectiveText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },

  // Vocabulary styles - Updated for single row
  vocabularyGrid: {
    flexDirection: "column",
    gap: 12,
  },
  modernVocabularyItem: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
  },

  // Compact vocabulary item for alphabet lessons
  compactVocabularyItem: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant - #FAFAFA
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER_COLORS.LIGHT, // Using constant
    shadowColor: BRAND_COLORS.OCEAN_BLUE, // Using constant
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
  },

  vocabularyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // Compact header for alphabet lessons
  compactVocabularyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modernKoreanText: {
    fontSize: 22,
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: "Montserrat-Bold",
    flex: 1,
  },

  // Compact Korean text for alphabet lessons
  compactKoreanText: {
    fontSize: 28,
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: "Montserrat-Bold",
    flex: 1,
    textAlign: "center",
  },
  modernAudioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_COLORS.EXPLORER_TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  audioButtonPlaying: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "CC", // Slightly darker when playing
    opacity: 0.8,
  },
  modernRomanizationText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Montserrat-Regular",
    marginBottom: 8,
    fontStyle: "italic",
  },

  // Compact romanization text for alphabet lessons
  compactRomanizationText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat-Regular",
    marginBottom: 6,
    fontStyle: "italic",
    textAlign: "center",
  },

  modernEnglishText: {
    fontSize: 16,
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 8,
  },

  // Compact English text for alphabet lessons
  compactEnglishText: {
    fontSize: 14,
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 6,
    textAlign: "center",
  },
  modernExampleText: {
    fontSize: 14,
    fontStyle: "italic",
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: "Montserrat-Regular",
    lineHeight: 20,
  },

  // Practice styles
  modernPracticeIntro: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    lineHeight: 24,
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 24,
    textAlign: "center",
  },
  primaryPracticeCard: {
    borderColor: BRAND_COLORS.EXPLORER_TEAL,
    borderWidth: 2,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "10",
  },
  practiceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  practiceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6FC935",
    justifyContent: "center",
    alignItems: "center",
  },
  practiceCardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  practiceCardTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
  },
  practiceCardSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginTop: 2,
  },
  practiceCardContent: {
    marginTop: 8,
  },
  practiceCardDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  practiceFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "48%",
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginLeft: 8,
  },
  practiceCardActions: {
    marginTop: 16,
  },
  practiceRequiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.WARM_CORAL,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  practiceRequiredText: {
    color: BRAND_COLORS.WHISPER_WHITE,
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
    marginLeft: 6,
  },
  modernPracticeButton: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    paddingVertical: 14,
    borderRadius: 12,
  },
  practiceButtonCompleted: {
    backgroundColor: BRAND_COLORS.RUCKSACK_BROWN,
  },
  modernCompletedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  modernCompletedText: {
    color: "#5BC4B3", // Explorer Teal
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    marginLeft: 8,
  },

  // Loading overlay
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: "#FAFAFA", // Whisper White
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  loadingOverlayText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat-Medium",
  },

  // Success feedback
  successFeedbackOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successFeedbackContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  successFeedbackText: {
    fontSize: 18,
    color: "#6FC935",
    fontFamily: "Montserrat-Bold",
    marginTop: 12,
  },
  successFeedbackSubtext: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat-Regular",
    marginTop: 4,
  },

  // Conversation practice styles
  conversationPracticeContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  conversationPracticeHeader: {
    zIndex: 1,
    elevation: 5,
  },
  conversationHeaderGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  conversationHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modernCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  conversationHeaderInfo: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20,
  },
  conversationPracticeTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  conversationPracticeSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  conversationHeaderStats: {
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
    color: "white",
    marginLeft: 4,
  },
  conversationMainArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modernConversationView: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  conversationBottomPanel: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  bottomPanelContent: {
    alignItems: "center",
  },
  practiceStatusContainer: {
    marginBottom: 20,
  },
  practiceStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "#495057",
  },
  actionButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  modernCompletePracticeButton: {
    backgroundColor: "#6FC935",
    width: "100%",
    paddingVertical: 16,
    marginBottom: 12,
  },
  disabledActionButton: {
    backgroundColor: "#adb5bd",
    opacity: 0.7,
  },
  quickTipsContainer: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  quickTipsText: {
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
    color: BRAND_COLORS.EXPLORER_TEAL,
    textAlign: "center",
  },

  // Grammar and other missing styles
  noContentContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noContentTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginTop: 16,
    marginBottom: 8,
  },
  noContentText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: "center",
    lineHeight: 24,
  },
  modernGrammarExplanation: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: BRAND_COLORS.OCEAN_BLUE,
    lineHeight: 24,
    marginBottom: 16,
  },
  grammarExamplesContainer: {
    marginTop: 12,
  },
  modernGrammarExample: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "15",
  },
  modernExampleKorean: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginBottom: 4,
  },
  modernExampleRomanization: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Montserrat-Regular",
    fontStyle: "italic",
    marginBottom: 4,
  },
  modernExampleEnglish: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 8,
  },
  modernExampleExplanation: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Montserrat-Regular",
    lineHeight: 20,
  },

  // Congratulations modal styles
  congratulationsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  congratulationsModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    alignItems: "center",
    maxWidth: 400,
    width: "90%",
  },
  lottieContainer: {
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  lottieAnimation: {
    height: "100%",
    width: "100%",
  },
  congratulationsContent: {
    alignItems: "center",
  },
  congratulationsTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginBottom: 8,
  },
  congratulationsSubtitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginBottom: 16,
  },
  congratulationsMessage: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  xpText: {
    color: "#6FC935",
    fontFamily: "Montserrat-Bold",
  },
  achievementBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  badge: {
    alignItems: "center",
    margin: 8,
    minWidth: 80,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
    color: "#666",
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: "#6FC935",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 200,
  },

  // Interactive Games Section Styles - Minimalist
  gamesDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginBottom: 16,
    textAlign: "left",
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modernGameCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "48%",
    minHeight: 120,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  gameIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginBottom: 4,
    textAlign: "center",
  },
  gameDescription: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },

  // Additional Practice Section Styles - Minimalist  
  additionalPracticeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  additionalPracticeItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "48%",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    elevation: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  additionalPracticeTitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginBottom: 4,
    marginTop: 8,
    textAlign: "center",
  },
  additionalPracticeDescription: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
});

export default styles;
